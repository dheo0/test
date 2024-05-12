import AT from '../constants/actionTypes';
import { actionCreator } from '../utils/reduxUtils';

export default {
  openPhotoAppender: actionCreator(AT.OPEN_PHOTO_APPENDER),
  closePhotoAppender: actionCreator(AT.CLOSE_PHOTO_APPENDER),
  setSelectedAppender: actionCreator(AT.SET_SELECTED_APPENDER),
  setPhotoAppenderModalContent: actionCreator(AT.SET_PHOTO_APPENDER_MODAL_CONTENT),
  markOrUnmarkPhotoToEdit: actionCreator(AT.MARK_OR_UNMARK_PHOTO_TO_EDIT),
  clearMarks: actionCreator(AT.CLEAR_MARKS),
}
