import Immutable from 'immutable';

import SmartboxPhoto from './SmartboxPhoto';

const SmartboxAlbumFrontPageRecord = Immutable.Record({
  code: '',
  title: '',
  cover: new SmartboxPhoto(),
  size: 0,
  analysisProgress: 0,
  idxs: Immutable.Set(),
});

class SmartboxAlbumFrontPage extends SmartboxAlbumFrontPageRecord {
  // eslint-disable-next-line no-useless-constructor
  constructor(attrs) {
    super(attrs);
  }
}

export default SmartboxAlbumFrontPage
