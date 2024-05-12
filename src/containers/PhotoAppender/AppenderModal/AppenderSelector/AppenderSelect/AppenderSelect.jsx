import React, { memo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import classNames from "classnames";
import PhotoAppenderActions from "../../../../../actions/PhotoAppenderActions";
import DirectPhotoUploadButton from "../../../../../components/DirectPhotoUploadButton/DirectPhotoUploadButton";
import styled from "styled-components";
import { deviceCheck } from "../../../../../utils/commonUtils";
import _ from "lodash";

import { AppenderModalType } from "../../../../../constants/uiTypes";
import styles from "./AppenderSelect.module.scss";

// const StyledAppenderSelectButton = styled.div`
//   background-image: ${(props) =>
//     props.isSelected
//       ? 'url("images/ic_upload_selected.png") !important;'
//       : 'url("images/ic_upload_deactivated.png") !important;'};
// `;

const SmartBox = styled.div`
  background-image: ${(props) =>
    props.isSelected
      ? 'url("images/bg_smart_upload.png") !important;'
      : 'url("images/bg_smart_deactivated.png") !important;'};
`;

const DirectUpload = styled.div`
  background-image: ${(props) =>
    props.isSelected
      ? 'url("images/bg_direct_upload.png") !important;'
      : 'url("images/bg_direct_deactivated.png") !important;'};
`;

const DirectUploadMobile = styled.span`
  background-image: ${(props) =>
    props.isSelected
      ? 'url("images/img_add_photos.png") !important;background-size:55px 49px !important'
      : 'url("images/img_add_photos.png") !important;background-size:55px 49px !important'};
`;

const SmartBoxMobile = styled.div`
  background-image: ${(props) =>
    props.isSelected
      ? 'url("images/img_add_smartbox.png") !important;background-size:55px 46px !important;backgournd-position:center 40%;'
      : 'url("images/img_add_smartbox.png") !important;background-size:55px 46px !important;backgournd-position:center 40%;'};
`;

function AppenderSelectButton({
  Component,
  className,
  isSelected,
  onClick,
  title,
}) {
  return (
    <Component
      className={classNames(styles.AppenderCheck, className)}
      isSelected={isSelected}
      onClick={onClick}
    >
      <div className={styles.Title}>{title}</div>
    </Component>
  );
}

const defaultProps = {
  selected: AppenderModalType.DIRECT_UPLOAD, // 2020.02.14 default 업로드 방식 변경
  onChange: _.noop,
};

function AppenderSelect({ selected, onChange, onMobileClick }) {
  const dispatch = useDispatch();
  const handleFileSelected = useCallback(() => {
    dispatch(PhotoAppenderActions.closePhotoAppender());
  }, []);
  // TODO: 비회원(비로그인)일 경우는 이용하기 클릭시 '회원전용 서비스입니다.' 메시지창 띄우고 막기
  return (
    <div className={`${styles.AppenderCheckWrapper} ${styles[deviceCheck()]}`}>
      {deviceCheck() === "Web" ? (
        <AppenderSelectButton
          Component={DirectUpload}
          isSelected={selected === AppenderModalType.DIRECT_UPLOAD}
          title={"직접 올리기"}
          onClick={() => {
            onChange(AppenderModalType.DIRECT_UPLOAD);
            if (deviceCheck() === "Mobile") {
              onMobileClick(AppenderModalType.DIRECT_UPLOAD);
            }
          }}
        />
      ) : (
        <DirectPhotoUploadButton
          className={styles.ActionButton}
          onSelectFiles={handleFileSelected}
        >
          <DirectUploadMobile>직접 올리기</DirectUploadMobile>
        </DirectPhotoUploadButton>
      )}
      <AppenderSelectButton
        Component={deviceCheck() === "Web" ? SmartBox : SmartBoxMobile}
        isSelected={selected === AppenderModalType.SMART_BOX}
        title={
          deviceCheck() === "Web"
            ? "스마트박스 이용하기"
            : "스마트박스에서 추가"
        }
        onClick={() => {
          onChange(AppenderModalType.SMART_BOX);
          if (deviceCheck() === "Mobile") {
            onMobileClick(AppenderModalType.SMART_BOX);
          }
        }}
      />
    </div>
  );
}

AppenderSelect.defaultProps = defaultProps;

export default memo(AppenderSelect);
