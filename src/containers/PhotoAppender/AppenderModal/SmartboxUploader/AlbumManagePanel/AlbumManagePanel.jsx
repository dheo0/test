import React, { useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Immutable from 'immutable';
import _ from 'lodash';
import styled from 'styled-components';

import SmartboxActions from '../../../../../actions/SmartboxActions';
import SmartboxSelector from '../../../../../selectors/SmartboxSelector';
import SidebarTabs from '../../../../../constants/smartbboxSidebarTabs';
import styles from './AlbumManagePanel.module.scss';
import SmartboxAlbumTypes from '../../../../../constants/smartboxAlbumTypes';

const StyledCloseButton = styled.div`
  background-image: url('images/btn_p_cancel.png');
`;

function AlbumItem({
  coverStyle,
  title,
  cover,
  onClick = _.noop,
}) {
  const _coverStyle = useMemo(() => {
    let src = '';
    if (_.isString(cover)) {
      src = cover;
    } else if (cover && cover.hasImageMeta()) {
      const imageMeta = cover.getImageMeta();
      src = imageMeta.getThumbnailUrl();
    }
    return {
      backgroundImage: `url('${src}')`,
      ...coverStyle,
    }
  }, [cover, coverStyle]);

  return (
    <div
      className={styles.AlbumItem}
      onClick={onClick}
    >
      <div
        className={styles.Cover}
        style={_coverStyle}
      />
      <div className={styles.Title}>
        { title }
      </div>
    </div>
  )
}

function AlbumManagePanel({ selectedPhotos, onAfterAddToAlbum = _.noop, }) {
  const dispatch = useDispatch();
  const isShowingAlbumManagePanel = useSelector(SmartboxSelector.isShowingAlbumManagePanel);
  const listingServerUrl = useSelector(SmartboxSelector.getListingServerUrl);
  const albums = useSelector(SmartboxSelector.getAlbums);
  const albumFrontPages = useSelector(SmartboxSelector.getAlbumFrontPages);

  // 앨범 표지 받아오기
  useEffect(() => {
    if (isShowingAlbumManagePanel) {
      albums.forEach(({ code }) => {
        dispatch(SmartboxActions.requestGetSmartboxPhotos({
          type: SmartboxAlbumTypes.ALBUM,
          listingServerUrl,
          code,
        }));
      });
    }
  }, [dispatch, albums, listingServerUrl, isShowingAlbumManagePanel]);

  const handleClickBackdrop = useCallback((event) => {
    event.stopPropagation();
    dispatch(SmartboxActions.hideAlbumManagePanel())
  }, [dispatch]);

  const handleAfterAddToAlbum = useCallback(() => {
    dispatch(SmartboxActions.hideAlbumManagePanel());
    dispatch(SmartboxActions.requestGetSmartboxAlbums({ listingServerUrl }));
    dispatch(SmartboxActions.changeSidebarTab(SidebarTabs.ALBUMS));
    onAfterAddToAlbum();
  }, [listingServerUrl, onAfterAddToAlbum]);

  const handleClickAddToNewAlbum = useCallback(() => {
    dispatch(SmartboxActions.requestAddToNewAlbum({ photos: selectedPhotos }))
      .promise
      .then(handleAfterAddToAlbum);
  }, [dispatch, selectedPhotos, handleAfterAddToAlbum]);

  const handleClickAddToAlbum = useCallback((album) => {
    const photos = (Immutable.isCollection(selectedPhotos))
      ? selectedPhotos
      : Immutable.List([selectedPhotos]);
    dispatch(SmartboxActions.requestAddToAlbum({ album, photos }))
      .promise
      .then(handleAfterAddToAlbum);
  }, [dispatch, selectedPhotos, handleAfterAddToAlbum]);

  const CloseButton = useMemo(() => (
    <StyledCloseButton
      className={styles.CloseButton}
      onClick={() => dispatch(SmartboxActions.hideAlbumManagePanel())}
    />
  ), [dispatch]);

  const renderAlbumItem = useCallback((album) => (
    <AlbumItem
      key={album.code}
      title={album.title}
      cover={album.cover}
      onClick={() => handleClickAddToAlbum(album)}
    />
  ), [handleClickAddToAlbum]);

  const AlbumList = useMemo(() => (
    <div className={styles.AlbumList}>
      <AlbumItem
        key="add_new_album"
        title="새 앨범 추가"
        cover="images/add_icon.png"
        coverStyle={{ backgroundSize: '40px' }}
        onClick={handleClickAddToNewAlbum}
      />
      { albumFrontPages.map(renderAlbumItem) }
    </div>
  ), [albumFrontPages, renderAlbumItem, handleClickAddToNewAlbum]);

  if (!isShowingAlbumManagePanel) { return null }

  return (
    <>
      <div
        className={styles.Backdrop}
        onClick={handleClickBackdrop}
      />

      <div className={styles.Wrapper}>
        <div className={styles.PanelTitle}>앨범관리</div>
        { CloseButton }
        { AlbumList }
      </div>
    </>
  )
}

export default AlbumManagePanel
