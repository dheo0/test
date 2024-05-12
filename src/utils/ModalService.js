import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';

import Modal from '../components/Modal';

const MODAL_WRAPPER_ID = 'modal-wrapper';
const modals = {};

function retrieveModalWrapper() {
  const modalWrapper = document.getElementById(MODAL_WRAPPER_ID);
  if (!modalWrapper) { throw new Error('ModalWrapper must be mounted!') }
  return modalWrapper;
}

export function ModalWrapper() {
  return (<div id={MODAL_WRAPPER_ID} />)
}

const _createGlobalModal = (onClose = () => {}, Component = Modal, props = {}) => {
  if (Component) {
    if (_.has(modals, Component)) {
      const el = _.get(modals, Component);
      ReactDOM.unmountComponentAtNode(el);
    }

    const el = window.document.createElement('div');
    retrieveModalWrapper().appendChild(el);

    ReactDOM.render(
      <Component
        _closeHandler={() => {
          ReactDOM.unmountComponentAtNode(el);
          onClose();
        }}
        { ...props }
      />,
      el,
    );

    _.set(modals, Component, el);

    return () => {
      closeModal(Component);
    };
  }
};

export const createOrderConfirmModal = (_message, title, props) => {
  return createOrderConfirmMessageModal(_message, title, {
    isOrderConfirmModal: true,
    ...props,
  });
};

export const createOrderConfirmMessageModal = (_message, title, props) => {
  const message = (() => {
    if (_.isString(_message)) { return _message }
    if (_.isObject(_message) && _.has(_message, 'error')) { return _.get(_message, 'error') }
    if (_message instanceof Error) { return _message.toString() }
    if (_.isArray(_message)) {
      const linemsg = _message.map(m => (`${m}<BR>`));
      return `${linemsg.join('')}`;
    }
    return null;
  })();
  const onClose = _.get(props, 'onClose', () => {});
  return (message && _createGlobalModal(onClose, Modal, { title, message, ...props })) || null;
};

export const createPrintOptionConfirmModal = (_message, title, props) => {
  return createPrintOptionConfirmMessageModal(_message, title, {
    isConfirmModal: true,
    ...props,
  });
};

export const createPrintOptionConfirmMessageModal = (_message, title, props) => {
  const message = (() => {
    if (_.isString(_message)) { return _message }
    if (_.isObject(_message) && _.has(_message, 'error')) { return _.get(_message, 'error') }
    if (_message instanceof Error) { return _message.toString() }
    if (_.isArray(_message)) {
      const linemsg = _message.map(m => (`${m}<BR>`));
      return `${linemsg.join('')}`;
    }
    return null;
  })();
  const onClose = _.get(props, 'onClose', () => {});
  return (message && _createGlobalModal(onClose, Modal, { title, message, ...props })) || null;
};

export const createConfirmModal = (_message, title, props) => {
  return createMessageModal(_message, title, {
    isConfirmModal: true,
    ...props,
  });
};

export const createPaperFullConfirmModal = (_message, title, props) => {
  return createMessageModal(_message, title, {
    isPaperFullConfirmModal: true,
    ...props,
  });
};

export const createMessageModal = (_message, title, props) => {
  const message = (() => {
    if (_.isString(_message)) { return _message }
    if (_.isObject(_message) && _.has(_message, 'error')) { return _.get(_message, 'error') }
    if (_message instanceof Error) { return _message.toString() }
    if (_.isArray(_message)) {
      const li = _message.map(m => (`<li>${m}</li>`));
      return `<ul>${li.join('')}</ul>`;
    }
    return null;
  })();
  const onClose = _.get(props, 'onClose', () => {});
  return (message && _createGlobalModal(onClose, Modal, { title, message, ...props })) || null;
};

export const createModal = (Component, { onClose, ...otherProps } = {}) => {
  return _createGlobalModal(onClose, Component, { ...otherProps });
};

export const closeModal = (Component) => {
  if (_.has(modals, Component)) {
    const el = _.get(modals, Component);
    ReactDOM.unmountComponentAtNode(el);

    try {
      retrieveModalWrapper().removeChild(el);
    } catch (e) {}
  }
};
