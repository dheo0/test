import { all } from 'redux-saga/effects';

import watchAppInfoSagas from './AppInfoSaga';
import watchPhotoDirectUploadSagas from './PhotoDirectUploadSaga';
import watchSmartboxSagas from './SmartboxSaga';
import watchCreateOrderSagas from './PhotoOrderSaga';

export default function* rootSaga() {
  yield all([
    watchAppInfoSagas(),
    watchPhotoDirectUploadSagas(),
    watchSmartboxSagas(),
    watchCreateOrderSagas(),
  ]);
}
