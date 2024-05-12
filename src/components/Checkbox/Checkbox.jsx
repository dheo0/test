import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import styled from "styled-components";
import _ from "lodash";

import styles from "./Checkbox.module.scss";

export const StyledCheck = styled.div`
  display: inline-block;
  vertical-align: middle;
  width: 15px;
  height: 15px;
  margin-right: 6px;
  background-size: 15px;
  background-position: center;
  background-image: ${(props) =>
    props.isChecked
      ? "url('images/ic_checkbox_checked.png') !important;"
      : "url('images/ic_checkbox.png');"};
`;

export const StyledCheckBox = styled.div`
  display: inline-block;
  cursor: pointer;
  user-select: none;
  ${(props) =>
    props.isHovering
      ? `
    ${StyledCheck} {
      background-image: url('images/ic_checkbox_over.png');
    }
  `
      : ""}

  &:hover {
    ${StyledCheck} {
      background-image: url("images/ic_checkbox_over.png");
    }
  }
`;

function Checkbox({
  checkBoxComponent,
  checkComponent,
  className = null,
  checkClassName = null,
  checkedClassName = null,
  contentClassName = null,
  checked = false,
  disabled = false,
  invisible = false,
  isHovering = false,
  children,
  onChange = _.noop,
  onMouseEnter = _.noop,
}) {
  const [isChecked, setChecked] = useState(checked);
  const CheckBoxComponent = checkBoxComponent || StyledCheckBox;
  const CheckComponent = checkComponent || StyledCheck;

  useEffect(() => {
    if (checked !== isChecked) {
      setChecked(checked);
    }
  }, [checked]);

  const handleClick = (event) => {
    event.stopPropagation();
    if (!disabled) {
      setChecked(!isChecked);
      onChange(!isChecked);
    }
  };

  return (
    <CheckBoxComponent
      className={classNames(className, {
        hidden: invisible,
      })}
      onClick={handleClick}
      isHovering={isHovering}
      onMouseEnter={onMouseEnter}
    >
      <CheckComponent
        className={classNames(checkClassName, {
          [checkedClassName]: isChecked,
        })}
        isChecked={isChecked}
      />

      <div className={classNames(styles.CheckContent, contentClassName)}>
        {children}
      </div>
    </CheckBoxComponent>
  );
}

Checkbox.propTypes = {
  className: PropTypes.string,
  checkClassName: PropTypes.string,
  checkedClassName: PropTypes.string,
  contentClassName: PropTypes.string,
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  invisible: PropTypes.bool,
  isHovering: PropTypes.bool,
  children: PropTypes.node,
  onChange: PropTypes.func,
  onMouseEnter: PropTypes.func,
};

export default Checkbox;
