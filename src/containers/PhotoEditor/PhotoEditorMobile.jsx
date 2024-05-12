import React, { Component } from "react";
import { connect } from "react-redux";
import _ from "lodash";
import classNames from "classnames";
import numeral from "numeral";
import styled from "styled-components";

import PhotoEditorActions from "../../actions/PhotoEditorActions";
import AppInfoSelector from "../../selectors/AppInfoSelector";
import PhotoEditorSelector from "../../selectors/PhotoEditorSelector";
import UISelector from "../../selectors/UISelector";
import UIActions from "../../actions/UIActions";
import { createMessageModal } from "../../utils/ModalService";
import { isDevelopment, getVersion } from "../../utils/commonUtils";
import OptionBar from "../OptionBar";
import PhotoUploadPanel from "./PhotoUploadPanel";
import PhotoGrid from "./PhotoGrid";
import { deviceCheck } from "../../utils/commonUtils";
import PhotoUploadingProgress from "./PhotoUploadingProgress";
import PhotoGridEmpty from "../../components/PhotoGridEmpty";
import GLOSS_ONLY_SIZES from "../../constants/glossOnlySizes";
import MATTE_ONLY_SIZES from "../../constants/matteOnlySizes";
import { isMobile, iPad } from "../../App";
import GNB from "../GNB/GNB";

import styles from "./PhotoEditor.module.scss";

const ZOOM_DEFAULT_RATIO = 1.0;
const ZOOM_MIN_RATIO = 0.5;
const ZOOM_MAX_RATIO = 2.0;
const ZOOM_CHANGE_STEP = 0.1;

const UndoButton = styled.div`
  background-image: url("images/bt_undo.png");

  &:hover {
    background-image: url("images/bt_undo_over.png");
  }
`;

const RedoButton = styled.div`
  background-image: url("images/bt_redo.png");
  margin-left: 4px;

  &:hover {
    background-image: url("images/bt_redo_over.png");
  }
`;

const ZoomBar = styled.div`
  background-image: url("images/bg-zoom.png") !important;
`;

const ZoomOut = styled.div`
  background-image: url("images/ic-zoomout.png") !important;

  &:hover {
    background-image: url("images/ic-zoomout-over.png") !important;
  }
`;

const ZoomIn = styled.div`
  background-image: url("images/ic-zoomin.png") !important;

  &:hover {
    background-image: url("images/ic-zoomin-over.png") !important;
  }
`;

const ZoomFit = styled.div`
  background-image: url("images/ic-screenfit.png") !important;

  &:hover {
    background-image: url("images/ic-screenfit-over.png") !important;
  }
`;

const ExitButton = styled.div`
  background-image: url("images/bt_quit.png") !important;

  &:hover {
    background-image: url("images/bt_quit_over.png") !important;
  }
`;

class PhotoEditorMobile extends Component {
  state = {
    isUploadPanelOpened: true,
    zoomRatio: ZOOM_DEFAULT_RATIO,
  };

  handleClickUndo = (type) => () => {
    const { undo, redo } = this.props;

    if (type === "undo") {
      undo();
    } else if (type === "redo") {
      redo();
    }
  };

  handleClickZoom(zoom) {
    switch (zoom) {
      case "out":
        return () =>
          this.setState((state) => ({
            zoomRatio: Math.max(
              ZOOM_MIN_RATIO,
              state.zoomRatio - ZOOM_CHANGE_STEP
            ),
          }));
      case "in":
        return () =>
          this.setState((state) => ({
            zoomRatio: Math.min(
              ZOOM_MAX_RATIO,
              state.zoomRatio + ZOOM_CHANGE_STEP
            ),
          }));
      case "reset":
      default:
        return () => this.setState({ zoomRatio: ZOOM_DEFAULT_RATIO });
    }
  }

  handleChangeOption = (photo, subject, value) => {
    const { setPrintOptions } = this.props;

    setPrintOptions({
      photos: [photo],
      options: { [subject]: value },
    });

    if (subject === "size") {
      // 2022.11.28
      let is_only_gloss_size = _.includes(GLOSS_ONLY_SIZES, value);
      let is_only_matte_size = _.includes(MATTE_ONLY_SIZES, value);

      let message =
        GLOSS_ONLY_SIZES.toString() +
        " 사이즈는\n모두 유광으로만 인화됩니다.\n"; // 2022.11.28
      if (is_only_matte_size)
        message =
          MATTE_ONLY_SIZES.toString() +
          " 사이즈는\n모두 무광으로만 인화됩니다.\n"; // 2022.11.28

      if (is_only_gloss_size || is_only_matte_size) {
        createMessageModal([message].join("\n"));
      }
    }
  };

  handleClickPhoto = (photo) => {
    const { openDetailEditor } = this.props;
    openDetailEditor({ photo });
  };

  handleDeletePhoto = (photo) => {
    const { purgePhotosFromPhotoEditor } = this.props;
    purgePhotosFromPhotoEditor({ photos: [photo] });
  };

  handleCheckChangePhoto = (photo) => {
    const { selectOrUnselectPhoto } = this.props;
    selectOrUnselectPhoto({ uuid: photo.uuid });
  };

  handleClickUploadPanelHandleBar = () => {
    this.setState((state) => ({
      isUploadPanelOpened: !state.isUploadPanelOpened,
    }));
  };

  handleClickExit = () => {
    window.history.back();
  };

  isMobile() {
    return isMobile || iPad ? "Mobile" : "";
  }

  handleUploadPanel() {
    const { isUploadComplete } = this.props;
    return isUploadComplete;
  }

  renderUndoButtons() {
    const { canUndo, canRedo } = this.props;
    const { isUploadPanelOpened } = this.state;

    return (
      <div
        className={classNames(styles.UndoButtonsWrapper, {
          [styles.withPanelOpen]: isUploadPanelOpened,
        })}
      >
        <UndoButton
          className={classNames(styles.UndoButtons, styles.Undo, {
            hidden: !canUndo,
          })}
          onClick={this.handleClickUndo("undo")}
        >
          실행취소
        </UndoButton>

        <RedoButton
          className={classNames(styles.UndoButtons, styles.Redo, {
            hidden: !canRedo,
          })}
          onClick={this.handleClickUndo("redo")}
        >
          다시실행
        </RedoButton>

        <p className={styles.CutInfo}>
          사진은 인화기 컷팅공정으로 인해 보이는것 보다 1~2mm 잘림이 있습니다.{" "}
        </p>
      </div>
    );
  }

  renderZoomButtons() {
    const { zoomRatio } = this.state;
    const zoomRatioPercentage = numeral(zoomRatio).format("0%");

    return (
      <ZoomBar className={styles.ZoomButtons}>
        <ZoomOut
          className={styles.Button}
          onClick={this.handleClickZoom("out")}
        />

        <div className={styles.Ratio}>{zoomRatioPercentage}</div>

        <ZoomIn
          className={styles.Button}
          onClick={this.handleClickZoom("in")}
        />

        <ZoomFit
          className={styles.Reset}
          onClick={this.handleClickZoom("reset")}
        />
      </ZoomBar>
    );
  }

  renderExitButton() {
    return (
      <ExitButton className={styles.ExitButton} onClick={this.handleClickExit}>
        <span>종료</span>
      </ExitButton>
    );
  }

  render() {
    const { photos, printSizes, selectedPhotoUUIDs, adjustDetailEdits } =
      this.props;
    const { isUploadPanelOpened, zoomRatio } = this.state;
    return (
      <>
        {/* <OptionBar /> */}
        {deviceCheck() === "Mobile" && !this.handleUploadPanel() && <GNB />}
        <div className={`${styles.PhotoEditor} ${styles[deviceCheck()]}`}>
          {/** 편집 */}
          <PhotoGrid
            isUploadPanelOpened={isUploadPanelOpened}
            zoomRatio={zoomRatio}
            photos={photos}
            printSizes={printSizes}
            selectedPhotoUUIDs={selectedPhotoUUIDs}
            onChangeOption={this.handleChangeOption}
            onClick={this.handleClickPhoto}
            onClickDelete={this.handleDeletePhoto}
            onCheckChange={this.handleCheckChangePhoto}
            adjustDetailEdits={adjustDetailEdits}
          />
          {/** 편집 */}
          {this.handleUploadPanel() && (
            <PhotoUploadPanel
              isUploadPanelOpened={isUploadPanelOpened}
              onClickHandleBar={this.handleClickUploadPanelHandleBar}
            />
          )}

          {/* {this.renderUndoButtons()}
          {this.renderZoomButtons()}
          {this.renderExitButton()} */}

          <PhotoUploadingProgress />
          <PhotoGridEmpty show={photos.isEmpty()} className={styles.Empty} />

          {isDevelopment() && (
            <div className={styles.Version}>v{getVersion()}</div>
          )}
        </div>
      </>
    );
  }
}

PhotoEditorMobile = connect(
  (state) => ({
    photos: PhotoEditorSelector.getSortedPhotos(state),
    printSizes: AppInfoSelector.getPrintSizes(state),
    selectedPhotoUUIDs: PhotoEditorSelector.getSelectedPhotoUUIDs(state),
    canUndo: PhotoEditorSelector.canUndo(state),
    canRedo: PhotoEditorSelector.canRedo(state),
    isUploadComplete: UISelector.getUploadPanel(state),
  }),
  {
    openDetailEditor: PhotoEditorActions.openDetailEditor,
    selectOrUnselectPhoto: PhotoEditorActions.selectOrUnselectPhoto,
    purgePhotosFromPhotoEditor: PhotoEditorActions.purgePhotosFromPhotoEditor,
    setPrintOptions: PhotoEditorActions.setPrintOptions,
    undo: PhotoEditorActions.undo,
    redo: PhotoEditorActions.redo,
    adjustDetailEdits: PhotoEditorActions.adjustDetailEdits,
    showUploadPanel: UIActions.showUploadPanel,
    hideUploadPanle: UIActions.hideUploadPanel,
  }
)(PhotoEditorMobile);

export default PhotoEditorMobile;
