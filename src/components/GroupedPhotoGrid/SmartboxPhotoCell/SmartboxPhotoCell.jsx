import React, { useCallback } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import styled from "styled-components";
import _ from "lodash";

import DataGridService from "../../../utils/DataGridService";
import ImageUpload from "../../../models/ImageUpload";
import SmartboxPhoto from "../../../models/SmartboxPhoto";
import PhotoCheckbox from "../../PhotoCheckbox";
import { deviceCheck } from "../../../utils/commonUtils";
import styles from "./SmartboxPhotoCell.module.scss";

const CellButton = styled.div`
  position: absolute;
  top: 10px;
  width: 20px;
  height: 20px;
  cursor: pointer;
`;

const AddToAlbumButton = styled(CellButton)`
  right: 37px;
  background-image: url("images/icon_add_w.png");
`;

const FavoriteButton = styled(CellButton)`
  right: 10px;

  ${(props) =>
    props.favorite
      ? 'background-image: url("images/icon_heart_y.png");'
      : 'background-image: url("images/icon_heart_w.png");'}
`;

const ZoomButton = styled.div`
  background-image: url("images/icon_zoom.png");
`;

const DeleteButton = styled.div`
  background-image: url("images/ic_pic_delete.png") !important;

  &:hover {
    background-image: url("images/ic_pic_delete_over.png") !important;
  }
`;

function SmartboxPhotoCell({
  className,
  checkboxClassName,
  imageContainer = new ImageUpload(),
  isSelected = false,
  deletable = false,
  favorite = false,
  disablePhotoCheckbox = false,
  onClick = _.noop,
  onClickAddToAlbum = _.noop,
  onClickFavorite = _.noop,
  onClickDelete = _.noop,
  onClickZoom = _.noop,
}) {
  const backgroundImage = !imageContainer.hasImageMeta()
    ? `url(${DataGridService.get(imageContainer.uuid)})`
    : `url(${imageContainer.getImageMeta().getThumbnailUrl()})`;

  const handleClickAddToAlbum = useCallback(
    (event) => {
      event.stopPropagation();
      onClickAddToAlbum(imageContainer);
    },
    [imageContainer, onClickAddToAlbum]
  );

  const handleClickFavorite = useCallback(
    (event) => {
      event.stopPropagation();
      onClickFavorite(imageContainer);
    },
    [imageContainer, onClickFavorite]
  );

  const handleClickDelete = useCallback(() => {
    onClickDelete(imageContainer);
  }, [imageContainer, onClickDelete]);

  const handleClickZoom = useCallback(
    (event) => {
      event.stopPropagation();
      onClickZoom(imageContainer);
    },
    [imageContainer, onClickZoom]
  );

  return (
    <div
      key={imageContainer.uuid}
      style={{ backgroundImage }}
      className={classNames(styles.SmartboxPhotoCell, className, {
        [styles.mobile]: deviceCheck() === "Mobile",
        [styles.isSelected]: isSelected,
        [styles.hasError]: imageContainer.hasError(),
      })}
    >
      <div className={styles.Mask} onClick={() => onClick(imageContainer)}>
        {imageContainer.hasError() && (
          <div className={styles.ErrorWrapper}>
            {imageContainer.getError().error}
          </div>
        )}
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

      <AddToAlbumButton onClick={handleClickAddToAlbum} />

      <FavoriteButton favorite={favorite} onClick={handleClickFavorite} />

      {deletable && (
        <DeleteButton
          className={styles.DeleteButton}
          onClick={handleClickDelete}
        />
      )}

      <ZoomButton className={styles.ZoomButton} onClick={handleClickZoom} />
    </div>
  );
}

SmartboxPhotoCell.propTypes = {
  className: PropTypes.string,
  checkboxClassName: PropTypes.string,
  imageContainer: PropTypes.oneOfType([
    PropTypes.instanceOf(ImageUpload),
    PropTypes.instanceOf(SmartboxPhoto),
  ]),
  isSelected: PropTypes.bool,
  deletable: PropTypes.bool,
  disablePhotoCheckbox: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
  onClick: PropTypes.func,
  onClickFavorite: PropTypes.func,
  onClickDelete: PropTypes.func,
};

export default SmartboxPhotoCell;
