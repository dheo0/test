import Immutable from 'immutable';
import PrintOptionsFields from '../constants/printOptionFields';
import { BorderTypes, PaperTypes, TrimmingTypes } from '../constants/printTypes';
import GLOSS_ONLY_SIZES from '../constants/glossOnlySizes';
import MATTE_ONLY_SIZES from '../constants/matteOnlySizes';
import _ from 'lodash';

export const PHOTO_EDIT_SIZE = 600;

const PrintOptionRecord = Immutable.Record({
  uuid: null,
  size: null,
  manualDateYear: null,
  manualDateMonth: null,
  manualDateDate: null,
  paper: null,
  border: null,
  trimming: null,
  autoAdjustment: null,
  insertDate: false,
  insertDateManual: null,
  printQuantity: null,

  filterAdjusted: null,
  filterAdjustedSrc: null,
  scale: 1,
  posX: 0,
  posY: 0,
  rotate: 0,
});

export const DEFAULT_VALUES = {
  size: PrintOptionsFields.SIZE.defaultValue,
  paper: PrintOptionsFields.PAPER.defaultValue,
  border: PrintOptionsFields.BORDER.defaultValue,
  trimming: PrintOptionsFields.TRIMMING.defaultValue,
  autoAdjustment: PrintOptionsFields.AUTO_ADJUSTMENT.defaultValue,
  insertDate: PrintOptionsFields.INSERT_DATE.defaultValue,
  insertDateManual: PrintOptionsFields.INSERT_DATE_MANUAL.defaultValue,
  printQuantity: PrintOptionsFields.PRINT_QUANTITY.defaultValue,
};

export const DEFAULT_VALUES_3x4 = {
  border: BorderTypes.BORDER,
  trimming: TrimmingTypes.IMAGE_FULL,
};

export const DEFAULT_VALUES_GLOSS_ONLY = {
  paper: PaperTypes.GLOSS,
};

export const DEFAULT_VALUES_MATTE_ONLY = {
  paper: PaperTypes.MATTE,
}

export default class PrintOption extends PrintOptionRecord {
  static default(args) {
    const argsWithoutFilterOptions = { ...args };
    _.unset(argsWithoutFilterOptions, 'uuid');
    _.unset(argsWithoutFilterOptions, 'filterAdjusted');
    _.unset(argsWithoutFilterOptions, 'filterAdjustedSrc');
    _.unset(argsWithoutFilterOptions, 'scale');
    _.unset(argsWithoutFilterOptions, 'posX');
    _.unset(argsWithoutFilterOptions, 'posY');
    _.unset(argsWithoutFilterOptions, 'rotate');

    if (_.get(argsWithoutFilterOptions, 'size') === '3x4') {
      return new PrintOption({
        ...DEFAULT_VALUES,
        ...argsWithoutFilterOptions,
        ...DEFAULT_VALUES_3x4,
      });
    } else if (_.includes(/*GLOSS_ONLY_SIZES*/MATTE_ONLY_SIZES, _.get(argsWithoutFilterOptions, 'size'))) { // 2022.11.28
      return new PrintOption({
        ...DEFAULT_VALUES,
        ...argsWithoutFilterOptions,
        //...DEFAULT_VALUES_GLOSS_ONLY,
        ...DEFAULT_VALUES_MATTE_ONLY, // 2022.11.28
      });
    }
    return new PrintOption({
      ...DEFAULT_VALUES,
      ...argsWithoutFilterOptions,
    });
  }

  static from(args) {
    if (args && args instanceof PrintOption) {
      return PrintOption.default(args.toJS());
    }
    return PrintOption.default(args);
  }

  constructor(args = {}) {
    if (args instanceof PrintOption) {
      super({ ...args.toJS() });
    } else if (_.isPlainObject(args)) {
      super({ ...args });
    }
  }

  // noinspection JSUnusedGlobalSymbols
  hashCode() {
    let h;
    for(let i = 0; i < this.uuid.length; i++)
      h = Math.imul(31, h) + this.uuid.charCodeAt(i) | 0;
    return h;
  }

  UUID(uuid) {
    return this.set('uuid', uuid);
  }

  canUpdate(attribute) {
    if (this.size === '3x4') {
      if (_.includes(MATTE_ONLY_SIZES, this.size)) // 2023.01.19
        _.has(DEFAULT_VALUES_MATTE_ONLY, attribute);
      
      return !_.has(DEFAULT_VALUES_3x4, attribute);
    }

    if (_.includes(GLOSS_ONLY_SIZES, this.size)) {
      return !_.has(DEFAULT_VALUES_GLOSS_ONLY, attribute);
    }

    if (_.includes(MATTE_ONLY_SIZES, this.size)) {
      return !_.has(DEFAULT_VALUES_MATTE_ONLY, attribute);
    }
    return true
  }

  update(description = {}) {
    let newVal;
    let dirty = false;

    if (_.isEmpty(description)) {
      return this;
    } else if (_.isPlainObject(description) && !_.isEmpty(description)) {
      newVal = _
        .toPairs(description)
        .filter(([key]) => this.canUpdate(key))
        .reduce((_this, [key, value]) => {
          dirty = true;
          return _this.set(key, value);
        }, this.asMutable());

    } else if (description instanceof PrintOption) {
      newVal = this.mergeWith((oldVal, newVal, key) => {
        if (key === 'uuid') { return oldVal }
        if (!this.canUpdate(key)) { return oldVal }
        dirty = true;
        return newVal;
      }, description);
    }

    if (dirty) {
      if (description.size === '3x4') {
        _.toPairs(DEFAULT_VALUES_3x4)
          .forEach(([attribute, defaultValue]) => newVal.set(attribute, defaultValue));

        if ((_.includes(MATTE_ONLY_SIZES, description.size))) { // 2023.01.19
          _.toPairs(DEFAULT_VALUES_MATTE_ONLY)
            .forEach(([attribute, defaultValue]) => newVal.set(attribute, defaultValue));
        }

      } else if (_.includes(GLOSS_ONLY_SIZES, description.size)) {
        _.toPairs(DEFAULT_VALUES_GLOSS_ONLY)
          .forEach(([attribute, defaultValue]) => newVal.set(attribute, defaultValue));
      } else if (_.includes(MATTE_ONLY_SIZES, description.size)) {
        _.toPairs(DEFAULT_VALUES_MATTE_ONLY)
          .forEach(([attribute, defaultValue]) => newVal.set(attribute, defaultValue));
      }
    }

    return newVal.asImmutable();
  }

  doRotate() {
    if (this.rotate === 270) {
      return this.set('rotate', 0);
    }
    return this.set('rotate', this.rotate + 90);
  }

  getTrimString(photo, printSize) {
    const printOption = photo.getPrintOption();

    const [left, top, width, height] = (printOption.trimming === TrimmingTypes.PAPER_FULL)
      ? this._getTrimStringPaperFull(photo, printSize)
      : this._getTrimStringImageFull(photo);

    return [left, top, width, height].join('^');
  }

  _getTrimStringImageFull(photo) {
    const [boundingWidth, boundingHeight] = (() => {
      return photo.isPortrait()
        ? [PHOTO_EDIT_SIZE * photo.getRatio(), PHOTO_EDIT_SIZE]
        : [PHOTO_EDIT_SIZE, PHOTO_EDIT_SIZE * photo.getRatio()];
    })();

    return [
      0,
      0,
      boundingWidth,
      boundingHeight,
    ].map(_.toInteger);
  }

  _getTrimStringPaperFull(photo, printSize) {
    const _photo = photo.ofRotated(this.rotate);
    const ratio = _photo.getRatio();
    const isOverSized = ratio > printSize.getRatio();

    const paddingRatio = _.round(
      Math.min(_photo.getRatio(true), printSize.getPrintRatio(true))
      / Math.max(_photo.getRatio(true), printSize.getPrintRatio(true)),
      5
    );

    // NOTE: ex) 600 x 420
    const [samplingWidth, samplingHeight] = (
      (_photo.isPortrait() || _photo.isSquare())
        ? [PHOTO_EDIT_SIZE * photo.getRatio(), PHOTO_EDIT_SIZE]
        : [PHOTO_EDIT_SIZE, PHOTO_EDIT_SIZE * photo.getRatio()]
    ).map(x => _.round(x, 5));


    const [boundingWidth, boundingHeight] = ((() => {
      if (_photo.isSquare()) {
        return [samplingWidth - (samplingWidth - (samplingWidth * Math.abs(paddingRatio))), samplingHeight];
      }

      if (this.rotate === 90 || this.rotate === 270) {
        return _photo.isPortrait()
          ? [PHOTO_EDIT_SIZE * ratio, PHOTO_EDIT_SIZE * ratio * printSize.getPrintRatio()]
          : [PHOTO_EDIT_SIZE * ratio * printSize.getPrintRatio(), PHOTO_EDIT_SIZE * ratio];
      }

      if (isOverSized) {
        return _photo.isPortrait()
          ? [samplingWidth - (samplingWidth - (samplingWidth * Math.abs(paddingRatio))), samplingHeight]
          : [samplingWidth, samplingHeight - (samplingHeight - (samplingHeight * Math.abs(paddingRatio)))];
      }
      return _photo.isPortrait()
        ? [samplingWidth, samplingHeight - (samplingHeight - (samplingHeight * Math.abs(paddingRatio)))]
        : [samplingWidth - (samplingWidth - (samplingWidth * Math.abs(paddingRatio))), samplingHeight];
    })()).map(x => x / this.scale).map(x => _.round(x));

    const horizontalPadding = samplingWidth - (samplingWidth * _.round(boundingWidth / samplingWidth, 2));
    const verticalPadding = samplingHeight - (samplingHeight * _.round(boundingHeight / samplingHeight, 2));

    const [pointFromLeft, pointFromTop] = (() => {
      switch (this.rotate) {
        case 90: {
          return [
            horizontalPadding * -((this.posX - 1) + 0.5),
            verticalPadding * (this.posY + 0.5),
            this.posX - 1,
            this.posY,
          ];
        }

        case 180: {
          return [
            horizontalPadding * (-this.posX + 0.5),
            verticalPadding * (-this.posY + 0.5),
            -this.posX,
            -this.posY,
          ];
        }

        case 270: {
          return [
            horizontalPadding * (this.posX + 0.5),
            verticalPadding * -((this.posY - 1) + 0.5),
            this.posX,
            this.posY - 1,
          ];
        }

        default: {
          return [
            horizontalPadding * (this.posX + 0.5),
            verticalPadding * (this.posY + 0.5),
            this.posX,
            this.posY,
          ];
        }
      }
    })();

    return [pointFromLeft, pointFromTop, boundingWidth, boundingHeight].map(_.toInteger);
  }
}
