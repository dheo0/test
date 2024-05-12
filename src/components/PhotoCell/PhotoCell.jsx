import React, { PureComponent, createRef } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import _ from "lodash";
import styled from "styled-components";

import Photo from "../../models/Photo";
import { isDevelopment, deviceCheck } from "../../utils/commonUtils";
import PhotoCanvas from "../PhotoCanvas";
import PrintSizeSelect, { ArrowStyles } from "../../components/PrintSizeSelect";
import Tooltip from "../../components/Tooltip";
import Counter from "../../components/Counter";
import PhotoCheckbox from "../../components/PhotoCheckbox";
import styles from "./PhotoCell.module.scss";

const WarningIcon = "images/ic_warning.png";

const StyledRemoveButton = styled.div`
  background-image: url("images/ic_pic_delete.png") !important;

  &:hover {
    background-image: url("images/ic_pic_delete_over.png") !important;
  }
`;

const RotateButton = styled.div`
  background-image: url("images/ic_s_rotate.png") !important;

  &:hover {
    background-image: url("images/ic_s_rotate_over.png") !important;
  }
`;

const MoreOverButton = styled.div`
  background-image: url("images/ic_edit.png") !important;

  &:hover {
    background-image: url("images/ic_edit_over.png") !important;
  }
`;

class PhotoCell extends PureComponent {
  isPortrait = this.props.photo.isPortrait();

  photoCellRef = createRef();
  state = {
    isDelete: false,
  };
  handleClick = () => {
    const { photo, onClick } = this.props;
    onClick(photo);
  };

  handleClickRemove = (event) => {
    const { photo, onClickDelete } = this.props;
    event.stopPropagation();
    if (deviceCheck() === "Web") {
      onClickDelete(photo);
    } else {
      this.setState({ isDelete: true });
    }
  };
  handleClickDelete = () => {
    const { photo, onClickDelete } = this.props;
    this.setState({ isDelete: true });
    onClickDelete(photo);
  };
  handleClickRemoveWrap = () => {
    console.log(111111);
    this.setState({ isDelete: false });
  };
  handleChangePrintSize = (printSize) => {
    const { onChangeOption } = this.props;
    onChangeOption("size", printSize.size);
    // 2020.08.05 개별사진 사이즈 적용
    //console.log(this.props);
  };

  handleClickRotateButton = () => {
    const { photo, adjustDetailEdits } = this.props;
    const printOption = photo.getPrintOption().doRotate();

    adjustDetailEdits({
      photos: [photo],
      options: {
        ...printOption.toJS(),
      },
    });
  };

  handleClickMoreOverButton = () => {
    this.props.onClickMoreOverButton(this.photoCellRef.current);
  };

  handleCheckChange = (checked) => {
    const { photo, onCheckChange } = this.props;
    onCheckChange(photo, checked);
  };

  handleChangeCounter = (counter) => {
    const { onChangeOption } = this.props;

    //console.log(counter);
    counter = Math.max(1, Math.floor(counter)); // 2020.08.13 수량은 최소 1 이상이며, 소수점 제거

    onChangeOption("printQuantity", counter);
  };

  renderPrintSizeWarning() {
    const { photo, printSize } = this.props;
    const shouldSizeWarn = photo.shouldSizeWarn(
      printSize,
      photo.getPrintOption().scale
    );

    return (
      shouldSizeWarn && (
        <div className={classNames(styles.PrintSizeWarning)}>
          <img className={styles.Icon} alt="" src={WarningIcon} />
          <div className={styles.Message}>
            <strong className={styles.Title}>인화 비권장</strong>
            <div className={styles.Content}>
              사진의 해상도가 낮아
              <br />
              인화 품질이 좋지 않을 수 있습니다.
            </div>
          </div>
        </div>
      )
    );
  }

  render() {
    const {
      className,
      zoomClassName,
      parentRef,
      photo,
      printSize,
      focused,
      selected,
    } = this.props;

    const {
      printQuantity,
      filterAdjusted,
      filterAdjustedSrc,
      rotate,
      ...otherPrintAttrs
    } = photo.getPrintOption().toJS();
    const _photo = photo.ofRotated(rotate);
    const printOption = _photo.getPrintOption();
    const src = filterAdjusted ? filterAdjustedSrc : _photo.src;
    const ratios = {
      ratio: _photo.getRatio(),
      optionRatio: printSize.getPrintRatio(),
      longerRatio: _photo.getRatio(true),
    };

    return (
      <div
        ref={this.photoCellRef}
        data-focused={focused}
        className={classNames(
          styles.PhotoCell,
          className,
          _.get(styles, zoomClassName),
          {
            [styles.smaller]: deviceCheck() === "Mobile",
          }
        )}
      >
        <div
          className={styles.PhotoWrapper}
          onClick={!this.state.isDelete && this.handleClick}
        >
          <PhotoCanvas
            zoomClassName={zoomClassName}
            printOption={printOption}
            canvasSize={236} // 2020.08.03 Photo Cel 사이즈 크기 216 -> 236
            src={src}
            date={_photo.getDateString()}
            isPortrait={_photo.isPortrait()}
            isTrimmingPortrait={photo.isPortrait()}
            rotate={rotate}
            ratios={ratios}
            {...otherPrintAttrs}
          />

          {this.renderPrintSizeWarning()}
          {this.state.isDelete && (
            <div
              className={styles.DeleteWrap}
              onClick={this.handleClickRemoveWrap}
            >
              <span>선택한 사진이 주문 목록에서 삭제됩니다.</span>
              <div className={styles.BtnWrap}>
                <button
                  type="button"
                  onClick={this.handleClickRemoveWrap}
                  className={styles.cancel}
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={this.handleClickDelete}
                  className={styles.check}
                >
                  확인
                </button>
              </div>
            </div>
          )}
          <PhotoCheckbox
            className={styles.Checkbox}
            checked={selected}
            onChange={this.handleCheckChange}
          />

          <StyledRemoveButton
            className={styles.RemoveButton}
            onClick={this.handleClickRemove}
          />

          {isDevelopment() && ( // 2020.08.06 개발 모드 옵션 표시
            <div className={styles.Debugger}>
              <div className={styles.UUIDDebugger}>
                <div>{_photo.uuid.split("-").slice(0, 2).join("-")}</div>
              </div>

              <div className={styles.TrimStringDebugger}>
                <div>
                  {printOption
                    .getTrimString(photo, printSize)
                    .split("^")
                    .map((x, i) => <span key={`tr-${i}`}>{x}</span>)
                    .reduce((r, e, i) => {
                      if (i > 0) {
                        r.push("^");
                      }
                      r.push(e);
                      return r;
                    }, [])}
                </div>
                <div>
                  {(() => {
                    if (photo.isSquare()) {
                      return "SQ";
                    }
                    if (photo.isLandscape()) {
                      return "LND";
                    }
                    if (photo.isPortrait()) {
                      return "PRT";
                    }
                  })()}
                </div>
                <div>{`${printOption.rotate}'`}</div>
                <div>{`${
                  printOption.paper === "gloss" ? "유광" : "무광"
                }'`}</div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.OptionBar}>
          <PrintSizeSelect
            tooltip="사이즈 변경"
            concise
            shortControlText
            overlayBelongsTo={parentRef}
            arrowStyle={ArrowStyles.FILL}
            wrapperClassName={styles.PrintSizeSelectWrapper}
            controlClassName={styles.PrintSizeSelectControl}
            controlArrowClassName={styles.PrintSizeSelectControlArrow}
            selectClassName={styles.PrintSizeSelect}
            selectedPrintSize={printSize}
            onChangePrintSize={this.handleChangePrintSize}
          />

          <Counter
            className={styles.Counter}
            initial={printQuantity}
            min={1}
            onChange={this.handleChangeCounter}
          />

          <Tooltip tooltip="사진 회전" className={styles.RotateButton}>
            <RotateButton
              className={styles.Button}
              onClick={this.handleClickRotateButton}
            />
          </Tooltip>
          {deviceCheck() === "Mobile" && (
            <button
              type="button"
              className={styles.CopyButton}
              onClick={this.handleClickCloneButton}
            >
              복사
            </button>
          )}
          <Tooltip tooltip="옵션 변경" className={styles.MoreOverButton}>
            <MoreOverButton
              className={styles.Button}
              onClick={this.handleClickMoreOverButton}
            />
          </Tooltip>
        </div>
      </div>
    );
  }
}

PhotoCell.propTypes = {
  className: PropTypes.string,
  zoomClassName: PropTypes.string,
  parentRef: PropTypes.object,
  photo: PropTypes.instanceOf(Photo),
  focused: PropTypes.bool,
  selected: PropTypes.bool,
  onChangeOption: PropTypes.func,
  onClickDelete: PropTypes.func,
  onCheckChange: PropTypes.func,
  onClickMoreOverButton: PropTypes.func,
  adjustDetailEdits: PropTypes.func,
};

PhotoCell.defaultProps = {
  className: null,
  zoomClassName: null,
  parentRef: null,
  photo: null,
  focused: false,
  selected: false,
  onChangeOption: () => {},
  onClickDelete: () => {},
  onCheckChange: () => {},
  onClickMoreOverButton: () => {},
  adjustDetailEdits: () => {},
};

export default PhotoCell;
