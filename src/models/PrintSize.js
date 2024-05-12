import Immutable from 'immutable'
import _ from 'lodash';
import memoize from 'memoize-one';

const RATIO_PRECISION = 5;

const PrintSizeRecord = Immutable.Record({
  size: null,
  currentPrice: 0,
  originalPrice: 0,
  width: 0,
  height: 0,
  minWidth: 0,
  minHeight: 0,
  printWidth: 0,
  printHeight: 0,
  longerRatio: 0.0,
  ratio: 0.0,
});

class PrintSize extends PrintSizeRecord {
  constructor(args = {}) {
    super({
      ...args,
      currentPrice: Number(args.currentPrice),
      originalPrice: Number(args.originalPrice),
      width: Number(args.width),
      height: Number(args.height),
      minWidth: Number(args.minWidth),
      minHeight: Number(args.minHeight),
      printWidth: Number(args.printWidth),
      printHeight: Number(args.printHeight),
    });
  }

  getRatio = memoize((ofLongerSide) => {
    if (ofLongerSide) {
      return _.round(this.width / this.height, RATIO_PRECISION);
    }
    return _.round(this.height / this.width, RATIO_PRECISION);
  });

  getPrintRatio = memoize((ofLongerSide) => {
    if (ofLongerSide) {
      return _.round(this.printWidth / this.printHeight, RATIO_PRECISION);
    }
    return _.round(this.printHeight / this.printWidth, RATIO_PRECISION);
  });

  isLargerThan(other) {
    if (!other || !other instanceof PrintSize) { return false }
    return (this.printWidth * this.printHeight) > (other.printWidth * other.printHeight);
  }

  getLengthString() {
    return `(${this.height}x${this.width}cm)`;
  }

  toString() {
    return _.isEmpty(this.size)
      ? ''
      : `${this.size} ${this.getLengthString()}`;
  }
}

export default PrintSize
