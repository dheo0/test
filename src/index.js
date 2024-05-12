import 'react-app-polyfill/ie11';
import 'react-app-polyfill/ie9';
import './polyfills';

import React from 'react';
import ReactDOM from 'react-dom';
import createSagaMiddleware from 'redux-saga';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';

import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

import ReduxService from './utils/ReduxService';
import { isDevelopment, getVersion } from './utils/commonUtils';
import ActionLifecycles from './middlewares/actionLifecycles';
import rootSaga from './sagas';
import reducers from './reducers';

const rootReducer = combineReducers({
  ...reducers,
});
const sagaMiddleware = createSagaMiddleware();

const store = createStore(
  rootReducer,
  (() => {
    console.log(`v${getVersion()}`);
    if (isDevelopment()) {
      console.log('Running on development mode.');
      return applyMiddleware(
        // require('redux-logger').logger,
        ActionLifecycles,
        sagaMiddleware,
      )
    } else {
      return applyMiddleware(
        ActionLifecycles,
        sagaMiddleware,
      )
    }
  })(),
);

ReduxService.setStore(store);

sagaMiddleware.run(rootSaga);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
