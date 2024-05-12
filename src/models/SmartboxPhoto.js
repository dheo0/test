import Immutable from 'immutable';
import uuidv4 from 'uuid/v4';
import uuidv5 from 'uuid/v5';
import _ from 'lodash';

import imageContainerTypes from '../constants/imageContainerTypes';
import ImageContainerRecord from './ImageContainer';

const NAMESPACE = uuidv4();

class SmartboxPhoto extends ImageContainerRecord {
  static isSmartboxInstance(x) {
    return x && Immutable.isRecord(x) && (x.get('$type') === imageContainerTypes.SMARTBOX);
  }

  constructor(args = {}) {
    const uploadedAt = _.get(args, 'uploadedAt', (+new Date()));
    const idx = _.get(args, 'idx', (+new Date()));
    const uuid = _.get(args, 'uuid', uuidv5(`smartbox_container_${idx}`, NAMESPACE));
    const favorite = _.get(args, 'favorite', false);
    const tags = _.get(args, 'tags', '');
    super({
      $type: imageContainerTypes.SMARTBOX,
      uuid, idx, uploadedAt, favorite, tags,
    });
  }

  // noinspection JSUnusedGlobalSymbols
  equals(other) {
    if (other && Immutable.isRecord(other) && other instanceof SmartboxPhoto) {
      return this.uuid === other.get('uuid');
    }
    return false;
  }

  // noinspection JSUnusedGlobalSymbols
  hashCode() {
    let h;
    for(let i = 0; i < this.uuid.length; i++)
      h = Math.imul(31, h) + this.uuid.charCodeAt(i) | 0;
    return h;
  }

  setImageMeta(imageMeta) {
    return this.set('$imageMeta', imageMeta);
  }

  getImageMeta() {
    return this.get('$imageMeta');
  }

  hasImageMeta() {
    return !_.isNil(this.getImageMeta());
  }

  getError() {
    return null;
  }

  hasError() {
    return false;
  }

  hasCompleted() {
    return true;
  }
}

export default SmartboxPhoto
