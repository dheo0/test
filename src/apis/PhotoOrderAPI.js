import client from '../utils/client';

const timeout = 20 * 1000;

export function postCreateOrder(dataSendUrl, orderInfo) {
  return client.get('', orderInfo, {
    baseURL: dataSendUrl,
    timeout,
  });
}

export function postAddCartItem(addCartUrl, cartItem) {
  return client.get('', cartItem, {
    baseURL: addCartUrl,
    timeout,
  });
}
