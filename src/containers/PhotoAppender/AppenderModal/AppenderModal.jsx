import React, { useRef, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deviceCheck } from "../../../utils/commonUtils";
import SmartboxActions from "../../../actions/SmartboxActions";
import AppInfoSelector from "../../../selectors/AppInfoSelector";
import PhotoAppenderSelector from "../../../selectors/PhotoAppenderSelector";
import SmartboxSelector from "../../../selectors/SmartboxSelector";
import { AppenderModalType } from "../../../constants/uiTypes";
import Spinner from "../../../components/Spinner";
import AppenderSelector from "./AppenderSelector";
import SmartboxUploader from "./SmartboxUploader";
import CloseButton from "./CloseButton";
import styles from "./AppenderModal.module.scss";

function AppenderModal() {
  const dispatch = useDispatch();
  const isFetchingUploadingServerUrl = useSelector(
    AppInfoSelector.isFetchingUploadingServerUrl
  );
  const isFetchingAgreementState = useSelector(
    SmartboxSelector.isFetchingAgreementState
  );
  const isUpdatingAgreementState = useSelector(
    SmartboxSelector.isUpdatingAgreementState
  );
  const uploadingServerUrl = useSelector(AppInfoSelector.getUploadingServerUrl);
  const appenderModalType = useSelector(
    PhotoAppenderSelector.getSelectedAppenderModalType
  );
  const uploadingServerUrlError = useSelector(
    AppInfoSelector.getUploadingServerUrlError
  );

  const contentWrapperRef = useRef(null);

  const showModalContent =
    !isFetchingUploadingServerUrl &&
    !isFetchingAgreementState &&
    !isUpdatingAgreementState &&
    uploadingServerUrl;
  const isLoading = !showModalContent && uploadingServerUrlError;

  useEffect(() => {
    dispatch(SmartboxActions.requestGetSmartboxAgreementState());
  }, []);

  const SpinnerComponent = useMemo(() => {
    if (!isLoading) {
      return null;
    }
    return (
      <div className={styles.SpinnerWrapper}>
        <Spinner className={styles.Spinner} />
      </div>
    );
  }, []);

  const ModalContent = useMemo(() => {
    if (!showModalContent) {
      return null;
    }
    switch (appenderModalType) {
      case AppenderModalType.SMART_BOX: {
        return <SmartboxUploader />;
      }
      default: {
        return (
          <>
            <div className={styles.Header}>
              {deviceCheck() === "Mobile" ? <h3>사진 추가하기</h3> : ""}
              <CloseButton />
            </div>
            <AppenderSelector
              container={contentWrapperRef.current}
              uploadingServerUrl={uploadingServerUrl}
            />
          </>
        );
      }
    }
  }, [showModalContent, appenderModalType]);

  const ErrorComponent = useMemo(() => {
    if (!uploadingServerUrlError) {
      return null;
    }
    return (
      <div className={styles.ErrorWrapper}>
        <div className={styles.Error}>{uploadingServerUrlError.message}</div>
      </div>
    );
  }, [uploadingServerUrlError]);

  return (
    <div
      ref={contentWrapperRef}
      className={`${styles.AppenderModal} ${styles[deviceCheck()]} ${
        appenderModalType === "SMART_BOX" ? styles.SmartBox : ""
      }`}
    >
      {SpinnerComponent}
      {ModalContent}
      {ErrorComponent}
    </div>
  );
}

export default AppenderModal;
