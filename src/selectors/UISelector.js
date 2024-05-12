const isExitingApp = (state) => state.UIReducer.isExitingApp;

const getUploadPanelTab = (state) => state.UIReducer.uploadPanelTab;

const isShowingPhotoPreviewModal = (state) =>
  state.UIReducer.showPhotoPreviewModal;

const getPreviewAlbumCode = (state) =>
  state.UIReducer.photoPreviewModalAlbumCode;

const getPreviewAlbumCursorIndex = (state) =>
  state.UIReducer.photoPreviewModalAlbumCursorIndex;

const getUploadPanel = (state) => state.UIReducer.isUploadComplete;

export default {
  isExitingApp,
  getUploadPanelTab,
  isShowingPhotoPreviewModal,
  getPreviewAlbumCode,
  getPreviewAlbumCursorIndex,
  getUploadPanel,
};
