import React, { useState, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import numeral from "numeral";
import classNames from "classnames";
import { deviceCheck } from "../../../../../utils/commonUtils";
import SmartboxSelector from "../../../../../selectors/SmartboxSelector";
import { isIE } from "../../../../../utils/commonUtils";
import styles from "./SmartboxUploadingProgress.module.scss";

function SmartboxUploadingProgress() {
  const uploadQueue = useSelector(SmartboxSelector.getQueue);
  const { willUploads, ended, flushed } = uploadQueue.getCounts();

  // eslint-disable-next-line no-unused-vars
  const [expended, setExpended] = useState(false);

  const animationClass = useMemo(() => {
    return styles.appear;

    /* IE 에서는 generator function 사용이 불가능하므로 업로드 개수로 판별함. */
    if (isIE()) {
      if (ended >= willUploads) {
        return styles.disappear;
      }
      if (willUploads > 0) {
        return styles.appear;
      }
    } else {
      if (flushed) {
        return styles.disappear;
      }
      if (!uploadQueue.isEmpty()) {
        return styles.appear;
      }
    }
  }, [uploadQueue]);

  const Content = useMemo(
    () => (
      <div className={`${styles.ContentWrapper} ${styles[deviceCheck()]}`}>
        <div className={styles.ProgressText}>
          {`${numeral(ended).format("0,0")}장 / 총 ${numeral(
            willUploads
          ).format("0,0")}장`}
        </div>

        <div className={styles.ProgressBar}>
          <div
            className={styles.Bar}
            style={{
              transform: `scaleX(${numeral(ended / willUploads).format(
                "0[.]0"
              )})`,
            }}
          />
        </div>

        <button className="dark">중지</button>
      </div>
    ),
    [ended, willUploads]
  );

  const onClickBackdrop = useCallback((event) => {
    event.preventDefault();
  }, []);

  if (willUploads === 0 || willUploads === ended || flushed) {
    return null;
  }

  return (
    <div className={styles.Backdrop} onClick={onClickBackdrop}>
      <div
        className={classNames(styles.Wrapper, animationClass, {
          [styles.expended]: expended,
        })}
      >
        <div className={styles.PhotoUploadingProgress}>
          <div className={styles.TitleWrapper}>
            <div className={styles.Title}>사진 올리는 중...</div>
          </div>

          {Content}
        </div>
      </div>
    </div>
  );
}

export default SmartboxUploadingProgress;
