import Immutable from 'immutable'

export default store => next => { // eslint-disable-line no-unused-vars
  let pending = Immutable.Map()

  return action => {
    const ret = (() => {
      if (action.uuid && action.meta && action.meta.lifecycle) {
        return next({
          ...action,
          promise: new Promise((resolve, reject) => {
            const { lifecycle } = action.meta;
            pending = pending.setIn([action.uuid, lifecycle.resolve], resolve);
            pending = pending.setIn([action.uuid, lifecycle.reject], reject);
          }),
        });
      }
      return next(action);
    })();

    if (action.uuid && pending.hasIn([action.uuid, action.type])) {
      const resolveOrReject = pending.getIn([action.uuid, action.type]);
      pending = pending.delete(action.uuid);
      resolveOrReject(action);
    }

    return ret
  }
};
