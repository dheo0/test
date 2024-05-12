import { createSelector } from 'reselect'

import PhotoDirectUploadSelector from './PhotoDirectUploadSelector';
import SmartboxSelector from './SmartboxSelector';

const getOrderableImages = createSelector(
  PhotoDirectUploadSelector.getUploadCompletedFiles,
  SmartboxSelector.getSortedList,
  (directUploadImages, smartboxImages) => (
    directUploadImages
      .filter(imageUpload => imageUpload.hasImageMeta())
      .concat(smartboxImages)
  ),
);

export default {
  getOrderableImages,
}
