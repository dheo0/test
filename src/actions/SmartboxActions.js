import AT from '../constants/actionTypes';
import { actionCreator, actionCreatorWithPromise } from '../utils/reduxUtils';

export default {
  /* Info */
  requestGetSmartboxAgreementState: actionCreatorWithPromise(AT.REQUEST_GET_SMARTBOX_AGREEMENT_STATE),
  requestGetSmartboxAgreementStateSuccess: actionCreator(AT.REQUEST_GET_SMARTBOX_AGREEMENT_STATE_SUCCESS),
  requestGetSmartboxAgreementStateError: actionCreator(AT.REQUEST_GET_SMARTBOX_AGREEMENT_STATE_ERROR),
  requestUpdateSmartboxAgreementState: actionCreatorWithPromise(AT.REQUEST_UPDATE_SMARTBOX_AGREEMENT_STATE),
  requestUpdateSmartboxAgreementStateSuccess: actionCreator(AT.REQUEST_UPDATE_SMARTBOX_AGREEMENT_STATE_SUCCESS),
  requestUpdateSmartboxAgreementStateError: actionCreator(AT.REQUEST_UPDATE_SMARTBOX_AGREEMENT_STATE_ERROR),
  requestGetSmartboxEndpoints: actionCreatorWithPromise(AT.REQUEST_GET_SMARTBOX_ENDPOINTS),
  requestGetSmartboxEndpointsSuccess: actionCreatorWithPromise(AT.REQUEST_GET_SMARTBOX_ENDPOINTS_SUCCESS),
  requestGetSmartboxEndpointsError: actionCreatorWithPromise(AT.REQUEST_GET_SMARTBOX_ENDPOINTS_ERROR),

  /* Photos */
  addToWorkspace: actionCreatorWithPromise(AT.ADD_TO_WORKSPACE),
  requestGetSmartboxPhotos: actionCreatorWithPromise(AT.REQUEST_GET_SMARTBOX_PHOTOS),
  requestGetSmartboxPhotosSuccess: actionCreatorWithPromise(AT.REQUEST_GET_SMARTBOX_PHOTOS_SUCCESS),
  requestGetSmartboxPhotosError: actionCreatorWithPromise(AT.REQUEST_GET_SMARTBOX_PHOTOS_ERROR),
  requestUploadImageFilesToSmartbox: actionCreatorWithPromise(AT.REQUEST_UPLOAD_IMAGE_FILES_TO_SMARTBOX),
  requestUploadImageFileToSmartboxSuccess: actionCreator(AT.REQUEST_UPLOAD_IMAGE_FILE_TO_SMARTBOX_SUCCESS),
  requestUploadImageFileToSmartboxError: actionCreator(AT.REQUEST_UPLOAD_IMAGE_FILE_TO_SMARTBOX_ERROR),
  requestUploadImageFilesToSmartboxSuccess: actionCreatorWithPromise(AT.REQUEST_UPLOAD_IMAGE_FILES_TO_SMARTBOX_SUCCESS),
  requestUploadImageFilesToSmartboxError: actionCreatorWithPromise(AT.REQUEST_UPLOAD_IMAGE_FILES_TO_SMARTBOX_ERROR),

  setUploadCounts: actionCreator(AT.SET_SMARTBOX_UPLOAD_COUNTS),
  appendUploads: actionCreator(AT.APPEND_SMARTBOX_UPLOADS),
  setFileUploadEnd: actionCreator(AT.SET_SMARTBOX_FILE_UPLOAD_END),
  requestFlushUploads: actionCreator(AT.REQUEST_FLUSH_SMARTBOX_UPLOADS),
  flushUploads: actionCreator(AT.FLUSH_SMARTBOX_UPLOADS),

  /* Albums */
  requestGetSmartboxAlbums: actionCreatorWithPromise(AT.REQUEST_GET_SMARTBOX_ALBUMS),
  requestGetSmartboxAlbumsSuccess: actionCreatorWithPromise(AT.REQUEST_GET_SMARTBOX_ALBUMS_SUCCESS),
  requestGetSmartboxAlbumsError: actionCreatorWithPromise(AT.REQUEST_GET_SMARTBOX_ALBUMS_ERROR),
  updateSmartboxAlbum: actionCreator(AT.UPDATE_SMARTBOX_ALBUM),

  requestAddToNewAlbum: actionCreatorWithPromise(AT.REQUEST_SMARTBOX_ADD_TO_NEW_ALBUM),
  requestAddToNewAlbumSuccess: actionCreatorWithPromise(AT.REQUEST_SMARTBOX_ADD_TO_NEW_ALBUM_SUCCESS),
  requestAddToNewAlbumError: actionCreatorWithPromise(AT.REQUEST_SMARTBOX_ADD_TO_NEW_ALBUM_ERROR),

  requestAddToAlbum: actionCreatorWithPromise(AT.REQUEST_SMARTBOX_ADD_TO_ALBUM),
  requestAddToAlbumSuccess: actionCreatorWithPromise(AT.REQUEST_SMARTBOX_ADD_TO_ALBUM_SUCCESS),
  requestAddToAlbumError: actionCreatorWithPromise(AT.REQUEST_SMARTBOX_ADD_TO_ALBUM_ERROR),

  requestAddAlbum: actionCreatorWithPromise(AT.REQUEST_SMARTBOX_ADD_ALBUM),
  requestAddAlbumSuccess: actionCreatorWithPromise(AT.REQUEST_SMARTBOX_ADD_ALBUM_SUCCESS),
  requestAddAlbumError: actionCreatorWithPromise(AT.REQUEST_SMARTBOX_ADD_ALBUM_ERROR),

  /* UI */
  changeSidebarTab: actionCreator(AT.CHANGE_SMARTBOX_SIDEBAR_TAB),
  markSmartboxPhoto: actionCreator(AT.MARK_SMARTBOX_PHOTO),
  unmarkSmartboxPhoto: actionCreator(AT.UNMARK_SMARTBOX_PHOTO),
  showAlbumManagePanel: actionCreator(AT.SHOW_SMARTBOX_ALBUM_MANAGE_PANEL),
  hideAlbumManagePanel: actionCreator(AT.HIDE_SMARTBOX_ALBUM_MANAGE_PANEL),

  /* ETC */
  requestAddFavorites: actionCreator(AT.REQUEST_SMARTBOX_ADD_FAVORITES),
  requestAddFavoritesSuccess: actionCreator(AT.REQUEST_SMARTBOX_ADD_FAVORITES_SUCCESS),
  requestAddFavoritesError: actionCreator(AT.REQUEST_SMARTBOX_ADD_FAVORITES_ERROR),

  requestDeleteFavorites: actionCreator(AT.REQUEST_SMARTBOX_DELETE_FAVORITES),
  requestDeleteFavoritesSuccess: actionCreator(AT.REQUEST_SMARTBOX_DELETE_FAVORITES_SUCCESS),
  requestDeleteFavoritesError: actionCreator(AT.REQUEST_SMARTBOX_DELETE_FAVORITES_ERROR),

  requestAddOrDeleteFavorites: actionCreator(AT.REQUEST_SMARTBOX_ADD_OR_DELETE_FAVORITES),
  requestAddOrDeleteFavoritesSuccess: actionCreator(AT.REQUEST_SMARTBOX_ADD_OR_DELETE_FAVORITES_SUCCESS),
  requestAddOrDeleteFavoritesError: actionCreator(AT.REQUEST_SMARTBOX_ADD_OR_DELETE_FAVORITES_ERROR),

  requestDeletePhotos: actionCreatorWithPromise(AT.REQUEST_SMARTBOX_DELETE_PHOTOS),
  requestDeletePhotosSuccess: actionCreatorWithPromise(AT.REQUEST_SMARTBOX_DELETE_PHOTOS_SUCCESS),
  requestDeletePhotosError: actionCreatorWithPromise(AT.REQUEST_SMARTBOX_DELETE_PHOTOS_ERROR),

  requestAddTags: actionCreatorWithPromise(AT.REQUEST_SMARTBOX_ADD_TAGS),
  requestAddTagsSuccess: actionCreator(AT.REQUEST_SMARTBOX_ADD_TAGS_SUCCESS),
  requestAddTagsError: actionCreator(AT.REQUEST_SMARTBOX_ADD_TAGS_ERROR),
};
