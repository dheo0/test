import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';

import PhotoDirectUploadSelector from '../../../selectors/PhotoDirectUploadSelector';
import { isIE } from '../../../utils/commonUtils'
import Spinner from '../../../components/Spinner';
import styles from './PhotoUploadingProgress.module.scss';

function PhotoUploadingProgress() {
  const uploadQueue = useSelector(PhotoDirectUploadSelector.getQueue);
  const { willUploads, ended, flushed } = uploadQueue.getCounts();

  const animationClass = useMemo(() => {
    /* IE 에서는 generator function 사용이 불가능하므로 업로드 개수로 판별함. */
    if (isIE()) {
      if (ended >= willUploads) { return styles.disappear }
      if (willUploads > 0) { return styles.appear }
    } else {
      if (flushed) { return styles.disappear }
      if (!uploadQueue.isEmpty()) { return styles.appear }
    }
  }, [uploadQueue]);

  return (
    <div
      className={classNames(styles.Wrapper, animationClass)}
    >
      <div className={styles.PhotoUploadingProgress}>
        <div className={styles.SpinnerWrapper}>
          <Spinner className={styles.Spinner} />
        </div>
        <div className={styles.Content}>
          { `사진을 업로드하는 중입니다. ${ended}/${willUploads}` }
        </div>
      </div>
    </div>
  );
}

export default PhotoUploadingProgress
