import Immutable from 'immutable';

import imageContainerTypes from '../constants/imageContainerTypes';

const ImageContainerRecord = Immutable.Record({
  uuid: null,
  idx: null,
  name: null,
  size: 0,
  type: null,
  lastModified: null,
  file: null,
  selectedAt: 0,
  uploadedAt: 0,
  favorite: false,
  tags: '',

  $type: imageContainerTypes.UNKNOWN,
  $imageMeta: null,
  $error: null,
});

export default ImageContainerRecord
