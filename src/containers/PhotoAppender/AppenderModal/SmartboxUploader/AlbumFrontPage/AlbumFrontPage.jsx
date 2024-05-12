import React, { useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import _ from 'lodash';
import numeral from 'numeral';

import SmartboxActions from '../../../../../actions/SmartboxActions';
import SmartboxSelector from '../../../../../selectors/SmartboxSelector';
import SmartboxAlbumTypes from '../../../../../constants/smartboxAlbumTypes';
import { createModal, closeModal } from '../../../../../utils/ModalService';
import AlbumNameModal from '../AlbumNameModal';
import styles from './AlbumFrontPage.module.scss';

const TagIcon = 'images/img_tag.png';
const PeopleIcon = 'images/img_human.png';
const PlaceIcon = 'images/img_place.png';
const NewAlbumIcon = 'images/add_icon.png';
const FavoriteIcon = 'images/favorite_icon.png';

function SectionItem({ entity, icon, title, subTitle, inverted, onClick }) {
  const handleClick = useCallback(() => {
    if (onClick) { onClick(entity) }
  }, [entity, onClick]);

  return (
    <div
      className={styles.SectionItem}
      onClick={handleClick}
    >
      <div
        className={classNames(styles.Square, {
          [styles.inverted]: inverted,
        })}
      >
        <img src={icon} alt={title} />
      </div>
      <div className={styles.title}>{ title }</div>
      { !_.isEmpty(subTitle) && (
        <div className={styles.subTitle}>{ subTitle }</div>
      ) }
    </div>
  )
}

function AlbumItem({ code, title, size, cover, onClick }) {
  const style = useMemo(() => {
    if (size !== 0) {
      if (cover && cover.hasImageMeta()) {
        const imageMeta = cover.getImageMeta();
        return {
          backgroundImage: `url('${imageMeta.getThumbnailUrl()}')`,
        }
      }
    }
    return null
  }, [size, cover]);

  const handleClick = useCallback(() => {
    if (onClick) { onClick(code) }
  }, [code, onClick]);

  return (
    <div
      className={styles.SectionItem}
      onClick={handleClick}
    >
      <div
        className={styles.AlbumCover}
        style={style}
      />
      <div className={styles.title}>{ title }</div>
      <div className={styles.subTitle}>{ `항목 ${numeral(size).format('0,0')}개` }</div>
    </div>
  )
}

function AlbumFrontPage({
  className,
  onClickEntity,
}) {
  const dispatch = useDispatch();
  const listingServerUrl = useSelector(SmartboxSelector.getListingServerUrl);
  const albums = useSelector(SmartboxSelector.getAlbums);
  const albumFrontPages = useSelector(SmartboxSelector.getAlbumFrontPages);

  // 앨범 표지 받아오기
  useEffect(() => {
    albums.forEach(({ code }) => {
      dispatch(SmartboxActions.requestGetSmartboxPhotos({
        type: SmartboxAlbumTypes.ALBUM,
        listingServerUrl,
        code,
      }));
    });
  }, [dispatch, albums, listingServerUrl]);

  const handleClickCreateNewAlbum = useCallback(() => {
    createModal(AlbumNameModal, {
      onConfirm: (name) => {
        dispatch(SmartboxActions.requestAddAlbum({ name }))
          .promise
          .then((action) => {
            closeModal(AlbumNameModal);
            onClickEntity(action.payload.album.code);
          }, () => {
            closeModal(AlbumNameModal);
          })
      },
      onClose: () => closeModal(AlbumNameModal),
    });
  }, [dispatch, onClickEntity]);

  return (
    <div className={classNames(styles.AlbumFrontPage, className)}>
      <section>
        <h1>특별한 순간</h1>

        <div className={styles.SectionItemWrapper}>
          {
            [
              [SmartboxAlbumTypes.TAG, TagIcon, '태그'],
              [SmartboxAlbumTypes.PEOPLE, PeopleIcon, '인물'],
              [SmartboxAlbumTypes.PLACE, PlaceIcon, '장소'],
            ].map(([entity, icon, title]) => (
              <SectionItem
                key={entity}
                entity={entity}
                icon={icon}
                title={title}
                onClick={onClickEntity}
              />
            ))
          }
        </div>
      </section>

      <section>
        <h1>나의 앨범</h1>

        <div className={styles.SectionItemWrapper}>
          <SectionItem
            inverted
            icon={NewAlbumIcon}
            title="새 앨범 추가"
            onClick={handleClickCreateNewAlbum}
          />

          <SectionItem
            inverted
            entity={SmartboxAlbumTypes.FAVORITE}
            icon={FavoriteIcon}
            title="즐겨찾기"
            onClick={onClickEntity}
          />

          {
            albumFrontPages.map(album => (
              <AlbumItem
                key={album.code}
                code={album.code}
                title={album.title}
                size={album.size}
                cover={album.cover}
                onClick={onClickEntity}
              />
            ))
          }
        </div>
      </section>
    </div>
  )
}

export default AlbumFrontPage
