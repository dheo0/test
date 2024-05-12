import React from "react";
import numeral from "numeral";
import { deviceCheck } from "../../../utils/commonUtils";
import _ from "lodash";

import styles from "./Prices.module.scss";

function Prices({ prices }) {
  return (
    <div className={`${styles.Prices} ${styles[deviceCheck()]}`}>
      <div className={styles.originalPrice}>{numeral(_.get(prices, "originalPrice", 0)).format("0,0")}원</div>
      <div className={styles.discountedPrice}>
        {numeral(_.get(prices, "currentPrice", 0)).format("0,0")}
        <span>원</span>
      </div>
    </div>
  );
}

export default Prices;
