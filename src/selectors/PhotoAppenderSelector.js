const isPhotoAppenderOpened = state => state.PhotoAppenderReducer.isPhotoAppenderOpened;

const getSelectedAppender = state => state.PhotoAppenderReducer.selectedAppender;

const getSelectedAppenderModalType = state => state.PhotoAppenderReducer.selectedAppenderModalType;

export default {
  isPhotoAppenderOpened,
  getSelectedAppender,
  getSelectedAppenderModalType,
}
