import Immutable from 'immutable';
import uuidv4 from 'uuid/v4';
import uuidv5 from 'uuid/v5';
import _ from 'lodash';

import imageContainerTypes from '../constants/imageContainerTypes';
import ImageContainerRecord from './ImageContainer';
import DataGridService from '../utils/DataGridService';

const NAMESPACE = uuidv4();

/* File fallback */
// noinspection JSDuplicatedDeclaration
let File = window.File;
try {
  new File([], '')
} catch(e) {
  File = class File extends Blob {
    constructor(chunks, filename, opts = {}){
      super(chunks, opts);
      this.lastModifiedDate = new Date();
      this.lastModified =+ this.lastModifiedDate;
      this.name = filename;
    }
  }
}

class ImageUpload extends ImageContainerRecord {
  static isDirectUploadInstance(x) {
    return x && Immutable.isRecord(x) && (x.get('$type') === imageContainerTypes.DIRECT_UPLOAD);
  }

  constructor(args = {}) {
    const selectedAt = _.get(args, 'selectedAt', (+new Date()));
    const uuid = _.get(args, 'uuid', uuidv5(`image_upload_${selectedAt}`, NAMESPACE));
    const file = _.get(args, 'file', new File([], null));
    const { name, size, type, lastModified } = file;
    super({
      ...args,
      $type: imageContainerTypes.DIRECT_UPLOAD,
      uuid,
      name, size, type, lastModified,
      selectedAt,
    });

    DataGridService.set(
      uuid,
      window.URL.createObjectURL(file),
      (objectURL) => { window.URL.revokeObjectURL(objectURL) },
    );
  }

  // noinspection JSUnusedGlobalSymbols
  equals(other) {
    if (other && Immutable.isRecord(other)) {
      return this.uuid === other.get('uuid');
    }
    return false;
  }

  setImageMeta(uploadMeta) {
    return this.set('$imageMeta', uploadMeta);
  }

  getImageMeta() {
    return this.get('$imageMeta');
  }

  hasImageMeta() {
    return !_.isNil(this.getImageMeta());
  }

  setError(error) {
    return this.set('$error', error);
  }

  getError() {
    return this.get('$error');
  }

  hasError() {
    return !_.isNil(this.getError());
  }

  hasCompleted() {
    return this.hasImageMeta() || this.hasError();
  }

  releaseLocalImage() {
    DataGridService.unset(this.uuid);
    return this;
  }
}

export default ImageUpload
