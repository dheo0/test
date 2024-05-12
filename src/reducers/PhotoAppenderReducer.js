import Immutable from "immutable";
import _ from "lodash";

import ActionTypes from "../constants/actionTypes";
import { PhotoAppender, AppenderModalType } from "../constants/uiTypes";

const initialState = {
  isPhotoAppenderOpened: false,
  selectedAppender: PhotoAppender.DIRECT_UPLOAD, // 2020.02.14 default 업로드 방식 변경
  selectedAppenderModalType: null,
  markedPhotoUUIDs: Immutable.Set(),
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.OPEN_PHOTO_APPENDER: {
      return {
        ...state,
        isPhotoAppenderOpened: true,
        selectedAppenderModalType: AppenderModalType.APPENDER_SELECTOR,
      };
    }

    case ActionTypes.CLOSE_PHOTO_APPENDER: {
      return {
        ...state,
        isPhotoAppenderOpened: false,
        markedPhotoUUIDs: state.markedPhotoUUIDs.clear(),
      };
    }

    case ActionTypes.SET_SELECTED_APPENDER: {
      return {
        ...state,
        selectedAppender: _.get(
          action,
          "payload.appender",
          PhotoAppender.SMART_BOX
        ),
      };
    }

    case ActionTypes.SET_PHOTO_APPENDER_MODAL_CONTENT: {
      return {
        ...state,
        selectedAppenderModalType: _.get(
          action,
          "payload.appenderType",
          AppenderModalType.APPENDER_SELECTOR
        ),
      };
    }

    /* TODO: as well as 스마트박스 */
    case ActionTypes.REQUEST_POST_LOCAL_IMAGE_FILE_SUCCESS: {
      return {
        ...state,
        markedPhotoUUIDs: state.markedPhotoUUIDs.add(action.uuid),
      };
    }

    case ActionTypes.MARK_OR_UNMARK_PHOTO_TO_EDIT: {
      const markedImageUpload = state.markedPhotoUUIDs.find(
        (uuid) => uuid === action.payload.imageUpload.uuid
      );

      return {
        ...state,
        /* TODO: 스마트박스 오브젝트 스키마 고려 */
        markedPhotoUUIDs: (() => {
          if (action.payload.force) {
            return action.payload.checked
              ? state.markedPhotoUUIDs.add(action.payload.imageUpload.uuid)
              : state.markedPhotoUUIDs.delete(action.payload.imageUpload.uuid);
          }
          return _.isNil(markedImageUpload)
            ? state.markedPhotoUUIDs.add(action.payload.imageUpload.uuid)
            : state.markedPhotoUUIDs.delete(action.payload.imageUpload.uuid);
        })(),
      };
    }

    case ActionTypes.CLEAR_MARKS: {
      return {
        ...state,
        markedPhotoUUIDs: state.markedPhotoUUIDs.clear(),
      };
    }

    default:
      return state;
  }
};
