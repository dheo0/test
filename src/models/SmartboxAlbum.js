import Immutable from 'immutable';
import uuidv4 from 'uuid/v4';
import uuidv5 from 'uuid/v5';
import _ from 'lodash';

const NAMESPACE = uuidv4();

const SmartboxAlbumRecord = Immutable.Record({
  uuid: null,
  code: null,
  folder: null,
});

class SmartboxAlbum extends SmartboxAlbumRecord {
  constructor(args = {}) {
    const code = _.get(args, 'code');
    const uuid = _.get(args, 'uuid', uuidv5(`smartbox_album_${code}`, NAMESPACE));
    const folder = _.get(args, 'folder');
    super({
      uuid,
      code,
      folder,
      ...args,
    });
  }
}

export default SmartboxAlbum
