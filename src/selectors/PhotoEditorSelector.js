import { createSelector } from 'reselect';

import AppInfoSelector from './AppInfoSelector';

const getGridSize = state => state.PhotoEditorReducer.gridSize;

const getGridOrder = state => state.PhotoEditorReducer.gridOrder;

const getGridGroup = state => state.PhotoEditorReducer.gridGroup;

const getSortedPhotos = createSelector(
  state => state.PhotoEditorReducer.photos,
  state => state.PhotoEditorReducer.printOptions,
  state => state.PhotoEditorReducer.printOptionsBuffer,
  state => state.PhotoEditorReducer.printOptionsBufferCursor,
  (photos, initialOptionStates, buffer, cursor) => {
    const reversedBuffer = buffer.slice(0, cursor).reverse();
    return photos
      .toList()
      .map((photo) => {
        const latestPrintOption = reversedBuffer
          .find(buffer => buffer.has(photo.uuid), null, initialOptionStates)
          .get(photo.uuid);
        return photo.set('$printOption', latestPrintOption);
      })
      .sortBy((photo) => (
        photo.isFromSmartbox() ? photo.uploadedAt : photo.selectedAt
      ))
  }
);

const getSortedPhotoUUIDs = createSelector(
  getSortedPhotos,
  (photos) => photos.map(photo => photo.uuid)
);

const getSelectedPhotoUUIDs = (state) => state.PhotoEditorReducer.selectedPhotoUUIDs;

const getPrices = createSelector(
  getSortedPhotos,
  AppInfoSelector.getPrintSizes,
  (photos, printSizes) => {
    if (photos.isEmpty() || printSizes.isEmpty()) { return null }
    const prices = photos
      .map((photo) => {
        const printOption = photo.getPrintOption();
        return [
          printOption,
          printSizes.find(s => s.size === printOption.size)
        ];
      })
      .reduce((ret, [printOption, printSize]) => ({
        originalPrice: ret.originalPrice + (printSize.originalPrice * printOption.printQuantity),
        currentPrice: ret.currentPrice + (printSize.currentPrice * printOption.printQuantity),
      }), { originalPrice: 0, currentPrice: 0 });
    return {
      ...prices,
      discountRatio: prices.currentPrice / prices.originalPrice,
    };
  }
);

const canUndo = state => state.PhotoEditorReducer.printOptionsBufferCursor > 0;

const canRedo = createSelector(
  state => state.PhotoEditorReducer.printOptionsBuffer,
  state => state.PhotoEditorReducer.printOptionsBufferCursor,
  (buffer, cursor) => (
    cursor < buffer.size
  )
);

const isAllPhotoSelected = createSelector(
  getSortedPhotos,
  getSelectedPhotoUUIDs,
  (photos, selectedPhotoUUIDs) => (
    photos.every(photo => selectedPhotoUUIDs.includes(photo.uuid))
  ),
);

export default {
  getGridSize,
  getGridOrder,
  getGridGroup,
  getSortedPhotos,
  getSortedPhotoUUIDs,
  getSelectedPhotoUUIDs,
  getPrices,
  canUndo,
  canRedo,
  isAllPhotoSelected,
}
