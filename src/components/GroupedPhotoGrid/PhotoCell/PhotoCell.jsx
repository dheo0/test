import React, { useCallback } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import styled from "styled-components";

import DataGridService from "../../../utils/DataGridService";
import ImageUpload from "../../../models/ImageUpload";
import SmartboxPhoto from "../../../models/SmartboxPhoto";
import PhotoCheckbox from "../../PhotoCheckbox";
import styles from "./PhotoCell.module.scss";
import { deviceCheck } from "../../../utils/commonUtils";

const StyledRemoveButton = styled.div`
  background-image: url("images/ic_pic_delete.png") !important;

  &:hover {
    background-image: url("images/ic_pic_delete_over.png") !important;
  }
`;

const PhotoCell = ({ className, checkboxClassName, imageContainer, isSelected, deletable, disablePhotoCheckbox, onClick, onClickDelete }) => {
  const backgroundImage = !imageContainer.hasImageMeta()
    ? `url(${DataGridService.get(imageContainer.uuid)})`
    : `url(${imageContainer.getImageMeta().getThumbnailUrl()})`;

  const handleClickDelete = useCallback(() => {
    onClickDelete(imageContainer);
  }, [imageContainer, onClickDelete]);

  return (
    <div
      key={imageContainer.uuid}
      style={{ backgroundImage }}
      className={classNames(styles.PhotoCell, className, {
        [styles.isSelected]: isSelected,
        [styles.hasError]: imageContainer.hasError(),
        [styles.mobile]: deviceCheck() === "Mobile",
      })}
    >
      <div className={styles.Mask} onClick={() => onClick(imageContainer)}>
        {imageContainer.hasError() && <div className={styles.ErrorWrapper}>{imageContainer.getError().error}</div>}
      </div>
      <div
        className={classNames(styles.LoaderWrapper, {
          hide: imageContainer.hasCompleted(),
        })}
      >
        <div className={classNames("Loader large", styles.Loader)} />
      </div>
      <PhotoCheckbox
        className={classNames(styles.Checkbox, checkboxClassName)}
        checked={isSelected}
        invisible={!isSelected}
        disabled={imageContainer.hasError() || disablePhotoCheckbox}
      />
      {deletable && <StyledRemoveButton className={styles.RemoveButton} onClick={handleClickDelete} />}
    </div>
  );
};

PhotoCell.propTypes = {
  className: PropTypes.string,
  checkboxClassName: PropTypes.string,
  imageContainer: PropTypes.oneOfType([PropTypes.instanceOf(ImageUpload), PropTypes.instanceOf(SmartboxPhoto)]),
  isSelected: PropTypes.bool,
  deletable: PropTypes.bool,
  disablePhotoCheckbox: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
  onClick: PropTypes.func,
  onClickDelete: PropTypes.func,
};

PhotoCell.defaultProps = {
  className: null,
  checkboxClassName: null,
  imageContainer: new ImageUpload(),
  isSelected: false,
  deletable: false,
  disablePhotoCheckbox: false,
  onClick: () => {},
  onClickDelete: () => {},
};

export default PhotoCell;
