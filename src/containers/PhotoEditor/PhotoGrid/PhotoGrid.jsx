import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import Immutable from "immutable";
import classNames from "classnames";
import _ from "lodash";

import { getZoomClassNameByRatio } from "../../../utils/styleUtils";
import PhotoCell from "../../../components/PhotoCell";
import PrintOptionPanel from "../../../components/PrintOptionPanel";
import { deviceCheck } from "../../../utils/commonUtils";
import styles from "./PhotoGrid.module.scss";
import PhotoEditorActions from "../../../actions/PhotoEditorActions";
function PhotoGrid({
  isUploadPanelOpened,
  zoomRatio,
  photos,
  printSizes,
  selectedPhotoUUIDs,
  onChangeOption,
  onClick,
  onClickDelete,
  onCheckChange,
  adjustDetailEdits,
}) {
  const photoGridRef = useRef(null);

  const [zoomClassName, setZoomClassname] = useState(null);
  const [focusedPhotoUUID, setFocusedPhotoUUID] = useState(null);
  const [focusedPhotoCell, setFocusedPhotoCell] = useState(null);

  useEffect(() => {
    setZoomClassname(getZoomClassNameByRatio(zoomRatio));
  }, [zoomRatio]);

  const renderPhotoCell = (photo) => {
    const handleClickMoreOverButton = (cell) => {
      if (focusedPhotoUUID !== photo.uuid) {
        setFocusedPhotoUUID(photo.uuid);
        setFocusedPhotoCell(cell);
      } else {
        setFocusedPhotoUUID(null);
        setFocusedPhotoCell(null);
      }
    };
    const printOption = photo.getPrintOption();
    const printSize = printSizes.find((s) => s.size === printOption.size);
    const onClickClone = (value) => {
      PhotoEditorActions.clonePhoto(value);
      console.log(photos);
    };

    return (
      <PhotoCell
        key={photo.uuid}
        zoomClassName={zoomClassName}
        parentRef={photoGridRef.current}
        photo={photo}
        printSize={printSize}
        focused={focusedPhotoUUID && focusedPhotoUUID === photo.uuid}
        selected={selectedPhotoUUIDs.includes(photo.uuid)}
        onChangeOption={(subject, value) =>
          onChangeOption(photo, subject, value)
        }
        onClick={onClick}
        onClickDelete={onClickDelete}
        onCheckChange={onCheckChange}
        onClickMoreOverButton={handleClickMoreOverButton}
        adjustDetailEdits={adjustDetailEdits}
        onClickClone={() => onClickClone(photo)}
      />
    );
  };

  return (
    <div
      ref={photoGridRef}
      className={classNames(styles.PhotoGrid, {
        [styles.withPanelOpen]: isUploadPanelOpened,
        [styles.mobile]: deviceCheck() === "Mobile",
      })}
    >
      <div className={classNames(styles.GridContent, styles[zoomClassName])}>
        {photos.map(renderPhotoCell)}

        <PrintOptionPanel
          photo={photos.find((photo) => photo.uuid === focusedPhotoUUID)}
          parentRef={photoGridRef.current}
          target={focusedPhotoCell}
          onClickBackdrop={() => setFocusedPhotoUUID(null)}
          onClickClose={() => setFocusedPhotoUUID(null)}
          onChangeOption={onChangeOption}
        />
      </div>
    </div>
  );
}

PhotoGrid.propTypes = {
  isUploadPanelOpened: PropTypes.bool,
  zoomRatio: PropTypes.number,
  photos: PropTypes.instanceOf(Immutable.List),
  printSizes: PropTypes.instanceOf(Immutable.List),
  selectedPhotoUUIDs: PropTypes.instanceOf(Immutable.Set),
  onChangeOption: PropTypes.func,
  onClick: PropTypes.func,
  onClickDelete: PropTypes.func,
  onCheckChange: PropTypes.func,
  adjustDetailEdits: PropTypes.func,
};

PhotoGrid.defaultProps = {
  isUploadPanelOpened: false,
  zoomRatio: 1.0,
  photos: Immutable.List(),
  printSizes: Immutable.List(),
  selectedPhotoUUIDs: Immutable.Set(),
  onChangeOption: _.noop,
  onClick: _.noop,
  onClickDelete: _.noop,
  onCheckChange: _.noop,
  adjustDetailEdits: _.noop,
};

export default PhotoGrid;
