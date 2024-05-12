import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import PhotoAppenderActions from '../../actions/PhotoAppenderActions';
import PhotoAppenderSelector from '../../selectors/PhotoAppenderSelector';
import SmartboxSelector from '../../selectors/SmartboxSelector';
import AppenderModal from './AppenderModal';
import styles from './PhotoAppender.module.scss';

function PhotoAppender() {
  const dispatch = useDispatch();
  const isPhotoAppenderOpened = useSelector(PhotoAppenderSelector.isPhotoAppenderOpened);
  const smartboxUploadQueue = useSelector(SmartboxSelector.getQueue);

  const handleClickBackDrop = useCallback(() => {
    if (!smartboxUploadQueue.isEmpty()) {
      // Nothing
    } else {
      dispatch(PhotoAppenderActions.closePhotoAppender());
    }
  }, [smartboxUploadQueue]);

  if (isPhotoAppenderOpened) {
    return (
      <div className={styles.PhotoAppender}>
        <div
          className={styles.BackDrop}
          onClick={handleClickBackDrop}
        />

        <AppenderModal />
      </div>
    );
  }
  return null;
}

export default PhotoAppender
