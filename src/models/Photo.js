import Immutable from 'immutable';
import _ from 'lodash';
import moment from 'moment';

import ImageContainerTypes from '../constants/imageContainerTypes';
import { InsertDate } from '../constants/printTypes';

const RATIO_PRECISION = 5;

const PhotoRecord = Immutable.Record({
  uuid: null,
  src: null,
  width: 0,
  height: 0,
  time: null,
  havingExifTime: false,
  selectedAt: 0,
  createdAt: 0,

  $parentType: ImageContainerTypes.UNKNOWN,
  $printOption: null,
  $rotated: 0,
});

class Photo extends PhotoRecord {
  static from(args) {
    if (args instanceof Photo) {
      const printOption = args.getPrintOption();
      return new Photo(args.toJS())
        .set('$printOption', printOption)
    }
    return new Photo(args);
  }

  constructor(args = {}) {
    const now = new Date().getTime();
    super({
      selectedAt: _.get(args, 'selectedAt', now),
      createdAt: now,
      ...args,
    });
  }

  // noinspection JSUnusedGlobalSymbols
  equals(other) {
    if (other && Immutable.isRecord(other) && other instanceof Photo) {
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

  getParentType() {
    return this.get('$parentType');
  }

  isFromSmartbox() {
    return this.getParentType() === ImageContainerTypes.SMARTBOX;
  }

  isFromDirectUpload() {
    return this.getParentType() === ImageContainerTypes.DIRECT_UPLOAD;
  }

  isPortrait() {
    return Number(this.height) >= Number(this.width);
  }

  isLandscape() {
    return !this.isPortrait();
  }

  isSquare() {
    return this.width === this.height;
  }

  isOverRatio(printSize) {
    if (printSize) {
      return this.getRatio(true) < printSize.getRatio(true);
    } else {
      console.error('PrintSize is undefined.');
    }
  }

  isRotated() {
    // 180 ?
    return this.$rotated !== 0;
  }

  ofRotated(rotation) {
    if (rotation === 90 || rotation === 270) {
      // noinspection JSSuspiciousNameCombination
      return this
        .set('width', this.height)
        .set('height', this.width)
        .set('$rotated', rotation);
    }
    return Photo.from(this);
  }

  getRatio(ofLongerSide) {
    if (ofLongerSide) {
      return this.isPortrait()
        ? _.round(this.height / this.width, RATIO_PRECISION)
        : _.round(this.width / this.height, RATIO_PRECISION);
    }
    return this.isPortrait()
      ? _.round(this.width / this.height, RATIO_PRECISION)
      : _.round(this.height / this.width, RATIO_PRECISION);
  }

  getLongestSide() {
    // NOTE: Implicit code. Same with Math.max(width, height)
    return this.isPortrait() ? this.height : this.width;
  }

  getPrintOption() {
    return this.get('$printOption');
  }

  hasPrintOption() {
    return !_.isNil(this.getPrintOption());
  }

  hasExifTime() {
    return this.havingExifTime;
  }

  getDateString(format = 'YYYY.MM.DD') {
    const printOption = this.getPrintOption();
    if (!this.hasExifTime() && printOption.insertDateManual === InsertDate.AUTO) { return '' }

    const mnt = moment.unix(this.time).utc();

    if (printOption.insertDateManual === InsertDate.MANUAL) {
      if (printOption.manualDateYear) mnt.year(printOption.manualDateYear);
      if (printOption.manualDateMonth) mnt.month(printOption.manualDateMonth - 1);
      if (printOption.manualDateDate) mnt.date(printOption.manualDateDate);
    }
    return mnt.format(format);
  }

  shouldSizeWarn(printSize, scale = 1) {
    return printSize &&
      (Math.max(this.width / scale, this.height / scale) < Math.max(printSize.minWidth, printSize.minHeight) ||
        Math.min(this.width / scale, this.height / scale) < Math.min(printSize.minWidth, printSize.minHeight));
  }
}

export default Photo
