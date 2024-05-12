import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import styles from './Spinner.module.scss';

function Spinner({ className }) {
  return (
    <div className={classNames(styles['lds-spinner'], className)}>
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
    </div>
  );
}

Spinner.propTypes = {
  className: PropTypes.string,
};

Spinner.defaultProps = {
  className: null,
};

export default Spinner;
