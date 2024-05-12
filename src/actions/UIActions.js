import AT from "../constants/actionTypes";
import { actionCreator } from "../utils/reduxUtils";

export default {
  exitApp: actionCreator(AT.EXIT_APP),
  setUploadPanelTab: actionCreator(AT.SET_UPLOAD_PANEL_TAB),
  showPhotoPreviewModal: actionCreator(AT.SHOW_PHOTO_PREVIEW_MODAL),
  hidePhotoPreviewModal: actionCreator(AT.HIDE_PHOTO_PREVIEW_MODAL),
  showUploadPanel: actionCreator(AT.SHOW_UPLOAD_PANEL),
  hideUploadPanel: actionCreator(AT.HIDE_UPLOAD_PANEL),
};
