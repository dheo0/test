import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import styled from 'styled-components';

import styles from './RadioButton.module.scss';

const StyledBButton = styled.div`
  background-image: url('images/ic_radio.png');
`;

const StyledRadioButton = styled.div`
  &:hover {
    ${StyledBButton} {
      background-image: url('images/ic_radio_over.png');
    }
  }
  
  ${props => props.checked
    ? `
      ${StyledBButton} {
        background-image: url('images/ic_radio_onclick.png') !important;
      }
    `: ""}
`;

const StyledRadioButtonLarge = styled(StyledRadioButton)`
  ${StyledBButton} {
    background-image: url('images/ic_radio_big.png');
  }

  &:hover {
    ${StyledBButton} {
      background-image: url('images/ic_radio_over_big.png');
    }
  }
  
  ${props => props.checked
    ? `
      ${StyledBButton} {
        background-image: url('images/ic_radio_onclick_big.png') !important;
      }
    `: ""}
`;

function RadioButton({ className, buttonClassName, large, checked, children, onClick }) {
  const Component = large ? StyledRadioButtonLarge : StyledRadioButton;
  return (
    <Component
      className={classNames(styles.RadioButton, className, {
        [styles.large]: large,
      })}
      checked={checked}
      onClick={onClick}
    >
      <StyledBButton className={classNames(styles.Button, buttonClassName)} />
      { children }
    </Component>
  );
}

RadioButton.propTypes = {
  className: PropTypes.string,
  buttonClassName: PropTypes.string,
  large: PropTypes.bool,
  checked: PropTypes.bool,
  onClick: PropTypes.func,
};

RadioButton.defaultProps = {
  className: null,
  buttonClassName: null,
  large: false,
  checked: false,
  onClick: () => {},
};

export default RadioButton
