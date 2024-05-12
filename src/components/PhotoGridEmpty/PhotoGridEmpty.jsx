import React, { useMemo, useCallback } from "react";
import { useDispatch } from "react-redux";
import classNames from "classnames";
import styled from "styled-components";

import PhotoAppenderActions from "../../actions/PhotoAppenderActions";
import { isSmartboxAvailable } from "../../utils/commonUtils";
import DirectPhotoUploadButton from "../../components/DirectPhotoUploadButton";
import { isMobile, iPad } from "../../App";
import styles from "./PhotoGridEmpty.module.scss";

const StyledEmptyContent = styled.div`
  &::before {
    background-image: url("images/ic_pic_add1_plus.png") !important;
  }
`;
const StyledEmptyContentMobile = styled.div`
  &::before {
    width: 44px;
    height: 44px;
    background-image: url("images/ic_add_gallery.svg") !important;
    background-size: 24.728px 24.73px !important;
  }
`;

const StyledPhotoGridEmpty = styled.div`
  &:hover {
    ${StyledEmptyContent} {
      &::before {
        background-image: url("images/ic_pic_add1_plus_over.png") !important;
      }
    }
  }
`;

const defaultProps = {
  className: null,
  show: false,
};

function PhotoGridEmpty({ className, show }) {
  const dispatch = useDispatch();

  const handleClickAppendButton = useCallback(() => {
    dispatch(PhotoAppenderActions.openPhotoAppender());
  }, []);

  const deviceCheck = () => {
    return isMobile || iPad ? "Mobile" : "";
  };

  const Content = useMemo(
    () => (
      <StyledPhotoGridEmpty
        className={classNames(styles.PhotoGridEmpty, className)}
        onClick={isSmartboxAvailable() ? handleClickAppendButton : null}
      >
        {deviceCheck() !== "Mobile" ? (
          <StyledEmptyContent className={styles.Content}>
            <div>
              사진을 추가하신 후<br />
              인화 주문을 하실 수 있습니다.
            </div>
          </StyledEmptyContent>
        ) : (
          <StyledEmptyContentMobile
            className={classNames(`${styles.Content} ${styles.wide}`)}
          >
            <div>
              사진을 추가하신 후<br />
              인화 주문을 하실 수 있습니다.
            </div>
          </StyledEmptyContentMobile>
        )}
      </StyledPhotoGridEmpty>
    ),
    [handleClickAppendButton]
  );

  if (!show) {
    return null;
  }
  return isSmartboxAvailable() ? (
    Content
  ) : (
    <DirectPhotoUploadButton>{Content}</DirectPhotoUploadButton>
  );
}

PhotoGridEmpty.defaultProps = defaultProps;

export default PhotoGridEmpty;
