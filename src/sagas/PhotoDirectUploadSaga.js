import { takeEvery, takeLatest, call, put, delay, all, select, debounce } from 'redux-saga/effects';
import Immutable from 'immutable'
import _ from 'lodash';

import PhotoDirectUploadActions from '../actions/PhotoDirectUploadActions';
import PhotoEditorActions from '../actions/PhotoEditorActions';
import AppInfoSelector from '../selectors/AppInfoSelector';
import PhotoDirectUploadSelector from '../selectors/PhotoDirectUploadSelector';
import ActionTypes from '../constants/actionTypes';
import { uploadBulkImageFiles } from '../apis/PhotoDirectUploadAPI';
import { getSafeOrderKey, isIE } from '../utils/commonUtils';
import { groupFilesBySize } from '../utils/sagaUtils';

const MAX_UPLOAD_RETRY = 2;
const MAX_UPLOAD_CONCURRENCY = 1; // 2021.01.25 동시 업로드 갯수, 중복 파일 이슈로 1건씩만 전송하자.

let COMPLETED_QUEUE = Immutable.List();

export default function* watchPhotoDirectUploadSagas() {
  yield takeEvery(ActionTypes.REQUEST_BULK_UPLOAD_IMAGE_FILES, uploadBulkImageFilesSaga);
  yield takeLatest(ActionTypes.REQUEST_FLUSH_UPLOADS, flushUploadsSaga);
  yield debounce(isIE() ? 3000 : 1000, ActionTypes.BULK_FLUSH, bulkFlush);
}

function* uploadBulkImageFilesSaga({ uuid: actionUUID, payload }) {
  try {
    const { uploadingServerUrl, files } = payload;

    const partitionedFiles = groupFilesBySize(files);
    const wholeUUIDs = _.map(_.flatten(partitionedFiles), ([,, uuid]) => uuid);
    yield put(PhotoDirectUploadActions.appendUploads({ willUploads: wholeUUIDs }));

    const calls = _.map(partitionedFiles,
        chunked => call(uploadBulkImageFilesUploaderSaga, { uploadingServerUrl, files: chunked }));
    const chunkedCalls = _.chunk(calls, MAX_UPLOAD_CONCURRENCY); // 동시전송 최대 수 - MAX_UPLOAD_CONCURRENCY

    /* NOTE: PhotoUploadingProgress 컴포넌트가 너무 빠르게 사라지는 것을 방지. */
    yield delay(1000);

    for (let i=0; i<chunkedCalls.length; i++) {
      const result = yield all(chunkedCalls[i]);

      const uploadedUUIDs = _.flatten(result);
      COMPLETED_QUEUE = COMPLETED_QUEUE.withMutations((list) => {
        _.forEach(uploadedUUIDs, uuid => list.push(uuid));
      });
      yield put(PhotoDirectUploadActions.setFileUploadEnd({ ended: uploadedUUIDs }));
      yield put({ type: ActionTypes.BULK_FLUSH });
    }

    /* NOTE: PhotoUploadingProgress 컴포넌트가 너무 빠르게 사라지는 것을 방지. */
    yield delay(1000);

    yield put(PhotoDirectUploadActions.requestBulkUploadImageFilesSuccess({}, { uuid: actionUUID }));
    yield put(PhotoDirectUploadActions.requestFlushUploads({}));

  } catch (error) {
    console.error(error);
    yield put(PhotoDirectUploadActions.requestBulkUploadImageFilesError({ error }, { uuid: actionUUID }));
  }
}

function* uploadBulkImageFilesUploaderSaga({ uploadingServerUrl, files }) { // 2020.06.24 파일 업로드
  const uploadUUIDs = [];

  try {
    for (let j=0; j<files.length; j++) {
      const [file, selectedAt, uploadUUID] = files[j];
      yield put(PhotoDirectUploadActions.createImageUpload(
        { uuid: uploadUUID, file, selectedAt }, { uuid: uploadUUID }
      ));
      uploadUUIDs[j] = uploadUUID;
    }
    
    //yield delay(10); // 2022.04.19 중복저장 방지를 위한 대기

    const result = yield call(uploadBulkImageFilesAPI,
      uploadingServerUrl,
      getSafeOrderKey(),
      _.map(files, ([file]) => file),
      uploadUUIDs,
    );

    if (_.has(result, 'error')) { throw new Error(_.get(result, 'error')) }
    if (!_.isEmpty(result)) {
      
      const uploadResults = _.get(result, 'items', []);

      for (let j=0; j<uploadResults.length; j++) {
        const uploadUUID = uploadUUIDs[j];
        const uploadMeta = uploadResults[j];

        if (_.get(uploadMeta, 'cmyk') === 'y') {
          const error = new Error('CMYK 이미지는 업로드 하실 수 없습니다');
          yield put(PhotoDirectUploadActions.createImageUploadError({ error }, { uuid: uploadUUID }));
        } else {
          yield put(PhotoDirectUploadActions.createImageUploadMeta({ uploadMeta }, { uuid: uploadUUID }));
        }
      }

      return uploadUUIDs;

    } else {
      throw new Error('업로드 실패');
    }

  } catch (error) {
    for (let i=0; i< uploadUUIDs.length; i++) {
      const uploadUUID = uploadUUIDs[i];
      yield put(PhotoDirectUploadActions.createImageUploadError({ error }, { uuid: uploadUUID }));
    }
  }
}

function* uploadBulkImageFilesAPI(uploadingServerUrl, userid, files, uploadUUIDs) {
  for (let i = 0; i < MAX_UPLOAD_RETRY; i++) {
    try {
      // 2020.04.03 이전 upload 전송과 중복사진 발생 오류 수정
      const totalSize = files.reduce((tot, file) => {return tot+file.size}, 0);
      if (totalSize < 1024*1024) yield delay(10); // 1M 이내 사용용량의 경우 delay 적용
      
      return yield call(uploadBulkImageFiles,
        uploadingServerUrl,
        userid,
        files,
        uploadUUIDs,
      );
    } catch (e) {
      if (i < (MAX_UPLOAD_RETRY - 1)) { yield delay(500) }
    }
  }
  throw new Error('업로드 실패');
}

function* flushUploadsSaga() {
  yield delay(1000);
  yield put(PhotoDirectUploadActions.flushUploads({}));
}

function* bulkFlush() {
  const UUIDs = Immutable.List().asMutable();
  COMPLETED_QUEUE = COMPLETED_QUEUE.withMutations((list) => {
    list.forEach(uuid => UUIDs.push(uuid));
    list.clear();
  });
  const state = yield select();
  const printSizes = AppInfoSelector.getPrintSizes(state);
  const photos = PhotoDirectUploadSelector.getUploadCompletedFiles(state)
    .filter(photo => UUIDs.includes(photo.uuid));
  yield put(PhotoEditorActions.appendPhotosToPhotoEditor({ photos, printSizes }));
}
