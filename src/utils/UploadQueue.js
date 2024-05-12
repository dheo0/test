import Immutable from 'immutable';
import _ from 'lodash';

const UploadQueueRecords = Immutable.Record({
  willUploads: Immutable.Set(),
  ended: Immutable.Set(),
  flushed: false,
});

class UploadQueue extends UploadQueueRecords {
  constructor(willUploads = []) {
    super({
      willUploads: Immutable.Set().withMutations((set) => {
        _.forEach(willUploads, (uuid) => set.add(uuid));
      }),
    });
  }

  isEmpty() {
    return this.willUploads.isEmpty();
  }

  isFlushed() {
    return this.flushed;
  }

  appendAll(uuids) {
    return this.set('willUploads', this.willUploads.withMutations((set) => {
      _.forEach(uuids, uuid => set.add(uuid));
    }));
  }

  endAll(uuids) {
    return this.set('ended', this.ended.withMutations((set) => {
      _.forEach(uuids, uuid => set.add(uuid));
    }));
  }

  clear(flush = false) {
    return this.withMutations((uploadQueue) => {
      uploadQueue.set('willUploads', uploadQueue.willUploads.clear());
      uploadQueue.set('ended', uploadQueue.ended.clear());
      uploadQueue.set('flushed', flush);
    });
  }

  flush() {
    return this.set('flushed', true);
  }

  getCounts() {
    return {
      willUploads: this.willUploads.size,
      ended: this.ended.size,
      flushed: this.flushed,
    };
  }
}

export default UploadQueue
