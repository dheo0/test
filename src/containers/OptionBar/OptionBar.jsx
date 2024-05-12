import React, { Component, createRef, useRef, useState, useMemo, useCallback } from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { flow, flatten, map, reduce } from 'lodash/fp';
import styled from 'styled-components';

import PrintOptionFields from '../../constants/printOptionFields';
import { PaperTypes, BorderTypes, TrimmingTypes, InsertDate } from '../../constants/printTypes';
import GLOSS_ONLY_SIZES from '../../constants/glossOnlySizes';
import MATTE_ONLY_SIZES from '../../constants/matteOnlySizes';
import AppInfoSelector from '../../selectors/AppInfoSelector';
import PhotoEditorSelector from '../../selectors/PhotoEditorSelector';
import PhotoEditorActions from '../../actions/PhotoEditorActions';
import { createMessageModal, createConfirmModal } from '../../utils/ModalService';
import { DEFAULT_VALUES_3x4, DEFAULT_VALUES_GLOSS_ONLY } from '../../models/PrintOption';
import { getSafePFYoonMode } from '../../utils/commonUtils';
import OptionHelpModal from '../../components/OptionHelpModal';
import PrintSizeSelect from '../../components/PrintSizeSelect';
import Divider from '../../components/Divider';
import SwitchOption from '../../components/SwitchOption';
import Checkbox from '../../components/Checkbox';
import Counter from '../../components/Counter';
import styles from './OptionBar.module.scss';

// 2020.07.09 아이콘 ui 수정
const StyledGlossyPrintSizeIcon = styled.div` 
  width: 14px;
  height: 14px;
  display: inline-block;
  margin-left: 10px;
  line-height: 1.8;
  background: url('images/ic_info_yellow.png') center;
  
  &:hover {
    background: url('images/ic_info_yellow.png') center;
  }
`;

function SwitchOptionSection({ sectionKey, value, disabled, negativeOption, positiveOption, onChange, show34SizeInfo }) {
  const wrapperRef = useRef(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  
  //console.log('show34SizeInfo', show34SizeInfo);

  const HelpModal = useMemo(() => {
    if (showHelpModal && wrapperRef.current) {
      return (
        <OptionHelpModal
          type={sectionKey}
          target={wrapperRef.current}
          show34SizeInfo={show34SizeInfo}
        />
      )
    }
    return null
  }, [showHelpModal, wrapperRef.current]);

  return (
    <div
      ref={wrapperRef}
      className={styles.SwitchOptionSection}
      onMouseEnter={() => setShowHelpModal(true)}
      onMouseLeave={() => setShowHelpModal(false)}
    >
      <SwitchOption
        className={styles.SwitchOption}
        on={value === positiveOption.key}
        offOptionName={negativeOption.value}
        onOptionName={positiveOption.value}
        disabled={disabled}
        onChange={(checked) => onChange(checked ? positiveOption.key : negativeOption.key)}
      />

      { HelpModal }
    </div>
  )
}

function CheckboxSection({ sectionTitle, sectionKey, checked, disabled, onChange }) {
  const wrapperRef = useRef(null);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const HelpModal = useMemo(() => {
    if (showHelpModal && wrapperRef.current) {
      return (
        <OptionHelpModal
          type={sectionKey}
          target={wrapperRef.current}
        />
      )
    }
    return null
  }, [showHelpModal, wrapperRef.current]);

  const handleClick = useCallback(() => onChange(!checked), [checked, onChange]);
  const handleMouseEnter = useCallback(() => setShowHelpModal(true), []);
  const handleMouseLeave = useCallback(() => setShowHelpModal(false), []);

  return (
    <div
      ref={wrapperRef}
      className={classNames(styles.CheckboxSection)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <div className={classNames(styles.SectionTitle, styles.isContent, {
        [styles.isHovering]: showHelpModal,
      })}>
        { sectionTitle }
      </div>

      <Checkbox
        className={styles.Checkbox}
        checked={checked}
        disabled={disabled}
        isHovering={showHelpModal}
        onChange={onChange}
        onMouseEnter={handleMouseEnter}
      />

      { HelpModal }
    </div>
  )
}

const CounterSection = ({ sectionTitle, value, disabled, onChange }) => (
  <div className={styles.CounterSection}>
    <div className={styles.SectionTitle}>
      { sectionTitle }
    </div>

    <Counter
      className={styles.Counter}
      initial={value}
      min={1}
      disabled={disabled}
      onChange={onChange}
    />
  </div>
);

class OptionBar extends Component {
  switchOptionSections = [
    PrintOptionFields.PAPER,
    PrintOptionFields.BORDER,
    PrintOptionFields.TRIMMING,
  ];

  checkboxSections = [
    PrintOptionFields.AUTO_ADJUSTMENT,
    PrintOptionFields.INSERT_DATE,
  ];

  counterSections = [
    PrintOptionFields.PRINT_QUANTITY,
  ];

  createDefaultOptions = () => flow(
    flatten,
    map(({ key, defaultValue }) => ({ key, defaultValue })),
    reduce((ret, { key, defaultValue }) => {
      _.set(ret, key, defaultValue);
      return ret;
    }, {})
  )([this.switchOptionSections, this.checkboxSections, this.counterSections]);

  state = {
    options: {
      printSize: this.props.printSizes.find(s => s.size === PrintOptionFields.SIZE.defaultValue),
      ...this.createDefaultOptions(),
    },
    disables: null,
    showGlossyInfo: false,
    showMatteInfo: false,
    show34SizeInfo:false,
  };

  optionBarRef = createRef();

  handleChangePrintSize = (printSize) => {
    this.setState(state => ({
      options: {
        ...state.options,
        printSize,
        ...(() => {
          if (printSize.size === '3x4') {
            return DEFAULT_VALUES_3x4;
          }
          return {};
        })(),
      },
      disables: (printSize.size === '3x4')
        ? _.keys(DEFAULT_VALUES_3x4)
        : null,
      showGlossyInfo: (_.includes(GLOSS_ONLY_SIZES, printSize.size))
        ? true
        : false,                
      showMatteInfo: (_.includes(MATTE_ONLY_SIZES, printSize.size)) // 2022.11.28
        ? true
        : false,
      show34SizeInfo: (printSize.size === '3x4')
        ? true
        : false,
    }));
  };

  handleOnChangeValue = (key) => (value) => {
    let app = this;
    let prev_value = this.state.options[key];

    if (key === 'printQuantity') // 2020.08.13 수량은 최소 1 이상이며, 소수점 제거
      value = Math.max(1, Math.floor(value));

    //console.log(value);

    this.setState(state => ({
      options: {
        ...state.options,
        [key]: value,
      },
    }));

    const { setPrintOptions } = this.props;

    let photos = this.props.photos;
    let title = "";
    let message = "모든 사진에 전체적용 하시겠습니까?";
    let is_confirm_ok = false;
    let is_only_gloss = photos.map(photo => photo.getPrintOption()).some(printOption => _.includes(GLOSS_ONLY_SIZES, printOption.size));
    let is_only_matte = photos.map(photo => photo.getPrintOption()).some(printOption => _.includes(MATTE_ONLY_SIZES, printOption.size)); // 2022.1128

    //console.log('GLOSS_ONLY_SIZES 111', is_only_gloss);
    //console.log('MATTE_ONLY_SIZES 222', is_only_matte);

    //console.log(value);
    if (key === 'paper') {
      title = "모든사진적용 - 인화지";
      title = value === PaperTypes.GLOSS ? '모든사진적용 - 인화지 (유광)' : '모든사진적용 - 인화지 (무광)';
    } else if (key === 'border') {
      title = "모든사진적용 - 테두리";
      title = value === BorderTypes.NONE ? '모든사진적용 - 테두리 (무테)' : '모든사진적용 - 테두리 (유테)';
      message = value === BorderTypes.NONE ? '테두리를 삭제 할까요?' : '모든사진에 흰색 테두리(유테)를 넣을까요?';
    } else if (key === 'trimming') {
      title = "모든사진적용 - 트리밍";
      title = value === TrimmingTypes.PAPER_FULL ? '모든사진적용 - 트리밍 (인화지풀)' : '모든사진적용 - 트리밍 (이미지풀)';
      message = value === TrimmingTypes.PAPER_FULL ? 
        `모든 사진을 인화지풀로 적용할까요?

        인화지풀은 사진이 잘릴 수 있으며, 여백없이 인화됩니다.
        사진잘림은 이미지와 인화지의 비율이 서로 다를 경우
        나타나며, 미리보기에서 잘리는 부분을 확인해 주십시오.
        ` 
        : 
        `모든 사진을 이미지풀로 적용할까요?

        이미지풀은 사진의 잘림 없이 인화가 가능하지만, 여백이 생깁니다.
        여백은 미리보기로 확인해 주십시오.
        `;
    } else if (key === 'autoAdjustment') {
      title = "모든사진적용 - 사진밝기보정";
      title = value === true ? '사진밝기보정 (신청)' : '사진밝기보정 (안함)';
      message = value === true ?
      `모든 사진에 사진밝기보정을 적용할까요?`
      :
      `모든 사진에 사진밝기보정을 취소할까요?`;
    } else if (key === 'insertDate') {
      title = "모든사진적용 - 날짜입력";
      title = value === true ? '날짜입력 (신청)' : '날짜입력 (안함)';
      message = value === true ? 
      `모든 사진에 촬영일을 넣을까요 ?
      촬영일 정보가 없는 사진은 촬영일자를 넣을수 없습니다.
      ` 
      : 
      `모든 사진에 적용한 촬영일자를 삭제 할까요?
      `;
    } else if (key === 'printQuantity') {
      title = "모든사진적용 - 인화수량";

      setPrintOptions({
        options: {
          [key]: value,
        },
        photos,
      });
      return;
    }
    
    // 2020.08.05 옵션 선택시 곧바로 전체적용 UI 표시
    createConfirmModal(
      message,
      title,
      {
        onClickConfirm: () => {
          //console.log('ok 적용하자');
          is_confirm_ok = true;

          if (key === 'paper') { //title = "인화지";
            if (
              is_only_gloss
            ) {
              let message = GLOSS_ONLY_SIZES.toString()+' 사이즈는\n모두 유광으로만 인화됩니다.\n'; // 2022.11.28

              createMessageModal([
                message,
                //'일부사이즈만 무광인화를 원하시면 별도로 주문을 진행해주세요.',
              ].join('\n'));
              setPrintOptions({
                options: {
                  paper: PaperTypes.GLOSS,
                },
                photos,
              });
              this.setState(state => ({
                options: {
                  ...state.options,
                  paper: PaperTypes.GLOSS,
                },
              }));
            } else if (
              is_only_matte
              ) {
                let message = MATTE_ONLY_SIZES.toString()+' 사이즈는\n모두 무광으로만 인화됩니다.\n'; // 2022.11.28
  
                createMessageModal([
                  message,
                  //'일부사이즈만 무광인화를 원하시면 별도로 주문을 진행해주세요.',
                ].join('\n'));
                setPrintOptions({
                  options: {
                    paper: PaperTypes.MATTE, // 2022.11.28
                  },
                  photos,
                });
                this.setState(state => ({
                  options: {
                    ...state.options,
                    paper: PaperTypes.MATTE, // 2022.1128
                  },
                }));
              
            } else {
              setPrintOptions({
                options: {
                  paper: value,
                },
                photos,
              });
            }          
          }
          else if (key === 'border') { //title = "테두리";
            setPrintOptions({
              options: {
                [key]: value,
              },
              photos,
            });
          }
          else if (key === 'trimming') { //title = "트리밍";
            setPrintOptions({
              options: {
                [key]: value,
              },
              photos,
            });
          }
          else if (key === 'autoAdjustment') { //title = "사진밝기보정";
            setPrintOptions({
              options: {
                [key]: value,
              },
              photos,
            });
          }
          else if (key === 'insertDate') { //title = "날짜입력";
            setPrintOptions({
              options: {
                [key]: value,
              },
              photos,
            });
          }
          else if (key === 'printQuantity') { //title = "인화수량";
            setPrintOptions({
              options: {
                [key]: Math.max(1, value),
              },
              photos,
            });
          }
        },
        onClose: () => {
          if (!is_confirm_ok) {
            //* 2020.08.04 이전옵션으로 되돌리기
            setTimeout(() => {
              app.setState(state => ({
                options: {
                  ...state.options,
                  [key]: prev_value,
                },
              }));
                
            }, 100);
            //*/
          }
          return;
        }
      }
    );

    return;


    if (key === 'paper' && value === PaperTypes.MATTE)
      this.handleClickShowGlossyPrintSizeInfoImpl();
    else { 
      // 2020.07.30 전체옵션바에서 옵션선택시 안내문구 추가
      if (key === 'paper' || key === 'border' || key === 'trimming') {
        createMessageModal([
          '옵션변경을 원하시면 "모든사진에 적용"을 눌러주세요.', 
        ]);
      }
    }
  };

  handleClickApplyImpl = (photos = this.props.photos) => {
    const { setPrintOptions } = this.props;
    const { options: { printSize, ...otherOptions } } = this.state;

    //console.log(otherOptions.paper)
    // NOTE: '무광' 선택되었고, 특정 사진 사이즈가 선택되었을 경우 오류 메시지 표시 후 강제 유광 처리.
    if (
      otherOptions.paper === PaperTypes.MATTE &&
      (
        photos
          .map(photo => photo.getPrintOption())
          .some(printOption => _.includes(GLOSS_ONLY_SIZES, printOption.size)) ||
        _.includes(GLOSS_ONLY_SIZES, printSize.size)
        )
    ) {
      //let message = getSafePFYoonMode() ? '8x10 ~ 12x17 사이즈는 유광으로만 인화됩니다.\n' : 'A4,8x10,10x13,10x15,11x14,12x17 사이즈는 유광으로만 인화됩니다.\n';
      //let message = getSafePFYoonMode() ? '8x10 ~ 12x17 사이즈는 유광으로만 인화됩니다.\n' : '8x10,12x17 사이즈는 유광으로만 인화됩니다.\nA4,10x13,10x15,11x14 사이즈는 무광으로만 인화됩니다.\n'; // 2022.11.17
      let message = GLOSS_ONLY_SIZES.toString()+' 사이즈는\n모두 유광으로만 인화됩니다.\n'; // 2022.11.28
      createMessageModal([
        message,
        '일부사이즈만 무광인화를 원하시면 별도로 주문을 진행해주세요.',
      ].join('\n'));
      setPrintOptions({
        options: {
          ...otherOptions,
          paper: PaperTypes.GLOSS,
          size: printSize.size,
        },
        photos,
      });
      this.setState(state => ({
        options: {
          ...state.options,
          paper: PaperTypes.GLOSS,
        },
      }));
      
    } else if (
        otherOptions.paper === PaperTypes.GLOSS &&
        (
          photos
            .map(photo => photo.getPrintOption())
            .some(printOption => _.includes(MATTE_ONLY_SIZES, printOption.size)) || // 2022.11.28
          _.includes(MATTE_ONLY_SIZES, printSize.size)
          )
      ) {
        let message = MATTE_ONLY_SIZES.toString()+' 사이즈는\n모두 무광으로만 인화됩니다.\n'; // 2022.11.28
        createMessageModal([
          message,
          '일부사이즈만 무광인화를 원하시면 별도로 주문을 진행해주세요.',
        ].join('\n'));
        setPrintOptions({
          options: {
            ...otherOptions,
            paper: PaperTypes.MATTE,
            size: printSize.size,
          },
          photos,
        });
        this.setState(state => ({
          options: {
            ...state.options,
            paper: PaperTypes.MATTE,
          },
        }));
    } else {
      setPrintOptions({
        options: {
          ...otherOptions,
          size: printSize.size,
        },
        photos,
      });
    }
  };

  handleClickApplyAll = () => { // 모든 사진에 적용
    this.handleClickApplyImpl();
  };

  handleClickShowGlossyPrintSizeInfoImpl = () => {
    const { options: { printSize } } = this.state;

    // 2020.01.22 8x10 이상 사이즈 선택시 알림표시.
    if (
        //_.includes(GLOSS_ONLY_SIZES, printSize.size)
        _.includes(GLOSS_ONLY_SIZES, printSize.size) || _.includes(MATTE_ONLY_SIZES, printSize.size) // 2022.11.28
    ) {
      //let message = getSafePFYoonMode() ? '8x10 ~ 12x17 사이즈는 유광으로만 인화됩니다.\n' : 'A4,8x10,10x13,10x15,11x14,12x17 사이즈는 유광으로만 인화됩니다.\n';
      //let message = getSafePFYoonMode() ? '8x10 ~ 12x17 사이즈는 유광으로만 인화됩니다.\n' : '8x10,12x17 사이즈는 유광으로만 인화됩니다.\nA4,10x13,10x15,11x14 사이즈는 무광으로만 인화됩니다.\n'; // 2022.11.17
      let message = GLOSS_ONLY_SIZES.toString()+' 사이즈는\n모두 유광으로만 인화됩니다.\n'; // 2022.11.28
      if (_.includes(MATTE_ONLY_SIZES, printSize.size))
        message = MATTE_ONLY_SIZES.toString()+' 사이즈는\n모두 무광으로만 인화됩니다.\n'; // 2022.11.28
      createMessageModal([
        message,
        '옵션변경을 원하시면 "모든사진에 적용"을 눌러주세요.' // 2020.07.30 전체옵션바에서 옵션선택시 안내문구 추가
      ]);
    } else { // 2020.07.30 전체옵션바에서 옵션선택시 안내문구 추가
      createMessageModal([
        '옵션변경을 원하시면 "모든사진에 적용"을 눌러주세요.',
      ]);
    } 
  };

  handleClickShowGlossyPrintSizeInfo = () => {
    this.handleClickShowGlossyPrintSizeInfoImpl();
  };

  handleClickShow34SizeSizeInfo = () => {
    createMessageModal([
      '3x4 사이즈는 유테, 이미지풀로만 인화됩니다.',
    ]);
  };

  handleClickApplySelected = () => {
    const { photos, selectedPhotoUUIDs } = this.props;
    this.handleClickApplyImpl(photos.filter(photo => selectedPhotoUUIDs.includes(photo.uuid)))
  };

  render() {
    const { photos, selectedPhotoUUIDs, isAllPhotoSelected } = this.props;
    const { options, disables, showGlossyInfo, showMatteInfo, show34SizeInfo } = this.state;

    return (
      <div
        ref={this.optionBarRef}
        className={styles.OptionBar}
      >
        <div className={styles.Content}>
          <PrintSizeSelect
            // shortControlText={isTablet()}
            controlClassName={styles.SizeSelectorControl}
            selectedPrintSize={options.printSize}
            onChangePrintSize={this.handleChangePrintSize}
          />

          {
            showGlossyInfo || showMatteInfo
            ? <StyledGlossyPrintSizeIcon 
                onClick={this.handleClickShowGlossyPrintSizeInfo}
              /> 
            : null
          }
          {
            show34SizeInfo
            ? <StyledGlossyPrintSizeIcon 
            onClick={this.handleClickShow34SizeSizeInfo}
              /> 
            : null
          }

          <Divider className={styles.Divider} />

          { this.switchOptionSections.map((section, i) => (
            <React.Fragment key={`${section.key}-fr`}>
              { (i !== 0) && (<Divider className={styles.Divider} key={`${section.key}-dv`} />) }
              <SwitchOptionSection
                key={section.key}
                sectionKey={section.key}
                value={_.get(options, section.key, section.defaultValue)}
                disabled={_.includes(disables, section.key)}
                onChange={this.handleOnChangeValue(section.key)}
                show34SizeInfo={show34SizeInfo}
                {...section}
              />
            </React.Fragment>
          )) }

          <Divider className={styles.Divider} />

          { this.checkboxSections.map((section, i) => (
            <React.Fragment key={`${section.key}-fr`}>
              { (i !== 0) && (<Divider className={styles.Divider} key={`${section.key}-dv`} />) }
              <CheckboxSection
                key={section.key}
                sectionKey={section.key}
                checked={_.get(options, section.key, section.defaultValue)}
                disabled={_.includes(disables, section.key)}
                onChange={this.handleOnChangeValue(section.key)}
                {...section}
              />
            </React.Fragment>
          )) }

          <Divider className={styles.Divider} />

          { this.counterSections.map((section, i) => (
            <React.Fragment key={`${section.key}-fr`}>
              { (i !== 0) && (<Divider className={styles.Divider} key={`${section.key}-dv`} />) }
              <CounterSection
                key={section.key}
                sectionKey={section.key}
                value={_.get(options, section.key, section.defaultValue)}
                disabled={_.includes(disables, section.key)}
                onChange={this.handleOnChangeValue(section.key)}
                {...section}
              />
            </React.Fragment>
          )) }
{
 /*   // 2020.08.05 버튼 비활성화

          <button
            className={classNames(styles.ButtonApplyAll, {
              'orange': isAllPhotoSelected,
            })}
            onClick={this.handleClickApplyAll}
            disabled={photos.isEmpty()}
          >
            모든 사진에 적용
          </button>

*/
}          
{
 /*   // 2020.08.03 버튼 비활성화

          <button
            className={classNames(styles.ButtonApplySelected, {
              'orange': !isAllPhotoSelected,
            })}
            onClick={this.handleClickApplySelected}
            disabled={selectedPhotoUUIDs.isEmpty()}
          >
            { `선택한 사진에 적용 (${numeral(selectedPhotoUUIDs.size).format('0,0')})` }
          </button>
*/
}          
        </div>
      </div>
    )
  }
}

OptionBar = connect(state => ({
  photos: PhotoEditorSelector.getSortedPhotos(state),
  printSizes: AppInfoSelector.getPrintSizes(state),
  selectedPhotoUUIDs: PhotoEditorSelector.getSelectedPhotoUUIDs(state),
  isAllPhotoSelected: PhotoEditorSelector.isAllPhotoSelected(state),
}), {
  setPrintOptions: PhotoEditorActions.setPrintOptions,
})(OptionBar);

export default OptionBar
