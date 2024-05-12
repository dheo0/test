import React from 'react';

import Spinner from '../Spinner';
import styles from './LoaderModal.module.scss';

function LoaderModal() {
  return (
    <div className={styles.LoaderModal}>
      <Spinner className={styles.Spinner} />
    </div>
  );
}

export default LoaderModal
