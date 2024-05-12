import Immutable from 'immutable';
import _ from 'lodash';
import uuidv4 from 'uuid/v4';
import uuidv5 from 'uuid/v5';

import ActionTypes from '../constants/actionTypes';
import AlbumTypes from '../constants/smartboxAlbumTypes';
import SidebarTabs from '../constants/smartbboxSidebarTabs';
import SmartboxPhoto from '../models/SmartboxPhoto';
import SmartboxAlbum from '../models/SmartboxAlbum';
import ImageMeta from '../models/ImageMeta';
import { parseDate } from '../utils/stringUtils'
import UploadQueue from '../utils/UploadQueue';

const NAMESPACE = uuidv4();

const initialState = {
  isFetchingAgreementState: false,
  isUpdatingAgreementState: false,
  isFetchingEndpoints: false,
  isFetching: false,
  isFetchingAlbums: false,
  hasAgreementAgreed: false,
  numberOfRemotePhotos: 0,
  uploadingServerUrl: null,
  listingServerUrl: null,
  albums: Immutable.Set(),
  albumIndex: Immutable.OrderedMap(),
  analysisProgresses: Immutable.Map(),
  photos: Immutable.Set(),
  lastOffsets: Immutable.Map(),
  possiblyMoreItems: false,
  markedPhotoUUIDs: Immutable.Set(),
  errorFetchingPhotos: null,
  errorFetchingAlbums: null,
  workspacePhotos: Immutable.Set(),
  uploadQueue: new UploadQueue(),
  /* UI */
  isShowingAlbumManagePanel: false,
  sidebarTab: SidebarTabs.ALL_PHOTOS,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.ADD_TO_WORKSPACE: {
      return {
        ...state,
        workspacePhotos: state.workspacePhotos.withMutations((set) => {
          _.get(action, 'payload.photos', Immutable.List()).forEach((photo) => {
            if (SmartboxPhoto.isSmartboxInstance(photo)) {
              set.add(photo);
            }
          });
        }),
      }
    }

    case ActionTypes.REQUEST_GET_SMARTBOX_AGREEMENT_STATE: {
      return {
        ...state,
        isFetchingAgreementState: true,
      }
    }

    case ActionTypes.REQUEST_UPDATE_SMARTBOX_AGREEMENT_STATE: {
      return {
        ...state,
        isUpdatingAgreementState: true,
      }
    }

    case ActionTypes.REQUEST_GET_SMARTBOX_AGREEMENT_STATE_SUCCESS:
    case ActionTypes.REQUEST_UPDATE_SMARTBOX_AGREEMENT_STATE_SUCCESS: {
      return {
        ...state,
        isFetchingAgreementState: false,
        isUpdatingAgreementState: false,
        hasAgreementAgreed: action.payload.hasAgreementAgreed,
        numberOfRemotePhotos: action.payload.numberOfRemotePhotos,
      }
    }

    case ActionTypes.REQUEST_GET_SMARTBOX_AGREEMENT_STATE_ERROR:
    case ActionTypes.REQUEST_UPDATE_SMARTBOX_AGREEMENT_STATE_ERROR: {
      return {
        ...state,
        isFetchingAgreementState: false,
        isUpdatingAgreementState: false,
      }
    }

    case ActionTypes.REQUEST_GET_SMARTBOX_ENDPOINTS: {
      return {
        ...state,
        isFetchingEndpoints: true,
      }
    }

    case ActionTypes.REQUEST_GET_SMARTBOX_ENDPOINTS_SUCCESS:
    case ActionTypes.REQUEST_GET_SMARTBOX_ENDPOINTS_ERROR: {
      return {
        ...state,
        isFetchingEndpoints: false,
        uploadingServerUrl: action.payload.uploadingServerUrl,
        listingServerUrl: action.payload.listingServerUrl,
      }
    }

    case ActionTypes.REQUEST_GET_SMARTBOX_PHOTOS: {
      return {
        ...state,
        isFetching: true,
      }
    }

    case ActionTypes.REQUEST_GET_SMARTBOX_PHOTOS_SUCCESS:
    case ActionTypes.REQUEST_UPLOAD_IMAGE_FILE_TO_SMARTBOX_SUCCESS: {
//console.log("REQUEST_UPLOAD_IMAGE_FILE_TO_SMARTBOX_SUCCESS");

      const code = _.get(action, 'payload.code', AlbumTypes.ALL_PHOTOS);
      const analysisProgress = _.get(action, 'payload.analysisProgress', state.analysisProgresses.get(code));
      const lastOffset = _.get(action, 'payload.lastOffset', state.lastOffsets.get(code));
      const photoArray = Immutable.List(_.get(action, 'payload.photos', []))
        .map((photo) => {
          const uuid = uuidv5(photo.idx, NAMESPACE);
          const uploadedAt = (() => {
            if (photo.uploaddate) { return +(parseDate(photo.uploaddate)) }
            if (action.type === ActionTypes.REQUEST_GET_SMARTBOX_PHOTOS_SUCCESS) {
              if (photo.dateunix) { return Number(photo.dateunix) * 1000 }
              return +(new Date());
            } else {
              return +(new Date());
            }
          })();
          const favorite = photo.uploadFav === 'Y';
          const tags = photo.tagstr;
          return new SmartboxPhoto({ uuid, idx: photo.idx, uploadedAt, favorite, tags })
            .setImageMeta(new ImageMeta({ uuid, ...photo }));
        });
      const idxs = state.albumIndex.get(code, Immutable.Set()).withMutations((set) => {
        photoArray.map(photo => photo.idx).forEach(idx => set.add(idx));
      });
      return {
        ...state,
        isFetching: false,
        errorFetchingPhotos: null,
        albumIndex: state.albumIndex.set(code, idxs),
        analysisProgresses: state.analysisProgresses.set(code, analysisProgress),
        photos: state.photos.withMutations((set) => {
          photoArray.forEach(photo => {
            if (set.has(photo)) { set.delete(photo) }
            set.add(photo);
          });
        }),
        lastOffsets: state.lastOffsets.set(code, lastOffset),
      }
    }

    case ActionTypes.REQUEST_GET_SMARTBOX_PHOTOS_ERROR: {
      return {
        ...state,
        isFetching: false,
        errorFetchingPhotos: _.get(action, 'payload.error'),
      }
    }

    case ActionTypes.REQUEST_GET_SMARTBOX_ALBUMS: {
      return {
        ...state,
        isFetchingAlbums: true,
      }
    }

    case ActionTypes.REQUEST_GET_SMARTBOX_ALBUMS_SUCCESS: {
      return {
        ...state,
        isFetchingAlbums: false,
        errorFetchingAlbums: null,
        albums: state.albums.withMutations((set) => {
          _.get(action, 'payload.albums', [])
            .map(({ code, folder }) => new SmartboxAlbum({ code, folder }))
            .forEach(album => set.add(album))
        }),
      }
    }

    case ActionTypes.REQUEST_SMARTBOX_ADD_ALBUM_SUCCESS: {
      return {
        ...state,
        albums: state.albums.withMutations((set) => {
          const attr = _.get(action, 'payload.album', []);
          if (attr) {
            const album = new SmartboxAlbum(attr);
            set.add(album);
          }
        }),
      }
    }

    case ActionTypes.REQUEST_GET_SMARTBOX_ALBUMS_ERROR: {
      return {
        ...state,
        isFetchingAlbums: false,
        errorFetchingAlbums: _.get(action, 'payload.error'),
      }
    }

    case ActionTypes.APPEND_SMARTBOX_UPLOADS: {
      return {
        ...state,
        uploadQueue: state.uploadQueue.appendAll(_.get(action, 'payload.willUploads', [])),
      }
    }

    case ActionTypes.SET_SMARTBOX_FILE_UPLOAD_END: {
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

    case ActionTypes.MARK_SMARTBOX_PHOTO: {
      return {
        ...state,
        markedPhotoUUIDs: state.markedPhotoUUIDs.withMutations((set) => {
          _.get(action, 'payload.photos', [])
            .forEach(smartboxPhoto => set.add(smartboxPhoto.uuid));
        }),
      }
    }

    case ActionTypes.UNMARK_SMARTBOX_PHOTO: {
      return {
        ...state,
        markedPhotoUUIDs: state.markedPhotoUUIDs.withMutations((set) => {
          _.get(action, 'payload.photos', [])
            .forEach(smartboxPhoto => set.delete(smartboxPhoto.uuid));
        }),
      }
    }

    /* UI */
    case ActionTypes.SHOW_SMARTBOX_ALBUM_MANAGE_PANEL: {
      return {
        ...state,
        isShowingAlbumManagePanel: true,
      }
    }

    case ActionTypes.CLOSE_PHOTO_APPENDER:
    case ActionTypes.HIDE_SMARTBOX_ALBUM_MANAGE_PANEL: {
      return {
        ...state,
        isShowingAlbumManagePanel: false,
      }
    }

    case ActionTypes.CHANGE_SMARTBOX_SIDEBAR_TAB: {
      return {
        ...state,
        sidebarTab: _.get(action, 'payload', SidebarTabs.ALL_PHOTOS),
      }
    }

    /* ETC */
    case ActionTypes.REQUEST_SMARTBOX_ADD_FAVORITES_SUCCESS:
    case ActionTypes.REQUEST_SMARTBOX_DELETE_FAVORITES_SUCCESS: {
      const isAdd = action.type === ActionTypes.REQUEST_SMARTBOX_ADD_FAVORITES_SUCCESS;

      const idx = _.get(action, 'payload.idx');
      const photo = state.photos.find(photo => photo.idx === idx);

      if (photo) {
        return {
          ...state,
          photos: state.photos.withMutations((set) => {
            set.delete(photo);
            // noinspection RedundantConditionalExpressionJS
            set.add(photo.set('favorite', isAdd ? true : false));
          }),
        }
      }
      return state;
    }

    case ActionTypes.REQUEST_SMARTBOX_DELETE_PHOTOS_SUCCESS: {
      const idxs = _.get(action, 'payload.idxs', []);
      return {
        ...state,
        photos: state.photos.filter(photo => !_.includes(idxs, photo.idx)),
      }
    }

    case ActionTypes.REQUEST_SMARTBOX_ADD_TAGS_SUCCESS: {
      const tags = _.get(action, 'payload.tags', '');
      const idxs = _.get(action, 'payload.idxs', []);
      const photos = state.photos.filter(photo => idxs.includes(photo.idx));
      return {
        ...state,
        photos: state.photos.withMutations((set) => {
          photos.forEach((photo) => {
            set.delete(photo);
            set.add(photo.set('tags', tags));
          })
        }),
      }
    }

    default:
      return state;
  }
};
