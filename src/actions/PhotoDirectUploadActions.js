import AT from '../constants/actionTypes';
import { actionCreator, actionCreatorWithPromise } from '../utils/reduxUtils';

export default {
  setUploadCounts: actionCreator(AT.SET_UPLOAD_COUNTS),
  appendUploads: actionCreator(AT.APPEND_UPLOADS),
  setFileUploadEnd: actionCreator(AT.SET_FILE_UPLOAD_END),
  requestFlushUploads: actionCreator(AT.REQUEST_FLUSH_UPLOADS),
  flushUploads: actionCreator(AT.FLUSH_UPLOADS),
  requestBulkUploadImageFiles: actionCreatorWithPromise(AT.REQUEST_BULK_UPLOAD_IMAGE_FILES),
  requestBulkUploadImageFilesSuccess: actionCreatorWithPromise(AT.REQUEST_BULK_UPLOAD_IMAGE_FILES_SUCCESS),
  requestBulkUploadImageFilesError: actionCreatorWithPromise(AT.REQUEST_BULK_UPLOAD_IMAGE_FILES_ERROR),
  createImageUpload: actionCreator(AT.CREATE_IMAGE_UPLOAD),
  createImageUploadMeta: actionCreator(AT.CREATE_IMAGE_UPLOAD_META),
  createImageUploadError: actionCreator(AT.CREATE_IMAGE_UPLOAD_ERROR),
  deleteLocalImageFile: actionCreator(AT.DELETE_LOCAL_IMAGE_FILE),
  bulkFlush: actionCreator(AT.BULK_FLUSH),
}
