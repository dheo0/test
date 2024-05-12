import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import _ from 'lodash';

import { TrimmingTypes } from '../../constants/printTypes';
import { isDevelopment } from '../../utils/commonUtils';
import Photo from '../../models/Photo';
import PrintSize from '../../models/PrintSize';
import PhotoCanvas from '../PhotoCanvas';
import styles from './Cropper.module.scss';

const WarningIcon = 'images/ic_warning.png';

const MOV_DIR_NONE = 0;
const MOV_DIR_L_TO_R = 1;
const MOV_DIR_R_TO_L = 2;
const MOV_DIR_T_TO_B = 3;
const MOV_DIR_B_TO_T = 4;

class Cropper extends Component {
  static propTypes = {
    className: PropTypes.string,
    photo: PropTypes.instanceOf(Photo).isRequired,
    printSize: PropTypes.instanceOf(PrintSize).isRequired,
  };

  static defaultProps = {
    className: null,
  };

  constructor(props) {
    super(props);
    this.canvasRef = createRef();

    const printOption = props.photo.getPrintOption();
    const { scale, rotate, posX, posY } = printOption.toJS();
    const photo = props.photo.ofRotated(rotate);

    this.optionRatio = props.printSize.getPrintRatio();
    this.ratio = photo.getRatio();
    this.longerRatio = photo.getRatio(true);
    this.isOverRatio = photo.isOverRatio(props.printSize);
    this.isPortrait = photo.isPortrait();
    this.isTrimPortrait = props.photo.isPortrait();

    this.initialized = false;
    this.initPosX = null;
    this.initPosY = null;
    this.lastCurPosX = null;
    this.lastCurPosY = null;
    this.isDragging = false;
    this.movDirH = MOV_DIR_NONE;
    this.movDirV = MOV_DIR_NONE;

    this.state = {
      isRelativePositions: true,
      isMovable: printOption.trimming !== TrimmingTypes.IMAGE_FULL,
      posX, posY, scale, rotate,
      initCurPosX: null, initCurPosY: null,
    };

    this.resetMoveGap = (scale = this.state.scale) => {
      const { posX, posY } = this.state;
      const { width: canvasWidth = 0, height: canvasHeight = 0 } = this.canvasRef.current.getCanvasRect();

      this.backgroundGap = this.getBackgroundSize(scale);
      const [maX, maY] = [
        _.round(canvasWidth * this.backgroundGap[0] / 2, 2),
        _.round(canvasHeight * this.backgroundGap[1] / 2, 2),
      ];

      this.movableAmounts = [
        (maX >= 1) ? maX : 0,
        (maY >= 1) ? maY : 0,
      ];

      this.setState({
        posX: _.clamp(posX, -this.movableAmounts[0], this.movableAmounts[0]),
        posY: _.clamp(posY, -this.movableAmounts[1], this.movableAmounts[1]),
      });

      if (isDevelopment()) {
        console.log({
          isOverRatio: this.isOverRatio,
          isPortrait: this.isPortrait,
          isTrimPortrait: this.isTrimPortrait,
          bgGapX: this.backgroundGap[0],
          bgGapY: this.backgroundGap[1],
          movableAmountX: this.movableAmounts[0],
          movableAmountY: this.movableAmounts[1],
        });
      }

      if (!this.initialized && (posX !== 0 || posY !== 0)) {
        this.initialized = true;

        /* Convert relative positions to absolute. */
        const absPosX = -1 * (posX / 0.5) * this.movableAmounts[0];
        const absPosY = -1 * (posY / 0.5) * this.movableAmounts[1];
        this.setState({ posX: absPosX, posY: absPosY, isRelativePositions: false });
      }
    };
  }

  componentDidMount() {
    this.resetMoveGap();
  }

  getBackgroundSize = (scale = this.state.scale) => {
    const { rotate } = this.state;
    const { photo, printSize } = this.props;

    const stdSize = (scale - 1);

    if (rotate === 90 || rotate === 270) {
      const longerSize = _.round(((photo.getRatio(true) / printSize.getPrintRatio()) * scale) - 1, 4);
      if (this.isTrimPortrait) {
        return [longerSize, stdSize];
      } else {
        return [stdSize, longerSize];
      }
    } else {
      const longerSize = Math.abs(
        this.isOverRatio
          ? _.round(((this.ratio / this.optionRatio) * scale) - 1, 4)
          : _.round(((this.optionRatio / this.ratio) * scale) - 1, 4)
      );

      if (this.isOverRatio) {
        if (this.isPortrait && this.isTrimPortrait) { return [longerSize, stdSize]; }
        if (this.isPortrait && !this.isTrimPortrait) { return [stdSize, longerSize]; }
        if (!this.isPortrait && this.isTrimPortrait) { return [longerSize, stdSize]; }
        return [stdSize, longerSize];
      } else {
        if (this.isPortrait) { return [stdSize, longerSize]; }
        return [longerSize, stdSize];
      }
    }
  };

  rotateTo(rotate = this.state.rotate) {
    this.setState({ rotate: rotate % 360 });
  }

  scale(scale = this.state.scale) {
    const _scale = _.clamp(scale, 1, 2);
    this.setState({ scale: _scale });
    this.resetMoveGap(_scale);
  }

  getData() {
    const [movableAmountX, movableAmountY] = this.movableAmounts;
    const { posX, posY, scale, rotate } = this.state;

    /* Convert to relative positions */
    const relPosX = !_.isNaN(posX / movableAmountX)
      ? (-1 * _.round(posX / movableAmountX, 2)) * 0.5
      : 0;
    const relPosY = !_.isNaN(posY / movableAmountY)
      ? (-1 * _.round(posY / movableAmountY, 2)) * 0.5
      : 0;

    return { scale, rotate, posX: relPosX, posY: relPosY };
  }

  confirmChanges() {
    // For spare
  }

  handleMove = (event) => {
    if (this.isDragging) {
      const [horizontalGap, verticalGap] = this.backgroundGap;
      const [movableAmountX, movableAmountY] = this.movableAmounts;
      let { posX, posY, initCurPosX, initCurPosY } = this.state;
      let invertX = false;
      let invertY = false;

      /* eslint-disable no-fallthrough, default-case */
      // noinspection FallThroughInSwitchStatementJS
      switch (this.state.rotate) {
        case 90: {
          invertX = true;
          break;
        }

        case 180: {
          invertX = true;
          invertY = true;
          break;
        }

        case 270: {
          invertY = true;
          break;
        }
      }
      /* eslint-enable no-fallthrough, default-case */

      if (horizontalGap !== 0) {
        posX = _.clamp(
          this.initPosX + ((invertX ? 1 : -1) * (initCurPosX - event.screenX)),
          -movableAmountX, movableAmountX
        );

        if (event.screenX - this.lastCurPosX > 0) {  /* → */
          if (this.movDirH === MOV_DIR_R_TO_L) {
            this.initPosX = posX;
            initCurPosX = this.lastCurPosX;
          }
          this.movDirH = MOV_DIR_L_TO_R;
        } else if (event.screenX - this.lastCurPosX < 0) {  /* ← */
          if (this.movDirH === MOV_DIR_L_TO_R) {
            this.initPosX = posX;
            initCurPosX = this.lastCurPosX;
          }
          this.movDirH = MOV_DIR_R_TO_L;
        }
        this.lastCurPosX = event.screenX;
      }

      if (verticalGap !== 0) {
        posY = _.clamp(
          this.initPosY + ((invertY ? 1 : -1) * (initCurPosY - event.screenY)),
          -movableAmountY, movableAmountY
        );

        if (event.screenY - this.lastCurPosY < 0) {  /* ↑ */
          if (this.movDirV === MOV_DIR_T_TO_B) {
            this.initPosY = posY;
            initCurPosY = this.lastCurPosY;
          }
          this.movDirV = MOV_DIR_B_TO_T;
        } else if (event.screenY - this.lastCurPosY > 0) {  /* ↓ */
          if (this.movDirV === MOV_DIR_B_TO_T) {
            this.initPosY = posY;
            initCurPosY = this.lastCurPosY;
          }
          this.movDirV = MOV_DIR_T_TO_B;
        }
        this.lastCurPosY = event.screenY;
      }

      this.setState({ posX, posY, initCurPosX, initCurPosY, isRelativePositions: false });
    }
  };

  handleBegin = (event) => {
    const { posX, posY } = this.state;
    this.isDragging = true;
    this.initPosX = posX;
    this.initPosY = posY;
    window.document.addEventListener('mousemove', this.handleMove);
    window.document.addEventListener('mouseup', this.handleEnd);
    this.setState({ initCurPosX: event.screenX, initCurPosY: event.screenY });
  };

  handleEnd = () => {
    this.isDragging = false;
    this.lastCurPosX = null;
    this.lastCurPosY = null;
    this.movDirH = MOV_DIR_NONE;
    this.movDirV = MOV_DIR_NONE;
    window.document.removeEventListener('mousemove', this.handleMove);
    window.document.removeEventListener('mouseup', this.handleEnd);
    this.setState({ initCurPosX: null, initCurPosY: null })
  };

  handleCropperMouseEvent = (fn) => {
    return this.state.isMovable ? fn : null;
  };

  renderPrintSizeWarning() {
    const { photo, printSize } = this.props;
    const { scale } = this.state;
    const shouldDisplaySizeWarning = photo.shouldSizeWarn(printSize, scale);

    return shouldDisplaySizeWarning && (
      <div
        className={classNames(styles.PrintSizeWarning)}
      >
        <img className={styles.Icon} alt="" src={WarningIcon} />
        <div className={styles.Message}>
          <strong className={styles.Title}>인화 비권장</strong>
          <div className={styles.Content}>사진의 해상도가 낮아<br />인화 품질이 좋지 않을 수 있습니다.</div>
        </div>
      </div>
    );
  }

  render() {
    const { className, photo, printSize, imageSrc } = this.props;
    const { isRelativePositions, posX, posY, rotate, scale } = this.state;

    const _photo = photo.ofRotated(rotate);
    const { paper, border, trimming, insertDate } = _photo.getPrintOption().toJS();
    const ratios = {
      ratio: _photo.getRatio(),
      optionRatio: printSize.getPrintRatio(),
      longerRatio: _photo.getRatio(true),
    };

    return (
      <div
        className={classNames(className)}
        onMouseDown={this.handleCropperMouseEvent(this.handleBegin)}
        onMouseUp={this.handleCropperMouseEvent(this.handleEnd)}
      >
        <PhotoCanvas
          ref={this.canvasRef}
          className={classNames(styles.Cropper, {
            [styles.paperFullMode]: trimming === TrimmingTypes.PAPER_FULL,
          })}
          canvasSize={470}
          src={imageSrc}
          paper={paper}
          border={border}
          trimming={trimming}
          insertDate={insertDate}
          isPortrait={_photo.isPortrait()}
          isTrimmingPortrait={photo.isPortrait()}
          isRelativePositions={isRelativePositions}
          rotate={rotate}
          scale={scale}
          posX={posX}
          posY={posY}
          ratios={ratios}
          date={_photo.getDateString()}
        />

        { this.renderPrintSizeWarning() }
      </div>
    );
  }
}

export default Cropper
