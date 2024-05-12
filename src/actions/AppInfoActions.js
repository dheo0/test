import AT from '../constants/actionTypes';
import { actionCreator, actionCreatorWithPromise } from '../utils/reduxUtils';

export default {
  requestGetPrintSizeInfo: actionCreatorWithPromise(AT.REQUEST_GET_PRINT_SIZE_INFO),
  requestGetPrintSizeInfoSuccess: actionCreatorWithPromise(AT.REQUEST_GET_PRINT_SIZE_INFO_SUCCESS),
  requestGetPrintSizeInfoError: actionCreatorWithPromise(AT.REQUEST_GET_PRINT_SIZE_INFO_ERROR),
  requestGetUploadingServerUrl: actionCreatorWithPromise(AT.REQUEST_GET_UPLOADING_SERVER_URL),
  requestGetUploadingServerUrlSuccess: actionCreatorWithPromise(AT.REQUEST_GET_UPLOADING_SERVER_URL_SUCCESS),
  requestGetUploadingServerUrlError: actionCreatorWithPromise(AT.REQUEST_GET_UPLOADING_SERVER_URL_ERROR),
  requestGetPlusProducts: actionCreator(AT.REQUEST_GET_PLUS_PRODUCTS),
  requestGetPlusProductsSuccess: actionCreator(AT.REQUEST_GET_PLUS_PRODUCTS_SUCCESS),
  requestGetPlusProductsError: actionCreator(AT.REQUEST_GET_PLUS_PRODUCTS_ERROR),
  requestGetOrderingServerUrl: actionCreatorWithPromise(AT.REQUEST_GET_ORDERING_SERVER_URL),
  requestGetOrderingServerUrlSuccess: actionCreatorWithPromise(AT.REQUEST_GET_ORDERING_SERVER_URL_SUCCESS),
  requestGetOrderingServerUrlError: actionCreatorWithPromise(AT.REQUEST_GET_ORDERING_SERVER_URL_ERROR),
};
