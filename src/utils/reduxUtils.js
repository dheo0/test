import _ from 'lodash';
import uuidv4 from 'uuid/v4';
import uuidv5 from 'uuid/v5';

const NAMESPACE = uuidv4();

export function actionCreator(requestType) {
  return (payload, meta) => ({
    uuid: _.get(meta, 'uuid', uuidv5(`${requestType}_${+Date.now()}`, NAMESPACE)),
    type: requestType,
    payload,
  })
}

export function actionCreatorWithPromise(requestType) {
  return (payload, meta) => ({
    uuid: _.get(meta, 'uuid', uuidv5(`${requestType}_${+Date.now()}`, NAMESPACE)),
    type: requestType,
    payload,
    meta: {
      lifecycle: {
        resolve: `${requestType}_SUCCESS`,
        reject: `${requestType}_ERROR`,
      },
    },
  })
}
