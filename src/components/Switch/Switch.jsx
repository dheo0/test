import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import styled from 'styled-components';

import styles from './Switch.module.scss';

const StyledControl = styled.div`
  background-image: url('images/ic_switch.png');

  &:hover {
    background-image: url('images/ic_switch_over.png');
  }
`;

function Switch({ className, value, disabled, ...otherProps }) {
  return (
    <div
      className={classNames(styles.Switch, { [styles.disabled]: disabled }, className)}
      data-value={value}
      {...otherProps}
    >
      <div className={styles.Bar} />
      <StyledControl className={styles.Control} />
    </div>
  );
}

Switch.propTypes = {
  className: PropTypes.string,
  value: PropTypes.bool,
  disabled: PropTypes.bool,
};

Switch.defaultProps = {
  className: null,
  value: false,
  disabled: false,
};

export default Switch
