import React, { PureComponent, createRef } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import _ from "lodash";
import numeral from "numeral";
import memoize from "memoize-one";

import { BorderTypes, TrimmingTypes } from "../../constants/printTypes";
import PrintOptionsFields from "../../constants/printOptionFields";
import styles from "./PhotoCanvas.module.scss";
import { deviceCheck } from "../../utils/commonUtils";

const DATE_MARGIN_PERC = 0.06;
const BORDER_THICKNESS_FACTOR = 2.5 / 100;

function formatPos(val) {
  if (_.isNil(val)) {
    return "0";
  }
  return val > 0 ? `+ ${val}px` : `- ${Math.abs(val)}px`;
}

class PhotoCanvas extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    zoomClassName: PropTypes.string,
    canvasSize: PropTypes.number,
    src: PropTypes.string,
    isPortrait: PropTypes.bool,
    isTrimmingPortrait: PropTypes.bool,
    isRelativePositions: PropTypes.bool,
    paper: PropTypes.string,
    border: PropTypes.string,
    trimming: PropTypes.string,
    insertDate: PropTypes.bool,
    scale: PropTypes.number,
    rotate: PropTypes.number,
    posX: PropTypes.number,
    posY: PropTypes.number,
    date: PropTypes.string,
    ratios: PropTypes.shape({
      ratio: PropTypes.number,
      optionRatio: PropTypes.number,
      longerRatio: PropTypes.number,
    }),
  };

  static defaultProps = {
    className: null,
    zoomClassName: "z10",
    canvasSize: 236, // 2020.08.03 Photo Cel 사이즈 크기 216 -> 236
    src: null,
    isPortrait: false,
    isTrimmingPortrait: false,
    isRelativePositions: true,
    paper: PrintOptionsFields.PAPER.defaultValue,
    border: PrintOptionsFields.BORDER.defaultValue,
    trimming: PrintOptionsFields.TRIMMING.defaultValue,
    insertDate: PrintOptionsFields.INSERT_DATE.defaultValue,
    scale: 1,
    rotate: 0,
    posX: 0,
    posY: 0,
    date: null,
    ratios: {
      ratio: 1,
      optionRatio: 1,
      longerRatio: 1,
    },
  };

  componentDidMount() {
    if (this.props.border === BorderTypes.BORDER) {
      // Force update once
      this.forceUpdate();
    }
  }

  canvasRef = createRef();

  getCanvasRect() {
    if (this.canvasRef.current) {
      return this.canvasRef.current.getBoundingClientRect();
    }
    return {};
  }

  computeTrimmingStyle = memoize((optionRatio, isTrimmingPortrait) => {
    const trimmingStyle = {};

    if (isTrimmingPortrait) {
      _.set(trimmingStyle, "width", numeral(optionRatio).format("0[.]00%"));
      _.set(trimmingStyle, "height", "100%");
    } else {
      _.set(trimmingStyle, "width", "100%");
      _.set(trimmingStyle, "height", numeral(optionRatio).format("0[.]00%"));
    }

    return trimmingStyle;
  });

  computeMaskStyle = memoize(
    (canvasSize, border, trimmingWidth, trimmingHeight) => {
      const maskStyle = {};

      /* NOTE: 소수점 문제로 이미지가 rotate + translate 되었을 경우 기대하는 사이즈보다 살짝 커지는 현상이 있음. */
      /* (커진다기보다는, 이미지 위치가 조금 어긋남.) */
      _.set(maskStyle, "width", `calc(${trimmingWidth} + 2px)`);
      _.set(maskStyle, "height", `calc(${trimmingHeight} + 2px)`);

      if (border === BorderTypes.BORDER) {
        _.set(
          maskStyle,
          "borderWidth",
          _.round(canvasSize * BORDER_THICKNESS_FACTOR)
        );
      }

      return maskStyle;
    }
  );

  computeDateStyle = memoize(
    (
      originalRatio,
      originalOptionRatio,
      trimmingRatio,
      trimmingLongerRatio,
      isTrimmingPortrait,
      rotate,
      trimming
    ) => {
      const dateStyle = {};

      if (isTrimmingPortrait) {
        _.set(
          dateStyle,
          "right",
          numeral((1 - trimmingRatio) / 2 + DATE_MARGIN_PERC).format("0[.]00%")
        );
        _.set(
          dateStyle,
          "bottom",
          numeral((1 - trimmingLongerRatio) / 2 + DATE_MARGIN_PERC).format(
            "0[.]00%"
          )
        );
      } else {
        _.set(
          dateStyle,
          "right",
          numeral((1 - trimmingLongerRatio) / 2 + DATE_MARGIN_PERC).format(
            "0[.]00%"
          )
        );
        _.set(
          dateStyle,
          "bottom",
          numeral((1 - trimmingRatio) / 2 + DATE_MARGIN_PERC).format("0[.]00%")
        );
      }

      if (
        (rotate === 90 || rotate === 270) &&
        trimming === TrimmingTypes.IMAGE_FULL
      ) {
        const _longerRatio =
          Math.max(originalOptionRatio, originalRatio) * originalRatio;
        if (isTrimmingPortrait) {
          _.set(
            dateStyle,
            "right",
            numeral((1 - originalOptionRatio) / 2 + DATE_MARGIN_PERC).format(
              "0[.]00%"
            )
          );
          _.set(
            dateStyle,
            "bottom",
            numeral((1 - _longerRatio) / 2 + DATE_MARGIN_PERC).format("0[.]00%")
          );
        } else {
          _.set(
            dateStyle,
            "right",
            numeral((1 - _longerRatio) / 2 + DATE_MARGIN_PERC).format("0[.]00%")
          );
          _.set(
            dateStyle,
            "bottom",
            numeral((1 - originalOptionRatio) / 2 + DATE_MARGIN_PERC).format(
              "0[.]00%"
            )
          );
        }
      }

      return dateStyle;
    }
  );

  getTrimmingRatios = memoize(
    (originalRatio, originalOptionRatio, originalLongerRatio, trimming) => {
      const trimmingRatio =
        trimming === TrimmingTypes.PAPER_FULL
          ? originalOptionRatio
          : Math.min(originalOptionRatio, originalRatio);
      const trimmingLongerRatio =
        trimming === TrimmingTypes.PAPER_FULL
          ? 1.0
          : Math.min(trimmingRatio * originalLongerRatio, 1.0);
      const isTrimmingOverRatio = originalRatio / originalOptionRatio >= 1;

      return {
        trimmingRatio,
        trimmingLongerRatio,
        isTrimmingOverRatio,
      };
    }
  );

  computeImageStyle = memoize(
    (
      border,
      isPortrait,
      isTrimmingPortrait,
      isRelativePositions,
      src,
      trimming,
      rotate,
      posX,
      posY,
      scale,
      originalRatio,
      originalOptionRatio,
      originalLongerRatio,
      trimmingRatio,
      trimmingLongerRatio,
      isTrimmingOverRatio
    ) => {
      const imageStyle = {};
      const imageTransforms = ["translate(-50%, -50%)"];

      //console.log(border);

      if (isTrimmingPortrait) {
        _.set(imageStyle, "width", numeral(trimmingRatio).format("0[.]00%"));
        _.set(
          imageStyle,
          "height",
          numeral(trimmingLongerRatio).format("0[.]00%")
        );
      } else {
        _.set(
          imageStyle,
          "width",
          numeral(trimmingLongerRatio).format("0[.]00%")
        );
        _.set(imageStyle, "height", numeral(trimmingRatio).format("0[.]00%"));
      }

      //console.log(_.round(canvasSize * BORDER_THICKNESS_FACTOR));
      if (trimming === TrimmingTypes.IMAGE_FULL) {
        if (border === BorderTypes.BORDER) {
          // 2022.02.22 이미지풀 유테 잘리는면 표현 보정
          //_.set(imageStyle, 'height', numeral(trimmingLongerRatio-0.05).format('0[.]00%'));
          //_.set(imageStyle, 'width', numeral(trimmingRatio-0.05).format('0[.]00%'));
          if (isTrimmingPortrait) {
            _.set(
              imageStyle,
              "width",
              numeral(trimmingRatio - 0.05).format("0[.]00%")
            );
            _.set(
              imageStyle,
              "height",
              numeral(trimmingLongerRatio - 0.05).format("0[.]00%")
            );
          } else {
            _.set(
              imageStyle,
              "width",
              numeral(trimmingLongerRatio - 0.05).format("0[.]00%")
            );
            _.set(
              imageStyle,
              "height",
              numeral(trimmingRatio - 0.05).format("0[.]00%")
            );
          }
        }

        _.set(imageStyle, "backgroundSize", "cover");
        _.set(imageStyle, "backgroundPosition", "center");
        if (rotate === 90 || rotate === 270) {
          _.set(imageStyle, "backgroundSize", "contain");
        }
      } else {
        if (isTrimmingOverRatio) {
          const longerSize = numeral(
            (originalRatio / originalOptionRatio) * scale
          ).format("0[.]00%");
          const stdSize = numeral(1 * scale).format("0%");
          if (isPortrait) {
            _.set(imageStyle, "backgroundSize", `${longerSize} ${stdSize}`);
          } else {
            _.set(imageStyle, "backgroundSize", `${stdSize} ${longerSize}`);
          }
        } else {
          const longerSize = numeral(
            (originalOptionRatio / originalRatio) * scale
          ).format("0[.]00%");
          const stdSize = numeral(1 * scale).format("0%");
          if (isPortrait) {
            _.set(imageStyle, "backgroundSize", `${stdSize} ${longerSize}`);
          } else {
            _.set(imageStyle, "backgroundSize", `${longerSize} ${stdSize}`);
          }
        }
      }

      if (rotate === 90 || rotate === 270) {
        if (trimming === TrimmingTypes.IMAGE_FULL) {
          if (isTrimmingPortrait) {
            const ratioW =
              Math.max(originalOptionRatio, originalRatio) * originalRatio;
            _.set(imageStyle, "width", numeral(ratioW).format("0[.]00%"));
            _.set(
              imageStyle,
              "height",
              numeral(originalOptionRatio).format("0[.]00%")
            );
          } else {
            const ratioH =
              Math.max(originalOptionRatio, originalRatio) *
              originalOptionRatio;
            _.set(
              imageStyle,
              "width",
              numeral(originalOptionRatio).format("0[.]00%")
            );
            _.set(imageStyle, "height", numeral(ratioH).format("0[.]00%"));
          }
          _.set(imageStyle, "backgroundPosition", "center");
        } else {
          if (isTrimmingPortrait) {
            const longerSize = numeral(
              (originalLongerRatio / originalOptionRatio) * scale
            ).format("0[.]00%");
            const stdSize = numeral(1 * scale).format("0%");
            _.set(imageStyle, "width", "100%");
            _.set(
              imageStyle,
              "height",
              numeral(originalOptionRatio).format("0[.]00%")
            );
            _.set(imageStyle, "backgroundSize", `${stdSize} ${longerSize}`);
          } else {
            const longerSize = numeral(
              (originalLongerRatio / originalOptionRatio) * scale
            ).format("0[.]00%");
            const stdSize = numeral(1 * scale).format("0%");
            _.set(
              imageStyle,
              "width",
              numeral(originalOptionRatio).format("0[.]00%")
            );
            _.set(imageStyle, "height", "100%");
            _.set(imageStyle, "backgroundSize", `${longerSize} ${stdSize}`);
          }
          if (isRelativePositions) {
            _.set(
              imageStyle,
              "backgroundPositionX",
              numeral(posY + 0.5).format("0[.]00%")
            );
            _.set(
              imageStyle,
              "backgroundPositionY",
              numeral(posX + 0.5).format("0[.]00%")
            );
          } else {
            _.set(
              imageStyle,
              "backgroundPositionX",
              deviceCheck() === "Mobile"
                ? "center"
                : `calc(50% ${formatPos(posY)})`
            );
            _.set(
              imageStyle,
              "backgroundPositionY",
              deviceCheck() === "Mobile"
                ? "center"
                : `calc(50% ${formatPos(posX)})`
            );
          }
        }
      } else {
        if (trimming === TrimmingTypes.PAPER_FULL) {
          if (isRelativePositions) {
            _.set(
              imageStyle,
              "backgroundPositionX",
              numeral(posX + 0.5).format("0[.]00%")
            );
            _.set(
              imageStyle,
              "backgroundPositionY",
              numeral(posY + 0.5).format("0[.]00%")
            );
          } else {
            _.set(
              imageStyle,
              "backgroundPositionX",
              deviceCheck() === "Mobile"
                ? "center"
                : `calc(50% ${formatPos(posX)})`
            );
            _.set(
              imageStyle,
              "backgroundPositionY",
              deviceCheck() === "Mobile"
                ? "center"
                : `calc(50% ${formatPos(posY)})`
            );
          }
        }
      }

      imageTransforms.push(`rotate(${rotate}deg)`);

      _.set(imageStyle, "transform", imageTransforms.join(" "));
      _.set(imageStyle, "backgroundImage", `url('${src}')`);

      return imageStyle;
    }
  );

  render() {
    const {
      className,
      zoomClassName,
      canvasSize,
      src,
      date,
      paper,
      border,
      trimming,
      rotate,
      scale,
      insertDate,
      posX,
      posY,
      ratios,
      isPortrait,
      isTrimmingPortrait,
      isRelativePositions,
    } = this.props;
    const {
      ratio: originalRatio,
      optionRatio: originalOptionRatio,
      longerRatio: originalLongerRatio,
    } = ratios;

    const { trimmingRatio, trimmingLongerRatio, isTrimmingOverRatio } =
      this.getTrimmingRatios(
        originalRatio,
        originalOptionRatio,
        originalLongerRatio,
        trimming
      );

    const imageStyle = this.computeImageStyle(
      border,
      isPortrait,
      isTrimmingPortrait,
      isRelativePositions,
      src,
      trimming,
      rotate,
      posX,
      posY,
      scale,
      originalRatio,
      originalOptionRatio,
      originalLongerRatio,
      trimmingRatio,
      trimmingLongerRatio,
      isTrimmingOverRatio
    );

    const trimmingStyle = this.computeTrimmingStyle(
      originalOptionRatio,
      isTrimmingPortrait
    );
    const { width: trimmingWidth, height: trimmingHeight } = trimmingStyle;
    const maskStyle = this.computeMaskStyle(
      canvasSize,
      border,
      trimmingWidth,
      trimmingHeight
    );
    const dateStyle = this.computeDateStyle(
      originalRatio,
      originalOptionRatio,
      trimmingRatio,
      trimmingLongerRatio,
      isTrimmingPortrait,
      rotate,
      trimming
    );

    //console.log('check');

    return (
      <div
        className={classNames(
          styles.PhotoCanvas,
          {
            [styles.Mobile]: deviceCheck() === "Mobile",
          },
          className,
          _.get(styles, zoomClassName)
        )}
      >
        <div
          className={styles.Trimming}
          style={trimmingStyle}
          data-trimming={trimming}
        />

        <div ref={this.canvasRef} className={styles.Photo} style={imageStyle} />

        <div
          className={classNames(styles.Mask, {
            /*[styles.gloss]: paper === PaperTypes.GLOSS, */ // 2019.10.21 유무광 표시 UI 제거
            [styles.border]: border === BorderTypes.BORDER,
          })}
          style={maskStyle}
          data-gloss={paper}
          data-border={border}
        />

        <div
          className={classNames(styles.PhotoDate, {
            [styles.insertDate]: insertDate === true,
          })}
          style={dateStyle}
          data-insert-date={insertDate}
        >
          {date}
        </div>
      </div>
    );
  }
}

export default PhotoCanvas;
