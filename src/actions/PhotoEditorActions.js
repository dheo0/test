import AT from "../constants/actionTypes";
import { actionCreator } from "../utils/reduxUtils";

export default {
  setEditorGridOptions: actionCreator(AT.SET_EDITOR_GRID_OPTIONS),
  appendPhotosToPhotoEditor: actionCreator(AT.APPEND_PHOTOS_TO_PHOTO_EDITOR),
  purgePhotosFromPhotoEditor: actionCreator(AT.PURGE_PHOTOS),
  purgeSelectedPhotos: actionCreator(AT.PURGE_SELECTED_PHOTOS),
  selectAllPhotos: actionCreator(AT.SELECT_ALL_PHOTOS),
  unselectAllPhotos: actionCreator(AT.UNSELECT_ALL_PHOTOS),
  selectOrUnselectPhoto: actionCreator(AT.SELECT_OR_UNSELECT_PHOTO),
  selectOrUnselectAllPhotos: actionCreator(AT.SELECT_OR_UNSELECT_ALL_PHOTOS),
  setPrintOptions: actionCreator(AT.SET_PRINT_OPTIONS),
  setPrintOptionsAll: actionCreator(AT.SET_PRINT_OPTIONS_ALL),
  undo: actionCreator(AT.UNDO),
  redo: actionCreator(AT.REDO),
  openDetailEditor: actionCreator(AT.OPEN_DETAIL_EDITOR),
  closeDetailEditor: actionCreator(AT.CLOSE_DETAIL_EDITOR),
  adjustDetailEdits: actionCreator(AT.ADJUST_DETAIL_EDITS),
  clonePhoto: actionCreator(AT.SELECT_CLONE_PHOTO),
};
