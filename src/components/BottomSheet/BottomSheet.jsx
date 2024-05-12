import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import styled from "styled-components";
import _ from "lodash";

import styles from "./BottomSheet.module.scss";

const BaseDiv = styled.div`
  height: 100vh;
  width: 100vw;
  background-color: #000000;
`;

function BottomSheet({
  children,

  onChange = _.noop,
  onMouseEnter = _.noop,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const handleClickClose = () => {
    setIsOpen(false);
  };
  return (
    <div
      className={classNames(styles.BottomSheet, {
        [styles.Opened]: isOpen,
      })}
    >
      {children}
      <div className={styles.Footer}>
        <button onClick={handleClickClose}>취소</button>
        <button>변경하기</button>
      </div>
    </div>
  );
}

export default BottomSheet;
