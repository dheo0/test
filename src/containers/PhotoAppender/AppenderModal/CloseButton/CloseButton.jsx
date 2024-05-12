import React from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { deviceCheck } from "../../../../utils/commonUtils";

import PhotoAppenderActions from "../../../../actions/PhotoAppenderActions";
import styles from "./CloseButton.module.scss";

const StyledCloseButton = styled.div`
  background-image: url("images/layer_close.png");

  &:hover {
    background-image: url("images/layer_close_over.png");
  }
`;

const StyledCloseButtonMobile = styled.div`
  background-image: url("images/ic_popup_close.svg");
  background-size: 14px 14px !important;
`;

function CloseButton({ closePhotoAppender }) {
  const handleClick = () => closePhotoAppender();

  return deviceCheck() === "Web" ? (
    <StyledCloseButton className={styles.CloseButton} onClick={handleClick} />
  ) : (
    <StyledCloseButtonMobile
      className={`${styles.CloseButton} ${styles[deviceCheck()]}`}
      onClick={handleClick}
    />
  );
}

export default connect(null, {
  closePhotoAppender: PhotoAppenderActions.closePhotoAppender,
})(CloseButton);
