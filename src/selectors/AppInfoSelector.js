import Immutable from 'immutable';
import { createSelector } from 'reselect';

import { getSafeOrderType } from '../utils/commonUtils';

const isFetchingUploadingServerUrl = state => state.AppInfoReducer.isFetchingUploadingServerUrl;

const getUploadingServerUrl = createSelector(
  state => state.AppInfoReducer.uploadingServerUrl,
  (uploadingServerUrl) => uploadingServerUrl,
);

const getPrintSizeMap = (state) => state.AppInfoReducer.printSizeInfo;

const getPrintSizes = (state, mode = getSafeOrderType()) =>
  state.AppInfoReducer.printSizeInfo.get(mode, /* default value */ Immutable.List());

const getPrintSizeInfoError = (state) => state.AppInfoReducer.printSizeInfoError;

const getUploadingServerUrlError = (state) => state.AppInfoReducer.uploadingServerUrlError;

const getPlusProductsError = (state) => state.AppInfoReducer.plusProductsError;

export default {
  isFetchingUploadingServerUrl,
  getUploadingServerUrl,
  getPrintSizeMap,
  getPrintSizes,
  getPrintSizeInfoError,
  getUploadingServerUrlError,
  getPlusProductsError,
}
