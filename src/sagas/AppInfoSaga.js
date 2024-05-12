import { takeLatest, takeEvery, call, put } from 'redux-saga/effects';
import _ from 'lodash';

import ActionTypes from '../constants/actionTypes';
import AppInfoActions from '../actions/AppInfoActions';
import { getPrintSizeInfo, getUploadingServerUrl, getPlusProducts, getOrderingServerUrl } from '../apis/AppInfoAPI';

//const PRINT_SIZE_INFO_FALLBACK = '3x4:69:200:10.2:8.9:600:450:10.2:8.9|3x5:69:240:12.7:8.9:750:450:12.7:8.95|D4:99:300:13.5:10.2:900:600:13.4394:10.2|4x6:99:300:15.2:10.2:900:600:15.2:10.2671|5x7:240:600:17.8:12.7:1050:750:17.678:12.7|6x8:490:1000:20.3:15.2:1200:900:20.216:15.2|8x10:990:2400:25.4:20.3:1500:1200:25.4:20.364|A4:990:3000:29.7:21:1800:1200:29.58:21|10x13:2000:6000:33:25.4:1950:1500:32.913:25.4|10x15:2000:6000:38.1:25.4:2250:1500:37.95:25.4|11x14:2200:6000:35.5:27.9:2100:1650:35.397:27.9|12x17:3300:6300:43.2:30.5:2550:1800:43.2:30.5|';
  const PRINT_SIZE_INFO_FALLBACK = '3x4:106:200:10.2:8.9:600:450:10.2:8.9|3x5:108:240:12.7:8.9:750:450:12.7:8.95|D4:138:300:13.5:10.2:900:600:13.4394:10.2|4x6:138:300:15.2:10.2:900:600:15.2:10.2671|5x7:258:600:17.8:12.7:1050:750:17.678:12.7|6x8:490:1000:20.3:15.2:1200:900:20.216:15.2|8x10:990:2400:25.4:20.3:1500:1200:25.4:20.364|A4:990:3000:29.7:21:1800:1200:29.58:21|10x13:2300:6000:33:25.4:1950:1500:32.913:25.4|10x15:2300:6000:38.1:25.4:2250:1500:37.95:25.4|11x14:2300:6000:35.5:27.9:2100:1650:35.397:27.9|12x17:3300:6300:43.2:30.5:2550:1800:43.2:30.5|'; // 2023.01.13
  
export default function* watchAppInfoSagas() {
  yield takeEvery(ActionTypes.REQUEST_GET_PRINT_SIZE_INFO, getPrintInfoSaga);
  yield takeLatest(ActionTypes.REQUEST_GET_UPLOADING_SERVER_URL, getUploadingServerUrlSaga);
  yield takeLatest(ActionTypes.REQUEST_GET_PLUS_PRODUCTS, getPlusProductsSaga);
  yield takeLatest(ActionTypes.REQUEST_GET_ORDERING_SERVER_URL, getOrderingServerUrlSaga);
}

function* getPrintInfoSaga({ uuid, payload: mode }) {
  try {
    const printSizeInfo = yield call(getPrintSizeInfo, mode);

    if (_.has(printSizeInfo, 'error')) { throw new Error(_.get(printSizeInfo, 'error')) }
    if (!_.isEmpty(printSizeInfo)) {
      yield put(AppInfoActions.requestGetPrintSizeInfoSuccess({ printSizeInfo, mode }, { uuid }));
    } else {
      yield put(AppInfoActions.requestGetPrintSizeInfoSuccess({ printSizeInfo: PRINT_SIZE_INFO_FALLBACK, mode }, { uuid }));
    }

  } catch (error) {
    // yield put(AppInfoActions.requestGetPrintSizeInfoSuccess({ printSizeInfo: PRINT_SIZE_INFO_FALLBACK, mode }, { uuid }));
    yield put(AppInfoActions.requestGetPrintSizeInfoError({ error }, { uuid }));
  }
}

function* getUploadingServerUrlSaga({ uuid }) {
  try {
    const uploadingServerUrl = yield call(getUploadingServerUrl);

    if (_.has(uploadingServerUrl, 'error')) { throw new Error(_.get(uploadingServerUrl, 'error')) }
    if (!_.isEmpty(uploadingServerUrl)) {
      yield put(AppInfoActions.requestGetUploadingServerUrlSuccess({ uploadingServerUrl }, { uuid }));
    } else {
      throw new Error('서버 정보가 없습니다');
    }

  } catch (error) {
    yield put(AppInfoActions.requestGetUploadingServerUrlError({ error }, { uuid }));
  }
}

function* getPlusProductsSaga({ uuid }) {
  try {
    const result = yield call(getPlusProducts);

    if (_.has(result, 'error')) { throw new Error(_.get(result, 'error')) }
    if (!_.isEmpty(result)) {
      const items = _.get(result, 'items');
      yield put(AppInfoActions.requestGetPlusProductsSuccess({ items }, { uuid }));
    } else {
      throw new Error('상품 정보를 받지 못헀습니다');
    }

  } catch (error) {
    yield put(AppInfoActions.requestGetPlusProductsError({ error }, { uuid }));
  }
}

function* getOrderingServerUrlSaga({ uuid }) {
  try {
    const result = yield call(getOrderingServerUrl);

    if (_.has(result, 'error')) { throw new Error(_.get(result, 'error')) }
    if (!_.isEmpty(result)) {
      const { OrderNo, addCartUrl, dataSendUrl } = _.get(result, 'items[0]');
      yield put(AppInfoActions.requestGetOrderingServerUrlSuccess({ OrderNo, addCartUrl, dataSendUrl }, { uuid }));
    } else {
      throw new Error('서버 정보가 없습니다');
    }

  } catch (error) {
    yield put(AppInfoActions.requestGetOrderingServerUrlError({ error }, { uuid }));
  }
}
