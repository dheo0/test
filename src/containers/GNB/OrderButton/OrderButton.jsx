import React from "react";
import { Link } from "react-router-dom";
import useReactRouter from "use-react-router";
import classNames from "classnames";
import styles from "./OrderButton.module.scss";
import { createPaperFullConfirmModal } from "../../../utils/ModalService";
import { deviceCheck } from "../../../utils/commonUtils";

function OrderButton({ className, hasNoPhotos, hasPaperFullOption }) {
  const {
    location: { pathname },
    history,
  } = useReactRouter();

  if (pathname === "/order") {
    return (
      <Link to="/">
        <button className={classNames("dark", styles.OrderButton, className)}>
          <img alt="Edit icon" src="images/ic_big_edit.png" />
          <span>편집하기</span>
        </button>
      </Link>
    );
  } else if (hasNoPhotos) {
    return (
      <button
        disabled
        className={classNames("coral", styles.OrderButton, className)}
      >
        {deviceCheck() === "Web" ? (
          <img alt="Cart icon" src="images/ic_cart.png" />
        ) : (
          <img alt="Cart icon" src="images/ic_order_cart.svg" />
        )}
        <span>주문하기</span>
      </button>
    );
  } else if (hasPaperFullOption) {
    // 2021.03.23 인화지풀 안내 팝업
    return (
      <button
        className={classNames("coral", styles.OrderButton, className)}
        onClick={function onClick() {
          let title = "";
          let message = `<div style='text-align:center'>인화지풀 인화는<br><strong style="color:#000;font-size:13px">사진이 잘릴 수 있습니다.</strong><br />잘리는 부분을 확인하셨나요?</div>`;

          createPaperFullConfirmModal(message, title, {
            onClickConfirm: () => {
              history.push("/order");
            },
            onClose: () => {
              return;
            },
          });
        }}
      >
        {deviceCheck() === "Web" ? (
          <img alt="Cart icon" src="images/ic_cart.png" />
        ) : (
          <img alt="Cart icon" src="images/ic_order_cart.svg" />
        )}
        <span>주문하기</span>
      </button>
    );
  }

  return (
    <Link to="/order">
      <button className={classNames("coral", styles.OrderButton, className)}>
        {deviceCheck() === "Web" ? (
          <img alt="Cart icon" src="images/ic_cart.png" />
        ) : (
          <img alt="Cart icon" src="images/ic_order_cart.svg" />
        )}
        <span>주문하기</span>
      </button>
    </Link>
  );
}

export default OrderButton;
