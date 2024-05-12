import React from "react";
import classNames from "classnames";

import PhotoGridOptionBar from "../PhotoGridOptionBar";
import { deviceCheck } from "../../utils/commonUtils";
import styles from "./SmartboxAlbumGridOptionBar.module.scss";

const BackIcon = "images/icon_back.png";

function SmartboxAlbumGridOptionBar({
  className,
  folder,
  onClickGoBack,
  ...otherGridOptionBarProps
}) {
  return (
    <div className={classNames(styles.SmartboxAlbumGridOptionBar, className)}>
      <div className={styles.GoBack} onClick={onClickGoBack}>
        <img src={BackIcon} alt="Go back" />
        <span>앨범</span>
      </div>

      <div className={styles.AlbumTitle}>{folder}</div>

      <PhotoGridOptionBar
        className={`${styles.PhotoGridOptionBar} ${styles[deviceCheck()]}`}
        {...otherGridOptionBarProps}
      />
    </div>
  );
}

export default SmartboxAlbumGridOptionBar;
