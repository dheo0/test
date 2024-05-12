import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import classNames from "classnames";
import numeral from "numeral";

import PhotoAppenderActions from "../../actions/PhotoAppenderActions";
import PhotoEditorActions from "../../actions/PhotoEditorActions";
import PhotoEditorSelector from "../../selectors/PhotoEditorSelector";
import PrintSizeTypes from "../../constants/printSizeTypes";
import { TrimmingTypes } from "../../constants/printTypes";
import {
  getSafeOrderType,
  isSmartboxAvailable,
  getSafePFYoonMode,
} from "../../utils/commonUtils";
import Divider from "../../components/Divider";
import DirectPhotoUploadButton from "../../components/DirectPhotoUploadButton";
import Prices from "./Prices";
import OrderButton from "./OrderButton";
import { deviceCheck } from "../../utils/commonUtils";
import styles from "./GNB.module.scss";

const Logo = "images/logo.png";
const PFYoonLogo = "images/photofactoryYoon_150X19px.png";

class GNB extends PureComponent {
  renderTitle() {
    const { photos } = this.props;
    const orderTypeString = (() => {
      switch (getSafeOrderType()) {
        case PrintSizeTypes.GGOM:
          return "꼼꼼 ";
        case PrintSizeTypes.SPEED:
          return "스피드 ";
        default:
          return getSafePFYoonMode() ? " " : "클래식 ";
      }
    })();
    return (
      <div className={styles.EditorTitle}>
        <div>{`${orderTypeString}사진인화`}&nbsp;</div>
        <div>{numeral(photos.size).format("0,0")}</div>
        <div>장</div>
      </div>
    );
  }

  render() {
    const {
      photos,
      openPhotoAppender,
      isAllPhotoSelected,
      selectedPhotoUUIDs,
      prices,
      selectAllPhotos,
      unselectAllPhotos,
      purgeSelectedPhotos,
      location: { pathname },
    } = this.props;
    const isOrderPage = pathname === "/order";

    let exist_paperfull = false; // 2021.03.23 인화지풀 안내 팝업
    photos.forEach((photo) => {
      const printOption = photo.getPrintOption();

      if (!exist_paperfull)
        exist_paperfull = printOption.trimming === TrimmingTypes.PAPER_FULL;
    });

    return (
      <>
        <div className={`${styles.GNB} ${styles[deviceCheck()]}`}>
          <div className={styles.Content}>
            <div
              className={getSafePFYoonMode() ? styles.PFYoonLogo : styles.Logo}
            >
              <img
                id="photomon_logo"
                alt="Photomon Logo"
                src={getSafePFYoonMode() ? PFYoonLogo : Logo}
              />
            </div>

            {deviceCheck() === "Web" && <Divider size={20} />}

            {this.renderTitle()}

            <div className={styles.Actions}>
              {!isOrderPage && (
                <>
                  {!photos.isEmpty() && (
                    <>
                      <button
                        className={classNames(
                          styles.Button,
                          styles.SubActionButton
                        )}
                        onClick={
                          isAllPhotoSelected
                            ? unselectAllPhotos
                            : selectAllPhotos
                        }
                      >
                        {isAllPhotoSelected
                          ? `전체 선택 해제 (${numeral(
                              selectedPhotoUUIDs.size
                            ).format("0,0")})`
                          : "전체 선택"}
                      </button>

                      <button
                        className={classNames(
                          styles.Button,
                          styles.SubActionButton
                        )}
                        onClick={purgeSelectedPhotos}
                        disabled={selectedPhotoUUIDs.isEmpty()}
                      >
                        {`선택 사진 삭제 (${numeral(
                          selectedPhotoUUIDs.size
                        ).format("0,0")})`}
                      </button>
                    </>
                  )}

                  {isSmartboxAvailable() ? (
                    <button
                      className={classNames(
                        styles.Button,
                        styles.SubActionButton,
                        styles.AddPhotosButton
                      )}
                      onClick={openPhotoAppender}
                    >
                      <img
                        alt="Add file button"
                        src="images/ic_counter_plus.png"
                      />
                      사진추가하기
                    </button>
                  ) : (
                    <DirectPhotoUploadButton
                      className={classNames(
                        styles.Button,
                        styles.SubActionButton,
                        styles.AddPhotosButton
                      )}
                    >
                      <img
                        alt="Add file button"
                        src="images/ic_counter_plus.png"
                      />
                      사진추가하기
                    </DirectPhotoUploadButton>
                  )}
                </>
              )}

              <Prices prices={prices} />
              <OrderButton
                className={styles.OrderButton}
                hasNoPhotos={photos.isEmpty()}
                hasPaperFullOption={exist_paperfull} // 2021.03.23 인화지풀 안내 팝업
              />
            </div>
          </div>
        </div>
        <div className={styles.EditorFooter}>
          {this.renderTitle()}

          {isSmartboxAvailable() ? (
            <button
              className={classNames(
                styles.Button,
                styles.SubActionButton,
                styles.AddPhotosButton
              )}
              onClick={openPhotoAppender}
            >
              <img alt="Add file button" src="images/ic_counter_plus.png" />
              사진추가하기
            </button>
          ) : (
            <DirectPhotoUploadButton
              className={classNames(
                styles.Button,
                styles.SubActionButton,
                styles.AddPhotosButton
              )}
            >
              <img alt="Add file button" src="images/ic_counter_plus.png" />
              사진추가하기
            </DirectPhotoUploadButton>
          )}
        </div>
      </>
    );
  }
}

GNB = withRouter(GNB);
GNB = connect(
  (state) => ({
    photos: PhotoEditorSelector.getSortedPhotos(state),
    prices: PhotoEditorSelector.getPrices(state),
    selectedPhotoUUIDs: PhotoEditorSelector.getSelectedPhotoUUIDs(state),
    isAllPhotoSelected: PhotoEditorSelector.isAllPhotoSelected(state),
  }),
  {
    openPhotoAppender: PhotoAppenderActions.openPhotoAppender,
    selectAllPhotos: PhotoEditorActions.selectAllPhotos,
    unselectAllPhotos: PhotoEditorActions.unselectAllPhotos,
    purgeSelectedPhotos: PhotoEditorActions.purgeSelectedPhotos,
  }
)(GNB);

export default GNB;
