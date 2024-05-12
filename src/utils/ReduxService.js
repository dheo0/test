class ReduxService {
  __store = {};

  setStore(store) {
    this.__store = store;
    return this;
  }

  getStore() {
    return this.__store;
  }

  getState() {
    if (this.getStore()) {
      return this.getStore().getState();
    }
    return null;
  }
}

export default new ReduxService()
