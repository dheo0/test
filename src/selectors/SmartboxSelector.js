import { createSelector } from 'reselect';
import Immutable from 'immutable';
// import memoize from 'memoize-one';
import _ from 'lodash';

import SmartboxAlbumTypes, { ReservedTypes } from '../constants/smartboxAlbumTypes';
import SmartboxAlbumFrontPage from '../models/SmartboxAlbumFrontPage';
// import { getSourcesFromPartitionKey } from '../utils/SmartboxUtils';

const isFetchingAgreementState = state => state.SmartboxReducer.isFetchingAgreementState;

const isFetchingEndpoints = state => state.SmartboxReducer.isFetchingEndpoints;

const isFetchingAlbums = state => state.SmartboxReducer.isFetchingAlbums;

const isFetching = state => state.SmartboxReducer.isFetching;

const isUpdatingAgreementState = state => state.SmartboxReducer.isUpdatingAgreementState;

const hasAgreementAgreed = state => state.SmartboxReducer.hasAgreementAgreed;

const getNumberOfCloudPhotos = state => state.SmartboxReducer.numberOfRemotePhotos;

const getUploadingServerUrl = state => state.SmartboxReducer.uploadingServerUrl;

const getListingServerUrl = state => state.SmartboxReducer.listingServerUrl;

const getSortedList = createSelector(
  state => state.SmartboxReducer.photos,
  (photos) => photos
    .sortBy(photo => photo.idx)
    .toList()
);

// const getPhotosByPartition = memoize((photos, partitionFolderIndex, photoIndex, code) => {
//   const folderSet = partitionFolderIndex.get(code);
//   // console.warn('>>', 'partition:', partition)
//   // console.warn('>>', 'folderSet:', folderSet.toJS())
//   return Immutable.Map().withMutations((map) => {
//     folderSet.forEach((partitionKey) => {
//       const folder = getSourcesFromPartitionKey(partitionKey)[1];
//       const indexSet = photoIndex.get(partitionKey, Immutable.Set());
//       const folderPhotos = photos.filter(photo => indexSet.includes(photo.idx));
//       // console.warn('>>', 'folder:', folder)
//       // console.warn('>>', 'indexSet:', indexSet.toJS())
//       // console.warn('>>', 'folderPhotos:', folderPhotos.toJS())
//       map.set(folder, folderPhotos);
//     });
//   });
// });

const getSortedListByAlbum = createSelector(
  getSortedList,
  state => state.SmartboxReducer.albumIndex,
  (__, ownProps) => _.get(ownProps, 'code'),
  (photos, albumIndex, code) => {
    if (code && albumIndex.has(code)) {
      const idxs = albumIndex.get(code);
      return photos.filter(photo => idxs.includes(photo.idx));
    }
    return Immutable.List();
  },
);

const getAlbums = createSelector(
  state => state.SmartboxReducer.albums,
  (albums) => (
    albums
      .valueSeq()
      .filter(album => album.code !== SmartboxAlbumTypes.ALL_PHOTOS)
      .sort((album1, album2) => {
        if (album1.folder < album2.folder) { return -1 }
        if (album1.folder > album2.folder) { return 1 }
        return 0
      })
  ),
);

const getAlbumFrontPages = createSelector(
  getSortedList,
  getAlbums,
  state => state.SmartboxReducer.albumIndex,
  state => state.SmartboxReducer.analysisProgresses,
  (photos, albums, albumIndex, analysisProgresses) => {
    const indexExceptAllPhoto = albumIndex.filter((__, code) => !ReservedTypes.includes(code));
    if (!indexExceptAllPhoto.isEmpty()) {
      return indexExceptAllPhoto
        .map((idxs, code) => {
          const album = albums.find(album => album.code === code);
          const firstIdx = idxs.first();
          const cover = photos.find(photo => photo.idx === firstIdx);
          const size = idxs.size;
          const analysisProgress = analysisProgresses.get(code, 100);
          return new SmartboxAlbumFrontPage({
            code,
            title: album.folder,
            cover,
            size,
            analysisProgress,
            idxs,
          });
        })
        .filter(_.identity)
        .valueSeq()
        .toList();
    }
    return Immutable.List()
  },
);

const getMarkedPhotoUUIDs = createSelector(
  state => state.SmartboxReducer.markedPhotoUUIDs,
  (markedPhotoUUIDs) => markedPhotoUUIDs.toList(),
);

const getMarkedPhotos = createSelector(
  getSortedList,
  getMarkedPhotoUUIDs,
  (smartboxPhotos, markedPhotoUUIDs) =>
    smartboxPhotos.filter(smartboxPhoto => markedPhotoUUIDs.includes(smartboxPhoto.uuid))
);

const getSortedWorkspacePhotos = createSelector(
  state => state.SmartboxReducer.workspacePhotos,
  (photos) => photos
    .sortBy(photo => photo.idx)
    .toList()
);

const getQueue = state => state.SmartboxReducer.uploadQueue;

/* UI */

const isShowingAlbumManagePanel = state => state.SmartboxReducer.isShowingAlbumManagePanel;

const getSidebarTab = state => state.SmartboxReducer.sidebarTab;

export default {
  isFetchingAgreementState,
  isFetchingEndpoints,
  isFetchingAlbums,
  isFetching,
  isUpdatingAgreementState,
  hasAgreementAgreed,
  getNumberOfCloudPhotos,
  getUploadingServerUrl,
  getListingServerUrl,
  //getOffset,
  getSortedList,
  getSortedListByAlbum,
  // getSimpleAlbumList,
  getAlbums,
  getAlbumFrontPages,
  getMarkedPhotoUUIDs,
  getMarkedPhotos,
  getSortedWorkspacePhotos,
  getQueue,
  /* UI */
  isShowingAlbumManagePanel,
  getSidebarTab,
}
