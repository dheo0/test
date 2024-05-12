import _ from "lodash";

import ActionTypes from "../constants/actionTypes";
import { PhotoAppender } from "../constants/uiTypes";

const initialState = {
  isExitingApp: false,
  uploadPanelTab: PhotoAppender.DIRECT_UPLOAD,
  showPhotoPreviewModal: false,
  photoPreviewModalAlbumCode: null,
  photoPreviewModalAlbumCursorIndex: 0,
  isUploadComplete: true,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.EXIT_APP: {
      return {
        ...state,
        isExitingApp: true,
      };
    }

    case ActionTypes.SET_UPLOAD_PANEL_TAB: {
      return {
        ...state,
        uploadPanelTab: _.get(
          action,
          "payload.tab",
          PhotoAppender.DIRECT_UPLOAD
        ),
      };
    }

    case ActionTypes.SHOW_PHOTO_PREVIEW_MODAL: {
      return {
        ...state,
        showPhotoPreviewModal: true,
        photoPreviewModalAlbumCode: _.get(action, "payload.albumCode"),
        photoPreviewModalAlbumCursorIndex: _.get(action, "payload.cursor", 0),
      };
    }

    case ActionTypes.HIDE_PHOTO_PREVIEW_MODAL: {
      return {
        ...state,
        showPhotoPreviewModal: false,
        photoPreviewModalAlbumCode: null,
        photoPreviewModalAlbumCursorIndex: 0,
      };
    }

    case ActionTypes.SHOW_UPLOAD_PANEL: {
      return {
        isUploadComplete: true,
      };
    }

    case ActionTypes.HIDE_UPLOAD_PANEL: {
      return {
        isUploadComplete: false,
      };
    }

    default:
      return state;
  }
};
