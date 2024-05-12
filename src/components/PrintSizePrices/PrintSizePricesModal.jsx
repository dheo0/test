import React, { useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import numeral from "numeral";
import Immutable from "immutable";
import _ from "lodash";

import PrintSizeType, {
  asArray as PrintSizeTypes,
} from "../../constants/printSizeTypes";
import { getSafePFYoonMode } from "../../utils/commonUtils";
import styles from "./PrintSizePrices.module.scss";

function PrintSizePricesMobile({ printSizes, printSizeType }) {
  const title = useMemo(() => {
    switch (printSizeType) {
      case PrintSizeType.GGOM:
        return "꼼꼼 사진인화 가격 안내";

      case PrintSizeType.SPEED:
        return "스피드 사진인화 가격 안내";

      case PrintSizeType.CLASSIC:
      default:
        return getSafePFYoonMode()
          ? "사진인화 가격 안내"
          : "클래식 사진인화 가격 안내"; // 2020.10.20
    }
  }, [printSizeType]);

  const renderPrintSize = useCallback((printSize) => {
    if (!printSize || _.isEmpty(printSize.size)) {
      return null;
    }
    return (
      <div key={printSize.size} className={styles.Row}>
        <div className={styles.size}>{printSize.size}</div>
        <div className={styles.centimeters}>{printSize.getLengthString()}</div>
        <div className={styles.currentPrice}>
          {numeral(printSize.currentPrice).format("0,0")}원
        </div>
      </div>
    );
  }, []);

  return (
    <div className={styles.PrintSizePrices}>
      <div className={styles.Title}>{title}</div>
      <div className={styles.Table}>{printSizes.map(renderPrintSize)}</div>
    </div>
  );
}

PrintSizePricesMobile.propTypes = {
  printSizes: Immutable.List,
  printSizeType: PropTypes.oneOf(PrintSizeTypes).isRequired,
};

PrintSizePricesMobile.defaultProps = {
  printSizes: Immutable.List(),
};

export default PrintSizePricesMobile;
