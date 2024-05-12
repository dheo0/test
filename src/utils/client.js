import axios from 'axios';
import _ from 'lodash';

import { isProduction } from '../utils/commonUtils';

export function getBaseUrl() {
  return isProduction()
    ? 'https://www.photomon.com'
    : 'https://www.photomon.com';//'http://dev.photomon.com'; // 2020.08.04 개발서버 연결오류로 임시 http로 연결... 'https://dev.photomon.com';
}

function createRequestOption({ config, params }) {
  return ({
    ...config,
    params: {
      ...params,
      t: new Date().getTime(),
    }
  })
}

const _client = axios.create({
  baseURL: getBaseUrl(),
  timeout: isProduction() ? 10000 : 5000,
  headers: {
    Accept: ['application/json', 'text/plain', 'text/html'].join(', '),
    'Content-Type': 'application/json',
  },
});

const errorHandler = (errorObj) => {
  let error;

  if (!_.has(errorObj, 'status')) {
    error = '네트워크 연결 실패';
  }

  if (!isProduction() && !_.isEmpty(error)) { console.error(error) }
  return { error };
};

const client = {
  options: function(url, params = {}) {
    return _client
      .options(url, createRequestOption({ params }))
      .then(response => response.data);
  },
  get: function(url, params = {}, config = {}) {
    //console.log(url);
    return _client
      .get(url, createRequestOption({ config, params }))
      .then(response => response.data)
      .catch(errorHandler);
  },
  post: function(url, data = {}, requestOptions = {}) {
    //console.log(url);
    return _client
      .post(url, data, { ...requestOptions })
      .then(response => response.data)
      .catch(errorHandler)
  },
  bulkUploadWithoutErrorHandling: function(url, data = {}, requestOptions = {}) {
    return _client
      .post(url, data, { ...requestOptions })
      .then(response => response.data)
  },
  postFormURLEncoded: function(url, data = {}, requestOptions = {}) {
    return this.post(
      url,
      data,
      {
        ...requestOptions,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    )
  },
  put: function(url, data = {}, requestOptions = {}) {
    return _client
      .put(url, data, { ...requestOptions })
      .then(response => response.data)
      .catch(errorHandler)
  }
};

export default client
