import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';

import styles from './Counter.module.scss';

const OPERATION_INCREASE = 'increase';
const OPERATION_DECREASE = 'decrease';

const StyledWrapper = styled.div`
  ${props => !_.isEmpty(props.backgroundSrc) ? `
    background-image: url('images/${props.backgroundSrc}');
  ` : null}
`;

export const ButtonBase = styled.div`
  width: 18px;
  height: 16px;
  background-position: center;
  background-repeat: no-repeat;
  cursor: pointer;
`;

const StyledButtonMinus = styled(ButtonBase)`
  background-image: url('images/ic_counter_minus.png');

  &:hover {
    background-image: url('images/ic_counter_minus_over.png');
  }
`;

const StyledButtonPlus = styled(ButtonBase)`
  background-image: url('images/ic_counter_plus.png');

  &:hover {
    background-image: url('images/ic_counter_plus_over.png');
  }
`;

export const ValueWrapperBase = styled.div`
  padding: 0 7px;
  font-size: 12px;
`;

const Counter = (
  {
    className,
    initial,
    min,
    max,
    step,
    backgroundSrc,
    MinusButton,
    PlusButton,
    ValueWrapper,
    disabled,
    onChange,
  }
) => {
  const [quantity, setQuantity] = useState(_.clamp(initial, min, max));

  useEffect(() => {
    setQuantity(_.clamp(initial, min, max));
  }, [initial, min, max]);

  const handleChange = (operation) => useCallback(() => {
    const newValue = (operation === OPERATION_INCREASE)
      ? Math.min(max, quantity + step)
      : Math.max(min, quantity - step);

    if (!disabled && quantity !== newValue) {
      setQuantity(newValue);
      onChange(newValue);
    }
  }, [quantity, min, max, step, disabled, onChange]);

  const manualHandleChange = (length = 3) => useCallback((event) => {
    const newValue = Number(_.truncate(event.target.value, { length, omission: '' }));
    if (!_.isNaN(newValue)) {
      setQuantity(Math.max(min, newValue));
      onChange(newValue);
    }
    
  }, []);

  return (
    <StyledWrapper
      className={classNames(styles.Counter, className, {
        [styles.disabled]: disabled,
      })}
      backgroundSrc={backgroundSrc}
    >
      <MinusButton
        className={styles.Minus}
        onClick={handleChange(OPERATION_DECREASE)}
      />

      {  
      //<ValueWrapper className={styles.Value}>
      //  { quantity }
      //</ValueWrapper>
      }
      <input 
        type="number" 
        maxLength="3"
        value={quantity} 
        onChange={manualHandleChange()} 
        onKeyPress={e => { if (e.key === 'Enter') e.target.blur() }}
      />

      <PlusButton
        className={styles.Plus}
        onClick={handleChange(OPERATION_INCREASE)}
      />



    </StyledWrapper>
  );
};

Counter.propTypes = {
  className: PropTypes.string,
  initial: PropTypes.number,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  backgroundSrc: PropTypes.string,
  MinusButton: PropTypes.object,
  PlusButton: PropTypes.object,
  ValueWrapper: PropTypes.object,
  onChange: PropTypes.func,
};

Counter.defaultProps = {
  className: null,
  initial: 0,
  min: 0,
  max: 999,
  step: 1,
  backgroundSrc: null,
  MinusButton: StyledButtonMinus,
  PlusButton: StyledButtonPlus,
  ValueWrapper: ValueWrapperBase,
  onChange: () => {},
};

export default Counter
