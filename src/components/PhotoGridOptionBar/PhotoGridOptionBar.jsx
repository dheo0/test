import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import classNames from "classnames";
import _ from "lodash";

import { SizeOptions } from "../../constants/photoGridOptions";
import GroupedPhotoGridOrderSelect from "../GroupedPhotoGridOrderSelect";
import styles from "./PhotoGridOptionBar.module.scss";
import { deviceCheck } from "../../utils/commonUtils";

const StyledGridButton = styled.div`
  width: 14px;
  height: 14px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 14px, 14px;
  cursor: pointer;
`;

const StyledGridButtonNormal = styled(StyledGridButton)`
  margin-right: 10px;
  background-image: ${(props) =>
    props.selected
      ? "url('images/ic_2column_over.png');"
      : "url('images/ic_2column.png');"}

  &:hover {
    background-image: url('images/ic_2column_over.png');
  }
`;

const StyledGridButtonSmaller = styled(StyledGridButton)`
  background-image: ${(props) =>
    props.selected
      ? "url('images/ic_3column_over.png');"
      : "url('images/ic_3column.png');"}

  &:hover {
    background-image: url('images/ic_3column_over.png');
  }
`;

function PhotoGridOptionBar({
  className,
  selectedOrder,
  selectedGroup,
  selectedGridSize,
  onChangeOrderOptions,
  onClickGridSize,
}) {
  return (
    <div className={classNames(styles.PhotoGridOptionBar, className)}>
      <GroupedPhotoGridOrderSelect
        selectedOrder={selectedOrder}
        selectedGroup={selectedGroup}
        onClickAdjust={onChangeOrderOptions}
      />

      <div className={styles.Space} />
      {deviceCheck() === "Web" && (
        <>
          <StyledGridButtonNormal
            selected={selectedGridSize === SizeOptions.NORMAL}
            onClick={onClickGridSize(SizeOptions.NORMAL)}
          />

          <StyledGridButtonSmaller
            selected={selectedGridSize === SizeOptions.SMALLER}
            onClick={onClickGridSize(SizeOptions.SMALLER)}
          />
        </>
      )}
    </div>
  );
}

PhotoGridOptionBar.propTypes = {
  selectedOrder: PropTypes.shape({
    key: PropTypes.string,
    value: PropTypes.string,
  }),
  selectedGroup: PropTypes.shape({
    key: PropTypes.string,
    value: PropTypes.string,
  }),
  selectedGridSize: PropTypes.oneOf(_.values(SizeOptions)),
  onChangeOrderOptions: PropTypes.func,
  onClickGridSize: PropTypes.func,
};

PhotoGridOptionBar.defaultProps = {
  selectedOrder: null,
  selectedGroup: null,
  selectedGridSize: SizeOptions.NORMAL,
  onChangeOrderOptions: () => {},
  onClickGridSize: () => {},
};

export default PhotoGridOptionBar;
