import Immutable from 'immutable'
import _ from 'lodash';
import { flow, split, filter, map, forEach } from 'lodash/fp';

import ActionTypes from '../constants/actionTypes';
import PrintSize from '../models/PrintSize';
import PlusProduct from '../models/PlusProduct';

const initialState = {
  isFetchingPrintSizeInfo: false,
  isFetchingUploadingServerUrl: false,
  isFetchingPlusProducts: false,
  printSizeInfo: Immutable.Map(),
  uploadingServerUrl: null,
  plusProducts: Immutable.List(),
  printSizeInfoError: null,
  uploadingServerUrlError: null,
  plusProductsError: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.REQUEST_GET_PRINT_SIZE_INFO: {
      return {
        ...state,
        isFetchingPrintSizeInfo: true,
      };
    }

    case ActionTypes.REQUEST_GET_PRINT_SIZE_INFO_SUCCESS: {
      const printSizeByMode = Immutable.List().withMutations((list) => {
        flow(
          split('|'),
          filter(_.identity),
          map((printSize) => {
            const tokens = _.split(printSize, ':');
            if (tokens.length !== 9 || _.some(tokens, token => _.isEmpty(token))) { return null }
            const [size, currentPrice, originalPrice, width, height, minWidth, minHeight, printWidth, printHeight] = tokens;
            return new PrintSize({
              size, currentPrice, originalPrice,
              width, height, minWidth, minHeight, printWidth, printHeight,
            });
          }),
          filter(_.identity),
          forEach(printSize => list.push(printSize))
        )(action.payload.printSizeInfo)
      });

      return {
        ...state,
        isFetchingPrintSizeInfo: false,
        printSizeInfo: state.printSizeInfo.set(action.payload.mode, printSizeByMode),
      };
    }

    case ActionTypes.REQUEST_GET_PRINT_SIZE_INFO_ERROR: {
      return {
        ...state,
        isFetchingPrintSizeInfo: false,
        printSizeInfo: state.printSizeInfo.clear(),
        printSizeInfoError: _.get(action, 'payload.error'),
      };
    }

    case ActionTypes.REQUEST_GET_UPLOADING_SERVER_URL: {
      return {
        ...state,
        isFetchingUploadingServerUrl: true,
      }
    }

    case ActionTypes.REQUEST_GET_UPLOADING_SERVER_URL_SUCCESS: {
      return {
        ...state,
        isFetchingUploadingServerUrl: false,
        uploadingServerUrl: action.payload.uploadingServerUrl,
      }
    }

    case ActionTypes.REQUEST_GET_UPLOADING_SERVER_URL_ERROR: {
      return {
        ...state,
        isFetchingUploadingServerUrl: false,
        uploadingServerUrl: null,
        uploadingServerUrlError: _.get(action, 'payload.error'),
      }
    }

    case ActionTypes.REQUEST_GET_PLUS_PRODUCTS: {
      return {
        ...state,
        isFetchingPlusProducts: true,
      }
    }

    case ActionTypes.REQUEST_GET_PLUS_PRODUCTS_SUCCESS: {
      return {
        ...state,
        isFetchingPlusProducts: false,
        plusProducts: state.plusProducts.clear().withMutations((list) => {
          action.payload.items.forEach(item => list.push(new PlusProduct(item)));
        }),
      }
    }

    case ActionTypes.REQUEST_GET_PLUS_PRODUCTS_ERROR: {
      return {
        ...state,
        isFetchingPlusProducts: false,
        plusProductsError: _.get(action, 'payload.error'),
      }
    }

    default:
      return state;
  }
}
