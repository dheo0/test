import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import styled from 'styled-components';

import Checkbox, { StyledCheckBox, StyledCheck } from '../Checkbox';

const StyledPhotoCheck = styled(StyledCheck)`
  width: 20px;
  height: 20px;
  margin: 0;
  padding: 0;
  background-size: 20px;
  background-position: center;
  background-image: ${props => props.isChecked
    ? `url('images/ic_pic_selected_onclick.png') !important;`
    : `url('images/ic_pic_deactivated.png') !important;`}
`;

const StyledPhotoCheckbox = styled(StyledCheckBox)`
  &:hover {
    ${StyledPhotoCheck} {
      background-image: url('images/ic_pic_deactivated.png');
    }
  }
`;

function PhotoCheckbox({ className, checkClassName, checkedClassName, checked, ...otherProps }) {
  return (
    <Checkbox
      checkBoxComponent={StyledPhotoCheckbox}
      checkComponent={StyledPhotoCheck}
      className={classNames(className)}
      checkClassName={classNames(checkClassName)}
      checked={checked}
      {...otherProps}
    />
  );
}

PhotoCheckbox.propTypes = {
  className: PropTypes.string,
  checkClassName: PropTypes.string,
  checkedClassName: PropTypes.string,
  contentClassName: PropTypes.string,
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  invisible: PropTypes.bool,
  children: PropTypes.node,
  onChange: PropTypes.func,
};

PhotoCheckbox.defaultProps = {
  className: null,
  checkClassName: null,
  checkedClassName: null,
  contentClassName: null,
  checked: false,
  disabled: false,
  invisible: false,
  children: null,
  onChange: () => {},
};

export default PhotoCheckbox
