import React, { memo } from "react";
import styles from "./SmartboxDescription.module.scss";
import { deviceCheck } from "../../../../../utils/commonUtils";
import styled from "styled-components";
const NoticeIcon = "images/ic_notice.png";

const StyledHeading = styled.h4`
  background-image: url("images/ic_warn.png") !important;
  margin: 0;
  font-size: toRem(16);
  padding-left: 24px;
  position: relative;
  background-size: 12px 12px !important;
  background-repeat: no-repeat;
  background-position: 5px 8px;
`;

function SmartboxDescription() {
  return (
    <div
      className={`${styles.SmartBoxDescriptionWrapper} ${
        styles[deviceCheck()]
      }`}
    >
      {deviceCheck() === "Web" && <img alt="" src={NoticeIcon} />}
      <div className={styles.SmartBoxDescription}>
        {deviceCheck() === "Web" ? (
          "스마트박스를 이용하시면"
        ) : (
          <StyledHeading>스마트박스를 이용하시면</StyledHeading>
        )}
        {deviceCheck() === "Web" ? (
          <ul>
            <li>무제한으로사진을 올릴 수있습니다.</li>
            <li>
              수백 장의 사진도 한 눈에 쉽게 볼 수 있도록 날짜, 인물, 장소 등으로
              분류해 드립니다.
            </li>
            <li>
              올리신 사진이 6개월간 보관되어 언제 어디서든 편하게 상품을
              주문하실 수 있습니다.
            </li>
          </ul>
        ) : (
          <ul>
            <li>
              수백 장의 사진도 한 눈에 쉽게 볼 수 있도록 날짜, 인물, 장소 등으로
              분류해드립니다. 올리신 사진이 6개월간 보관되어 언제 어디서든
              편하게 상품을 주문하실 수 있습니다.
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}

export default memo(SmartboxDescription);
