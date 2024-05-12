import {
  takeLatest,
  takeEvery,
  call,
  put,
  delay,
  all,
  select,
} from "redux-saga/effects";
import Immutable from "immutable";
import _ from "lodash";

import ActionTypes from "../constants/actionTypes";
import AlbumTypes from "../constants/smartboxAlbumTypes";
import SmartboxActions from "../actions/SmartboxActions";
import {
  getSmartboxAgreementState,
  updateSmartboxAgreementState,
  getSmartboxEndpoints,
  getSmartboxPhotos,
  uploadBulkImageFiles,
  /* Album */
  getSmartboxAlbums,
  addToNewAlbum,
  addToAlbum,
  addAlbum,
  /* ETC */
  addFavorites,
  deleteFavorites,
  deletePhotos,
  addTags,
} from "../apis/SmartboxAPI";
import { getSafeUserId } from "../utils/commonUtils";
import { groupFilesBySize } from "../utils/sagaUtils";
import AppInfoSelector from "../selectors/AppInfoSelector";
import PhotoDirectUploadSelector from "../selectors/PhotoDirectUploadSelector";

const MAX_UPLOAD_RETRY = 2;
const MAX_UPLOAD_CONCURRENCY = 2;

export default function* watchSmartboxSagas() {
  yield takeEvery(
    ActionTypes.REQUEST_GET_SMARTBOX_AGREEMENT_STATE,
    getAgreementStateSaga
  );
  yield takeLatest(
    ActionTypes.REQUEST_UPDATE_SMARTBOX_AGREEMENT_STATE,
    updateAgreementStateSaga
  );
  yield takeLatest(
    ActionTypes.REQUEST_GET_SMARTBOX_ENDPOINTS,
    getEndpointsSaga
  );
  yield takeEvery(ActionTypes.REQUEST_GET_SMARTBOX_PHOTOS, getPhotosSaga);
  yield takeEvery(
    ActionTypes.REQUEST_UPLOAD_IMAGE_FILES_TO_SMARTBOX,
    uploadBulkImageFilesSaga
  );
  yield takeLatest(ActionTypes.REQUEST_FLUSH_UPLOADS, flushUploadsSaga);
  /* Album */
  yield takeLatest(ActionTypes.REQUEST_GET_SMARTBOX_ALBUMS, getAlbumsSaga);
  yield takeLatest(
    ActionTypes.REQUEST_SMARTBOX_ADD_TO_NEW_ALBUM,
    addToNewAlbumSaga
  );
  yield takeLatest(ActionTypes.REQUEST_SMARTBOX_ADD_TO_ALBUM, addToAlbumSaga);
  yield takeLatest(ActionTypes.REQUEST_SMARTBOX_ADD_ALBUM, addAlbumSaga);
  /* ETC */
  yield takeEvery(ActionTypes.REQUEST_SMARTBOX_ADD_FAVORITES, addFavoritesSaga);
  yield takeEvery(
    ActionTypes.REQUEST_SMARTBOX_DELETE_FAVORITES,
    deleteFavoritesSaga
  );
  yield takeLatest(
    ActionTypes.REQUEST_SMARTBOX_ADD_OR_DELETE_FAVORITES,
    addOrDeleteFavoritesSaga
  );
  yield takeEvery(ActionTypes.REQUEST_SMARTBOX_DELETE_PHOTOS, deletePhotosSaga);
  yield takeLatest(ActionTypes.REQUEST_SMARTBOX_ADD_TAGS, addTagsSaga);
}

function* getAgreementStateSaga({ uuid, payload: userid }) {
  try {
    const result = yield call(getSmartboxAgreementState, userid);

    if (_.has(result, "error")) {
      throw new Error(_.get(result, "error"));
    }
    if (!_.isEmpty(result)) {
      yield put(
        SmartboxActions.requestGetSmartboxAgreementStateSuccess(
          {
            hasAgreementAgreed: _.get(result, "cloudagree", "N") === "Y",
            numberOfRemotePhotos: _.get(result, "cloud", 0),
          },
          { uuid }
        )
      );
    } else {
      throw new Error("스마트박스 연결에 실패하였습니다");
    }
  } catch (error) {
    yield put(
      SmartboxActions.requestGetSmartboxAgreementStateError({ error }, { uuid })
    );
  }
}

function* updateAgreementStateSaga({ uuid, payload: userid }) {
  try {
    const result = yield call(updateSmartboxAgreementState, userid);

    if (_.has(result, "error")) {
      throw new Error(_.get(result, "error"));
    }
    if (!_.isEmpty(result)) {
      yield put(
        SmartboxActions.requestUpdateSmartboxAgreementStateSuccess(
          {
            hasAgreementAgreed: _.get(result, "cloudagree", "N") === "Y",
            numberOfRemotePhotos: _.get(result, "cloud", 0),
          },
          { uuid }
        )
      );
    } else {
      throw new Error("스마트박스 연결에 실패하였습니다");
    }
  } catch (error) {
    yield put(
      SmartboxActions.requestUpdateSmartboxAgreementStateError(
        { error },
        { uuid }
      )
    );
  }
}

function* getEndpointsSaga({ uuid }) {
  try {
    const result = yield call(getSmartboxEndpoints);

    if (_.has(result, "error")) {
      throw new Error(_.get(result, "error"));
    }
    if (!_.isEmpty(result)) {
      if (!_.includes(result, "^")) {
        throw new Error("스마트박스 정보를 받아오지 못했습니다");
      }
      const [uploadingServerUrl, listingServerUrl] = _.split(result, "^");

      yield put(
        SmartboxActions.requestGetSmartboxEndpointsSuccess(
          {
            uploadingServerUrl,
            listingServerUrl,
          },
          { uuid }
        )
      );
    } else {
      throw new Error("스마트박스 연결에 실패하였습니다");
    }
  } catch (error) {
    yield put(
      SmartboxActions.requestGetSmartboxEndpointsError({ error }, { uuid })
    );
  }
}

function* getPhotosSaga({ uuid, payload }) {
  try {
    //console.log('payload', payload, getSafeUserId());
    const offset = _.get(payload, "offset", 1);
    const limit = _.get(payload, "limit", 50); // 2020.09.11 페이징 수량 임시로 늘려놓자. - TODO 페이징 개선 필요, 수정개발시에는  _.get(payload, 'limit', 50)  으로 맞추고, 개발 테스트 진행

    const result = yield call(
      getSmartboxPhotos,
      _.get(payload, "listingServerUrl", ""),
      _.get(payload, "userid", getSafeUserId()),
      _.get(payload, "type", AlbumTypes.ALL_PHOTOS),
      _.get(payload, "code", null),
      offset,
      limit
    );

    if (_.has(result, "error")) {
      throw new Error(_.get(result, "error"));
    }
    if (!_.isEmpty(result) && _.isArray(result)) {
      for (let i = 0; i < result.length; i++) {
        const node = result[i];
        /* NOTE: 앨범 내용을 조회하는 API 상의 앨범 고유구분필드는 'title' 인데,
         * 앨범 리스트를 조회하는 API 상의 앨범 고유구분필드는 'code' 임... */
        const code = _.get(node, "title");
        const folder = _.get(node, "folder");
        const analysisProgress = _.get(node, "percent", 0);
        const photos = _.get(node, "items", []);

        //console.log('TODO', photos);

        const lastOffset = offset + _.size(photos);
        const possiblyMoreItems = photos.length === limit;
        yield put(
          SmartboxActions.requestGetSmartboxPhotosSuccess(
            {
              code,
              folder,
              analysisProgress,
              photos,
              lastOffset,
              possiblyMoreItems,
            },
            { uuid }
          )
        );
      }
    } else {
      throw new Error("스마트박스 연결에 실패하였습니다");
    }
  } catch (error) {
    yield put(
      SmartboxActions.requestGetSmartboxPhotosError({ error }, { uuid })
    );
  }
}

function* uploadBulkImageFilesSaga({ uuid, payload }) {
  try {
    const { uploadingServerUrl, files } = payload;

    const partitionedFiles = groupFilesBySize(files);
    const wholeUUIDs = _.map(_.flatten(partitionedFiles), ([, , uuid]) => uuid);
    yield put(SmartboxActions.appendUploads({ willUploads: wholeUUIDs }));

    const calls = _.map(partitionedFiles, (chunked) =>
      call(uploadBulkImageFilesUploaderSaga, {
        uploadingServerUrl,
        files: chunked,
      })
    );
    const chunkedCalls = _.chunk(calls, MAX_UPLOAD_CONCURRENCY);

    for (let i = 0; i < chunkedCalls.length; i++) {
      const uploadedUUIDs = yield all(chunkedCalls[i]);
      yield setEndedAndAppendToEditor(_.flatten(uploadedUUIDs));
    }

    /* NOTE: PhotoUploadingProgress 컴포넌트가 너무 빠르게 사라지는 것을 방지. */
    yield delay(1000);

    yield put(
      SmartboxActions.requestUploadImageFilesToSmartboxSuccess({}, { uuid })
    );
    yield put(SmartboxActions.requestFlushUploads({}));
  } catch (error) {
    console.error(error);
    yield put(
      SmartboxActions.requestUploadImageFilesToSmartboxError(
        { error },
        { uuid }
      )
    );
  }
}

function* setEndedAndAppendToEditor(inclusion = []) {
  const state = yield select();
  const printSizes = AppInfoSelector.getPrintSizes(state);
  const photos = _.isEmpty(inclusion)
    ? PhotoDirectUploadSelector.getUploadCompletedFiles(state)
    : PhotoDirectUploadSelector.getUploadCompletedFiles(state).filter((photo) =>
        _.includes(inclusion, photo.uuid)
      );
  yield put(SmartboxActions.setFileUploadEnd({ ended: inclusion }));
  // yield put(SmartboxActions.appendPhotosToPhotoEditor({ photos, printSizes }));
}

function* uploadBulkImageFilesUploaderSaga({ uploadingServerUrl, files }) {
  const uploadUUIDs = [];

  try {
    const result = yield call(
      uploadBulkImageFilesAPI,
      uploadingServerUrl,
      getSafeUserId(),
      _.map(files, ([file]) => file),
      uploadUUIDs
    );

    if (_.has(result, "error")) {
      throw new Error(_.get(result, "error"));
    }
    if (!_.isEmpty(result)) {
      const uploadResults = _.get(result, "items", []);

      for (let j = 0; j < uploadResults.length; j++) {
        const uploadUUID = uploadUUIDs[j];
        const uploadMeta = uploadResults[j];

        /*
        if (_.get(uploadMeta, 'cmyk') === 'y') {
          const error = new Error('CMYK 이미지는 업로드 하실 수 없습니다');
          yield put(SmartboxActions.createImageUploadError({ error }, { uuid: uploadUUID }));
        } else {
          yield put(SmartboxActions.createImageUploadMeta({ uploadMeta }, { uuid: uploadUUID }));
        }
         */
        yield put(
          SmartboxActions.requestUploadImageFileToSmartboxSuccess({
            uuid: uploadUUID,
            photos: [uploadMeta],
          })
        );
      }

      return uploadUUIDs;
    } else {
      throw new Error("업로드 실패");
    }
  } catch (error) {
    for (let i = 0; i < uploadUUIDs.length; i++) {
      const uploadUUID = uploadUUIDs[i];
      // yield put(SmartboxActions.createImageUploadError({ error }, { uuid: uploadUUID }));
      yield put(
        SmartboxActions.requestUploadImageFileToSmartboxError(
          { error },
          { uuid: uploadUUID }
        )
      );
    }
  }
}

function* uploadBulkImageFilesAPI(
  uploadingServerUrl,
  userid,
  files,
  uploadUUIDs
) {
  for (let i = 0; i < MAX_UPLOAD_RETRY; i++) {
    try {
      return yield call(
        uploadBulkImageFiles,
        uploadingServerUrl,
        userid,
        files,
        uploadUUIDs
      );
    } catch (e) {
      if (i < MAX_UPLOAD_RETRY - 1) {
        yield delay(500);
      }
    }
  }
  throw new Error("업로드 실패");
}

function* flushUploadsSaga() {
  yield delay(1000);
  yield put(SmartboxActions.flushUploads({}));
}

/* Albums */
function* getAlbumsSaga({ uuid, payload }) {
  try {
    const result = yield call(
      getSmartboxAlbums,
      _.get(payload, "listingServerUrl", ""),
      _.get(payload, "userid", getSafeUserId())
    );

    if (_.has(result, "error")) {
      throw new Error(_.get(result, "error"));
    }
    if (!_.isEmpty(result)) {
      const albums = _.get(result, "items", [])
        .map((node) => ({
          /* NOTE: 앨범 내용을 조회하는 API 상의 앨범 고유구분필드는 'title' 인데,
           * 앨범 리스트를 조회하는 API 상의 앨범 고유구분필드는 'code' 임... */
          code: _.get(node, "code"),
          folder: _.get(node, "folder"),
        }))
        .filter((album) => _.has(album, "code") && _.has(album, "folder"));
      yield put(
        SmartboxActions.requestGetSmartboxAlbumsSuccess({ albums }, { uuid })
      );
    } else {
      throw new Error("스마트박스 연결에 실패하였습니다");
    }
  } catch (error) {
    yield put(
      SmartboxActions.requestGetSmartboxAlbumsError({ error }, { uuid })
    );
  }
}

function* addToNewAlbumSaga({ uuid, payload }) {
  try {
    const { photos } = payload;
    const idxs = photos.map((photo) => photo.idx).toJS();

    const result = yield call(
      addToNewAlbum,
      _.get(payload, "userid", getSafeUserId()),
      idxs
    );
    if (_.has(result, "error")) {
      throw new Error(_.get(result, "error"));
    }
    yield put(SmartboxActions.requestAddToNewAlbumSuccess({}, { uuid }));
  } catch (error) {
    yield put(SmartboxActions.requestAddToNewAlbumError({ error }, { uuid }));
  }
}

function* addToAlbumSaga({ uuid, payload }) {
  try {
    const { album, photos } = payload;
    const idxs = photos.map((photo) => photo.idx).toJS();

    const result = yield call(
      addToAlbum,
      _.get(payload, "userid", getSafeUserId()),
      album.code,
      idxs
    );
    if (_.has(result, "error")) {
      throw new Error(_.get(result, "error"));
    }
    yield put(SmartboxActions.requestAddToAlbumSuccess({}, { uuid }));
  } catch (error) {
    yield put(SmartboxActions.requestAddToAlbumError({ error }, { uuid }));
  }
}

function* addAlbumSaga({ uuid, payload }) {
  try {
    const { name } = payload;

    const result = yield call(
      addAlbum,
      _.get(payload, "userid", getSafeUserId()),
      name
    );
    if (_.has(result, "error")) {
      throw new Error(_.get(result, "error"));
    }
    const code = _.get(result, "album_idx");
    yield put(
      SmartboxActions.requestAddAlbumSuccess(
        { album: { code, folder: name } },
        { uuid }
      )
    );
  } catch (error) {
    yield put(SmartboxActions.requestAddAlbumError({ error }, { uuid }));
  }
}

/* ETC */

function* addFavoritesSaga({ uuid, payload }) {
  try {
    const { photos } = payload;
    const idxs = photos.map((photo) => photo.idx).toJS();

    for (let i = 0; i < idxs.length; i++) {
      const idx = idxs[i];
      const result = yield call(addFavorites, idx);
      if (_.has(result, "error")) {
        throw new Error(_.get(result, "error"));
      }
      yield put(SmartboxActions.requestAddFavoritesSuccess({ idx }, { uuid }));
    }
  } catch (error) {
    yield put(SmartboxActions.requestAddFavoritesError({ error }, { uuid }));
  }
}

function* deleteFavoritesSaga({ uuid, payload }) {
  try {
    const { photos } = payload;
    const idxs = photos.map((photo) => photo.idx).toJS();

    for (let i = 0; i < idxs.length; i++) {
      const idx = idxs[i];
      const result = yield call(deleteFavorites, idx);
      if (_.has(result, "error")) {
        throw new Error(_.get(result, "error"));
      }
      yield put(
        SmartboxActions.requestDeleteFavoritesSuccess({ idx }, { uuid })
      );
    }
  } catch (error) {
    yield put(SmartboxActions.requestDeleteFavoritesError({ error }, { uuid }));
  }
}

function* addOrDeleteFavoritesSaga({ uuid, payload }) {
  try {
    const { photos } = payload;

    for (let i = 0; i < photos.size; i++) {
      const photo = photos.get(i);
      if (photo.favorite) {
        yield put(
          SmartboxActions.requestDeleteFavorites({
            photos: Immutable.List([photo]),
          })
        );
      } else {
        yield put(
          SmartboxActions.requestAddFavorites({
            photos: Immutable.List([photo]),
          })
        );
      }
    }
    yield put(
      SmartboxActions.requestAddOrDeleteFavoritesSuccess({ photos }, { uuid })
    );
  } catch (error) {
    yield put(
      SmartboxActions.requestAddOrDeleteFavoritesError({ error }, { uuid })
    );
  }
}

function* deletePhotosSaga({ uuid, payload }) {
  try {
    const { photos } = payload;
    const idxs = photos.map((photo) => photo.idx).toJS();
    const calls = idxs.map((idx) =>
      call(deletePhotos, _.get(payload, "userid", getSafeUserId()), idx)
    );

    const results = yield all(calls);
    const { ok, errors } = _.reduce(
      results,
      (ret, row) => {
        if (_.get(row, "code") !== "0000") {
          _.set(ret, "ok", false);
        }
        if (!_.isEmpty(_.get(row, "msg"))) {
          ret.errors.push(_.get(row, "msg"));
        }
        return ret;
      },
      { ok: true, errors: [] }
    );

    if (ok) {
      yield put(SmartboxActions.requestDeletePhotosSuccess({ idxs }, { uuid }));
    } else {
      yield put(SmartboxActions.requestDeletePhotosError({ errors }, { uuid }));
    }
  } catch (error) {
    yield put(SmartboxActions.requestDeletePhotosError({ error }, { uuid }));
  }
}

function* addTagsSaga({ uuid, payload }) {
  try {
    const { photos, tags } = payload;
    const idxs = photos.map((photo) => photo.idx).toJS();
    const calls = idxs.map((idx) =>
      call(addTags, _.get(payload, "userid", getSafeUserId()), idx, tags)
    );

    const results = yield all(calls);
    const { ok, errors } = _.reduce(
      results,
      (ret, row) => {
        if (_.get(row, "code") !== "0000") {
          _.set(ret, "ok", false);
        }
        if (!_.isEmpty(_.get(row, "msg"))) {
          ret.errors.push(_.get(row, "msg"));
        }
        return ret;
      },
      { ok: true, errors: [] }
    );

    if (ok) {
      yield put(
        SmartboxActions.requestAddTagsSuccess({ idxs, tags }, { uuid })
      );
    } else {
      yield put(SmartboxActions.requestAddTagsError({ errors }, { uuid }));
    }
  } catch (error) {
    console.error(error);
    yield put(SmartboxActions.requestAddTagsError({ error }, { uuid }));
  }
}
