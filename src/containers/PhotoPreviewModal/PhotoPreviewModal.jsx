import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import Immutable from 'immutable';

import UISelector from '../../selectors/UISelector';
import UIActions from '../../actions/UIActions';
import SmartboxActions from '../../actions/SmartboxActions';
import { createConfirmModal } from '../../utils/ModalService';
import styles from './PhotoPreviewModal.module.scss';
import SmartboxSelector from '../../selectors/SmartboxSelector';

const ActionBarAddIcon = 'images/icon_add_w.png';
const ActionBarHeartIcon = 'images/icon_heart_w.png';
const ActionBarDeleteIcon = 'images/icon_del_w.png';

const CloseButton = styled.div`
  background-image: url('images/btn_p_cancel_b.png');
`;

const LeftButton = styled.div`
  left: 20px;
  background-image: url('images/btn_p_left.png');
`;

const RightButton = styled.div`
  right: 20px;
  background-image: url('images/btn_p_right.png');
`;

const ActionBarButton = styled.div`
  width: 20px;
  height: 20px;
  background-size: 20px 20px;
  cursor: pointer;
  
  &:not(:first-child) {
    margin-left: 20px;
  }
`;
const ActionBarAddButton = styled(ActionBarButton)`
  background-image: url('${ActionBarAddIcon}');
`;
const ActionBarHeartButton = styled(ActionBarButton)`
  background-image: url('${ActionBarHeartIcon}');
`;
const ActionBarDeleteButton = styled(ActionBarButton)`
  background-image: url('${ActionBarDeleteIcon}');
`;
const TagIcon = 'images/icon_tag_w.png';

function PhotoPreviewModal() {
  const dispatch = useDispatch();
  const isShowing = useSelector(UISelector.isShowingPhotoPreviewModal);
  const albumCode = useSelector(UISelector.getPreviewAlbumCode);
  const cursorIndex = useSelector(UISelector.getPreviewAlbumCursorIndex);
  const album = useSelector(state => SmartboxSelector.getSortedListByAlbum(state, { code: albumCode }));

  const [currentCursorIndex, setCursorIndex] = useState(cursorIndex);
  const [tagValue, setTagValue] = useState('');

  const currentPhoto = useMemo(() => {
    if (album && !album.isEmpty()) {
      return album.get(currentCursorIndex);
    }
    return null
  }, [album, currentCursorIndex]);

  const photoDivStyle = useMemo(() => {
    if (currentPhoto) {
      const imageMeta = currentPhoto.getImageMeta();
      return {
        backgroundImage: `url('${imageMeta.getEditUrl()}')`,
      }
    }
    return {}
  }, [currentPhoto]);

  useEffect(() => {
    setCursorIndex(cursorIndex);
  }, [cursorIndex]);

  useEffect(() => {
    if (currentPhoto) {
      setTagValue(currentPhoto.tags);
    } else {
      setTagValue('');
    }
  }, [currentPhoto]);

  const handleClose = useCallback(() => {
    dispatch(UIActions.hidePhotoPreviewModal());
  }, [dispatch]);

  const handleClickLeft = useCallback(() => {
    setCursorIndex(current => current - 1);
  }, []);

  const handleClickRight = useCallback(() => {
    setCursorIndex(current => current + 1);
  }, []);

  const handleChangeTagInput = useCallback((event) => {
    setTagValue(event.currentTarget.value)
  }, []);

  const handleKeyDownTagInput = useCallback((event) => {
    // Enter
    if (event.keyCode === 13) {
      event.currentTarget.blur();
    }
  }, [
    currentPhoto,
  ]);

  const handleBlurTagInput = useCallback((event) => {
    dispatch(SmartboxActions.requestAddTags({
      photos: Immutable.List([currentPhoto]),
      tags: event.currentTarget.value,
    }));
  }, [
    dispatch,
    currentPhoto,
  ]);

  const TagInput = useMemo(() => (
    <div className={styles.TagInput}>
      <img src={TagIcon} />
      <input
        value={tagValue}
        placeholder="태그를 입력해 주세요. (,로 구분 가능)"
        onChange={handleChangeTagInput}
        onBlur={handleBlurTagInput}
        onKeyDown={handleKeyDownTagInput}
      />
    </div>
  ), [
    tagValue,
    handleChangeTagInput,
    handleBlurTagInput,
    handleKeyDownTagInput,
  ]);

  const ActionBar = useMemo(() => {
    if (!currentPhoto) { return null }
    return (
      <div className={styles.ActionBar}>
        { TagInput }

        <div className={styles.AlbumActions}>
          <ActionBarAddButton
            onClick={() => dispatch(SmartboxActions.showAlbumManagePanel())}
          />
          <ActionBarHeartButton
            onClick={() => dispatch(SmartboxActions.requestAddFavorites({
              photos: Immutable.List([currentPhoto]),
            }))}
          />
          <ActionBarDeleteButton
            onClick={() => {
              createConfirmModal(
                '삭제된 사진은 복구할 수 없습니다.',
                '선택한 사진(들)을 삭제하시겠습니까?',
                {
                  onClickConfirm: () => {
                    dispatch(SmartboxActions.requestDeletePhotos({
                      photos: Immutable.List([currentPhoto]),
                    }));
                    setCursorIndex(currentCursorIndex - 1);
                  },
                }
              );
            }}
          />
        </div>
      </div>
    )
  }, [currentPhoto, currentCursorIndex, TagInput]);

  return (isShowing && album) && (
    <div className={styles.PhotoPreviewModal}>
      <div
        className={styles.BackDrop}
        onClick={handleClose}
      />

      <div className={styles.PreviewModal}>
        <div
          className={styles.Photo}
          style={photoDivStyle}
        />

        <CloseButton
          className={styles.CloseButton}
          onClick={handleClose}
        />

        <LeftButton
          className={styles.CursorButton}
          onClick={handleClickLeft}
        />

        <RightButton
          className={styles.CursorButton}
          onClick={handleClickRight}
        />

        { ActionBar }
      </div>
    </div>
  )
}

export default PhotoPreviewModal
