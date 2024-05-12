import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MemoryRouter as Router, Route, Switch } from "react-router-dom";
import _ from "lodash";
import ReactTooltip from "react-tooltip";

import PrintSizeTypes from "./constants/printSizeTypes";
import LoadingSelector from "./selectors/LoadingSelector";
import AppInfoSelector from "./selectors/AppInfoSelector";
import GNB from "./containers/GNB";
import PhotoEditor from "./containers/PhotoEditor";
import PhotoEditorMobile from "./containers/PhotoEditor/PhotoEditorMobile";
import PhotoAppender from "./containers/PhotoAppender";
import PhotoPreviewModal from "./containers/PhotoPreviewModal";
import PhotoDetailEditor from "./containers/PhotoDetailEditor";
import PhotoOrder from "./containers/PhotoOrder";
import TransitionPrompt from "./components/TransitionPrompt";
import { ModalWrapper } from "./utils/ModalService";

import AppInfoActions from "./actions/AppInfoActions";
import Spinner from "./components/Spinner";
import styles from "./App.module.scss";
import BottomSheet from "./components/BottomSheet/BottomSheet";

function detectMobileDevice(agent) {
  const mobileRegex = [
    /Android/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i,
  ];

  return mobileRegex.some((mobile) => agent.match(mobile));
}

export const isMobile = detectMobileDevice(window.navigator.userAgent);
export const iPad =
  window.navigator.userAgent.includes("Macintosh") &&
  navigator.maxTouchPoints === 5; // 아이패드 사파리일 경우

if (isMobile || iPad) {
  require("./resources/styles/mobile/global.scss");
} else {
  require("./resources/styles/global.scss");
}

function App() {
  const dispatch = useDispatch();
  const printSizes = useSelector(AppInfoSelector.getPrintSizes);
  const printSizeInfoError = useSelector(AppInfoSelector.getPrintSizeInfoError);
  const isFetchingEssentials = useSelector(
    LoadingSelector.isFetchingEssentials
  );
  const essentialsFetched = !_.isNil(printSizes) && !printSizes.isEmpty();

  useEffect(() => {
    _.values(PrintSizeTypes).forEach((printSizeType) =>
      dispatch(AppInfoActions.requestGetPrintSizeInfo(printSizeType))
    );
    dispatch(AppInfoActions.requestGetUploadingServerUrl());
  }, []);

  const AppContent = useMemo(() => {
    if (!isFetchingEssentials && essentialsFetched) {
      return (
        <Router>
          <GNB />
          <PhotoAppender />
          <PhotoPreviewModal />
          <PhotoDetailEditor />

          <Switch>
            <Route exact path="/order" component={PhotoOrder} />
            <Route component={PhotoEditor} />
          </Switch>

          <TransitionPrompt />
        </Router>
      );
    } else if (printSizeInfoError) {
      return (
        <div className={styles.ErrorWrapper}>
          <div className={styles.Error}>{printSizeInfoError.message}</div>
        </div>
      );
    }
    return (
      <div className={styles.LoaderWrapper}>
        <Spinner className={styles.Spinner} />
      </div>
    );
  }, [isFetchingEssentials, essentialsFetched, printSizeInfoError]);

  const MobileContent = useMemo(() => {
    if (!isFetchingEssentials && essentialsFetched) {
      return (
        <Router>
          <PhotoAppender />
          <PhotoDetailEditor />
          <Switch>
            <Route exact path="/order" component={PhotoOrder} />
            <Route component={PhotoEditorMobile} />
          </Switch>
          <BottomSheet />
          <TransitionPrompt />
        </Router>
      );
    } else if (printSizeInfoError) {
      return (
        <div className={styles.ErrorWrapper}>
          <div className={styles.Error}>{printSizeInfoError.message}</div>
        </div>
      );
    }
    return (
      <div className={styles.LoaderWrapper}>
        <Spinner className={styles.Spinner} />
      </div>
    );
  }, [isFetchingEssentials, essentialsFetched, printSizeInfoError]);

  return (
    <div className={`${styles.App} ${isMobile || iPad ? styles.Mobile : ""}`}>
      {isMobile || iPad ? MobileContent : AppContent}
      <ReactTooltip
        className={styles.Tooltip}
        globalEventOff="hashchange"
        effect="solid"
      />
      <ModalWrapper />
    </div>
  );
}

export default App;
