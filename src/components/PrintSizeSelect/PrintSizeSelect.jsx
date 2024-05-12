import React, { Component, createRef } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Immutable from 'immutable';
import numeral from 'numeral';
import classNames from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { createMessageModal, createConfirmModal } from '../../utils/ModalService';
import GLOSS_ONLY_SIZES from '../../constants/glossOnlySizes';
import MATTE_ONLY_SIZES from '../../constants/matteOnlySizes';
import PhotoEditorActions from '../../actions/PhotoEditorActions';
import AppInfoSelector from '../../selectors/AppInfoSelector';
import PhotoEditorSelector from '../../selectors/PhotoEditorSelector';
import PrintSize from '../../models/PrintSize';
import Tooltip from '../../components/Tooltip';
import RadioButton from '../RadioButton';
import styles from './PrintSizeSelect.module.scss';
import { PaperTypes } from '../../constants/printTypes';
import { getSafePFYoonMode } from '../../utils/commonUtils';

export const ArrowStyles = {
  NORMAL: 'normal',
  FILL: 'fill',
};

const StyledControlArrow = styled.div`
  ${props => {
    switch (props.arrowStyle) {
      case ArrowStyles.FILL: {
        return `
          background-image: url('images/ic_sizeselcetbox.png') !important;
        
          &:hover {
            background-image: url('images/ic_sizeselcetbox_over.png') !important;
          }
        `;
      }

      case ArrowStyles.NORMAL:
      default: {
        return `
          background-image: url('images/ic_b_pulldown.png') !important;
        
          &:hover {
            background-image: url('images/ic_b_pulldown_over.png') !important;
          }
        `;
      }
    }  
  }}
`;

const StyledComparatorImage = styled.div`
  background-image: url('images/img_size_compare.jpg');
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
`;

class PrintSizeSelect extends Component{
  static propTypes = {
    wrapperClassName: PropTypes.string,
    controlClassName: PropTypes.string,
    controlArrowClassName: PropTypes.string,
    selectClassName: PropTypes.string,
    printSizes: PropTypes.instanceOf(Immutable.List),
    selectedPrintSize: PropTypes.instanceOf(PrintSize),
    concise: PropTypes.bool,
    shortControlText: PropTypes.bool,
    overlayBelongsTo: PropTypes.object,
    arrowStyle: PropTypes.oneOf(_.values(ArrowStyles)),
    onChangePrintSize: PropTypes.func,
  };

  static defaultProps = {
    wrapperClassName: null,
    controlClassName: null,
    controlArrowClassName: null,
    selectClassName: null,
    printSizes: Immutable.List(),
    selectedPrintSize: null,
    concise: false,
    shortControlText: false,
    overlayBelongsTo: null,
    arrowStyle: ArrowStyles.NORMAL,
    onChangePrintSize: () => {},
  };

  state = {
    showSelect: false,
    selectedSize: this.props.selectedPrintSize || this.props.printSizes.first(),
  };

  controlRef = createRef();

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      prevProps.printSizes !== this.props.printSizes &&
      this.state.selectedSize === null
    ) {
      this.setState({ selectedSize: this.props.printSizes.first() });
    }

    if (prevProps.selectedPrintSize !== this.props.selectedPrintSize) {
      this.setState({ selectedSize: this.props.selectedPrintSize });
    }
  }

  handleClickOverlay = () => {
    this.setState({ showSelect: false });
  };

  handleClickControl = () => {
    this.setState(state => ({ showSelect: !state.showSelect }));
  };

  handleClickPrintSizeTableRadio = (printSize) => () => {
    let app = this;

    this.setState({
      selectedSize: printSize,
    }, () => {
      this.props.onChangePrintSize(printSize);
    });

    const { overlayBelongsTo } = this.props;

    if (!_.isNil(overlayBelongsTo)) { // 2020.08.05 사이즈 개별 선택시에는 return
      // 개별선택
      setTimeout(() => {
        const { photos, setPrintOptionsAll } = app.props;

        // 2020.08.07 혹시 유무광이 섞이는 케이스 오류 수정 보완 ex) 3x5 무광 2장, 1장을 큰사이즈로 선택시 유광으로 바뀜. 다시 1장 큰사이즈 사진을 3x5 로 교체시 유광이 남아있음.
        let select_size = printSize.size;    
  
        // 사이즈별 유광 무광 수량파악
        let gloss_count = 0; // PaperTypes.GLOSS
        let matte_count = 0; // PaperTypes.MATTE
  
        photos.forEach(photoItem => {        
          if (select_size ===  photoItem.getPrintOption().size) {
            if (photoItem.getPrintOption().paper === PaperTypes.GLOSS) gloss_count++;
            if (photoItem.getPrintOption().paper === PaperTypes.MATTE) matte_count++;
          }         
        });
    
        //console.log(gloss_count, matte_count);
        if (gloss_count > 0 && matte_count > 0) {
          //console.log(select_size, '한사이즈내 유/무광 섞여서 보정함.');
    
          setPrintOptionsAll({
            options: {
              paper: (gloss_count > matte_count) ? PaperTypes.GLOSS : PaperTypes.MATTE,
            },
          });
        }
      }, 200);
      // 2020.08.07
      return; 
    }

    let title = "모든사진적용 - 사진인화 사이즈 ("+printSize.size+")";
    let message = printSize.size === '3x4' ? 
    `모든 사진에 전체적용 하시겠습니까?
    3x4사이즈는 유테/이미지풀로만 인화됩니다.
    `
    : "모든 사진에 전체적용 하시겠습니까?";

    // 2020.08.05 옵션 선택시 곧바로 전체적용 UI 표시
    createConfirmModal(
      message,
      title,
      {
        onClickConfirm: () => {
          //console.log('ok 적용하자');
          //is_confirm_ok = true;
          app.handleClickApplyAll();
          app.handleClickClose();
        },
        onClose: () => {
          return;
        }
      }
    );
  };

  handleClickApplyAll = () => {
    const { setPrintOptionsAll } = this.props;
    const { selectedSize } = this.state;

    let is_only_gloss_size = _.includes(GLOSS_ONLY_SIZES, selectedSize.size);
    let is_only_matte_size = _.includes(MATTE_ONLY_SIZES, selectedSize.size);

    setPrintOptionsAll({
      options: {
        size: selectedSize.size,
      },
    });

    //let is_only_size = _.includes(GLOSS_ONLY_SIZES, selectedSize.size);
    //let message = getSafePFYoonMode() ? '8x10 ~ 12x17 사이즈는 유광으로만 인화됩니다.\n' : 'A4,8x10,10x13,10x15,11x14,12x17 사이즈는 유광으로만 인화됩니다.\n';
    //let message = getSafePFYoonMode() ? '8x10 ~ 12x17 사이즈는 유광으로만 인화됩니다.\n' : '8x10,12x17 사이즈는 유광으로만 인화됩니다.\nA4,10x13,10x15,11x14 사이즈는 무광으로만 인화됩니다.\n'; // 2022.11.17
    
    if (is_only_gloss_size) { // 2023.01.19 전체옵션 바꿀때에도 옵션 강제 적용
      setPrintOptionsAll({
        options: {
          paper: PaperTypes.GLOSS,
        },
      });
    } else if (is_only_matte_size) { // 2023.01.19 전체옵션 바꿀때에도 옵션 강제 적용
      setPrintOptionsAll({
        options: {
          paper: PaperTypes.MATTE,
        },
      });
    }
    
    let message = GLOSS_ONLY_SIZES.toString()+' 사이즈는\n모두 유광으로만 인화됩니다.\n';
    if (is_only_matte_size)
      message = MATTE_ONLY_SIZES.toString()+' 사이즈는\n모두 무광으로만 인화됩니다.\n';
    if (is_only_gloss_size || is_only_matte_size) {
      createMessageModal([
        message,
      ].join('\n'));  

    }

  };

  handleClickApplySelected = () => {
    const { photos, selectedPhotoUUIDs, setPrintOptions } = this.props;
    const { selectedSize } = this.state;

    setPrintOptions({
      photos: photos.filter(photo => selectedPhotoUUIDs.includes(photo.uuid)),
      options: {
        size: selectedSize.size,
      },
    });
  };

  handleClickClose = () => { // 2020.08.07 close 기능 추가
    this.handleClickOverlay();
  }

  renderOverlayContent() {
    return (
      <div
        className={styles.Overlay}
        onClick={this.handleClickOverlay}
      />
    );
  }

  renderOverlay() {
    const { overlayBelongsTo } = this.props;
    const { showSelect } = this.state;

    if (!showSelect) { return null }

    if (!_.isNil(overlayBelongsTo)) {
      return ReactDOM.createPortal(
        this.renderOverlayContent(),
        overlayBelongsTo,
      );
    }
    return this.renderOverlayContent();
  }

  renderControl() {
    const { controlClassName, controlArrowClassName, shortControlText, arrowStyle, tooltip } = this.props;
    const { showSelect, selectedSize } = this.state;

    return (
      <Tooltip tooltip={tooltip}>
        <div
          ref={this.controlRef}
          className={classNames(styles.Control, controlClassName)}
          data-showing={showSelect}
          onClick={this.handleClickControl}
        >
          <div className={styles.ControlText}>
            { (() => {
              if (selectedSize) {
                if (shortControlText) {
                  return selectedSize.size
                }
                return selectedSize.toString()
              }
            })() }
          </div>

          <StyledControlArrow
            className={classNames(styles.ControlArrow, controlArrowClassName)}
            arrowStyle={arrowStyle}
          />
        </div>
      </Tooltip>
    );
  }

  renderPrintSizeTableRow = (printSize) => (
    <div
      key={printSize.size}
      className={styles.Row}
    >
      <div className={styles.size}>
        <RadioButton
          buttonClassName={styles.RadioButton}
          checked={this.state.selectedSize === printSize}
          onClick={this.handleClickPrintSizeTableRadio(printSize)}
        >
          <span>{ printSize.size }</span>
        </RadioButton>
      </div>
      <div className={styles.centimeters}>{ printSize.getLengthString() }</div>
      <div className={styles.originalPrice}>{ numeral(printSize.currentPrice).format('0,0') }원</div>
      <div className={styles.currentPrice}>{ numeral(printSize.originalPrice).format('0,0') }원</div>
    </div>
  );

  renderSelectPreviewComparator(printSize, ratio) {
    /* NOTE: 세로로 회전한 형태로 보여줘야 하기 때문에 width x height 교차 */
    const width = _.get(printSize, 'height', 0) * ratio;
    const height = _.get(printSize, 'width', 0) * ratio;

    return printSize && (
      <div
        className={styles.Comparator}
        style={{ width, height }}
      >
        <StyledComparatorImage
          style={{
            width, height,
          }}
        />
        <div className={styles.ComparatorSize}>
          { printSize.size }
        </div>
      </div>
    )
  }

  renderSelectPreviewArea() {
    const { printSizes } = this.props;
    const { selectedSize } = this.state;

    return (
      <div>
        <div className={styles.PreviewArea}>
          <div className={styles.Title}>
            사이즈 비교하기
          </div>

          <div className={styles.Preview}>
            { (() => {
              if (selectedSize && printSizes) {
                const sizeA4 = printSizes.find(printSize => printSize.size === 'A4');
                /* TODO: 더 큰 쪽의 높이를 기준으로 상대적인 ratio 변경하는 것이 더 자연스러울 것 */
                const ratio = selectedSize.isLargerThan(sizeA4) ? 4.6 : 5.6;
                return (
                  <>
                    { this.renderSelectPreviewComparator(selectedSize, ratio) }
                    { this.renderSelectPreviewComparator(sizeA4, ratio) }
                  </>
                )
              }
              return null;
            })() }
          </div>
        </div>
      </div>
    )
  }

  renderSelectContent(isBelonged = false) {
    const { selectClassName, photos, printSizes, selectedPhotoUUIDs, concise } = this.props;

    let popularSizes = {}; //printSizes.slice(0, 4);
    let otherSizes = {}; //printSizes.slice(4);

    if (getSafePFYoonMode()) { // 2020.10.20 팩토리윤은 인기사이즈 지정 -> 4x6 5x7 8x10 11x14
      popularSizes = printSizes.filter((item) => {
        return (item.size === '4x6') || (item.size === '5x7') || (item.size === '8x10') || (item.size === '11x14');
      });
      otherSizes = printSizes.filter((item) => {
        return (item.size !== '4x6') && (item.size !== '5x7') && (item.size !== '8x10') && (item.size !== '11x14');
      });
    } else {
      popularSizes = printSizes.slice(0, 4); // 포토몬은 상위 4개 인기사이즈
      otherSizes = printSizes.slice(4); 
    }

    //console.log('popularSizes', popularSizes);
    //console.log('otherSizes', otherSizes);

    const style = {};

    if (isBelonged && this.controlRef.current) {
      const parentScrollTop = this.props.overlayBelongsTo.scrollTop;
      const parentRect = this.props.overlayBelongsTo.getBoundingClientRect();
      const controlRect = this.controlRef.current.getBoundingClientRect();
      _.set(style, 'top', controlRect.top - parentRect.top + controlRect.height + parentScrollTop);
      _.set(style, 'left', controlRect.left - parentRect.left);

      const windowRect = { width : window.innerWidth || document.body.clientWidth, height : window.innerHeight || document.body.clientHeight }
      if (windowRect.height < controlRect.top - parentRect.top + controlRect.height + 350 ) // 2023.05.22 사이즈 팝업 위치/크기 브라우저 height보다 크면, 위치조정
        _.set(style, 'top', controlRect.top - parentRect.top + controlRect.height + parentScrollTop - 350);

      //console.log(controlRect);
    }

    return (
      <div
        className={classNames(getSafePFYoonMode() ? styles.SelectPFYoon : styles.Select, selectClassName, {
          [styles.concise]: concise,
        })}
        style={style}
      >
        <div className={styles.ItemArea}>
          <div
            className={classNames(styles.SizeTable, {
              [styles.concise]: concise,
            })}
          >
            <div className={styles.GroupTitle}>인기사이즈</div>
            <div className={styles.Group}>
              { popularSizes.map(this.renderPrintSizeTableRow) }
            </div>
            <div className={styles.GroupTitle}>전체사이즈</div>
            <div className={styles.Group}>
              { otherSizes.map(this.renderPrintSizeTableRow) }
            </div>
          </div>

          <div
            className={classNames(styles.Actions, {
              hidden: concise,
            })}
          >
{
  /* // 2020.08.05 버튼 비활성화
            <button
              className={classNames('orange', styles.ButtonApplyAll)} // 2020.08.04 dark - orange
              onClick={this.handleClickApplyAll}
              disabled={photos.isEmpty()}
            >
              모든 사진에 적용
            </button>
  */            
}            
{
  /* // 2020.08.03 버튼 비활성화
            <button
              className={styles.ButtonApplySelected}
              onClick={this.handleClickApplySelected}
              disabled={selectedPhotoUUIDs.isEmpty()}
            >
              { `선택한 사진에 적용 (${numeral(selectedPhotoUUIDs.size).format('0,0')})` }
            </button>
  */            
}          
{            
/*
            <button
              className={classNames('orange', styles.ButtonApplyAll)} // 2020.08.04 dark - orange
              onClick={this.handleClickClose}
            >
              닫기
            </button>  
*/            
}            
          </div>
        </div>

        { !getSafePFYoonMode() && this.renderSelectPreviewArea() }
      </div>
    );
  }

  renderSelect() {
    const { overlayBelongsTo } = this.props;
    const { showSelect } = this.state;

    if (!showSelect) { return null }

    if (!_.isNil(overlayBelongsTo)) {
      return ReactDOM.createPortal(
        this.renderSelectContent(true), // 개별 사이즈 선택
        overlayBelongsTo,
      );
    }
    return this.renderSelectContent(); // 옵션바 사이즈 선택
  }

  render() {
    const { wrapperClassName } = this.props;
    return (
      <>
        { this.renderOverlay() }

        <div className={classNames(wrapperClassName)}>
          { this.renderControl() }
          { this.renderSelect() }
        </div>
      </>
    );
  }
}

PrintSizeSelect = connect(state => ({
  photos: PhotoEditorSelector.getSortedPhotos(state),
  printSizes: AppInfoSelector.getPrintSizes(state),
  selectedPhotoUUIDs: PhotoEditorSelector.getSelectedPhotoUUIDs(state),
}), {
  setPrintOptions: PhotoEditorActions.setPrintOptions,
  setPrintOptionsAll: PhotoEditorActions.setPrintOptionsAll,
})(PrintSizeSelect);

export default PrintSizeSelect
