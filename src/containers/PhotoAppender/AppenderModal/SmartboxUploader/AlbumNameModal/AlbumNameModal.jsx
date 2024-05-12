import React, { useState, useMemo, useCallback } from 'react';
import _ from 'lodash';

import Modal from '../../../../../components/Modal';
import styles from './AlbumNameModal.module.scss';

function AlbumNameModal({ onConfirm, _closeHandler }) {
  const [value, setValue] = useState('');

  const Input = useMemo(() => (
    <input
      className={styles.input}
      type="text"
      value={value}
      placeholder="앨범 이름을 입력하세요"
      onChange={(event) => setValue(event.currentTarget.value)}
    />
  ), [value]);

  const handleConfirm = useCallback(() => {
    onConfirm(value);
  }, [onConfirm, value]);

  return (
    <Modal
      isConfirmModal
      title="새 앨범 추가"
      message={Input}
      disabledConfirm={_.isEmpty(value)}
      onClickConfirm={handleConfirm}
      _closeHandler={_closeHandler}
    />
  )
}

export default AlbumNameModal
