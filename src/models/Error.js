import Immutable from 'immutable';

const ErrorRecord = Immutable.Record({
  uuid: null,
  error: null,
});

class Error extends ErrorRecord {
  constructor(args = {}) {
    super({ ...args });
  }
}

export default Error
