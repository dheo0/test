import { takeLatest, all, call, put, delay } from 'redux-saga/effects';
import { flow, flatten, filter, map, uniqBy, chunk } from 'lodash/fp';
import _ from 'lodash';

import ActionTypes from '../constants/actionTypes';
import PhotoOrderActions from '../actions/PhotoOrderActions';
import { postCreateOrder, postAddCartItem } from '../apis/PhotoOrderAPI';

const MAX_RETRY = 3;

export default function* watchCreateOrderSagas() {
  yield takeLatest(ActionTypes.REQUEST_CREATE_ORDER, createOrderSaga);
  yield takeLatest(ActionTypes.REQUEST_ADD_TO_CART, addToCartSaga);
}

function* createOrderSaga({ uuid, payload }) {
  try {
    let seq_start_value = 10000;
    
     _.get(payload, 'orderInfos', []).forEach(orderInfo => {
       orderInfo.seq_index = seq_start_value++; // 2024.01.03 사진업로드 순서위한 순서 값
     })

    const tasks = flow(
      map(orderInfo => call(withRetry, postCreateOrder, payload.dataSendUrl, orderInfo)),      
      //map(orderInfo => call(withRetry, postCreateOrder, 'https://www.photomon.com/include/Appinfo/PrintSenddata_html5_ljb.asp', orderInfo)),      
      chunk(5), // 서버연동 동시 호출 수
    )(_.get(payload, 'orderInfos', []));

    const results = [];

    for (let i=0; i<tasks.length; i++) {
      const chunkedTask = tasks[i];
      const chunkedResults = yield all(chunkedTask);
      results.push(chunkedResults);
    }

    const errorMessages = flow(
      flatten,
      filter(({ code }) => code !== '0000'),
      map(({ msg }) => msg),
      uniqBy(_.identity)
    )(results);

    if (_.isEmpty(errorMessages)) {
      yield put(PhotoOrderActions.requestCreateOrderSuccess({}, { uuid }));
    } else {
      yield put(PhotoOrderActions.requestCreateOrderError({ errors: errorMessages }, { uuid }));
    }

  } catch (error) {
    yield put(PhotoOrderActions.requestCreateOrderError({ errors: [error.message] }, { uuid }));
  }
}

function* addToCartSaga({ uuid, payload }) {
  try {
    const tasks = flow(
      map(cartItem => call(withRetry, postAddCartItem, payload.addCartUrl, cartItem)),
      chunk(5),
    )(_.get(payload, 'cartItems', []));

    const results = [];

    for (let i=0; i<tasks.length; i++) {
      const chunkedTask = tasks[i];
      const chunkedResults = yield all(chunkedTask);
      _.forEach(chunkedResults, r => results.push(r));
    }

    const { ok, errors, moveurl } = _.reduce(results, (ret, row) => {
      if (_.get(row, 'code') !== '0000') { _.set(ret, 'ok', false) }
      if (!_.isEmpty(_.get(row, 'msg'))) { ret.errors.push(_.get(row, 'msg')) }
      if (!_.isEmpty(_.get(row, 'moveurl'))) { _.set(ret, 'moveurl', _.get(row, 'moveurl')) }
      return ret;
    }, { ok: true, errors: [], moveurl: '' });

    if (ok) {
      yield put(PhotoOrderActions.requestAddToCartSuccess({ moveurl }, { uuid }));
    } else {
      yield put(PhotoOrderActions.requestAddToCartError({ errors }, { uuid }));
    }

  } catch (error) {
    yield put(PhotoOrderActions.requestAddToCartError({ errors: [error.message] }, { uuid }));
  }
}

function* withRetry(api, ...args) {
  for (let i = 0; i < MAX_RETRY; i++) {
    try {
      //console.log('사진파일 정보 전송 - ', api, ...args)

      return yield call(
        api,
        ...args,
      );
    } catch (e) {
      if (i < (MAX_RETRY - 1)) { yield delay(200) }
    }
  }
  throw new Error('주문 실패');
}
