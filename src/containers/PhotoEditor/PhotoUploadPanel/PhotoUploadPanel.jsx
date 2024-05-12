import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import classNames from "classnames";
import numeral from "numeral";
import styled from "styled-components";
import _ from "lodash";

import { GridSize } from "../../../constants/photoGridOptions";
import { PartitionOptions } from "../../../constants/photoGridOptions";
import UIActions from "../../../actions/UIActions";
import PhotoAppenderActions from "../../../actions/PhotoAppenderActions";
import PhotoEditorActions from "../../../actions/PhotoEditorActions";
import PhotoDirectUploadActions from "../../../actions/PhotoDirectUploadActions";
import AppInfoSelector from "../../../selectors/AppInfoSelector";
import UISelector from "../../../selectors/UISelector";
import PhotoAppenderSelector from "../../../selectors/PhotoAppenderSelector";
import PhotoEditorSelector from "../../../selectors/PhotoEditorSelector";
import SmartboxSelector from "../../../selectors/SmartboxSelector";
import PhotoDirectUploadSelector from "../../../selectors/PhotoDirectUploadSelector";
import { PhotoAppender } from "../../../constants/uiTypes";
import { isDevelopment, isSmartboxAvailable } from "../../../utils/commonUtils";
import PhotoGridOptionBar from "../../../components/PhotoGridOptionBar";
import GroupedPhotoGrid from "../../../components/GroupedPhotoGrid";
import PhotoGridEmpty from "../../../components/PhotoGridEmpty";
import DirectPhotoUploadButton from "../../../components/DirectPhotoUploadButton";
import { isMobile, iPad } from "../../../App";
import styles from "./PhotoUploadPanel.module.scss";

const StyledUploadPhotoButtonContentIcon = styled.div`
  background-image: url("images/ic_addpic_plus_onclick.png") !important;
`;

const StyledHandle = styled.div`
  background-image: url("images/ic_panel_closed.png") !important;

  &:hover {
    background-image: url("images/ic_panel_closed_over.png") !important;
  }

  ${(props) =>
    props.opened
      ? `
    background-image: url('images/ic_panel_opened.png') !important;

    &:hover {
      background-image: url('images/ic_panel_opened_over.png') !important;
    }
  `
      : ""}
`;

class PhotoUploadPanel extends Component {
  static propTypes = {
    isUploadPanelOpened: PropTypes.bool,
    onClickHandleBar: PropTypes.func,
  };

  static defaultProps = {
    isUploadPanelOpened: false,
    onClickHandleBar: () => {},
  };

  state = {
    isFromVisibleToHide: false,
  };

  componentWillReceiveProps(nextProps, nextContext) {
    if (
      this.props.isUploadPanelOpened === true &&
      nextProps.isUploadPanelOpened === false
    ) {
      this.setState({ isFromVisibleToHide: true });
    } else if (
      this.props.isUploadPanelOpened === false &&
      nextProps.isUploadPanelOpened === true
    ) {
      this.setState({ isFromVisibleToHide: false });
    }
  }

  isMobile() {
    return isMobile || iPad ? "Mobile" : "";
  }

  handleClickUploadPhotoButton = () => {
    this.props.openPhotoAppender();
  };

  handleClickTab = (tab) => () => {
    const { setTab } = this.props;
    setTab({ tab });
  };

  handleCheckedChangeGroup = (imageContainers, checked) => {
    const {
      printSizes,
      appendPhotosToPhotoEditor,
      purgePhotosFromPhotoEditor,
    } = this.props;

    if (checked) {
      appendPhotosToPhotoEditor({
        photos: imageContainers,
        printSizes,
      });
    } else {
      purgePhotosFromPhotoEditor({
        photos: imageContainers,
      });
    }
  };

  handleClickPhotoCell = (imageUpload) => {
    const { printSizes, appendPhotosToPhotoEditor, appendedPhotoUUIDs } =
      this.props;
    if (!appendedPhotoUUIDs.includes(imageUpload.uuid)) {
      appendPhotosToPhotoEditor({
        photos: [imageUpload],
        printSizes,
      });
    }
  };

  handleClickPhotoCellDelete = (imageUpload) => {
    this.props.deleteLocalImageFile({ imageUpload });
  };

  handleChangeOrderOptions = (selectedOrder, selectedGroup) => {
    this.props.setEditorGridOptions({
      gridOrder: selectedOrder,
      gridGroup: selectedGroup,
    });
  };

  handleClickGridSize = (gridSize) => () => {
    this.props.setEditorGridOptions({ gridSize });
  };

  renderGridOptions() {
    const { gridOrder, gridGroup, gridSize } = this.props;

    return (
      <PhotoGridOptionBar
        selectedOrder={gridOrder}
        selectedGroup={gridGroup}
        selectedGridSize={gridSize}
        onChangeOrderOptions={this.handleChangeOrderOptions}
        onClickGridSize={this.handleClickGridSize}
      />
    );
  }

  renderTab() {
    const { selectedTab, counts } = this.props;
    const smartboxCount = _.get(counts, PhotoAppender.SMART_BOX, 0);
    const directUploadCount = _.get(counts, PhotoAppender.DIRECT_UPLOAD, 0);

    return (
      <div className={styles.Tab}>
        {isSmartboxAvailable() && (
          <div
            className={classNames(styles.TabItem, {
              [styles.active]: selectedTab === PhotoAppender.SMART_BOX,
            })}
            onClick={this.handleClickTab(PhotoAppender.SMART_BOX)}
          >
            <span className={styles.TabName}>스마트박스</span>
            <span className={styles.Count}>
              {numeral(smartboxCount).format("0,0")}
            </span>
          </div>
        )}

        <div
          className={classNames(styles.TabItem, {
            [styles.active]: selectedTab === PhotoAppender.DIRECT_UPLOAD,
          })}
          onClick={this.handleClickTab(PhotoAppender.DIRECT_UPLOAD)}
        >
          <span className={styles.TabName}>업로드 한 사진</span>
          <span className={styles.Count}>
            {numeral(directUploadCount).format("0,0")}
          </span>
        </div>
      </div>
    );
  }

  renderGrid() {
    const { workspacePhotos, appendedPhotoUUIDs, editorPhotos } = this.props;
    const { gridSize, gridOrder, gridGroup } = this.props;

    return (
      <>
        {!workspacePhotos.isEmpty() && (
          <>
            <GroupedPhotoGrid
              className={styles.GroupedPhotoGrid}
              cellClassName={classNames(styles.GroupedPhotoGridCell, {
                [styles.smaller]: gridSize === GridSize.SMALLER,
              })}
              checkboxClassName={styles.GroupedPhotoGridCellCheckbox}
              disablePhotoCheckbox
              imageContainers={workspacePhotos}
              selectedImageContainerUUIDs={appendedPhotoUUIDs}
              orderBy={gridOrder}
              groupBy={gridGroup}
              partitionBy={
                gridSize === GridSize.SMALLER
                  ? PartitionOptions.SMALLER
                  : PartitionOptions.NORMAL
              }
              onCheckedChangeGroup={this.handleCheckedChangeGroup}
              onClickPhotoCell={this.handleClickPhotoCell}
              onClickPhotoCellDelete={this.handleClickPhotoCellDelete}
              uploadFileCount={editorPhotos.size}
            />
          </>
        )}
        <PhotoGridEmpty
          show={workspacePhotos.isEmpty()}
          className={styles.Empty}
        />
      </>
    );
  }

  render() {
    const { isUploadPanelOpened, onClickHandleBar } = this.props;
    const { isFromVisibleToHide } = this.state;
    return (
      <div
        className={classNames(styles.PhotoUploadPanel, {
          [styles.open]: isUploadPanelOpened,
          [styles.hide]: isFromVisibleToHide,
          [styles.mobile]: this.isMobile(),
        })}
      >
        {this.isMobile() === "Mobile" && <h3>사진을 업로드 해주세요</h3>}

        {this.isMobile() !== "Mobile" && (
          <div className={styles.UploadPhotoButton}>
            {isSmartboxAvailable() ? (
              <button
                className="dark"
                onClick={this.handleClickUploadPhotoButton}
              >
                <div className={styles.UploadPhotoButtonContent}>
                  <StyledUploadPhotoButtonContentIcon className={styles.Icon} />
                  <div className={styles.Text}>사진 추가하기</div>
                </div>
              </button>
            ) : (
              <DirectPhotoUploadButton
                className={styles.UploadPhotoButtonContent}
              >
                <StyledUploadPhotoButtonContentIcon className={styles.Icon} />
                <div className={styles.Text}>사진 추가하기</div>
              </DirectPhotoUploadButton>
            )}
          </div>
        )}

        {!this.isMobile() && this.renderGridOptions()}
        {!this.isMobile() && this.renderTab()}
        {this.renderGrid()}

        {this.isMobile() === "Mobile" && (
          <div
            className={`${styles.UploadPhotoButton} ${styles.bigUploadButton}`}
          >
            {isSmartboxAvailable() ? (
              <button onClick={this.handleClickUploadPhotoButton}>
                <div className={styles.UploadPhotoButtonContent}>
                  <div className={styles.Text}>갤러리에서 가져오기</div>
                </div>
              </button>
            ) : (
              <DirectPhotoUploadButton
                className={styles.UploadPhotoButtonContent}
              >
                <div className={styles.Text}>갤러리에서 가져오기</div>
              </DirectPhotoUploadButton>
            )}
          </div>
        )}

        <div className={styles.SideBorder} />
        <StyledHandle
          className={classNames(styles.Handle)}
          opened={isUploadPanelOpened}
          onClick={onClickHandleBar}
        />

        {false && isDevelopment() && !this.props.editorPhotos.isEmpty() && (
          <div className={styles.AppendedDebugger}>
            <div className={styles.Title}>Debugger (Dev)</div>
            {this.props.editorPhotos.map((photo, i) => (
              <div
                key={photo.uuid}
                data-kind={photo.get("$parentType")}
                data-appended={this.props.appendedPhotoUUIDs.includes(
                  photo.uuid
                )}
              >
                {`(${numeral(i).format("000")})  `}
                {photo.uuid.split("-").slice(0, 2).join("-")}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}

PhotoUploadPanel = connect(
  (state) => {
    const selectedTab = UISelector.getUploadPanelTab(state);
    const selectedSmartboxPhotos =
      SmartboxSelector.getSortedWorkspacePhotos(state);
    const directUploadedPhotos =
      PhotoDirectUploadSelector.getUploadEndedFiles(state);
    return {
      printSizes: AppInfoSelector.getPrintSizes(state),
      selectedTab,
      gridSize: PhotoEditorSelector.getGridSize(state),
      gridOrder: PhotoEditorSelector.getGridOrder(state),
      gridGroup: PhotoEditorSelector.getGridGroup(state),
      isPhotoAppenderOpened: PhotoAppenderSelector.isPhotoAppenderOpened(state),
      counts: {
        [PhotoAppender.SMART_BOX]: selectedSmartboxPhotos.size,
        [PhotoAppender.DIRECT_UPLOAD]: directUploadedPhotos.size,
      },
      workspacePhotos:
        selectedTab === PhotoAppender.SMART_BOX
          ? selectedSmartboxPhotos
          : directUploadedPhotos,
      appendedPhotoUUIDs: PhotoEditorSelector.getSortedPhotoUUIDs(state),
      editorPhotos: PhotoEditorSelector.getSortedPhotos(state),
    };
  },
  {
    setTab: UIActions.setUploadPanelTab,
    setEditorGridOptions: PhotoEditorActions.setEditorGridOptions,
    openPhotoAppender: PhotoAppenderActions.openPhotoAppender,
    markOrUnmarkPhotoToEdit: PhotoAppenderActions.markOrUnmarkPhotoToEdit,
    appendPhotosToPhotoEditor: PhotoEditorActions.appendPhotosToPhotoEditor,
    purgePhotosFromPhotoEditor: PhotoEditorActions.purgePhotosFromPhotoEditor,
    deleteLocalImageFile: PhotoDirectUploadActions.deleteLocalImageFile,
  }
)(PhotoUploadPanel);

export default PhotoUploadPanel;
