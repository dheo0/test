import Immutable from 'immutable'
import _ from 'lodash'

import ActionTypes from '../constants/actionTypes';
import ImageMeta from '../models/ImageMeta';
import Error from '../models/Error';
import ImageUpload from '../models/ImageUpload';
import UploadQueue from '../utils/UploadQueue';

const initialState = {
  uploadQueue: new UploadQueue(),
  allUploadFiles: Immutable.List(),
  uploadMetas: Immutable.List(),
  uploadErrors: Immutable.List(),
  deletedFileUUIDs: Immutable.Set(),
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.REQUEST_BULK_UPLOAD_IMAGE_FILES: {
      return {
        ...state,
        uploadQueue: (state.uploadQueue.isFlushed())
          ? new UploadQueue()
          : state.uploadQueue.appendAll(_.get(action, 'payload.willUploads', [])),
      }
    }

    case ActionTypes.REQUEST_BULK_UPLOAD_IMAGE_FILES_ERROR: {
      return {
        ...state,
        uploadQueue: state.uploadQueue.clear(true),
      }
    }

    case ActionTypes.APPEND_UPLOADS: {
      return {
        ...state,
        uploadQueue: state.uploadQueue.appendAll(_.get(action, 'payload.willUploads', [])),
      }
    }

    case ActionTypes.SET_FILE_UPLOAD_END: {
      return {
        ...state,
        uploadQueue: state.uploadQueue.endAll(_.get(action, 'payload.ended', [])),
      }
    }

    case ActionTypes.FLUSH_UPLOADS: {
      return {
        ...state,
        uploadQueue: state.uploadQueue.flush(),
      }
    }

    case ActionTypes.CREATE_IMAGE_UPLOAD: {
      const { uuid, file, selectedAt } = action.payload;
      return {
        ...state,
        allUploadFiles: state.allUploadFiles.push(new ImageUpload({
          uuid, file, selectedAt,
        })),
      }
    }

    case ActionTypes.CREATE_IMAGE_UPLOAD_META: {
      return {
        ...state,
        uploadMetas: state.uploadMetas.push(new ImageMeta({
          uuid: action.uuid,
          ts: Number(action.payload.uploadMeta.dateunix),
          ...action.payload.uploadMeta,
        })),
      }
    }

    case ActionTypes.CREATE_IMAGE_UPLOAD_ERROR: {
      return {
        ...state,
        uploadErrors: state.uploadErrors.push(new Error({
          uuid: action.uuid,
          error: action.payload.error.message,
        })),
      }
    }

    case ActionTypes.DELETE_LOCAL_IMAGE_FILE: {
      return {
        ...state,
        deletedFileUUIDs: state.deletedFileUUIDs.add(action.payload.imageUpload.uuid),
      }
    }

    default:
      return state;
  }
}
