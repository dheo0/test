import AT from '../constants/actionTypes';
import { actionCreator, actionCreatorWithPromise } from '../utils/reduxUtils';

export default {
  requestCreateOrder: actionCreatorWithPromise(AT.REQUEST_CREATE_ORDER),
  requestCreateOrderSuccess: actionCreator(AT.REQUEST_CREATE_ORDER_SUCCESS),
  requestCreateOrderError: actionCreator(AT.REQUEST_CREATE_ORDER_ERROR),
  requestAddToCart: actionCreatorWithPromise(AT.REQUEST_ADD_TO_CART),
  requestAddToCartSuccess: actionCreatorWithPromise(AT.REQUEST_ADD_TO_CART_SUCCESS),
  requestAddToCartError: actionCreatorWithPromise(AT.REQUEST_ADD_TO_CART_ERROR),
}
