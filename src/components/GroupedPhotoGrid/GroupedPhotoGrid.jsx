import React, { useMemo, useCallback } from "react";
import Immutable from "immutable";
import moment from "moment";
import classNames from "classnames";
import _ from "lodash";

import imageContainerTypes from "../../constants/imageContainerTypes";
import {
  OrderOptions,
  GroupOptions,
  PartitionOptions,
} from "../../constants/photoGridOptions";
import { deviceCheck } from "../../utils/commonUtils";
import SmartboxPhoto from "../../models/SmartboxPhoto";
import PhotoCheckbox from "../../components/PhotoCheckbox";
import SmartboxPhotoCell from "./SmartboxPhotoCell";
import PhotoCell from "./PhotoCell";
import styles from "./GroupedPhotoGrid.module.scss";
import UIActions from "../../actions/UIActions";
import { useDispatch } from "react-redux";

function GroupedPhotoGrid({
  className,
  cellClassName,
  checkboxClassName,
  smartboxUI = false,
  disablePhotoCheckbox = false,
  deletable = true,
  imageContainers = Immutable.List(),
  selectedImageContainerUUIDs = Immutable.List(),
  orderBy = OrderOptions.BY_RECENT_UPLOAD,
  groupBy = GroupOptions.BY_DATE,
  partitionBy = PartitionOptions.NONE,
  uploadFileCount,
  onCheckedChangeGroup = _.noop,
  onClickPhotoCell = _.noop,
  onClickPhotoCellAddToAlbum = _.noop,
  onClickPhotoCellFavorite = _.noop,
  onClickPhotoCellDelete = _.noop,
  onClickPhotoCellZoom = _.noop,
}) {
  const dispatch = useDispatch();
  const groupedPhotos = useMemo(() => {
    return imageContainers
      .groupBy((imageContainer) => {
        const timeValue = (() => {
          if (
            orderBy === OrderOptions.BY_RECENT_UPLOAD ||
            orderBy === OrderOptions.BY_OLD_UPLOAD
          ) {
            if (SmartboxPhoto.isSmartboxInstance(imageContainer)) {
              return imageContainer.uploadedAt / 1000;
            } else {
              return imageContainer.selectedAt / 1000;
            }
          }
          return imageContainer.getImageMeta().dateunix;
        })();
        return moment.unix(timeValue).startOf(groupBy.groupKey).valueOf();
      })
      .sortBy((__, ts) => {
        if (
          orderBy === OrderOptions.BY_OLD_UPLOAD ||
          orderBy === OrderOptions.BY_OLD_DATE
        ) {
          return ts;
        }
        return -ts;
      });
  }, [imageContainers, orderBy, groupBy]);

  const handleClickPhotoCell = useCallback(
    (imageContainer) => {
      onClickPhotoCell(imageContainer);
    },
    [onClickPhotoCell]
  );

  const renderPhotoCell = useCallback(
    (imageContainer) => {
      const isSelected = selectedImageContainerUUIDs.includes(
        imageContainer.uuid
      );

      if (smartboxUI && imageContainer.$type === imageContainerTypes.SMARTBOX) {
        return (
          <SmartboxPhotoCell
            key={imageContainer.uuid}
            className={cellClassName}
            checkboxClassName={checkboxClassName}
            imageContainer={imageContainer}
            isSelected={isSelected}
            deletable={deletable && !isSelected}
            favorite={imageContainer.favorite}
            disablePhotoCheckbox={disablePhotoCheckbox}
            onClick={handleClickPhotoCell}
            onClickAddToAlbum={onClickPhotoCellAddToAlbum}
            onClickFavorite={onClickPhotoCellFavorite}
            onClickDelete={onClickPhotoCellDelete}
            onClickZoom={onClickPhotoCellZoom}
          />
        );
      }

      return (
        <PhotoCell
          key={imageContainer.uuid}
          className={cellClassName}
          checkboxClassName={checkboxClassName}
          imageContainer={imageContainer}
          isSelected={isSelected}
          deletable={deletable && !isSelected}
          disablePhotoCheckbox={disablePhotoCheckbox}
          onClick={handleClickPhotoCell}
          onClickDelete={onClickPhotoCellDelete}
        />
        /**
         * deviceCheck() === "Web"
              ? disablePhotoCheckbox
              : !
         * 
         */
      );
    },
    [
      cellClassName,
      checkboxClassName,
      disablePhotoCheckbox,
      deletable,
      selectedImageContainerUUIDs,
      onClickPhotoCellDelete,
      onClickPhotoCellZoom,
      handleClickPhotoCell,
    ]
  );

  const handleUploadComplete = () => {
    dispatch(UIActions.hideUploadPanel());
  };

  const renderPartitioned = useCallback(
    (imageContainers) => {
      if (!imageContainers) {
        return null;
      }
      if (partitionBy === PartitionOptions.NONE) {
        return imageContainers.map(renderPhotoCell);
      }
      if (deviceCheck() === "Mobile") {
        partitionBy = 3;
      }

      return Immutable.Range(0, imageContainers.count(), partitionBy)
        .map((i) => imageContainers.slice(i, i + partitionBy))
        .map((chunked, i) => (
          <div
            key={`partitioned-${i}`}
            className={`${styles.Partition} ${styles[deviceCheck()]}`}
          >
            {chunked.map(renderPhotoCell)}
          </div>
        ));
    },
    [partitionBy, renderPhotoCell]
  );

  const PhotoGroup = useMemo(() => {
    const handleCheckedChangeGroup = (groupedImageUploads) => (checked) => {
      onCheckedChangeGroup(groupedImageUploads, checked);
    };

    return groupedPhotos
      .entrySeq()
      .toList()
      .map(([ts, imageContainers]) => [
        ts,
        imageContainers.sortBy((imageContainer) => {
          if (SmartboxPhoto.isSmartboxInstance(imageContainer)) {
            switch (orderBy) {
              case OrderOptions.BY_RECENT_UPLOAD: {
                return imageContainer.uploadedAt;
              }
              case OrderOptions.BY_OLD_UPLOAD: {
                return -imageContainer.uploadedAt;
              }
              case OrderOptions.BY_RECENT_DATE: {
                return imageContainer.getImageMeta().dateunix;
              }
              case OrderOptions.BY_OLD_DATE:
              default: {
                return -imageContainer.getImageMeta().dateunix;
              }
            }
          } else {
            switch (orderBy) {
              case OrderOptions.BY_RECENT_UPLOAD: {
                return imageContainer.selectedAt;
              }
              case OrderOptions.BY_OLD_UPLOAD: {
                return -imageContainer.selectedAt;
              }
              case OrderOptions.BY_RECENT_DATE: {
                return imageContainer.getImageMeta().dateunix;
              }
              case OrderOptions.BY_OLD_DATE:
              default: {
                return -imageContainer.getImageMeta().dateunix;
              }
            }
          }
        }),
      ])
      .map(([ts, imageContainers]) => {
        const isGroupChecked = imageContainers
          .filter((imageContainer) => !imageContainer.hasError())
          .every((imageContainer) =>
            selectedImageContainerUUIDs.includes(imageContainer.uuid)
          );
        return (
          <>
            <div
              key={`photo-group-${ts}`}
              className={`${styles.PhotoGroup} ${styles[deviceCheck()]} ${
                smartboxUI ? styles.SmartGroup : ""
              }`}
            >
              <div className={styles.Label}>
                <PhotoCheckbox
                  checkClassName={styles.Check}
                  checked={isGroupChecked}
                  onChange={handleCheckedChangeGroup(imageContainers)}
                >
                  {`${moment(ts).format(groupBy.groupFormat)} (${
                    imageContainers.size
                  })`}
                </PhotoCheckbox>
              </div>
              {deviceCheck() === "Web" ? (
                <div>{renderPartitioned(imageContainers)}</div>
              ) : (
                <div className={styles.GroupWrap}>
                  {renderPartitioned(imageContainers)}
                </div>
              )}
            </div>
            {deviceCheck() === "Mobile" && !smartboxUI && (
              <button
                type="button"
                className={styles.UploadPhotoButton}
                onClick={handleUploadComplete}
              >
                <div className={styles.Text}>
                  {uploadFileCount}개의 사진 주문하기
                </div>
              </button>
            )}
          </>
        );
      });
  }, [
    selectedImageContainerUUIDs,
    orderBy,
    groupBy,
    onCheckedChangeGroup,
    groupedPhotos,
    renderPartitioned,
  ]);

  return (
    <div
      className={classNames(
        styles.GroupedPhotoGrid,
        className,
        styles[imageContainers.$type]
      )}
    >
      {PhotoGroup}
    </div>
  );
}

export default GroupedPhotoGrid;
