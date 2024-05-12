import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import classNames from "classnames";
import _ from "lodash";
import { deviceCheck } from "../../../../utils/commonUtils";
import PhotoAppenderActions from "../../../../actions/PhotoAppenderActions";
import SmartboxActions from "../../../../actions/SmartboxActions";
import PhotoAppenderSelector from "../../../../selectors/PhotoAppenderSelector";
import SmartboxSelector from "../../../../selectors/SmartboxSelector";
import { AppenderModalType } from "../../../../constants/uiTypes";
import { createMessageModal } from "../../../../utils/ModalService";
import DirectPhotoUploadButton from "../../../../components/DirectPhotoUploadButton";
import Checkbox from "../../../../components/Checkbox";
import SmartboxDescription from "./SmartboxDescription/SmartboxDescription";
import styles from "./AppenderSelector.module.scss";
import AppenderSelect from "./AppenderSelect/AppenderSelect";

function AppenderSelector() {
  const dispatch = useDispatch();
  const selectedAppender = useSelector(
    PhotoAppenderSelector.getSelectedAppender
  );
  const hasAgreementAgreed = useSelector(SmartboxSelector.hasAgreementAgreed);
  const setAppender = (appender) => {
    dispatch(PhotoAppenderActions.setSelectedAppender({ appender }));
  };
  const setPhotoAppenderModalContent = (args) =>
    dispatch(PhotoAppenderActions.setPhotoAppenderModalContent(args));
  const agreeSmartboxAgreement = () =>
    dispatch(SmartboxActions.requestUpdateSmartboxAgreementState());

  const [smartboxAgreementsAgreed, setAgreeSmartboxAgreements] =
    useState(false);

  const handleSelectAppender = useCallback(
    (appender) => setAppender(appender),
    []
  );

  const handleFileSelected = useCallback(() => {
    dispatch(PhotoAppenderActions.closePhotoAppender());
  }, []);

  const handleRequestError = useCallback((action) => {
    if (_.has(action, "payload.error")) {
      createMessageModal(_.get(action, "payload.error"));
    }
  }, []);

  const handleClickSubmitButton = useCallback(() => {
    if (hasAgreementAgreed) {
      const appenderType =
        selectedAppender === AppenderModalType.SMART_BOX
          ? AppenderModalType.SMART_BOX
          : AppenderModalType.DIRECT_UPLOAD;
      setPhotoAppenderModalContent({ appenderType });
    } else {
      agreeSmartboxAgreement().promise.then(
        ({ payload: { hasAgreementAgreed } }) => {
          if (hasAgreementAgreed) {
            setPhotoAppenderModalContent(AppenderModalType.SMART_BOX);
          }
        },
        handleRequestError
      );
    }
  }, [hasAgreementAgreed, selectedAppender]);

  const handleMobileBoxClick = (value) => {
    if (value === "SMART_BOX") {
      const appenderType = AppenderModalType.SMART_BOX;
      setPhotoAppenderModalContent({ appenderType });
    }
  };

  const ActionButton = useMemo(() => {
    if (selectedAppender === AppenderModalType.SMART_BOX) {
      return (
        <>
          <div
            className={classNames(styles.SmartBoxTermsAgreement, {
              hidden: hasAgreementAgreed,
            })}
          >
            <Checkbox
              checked={smartboxAgreementsAgreed}
              className={styles.SmartBoxTermsAgreementCheckBox}
              contentClassName={styles.SmartBoxTermsAgreementCheckBoxContent}
              onChange={(agreed) => setAgreeSmartboxAgreements(agreed)}
            >
              스마트박스 서비스 이용 동의
            </Checkbox>

            <button className="grey">
              내용보기 <span>▶</span>
            </button>
          </div>

          <button
            className={styles.ActionButton}
            disabled={!hasAgreementAgreed && !smartboxAgreementsAgreed}
            onClick={handleClickSubmitButton}
          >
            스마트박스 이용하기
          </button>
        </>
      );
    } else {
      return (
        <DirectPhotoUploadButton
          className={styles.ActionButton}
          onSelectFiles={handleFileSelected}
        >
          직접 올리기
        </DirectPhotoUploadButton>
      );
    }
  }, [
    selectedAppender,
    hasAgreementAgreed,
    smartboxAgreementsAgreed,
    handleClickSubmitButton,
  ]);

  return (
    <>
      <div className={`${styles.Content} ${styles[deviceCheck()]}`}>
        <AppenderSelect
          selected={selectedAppender}
          onChange={handleSelectAppender}
          onMobileClick={deviceCheck() === "Mobile" && handleMobileBoxClick}
        />

        <SmartboxDescription />

        {deviceCheck() === "Web" && (
          <div className={styles.ButtonWrapper}>{ActionButton} </div>
        )}
      </div>
    </>
  );
}

export default AppenderSelector;
