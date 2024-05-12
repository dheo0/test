import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Switch from '../Switch';
import styles from './SwitchOption.module.scss';

const SwitchOption = (
  {
    className,
    labelClassName,
    switchClassName,
    on,
    offOptionName,
    onOptionName,
    disabled,
    onChange,
  }
) => {
  const [isOn, setOn] = useState(on);

  useEffect(() => {
    if (on !== isOn) {
      setOn(on);
    }
  }, [on]);

  const handleChange = useCallback(() => {
    if (!disabled) {
      setOn(!isOn);
      onChange(!isOn);
    }
  }, [disabled, onChange]);

  const handleClickLabel = useCallback((value) => () => {
    if (!disabled) {
      setOn(value);
      onChange(value);
    }
  }, [disabled, onChange]);

  return (
    <div
      className={classNames(styles.SwitchOption, className, {
        [styles.disabled]: disabled,
      })}
    >
      <span
        className={classNames(styles.OptionLabel, styles.negativeOption, { [styles.isActive]: !isOn }, labelClassName)}
        onClick={handleClickLabel(false)}
      >
        { offOptionName }
      </span>

      <Switch
        className={switchClassName}
        value={isOn}
        disabled={disabled}
        onClick={handleChange}
      />

      <span
        className={classNames(styles.OptionLabel, styles.positiveOption, { [styles.isActive]: isOn }, labelClassName)}
        onClick={handleClickLabel(true)}
      >
        { onOptionName }
      </span>
    </div>
  );
};

SwitchOption.propTypes = {
  className: PropTypes.string,
  labelClassName: PropTypes.string,
  switchClassName: PropTypes.string,
  value: PropTypes.bool,
  offOptionName: PropTypes.string.isRequired,
  onOptionName: PropTypes.string.isRequired,
  onChange: PropTypes.func,
};

SwitchOption.defaultProps = {
  className: null,
  labelClassName: null,
  switchClassName: null,
  value: false,
  onChange: () => {},
};

export default SwitchOption
