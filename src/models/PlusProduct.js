import Immutable from 'immutable';

const PlusProductRecord = Immutable.Record({
  intnum: null,
  seq: null,
  pkgname: null,
  seloption: null,
  price: null,
  url_thumb: null,
});

class PlusProduct extends PlusProductRecord {
  static getId(plusProduct) {
    if (!plusProduct) { return null }
    return `${plusProduct.intnum}_${plusProduct.seq}`;
  }

  static getProductName(plusProduct) {
    if (!plusProduct) { return null }
    return `${plusProduct.pkgname} ${plusProduct.seloption}`;
  }

  constructor(args = {}) {
    super({ ...args });
  }

  // noinspection JSUnusedGlobalSymbols
  equals(other) {
    if (other && Immutable.isRecord(other) && other instanceof PlusProduct) {
      return this.getId() === other.getId();
    }
    return false;
  }

  getId() {
    return PlusProduct.getId(this);
  }

  getProductName() {
    return PlusProduct.getProductName(this);
  }
}

export default PlusProduct
