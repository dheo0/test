import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Immutable from "immutable";
import _ from "lodash";
import numeral from "numeral";
import styled from "styled-components";

import UIActions from "../../../../actions/UIActions";
import SmartboxActions from "../../../../actions/SmartboxActions";
import PhotoEditorActions from "../../../../actions/PhotoEditorActions";
import PhotoAppenderActions from "../../../../actions/PhotoAppenderActions";
import SmartboxSelector from "../../../../selectors/SmartboxSelector";
import AppInfoSelector from "../../../../selectors/AppInfoSelector";
import { PhotoAppender } from "../../../../constants/uiTypes";
import {
  SizeOptions,
  OrderOptions,
  GroupOptions,
} from "../../../../constants/photoGridOptions";
import SmartboxAlbumTypes, {
  AlbumTypeNames,
  ReservedTypes,
} from "../../../../constants/smartboxAlbumTypes";
import SidebarTabs from "../../../../constants/smartbboxSidebarTabs";
import { createConfirmModal } from "../../../../utils/ModalService";
import SmartboxAlbum from "../../../../models/SmartboxAlbum";
import Spinner from "../../../../components/Spinner";
import PhotoGridOptionBar from "../../../../components/PhotoGridOptionBar";
import SmartboxAlbumGridOptionBar from "../../../../components/SmartboxAlbumGridOptionBar";
import FileUploadButton, {
  AcceptableMIMEs,
} from "../../../../components/FileUploadButton";
import CloseButton from "../CloseButton";
import styles from "./SmartboxUploader.module.scss";
import GroupedPhotoGrid from "../../../../components/GroupedPhotoGrid";
import AlbumFrontPage from "./AlbumFrontPage";
import AlbumManagePanel from "./AlbumManagePanel";
import SmartboxUploadingProgress from "./SmartboxUploadingProgress";
import PhotoAppenderSelector from "../../../../selectors/PhotoAppenderSelector";
import classNames from "classnames";
import UUID from "uuid";
import { deviceCheck } from "../../../../utils/commonUtils";

const AllPhotosOffIcon = "images/icon_picture_off.png";
const AllPhotosOnIcon = "images/icon_picture_on.png";
const AlbumsOffIcon = "images/icon_album_off.png";
const AlbumsOnIcon = "images/icon_album_on.png";
const ActionBarAddIcon = "images/icon_add_w.png";
const ActionBarHeartIcon = "images/icon_heart_w.png";
const ActionBarDeleteIcon = "images/icon_del_w.png";

const ActionBarButton = styled.div`
  width: 20px;
  height: 20px;
  background-size: 20px 20px;
  cursor: pointer;

  ${(props) =>
    props.disabled &&
    `
    pointer-events: none;
  `}

  &:not(:first-child) {
    margin-left: 20px;
  }
`;

const ActionBarAddButton = styled(ActionBarButton)`
  background-image: url("${ActionBarAddIcon}");
`;
const ActionBarHeartButton = styled(ActionBarButton)`
  background-image: url("${ActionBarHeartIcon}");
`;
const ActionBarDeleteButton = styled(ActionBarButton)`
  background-image: url("${ActionBarDeleteIcon}");
`;

function SmartboxUploader() {
  const dispatch = useDispatch();
  const selectedTab = useSelector(SmartboxSelector.getSidebarTab);
  const isFetchingEndpoints = useSelector(SmartboxSelector.isFetchingEndpoints);
  const isFetchingAlbums = useSelector(SmartboxSelector.isFetchingAlbums);
  const isFetchingPhotos = useSelector(SmartboxSelector.isFetching);
  const uploadingServerUrl = useSelector(
    SmartboxSelector.getUploadingServerUrl
  );
  const listingServerUrl = useSelector(SmartboxSelector.getListingServerUrl);
  const markedPhotoUUIDs = useSelector(SmartboxSelector.getMarkedPhotoUUIDs);
  const printSizes = useSelector(AppInfoSelector.getPrintSizes);

  const [selectedEntity, setEntity] = useState(SmartboxAlbumTypes.ALL_PHOTOS);
  const [tempPhoto, setTempPhoto] = useState(null);
  const [gridSize, setGridSize] = useState(SizeOptions.NORMAL);
  const [gridOrder, setGridOrder] = useState(OrderOptions.BY_RECENT_UPLOAD);
  const [gridGroup, setGridGroup] = useState(GroupOptions.BY_DATE);

  const albums = useSelector(SmartboxSelector.getAlbums);
  const albumPhotos = useSelector((state) =>
    SmartboxSelector.getSortedListByAlbum(state, { code: selectedEntity })
  );
  const selectedPhotos = albumPhotos.filter((photo) =>
    markedPhotoUUIDs.includes(photo.uuid)
  );
  const appenderModalType = useSelector(
    PhotoAppenderSelector.getSelectedAppenderModalType
  );

  const setSelectedTab = useCallback(
    (tab) => {
      dispatch(SmartboxActions.changeSidebarTab(tab));
    },
    [dispatch]
  );

  // 스마트박스 End-point 받아오기
  useEffect(() => {
    if (isFetchingEndpoints) return;
    if (_.isEmpty(uploadingServerUrl) || _.isEmpty(listingServerUrl)) {
      dispatch(SmartboxActions.requestGetSmartboxEndpoints());
    }
  }, [dispatch, isFetchingEndpoints, uploadingServerUrl, listingServerUrl]);

  // allphotos + 앨범 받아오기
  useEffect(() => {
    if (!isFetchingEndpoints && !_.isEmpty(listingServerUrl)) {
      dispatch(SmartboxActions.requestGetSmartboxPhotos({ listingServerUrl }));
      dispatch(SmartboxActions.requestGetSmartboxAlbums({ listingServerUrl }));
    }
  }, [dispatch, isFetchingEndpoints, listingServerUrl]);

  useEffect(() => {
    if (selectedEntity === SmartboxAlbumTypes.ALL_PHOTOS) {
      return;
    }
    if (
      _.includes(
        [
          SmartboxAlbumTypes.TAG,
          SmartboxAlbumTypes.PEOPLE,
          SmartboxAlbumTypes.PLACE,
          SmartboxAlbumTypes.FAVORITE,
        ],
        selectedEntity
      )
    ) {
      dispatch(
        SmartboxActions.requestGetSmartboxPhotos({
          listingServerUrl,
          type: selectedEntity,
        })
      );
    } else {
      dispatch(
        SmartboxActions.requestGetSmartboxPhotos({
          listingServerUrl,
          type: SmartboxAlbumTypes.ALBUM,
          code: selectedEntity,
        })
      );
    }
  }, [selectedEntity]);

  const isChecked = useCallback(
    (smartboxPhoto) => markedPhotoUUIDs.includes(smartboxPhoto.uuid),
    [markedPhotoUUIDs]
  );

  const allPhotosSelected = useMemo(
    () => albumPhotos.every((smartboxPhoto) => isChecked(smartboxPhoto)),
    [albumPhotos, isChecked]
  );

  const handleSelectFiles = useCallback(
    (files) => {
      const uuid = UUID.v4();
      dispatch(
        SmartboxActions.requestUploadImageFilesToSmartbox(
          { uploadingServerUrl, files },
          { uuid }
        )
      );
    },
    [dispatch, uploadingServerUrl]
  );

  const handleClickOptionBarGoBack = useCallback(() => {
    setSelectedTab(SidebarTabs.ALBUMS);
  }, []);

  const handleClickEntity = useCallback((entity) => {
    setSelectedTab(SidebarTabs.PHOTOS_IN_ALBUMS);
    setEntity(entity);
  }, []);

  const handleChangeOrderOptions = useCallback(
    (selectedOrder, selectedGroup) => {
      setGridOrder(selectedOrder);
      setGridGroup(selectedGroup);
    },
    []
  );

  const handleClickGridSize = useCallback((gridSize) => {
    return () => setGridSize(gridSize);
  }, []);

  const handleClickPhotoCell = useCallback(
    (smartboxPhoto) => {
      if (isChecked(smartboxPhoto)) {
        dispatch(
          SmartboxActions.unmarkSmartboxPhoto({ photos: [smartboxPhoto] })
        );
      } else {
        dispatch(
          SmartboxActions.markSmartboxPhoto({ photos: [smartboxPhoto] })
        );
      }
    },
    [dispatch, isChecked]
  );

  const handleCheckedChangeGroup = useCallback(
    (smartboxPhotos, checked) => {
      if (checked) {
        dispatch(
          SmartboxActions.markSmartboxPhoto({
            photos: smartboxPhotos.toArray(),
          })
        );
      } else {
        dispatch(
          SmartboxActions.unmarkSmartboxPhoto({
            photos: smartboxPhotos.toArray(),
          })
        );
      }
    },
    [dispatch]
  );

  const handleClickSelectAllButton = useCallback(() => {
    if (allPhotosSelected) {
      dispatch(
        SmartboxActions.unmarkSmartboxPhoto({ photos: albumPhotos.toArray() })
      );
    } else {
      dispatch(
        SmartboxActions.markSmartboxPhoto({ photos: albumPhotos.toArray() })
      );
    }
  }, [dispatch, allPhotosSelected]);

  const handleClickMorePhotos = useCallback(() => {
    // TODO
    //console.log("handleClickMorePhotos", SmartboxActions);
    //let payload = {listingServerUrl, offset: 10, limit: 100,};

    dispatch(SmartboxActions.requestGetSmartboxPhotos({ listingServerUrl }));
  }, [dispatch, listingServerUrl]);

  const handleClickAppendToEditor = useCallback(() => {
    dispatch(UIActions.setUploadPanelTab({ tab: PhotoAppender.SMART_BOX }));
    dispatch(
      PhotoEditorActions.appendPhotosToPhotoEditor({
        photos: selectedPhotos,
        printSizes,
      })
    );
    dispatch(SmartboxActions.addToWorkspace({ photos: selectedPhotos }));
    dispatch(PhotoAppenderActions.closePhotoAppender({}));
  }, [dispatch, selectedPhotos, printSizes]);

  const handleClickAddToAlbum = useCallback(
    (imageContainer) => {
      const photo = albumPhotos.find((p) => p.idx === imageContainer.idx);
      setTempPhoto(photo);
      dispatch(SmartboxActions.showAlbumManagePanel({}));
    },
    [dispatch, albumPhotos]
  );

  const handleAfterAddToNewAlbum = useCallback(() => {
    setTempPhoto(null);
  }, []);

  const handleClickFavorite = useCallback(
    (imageContainer) => {
      const photo = albumPhotos.find((p) => p.idx === imageContainer.idx);
      if (imageContainer.favorite) {
        dispatch(
          SmartboxActions.requestDeleteFavorites({
            photos: Immutable.List([photo]),
          })
        );
      } else {
        dispatch(
          SmartboxActions.requestAddFavorites({
            photos: Immutable.List([photo]),
          })
        );
      }
    },
    [dispatch, albumPhotos]
  );

  const handleClickZoom = useCallback(
    (imageContainer) => {
      const cursor =
        albumPhotos.findIndex((p) => p.idx === imageContainer.idx) || 0;
      dispatch(
        UIActions.showPhotoPreviewModal({
          albumCode: selectedEntity,
          cursor: _.clamp(cursor, 0, albumPhotos.size),
        })
      );
    },
    [dispatch, albumPhotos, selectedEntity]
  );

  const Header = useMemo(
    () => (
      <div
        className={`${styles.Header} ${
          deviceCheck() === "Mobile" ? styles.Mbox : ""
        }`}
      >
        스마트 박스
        <FileUploadButton
          className={styles.UploaderButton}
          accepts={[AcceptableMIMEs.JPG, AcceptableMIMEs.PNG]}
          onSelectFiles={handleSelectFiles}
        >
          사진 추가하기
        </FileUploadButton>
        <CloseButton />
      </div>
    ),
    [handleSelectFiles]
  );

  const OptionBar = useMemo(() => {
    if (selectedTab === SidebarTabs.PHOTOS_IN_ALBUMS) {
      const folder = _.includes(ReservedTypes, selectedEntity)
        ? AlbumTypeNames[selectedEntity]
        : albums.find(
            (album) => album.code === selectedEntity,
            null,
            new SmartboxAlbum()
          ).folder;
      return (
        <SmartboxAlbumGridOptionBar
          className={`${styles.PhotoGridOptionBar} ${styles[deviceCheck()]}`}
          folder={folder}
          selectedOrder={gridOrder}
          selectedGroup={gridGroup}
          selectedGridSize={gridSize}
          onChangeOrderOptions={handleChangeOrderOptions}
          onClickGridSize={handleClickGridSize}
          onClickGoBack={handleClickOptionBarGoBack}
        />
      );
    }
    return (
      <PhotoGridOptionBar
        className={`${styles.PhotoGridOptionBar} ${styles[deviceCheck()]}`}
        selectedOrder={gridOrder}
        selectedGroup={gridGroup}
        selectedGridSize={gridSize}
        onChangeOrderOptions={handleChangeOrderOptions}
        onClickGridSize={handleClickGridSize}
      />
    );
  }, [
    selectedTab,
    selectedEntity,
    gridOrder,
    gridGroup,
    gridSize,
    handleChangeOrderOptions,
    handleClickGridSize,
    handleClickOptionBarGoBack,
  ]);

  const Sidebar = useMemo(
    () => (
      <div className={`${styles.Sidebar} ${styles[deviceCheck()]}`}>
        {[
          [[SidebarTabs.ALL_PHOTOS], AllPhotosOffIcon, AllPhotosOnIcon, "사진"],
          [
            [SidebarTabs.ALBUMS, SidebarTabs.PHOTOS_IN_ALBUMS],
            AlbumsOffIcon,
            AlbumsOnIcon,
            "앨범",
          ],
        ].map(([tabs, offIcon, onIcon, title]) => {
          const isSelected = _.includes(tabs, selectedTab);
          return (
            <div
              key={tabs.join("")}
              className={classNames(styles.Tab, {
                [styles.isSelected]: isSelected,
              })}
              onClick={() => {
                const newTab = tabs[0];
                setSelectedTab(newTab);
                if (newTab === SidebarTabs.ALL_PHOTOS) {
                  setEntity(SmartboxAlbumTypes.ALL_PHOTOS);
                }
              }}
            >
              <div className={styles.contentWrapper}>
                <img
                  className={styles.image}
                  src={isSelected ? onIcon : offIcon}
                  alt={title}
                />
                <div className={styles.title}>{title}</div>
              </div>
            </div>
          );
        })}
      </div>
    ),
    [selectedTab]
  );

  const ActionBar = useMemo(
    () => (
      <div className={`${styles.UploaderActionBar} ${styles[deviceCheck()]}`}>
        <div className={styles.Counter}>
          {deviceCheck() === "Web" ? (
            <>
              <b>{numeral(selectedPhotos.size).format("0,0")}</b>장의 사진을
              선택하셨습니다.
            </>
          ) : (
            <>
              선택 <b>{numeral(selectedPhotos.size).format("0,0")}</b>
            </>
          )}
        </div>

        <div className={styles.Divider} />

        <div className={styles.AlbumActions}>
          <ActionBarAddButton
            disabled={selectedPhotos.isEmpty()}
            onClick={() => dispatch(SmartboxActions.showAlbumManagePanel())}
          />
          <ActionBarHeartButton
            disabled={selectedPhotos.isEmpty()}
            onClick={() =>
              dispatch(
                SmartboxActions.requestAddOrDeleteFavorites({
                  photos: selectedPhotos,
                })
              )
            }
          />
          <ActionBarDeleteButton
            disabled={selectedPhotos.isEmpty()}
            onClick={() => {
              createConfirmModal(
                "삭제된 사진은 복구할 수 없습니다.",
                "선택한 사진(들)을 삭제하시겠습니까?",
                {
                  onClickConfirm: () =>
                    dispatch(
                      SmartboxActions.requestDeletePhotos({
                        photos: selectedPhotos,
                      })
                    ),
                }
              );
            }}
          />
        </div>

        <div className={styles.ButtonWrapper}>
          {/*
      <button
        onClick={handleClickMorePhotos} // TODO
      >
        { '더보기' }
      </button>
//*/}

          <button
            className="orange"
            disabled={selectedPhotos.isEmpty()}
            onClick={handleClickAppendToEditor}
          >
            선택한 사진들로 인화 주문하기
          </button>

          <button
            onClick={handleClickSelectAllButton}
            disabled={albumPhotos.isEmpty()}
          >
            {allPhotosSelected ? "전체 선택 해제" : "전체 선택"}
          </button>
        </div>
      </div>
    ),
    [dispatch, albumPhotos, selectedPhotos]
  );

  return (
    <>
      {Header}
      {Sidebar}
      {selectedTab === SidebarTabs.ALBUMS ? (
        <AlbumFrontPage
          className={styles.AlbumFrontPage}
          onClickEntity={handleClickEntity}
        />
      ) : (
        <>
          {OptionBar}
          {isFetchingEndpoints || isFetchingAlbums || isFetchingPhotos ? (
            <div className={styles.LoaderWrapper}>
              <Spinner className={styles.Spinner} />
            </div>
          ) : (
            <GroupedPhotoGrid
              smartboxUI
              className={classNames(styles.GroupedPhotoGrid, {
                [styles.smaller]: gridSize === SizeOptions.SMALLER,
                [styles.smartbox]:
                  appenderModalType === "SMART_BOX" &&
                  deviceCheck() === "Mobile",
              })}
              cellClassName={classNames(styles.GroupedPhotoGridCell, {
                [styles.smaller]: gridSize === SizeOptions.SMALLER,
              })}
              imageContainers={albumPhotos}
              selectedImageContainerUUIDs={markedPhotoUUIDs}
              orderBy={gridOrder}
              groupBy={gridGroup}
              deletable={false}
              onCheckedChangeGroup={handleCheckedChangeGroup}
              onClickPhotoCell={handleClickPhotoCell}
              onClickPhotoCellAddToAlbum={handleClickAddToAlbum}
              onClickPhotoCellFavorite={handleClickFavorite}
              onClickPhotoCellZoom={handleClickZoom}
            />
          )}
        </>
      )}
      {ActionBar}

      <AlbumManagePanel
        selectedPhotos={tempPhoto || selectedPhotos}
        onAfterAddToAlbum={handleAfterAddToNewAlbum}
      />
      {/*<SmartboxUploadingProgress />*/}
    </>
  );
}

export default SmartboxUploader;
