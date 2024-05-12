import _ from 'lodash';

function dataCellFactory(value, releaseHandler = () => {}) {
  return {
    value,
    releaseHandler,
  };
}

class DataGridService {
  constructor() {
    this._memMap = {};
  }

  _checkKey(key) {
    if (!key) { throw new Error('"key" must be specified!') }
    if (!_.isString(key)) { throw new TypeError('"key" must be string!') }
  }

  has(key) {
    this._checkKey(key);
    return _.has(this._memMap, key);
  }

  set(key, value, releaseHandler) {
    this._checkKey(key);
    const hasPrevVal = this.has(key);
    if (hasPrevVal) { this.unset(key) }
    _.set(this._memMap, key, dataCellFactory(value, releaseHandler));
    return hasPrevVal;
  }

  get(key, notSetValue = null) {
    this._checkKey(key);
    if (this.has(key)) {
      return _.get(this._memMap, key).value;
    }
    return notSetValue;
  }

  unset(key) {
    this._checkKey(key);
    const hasPrevVal = this.has(key);
    if (hasPrevVal) {
      const dataCell = _.get(this._memMap, key);
      dataCell.releaseHandler(dataCell.value);
      _.unset(this._memMap, key);
    }
    return hasPrevVal;
  }
}

export default new DataGridService();
