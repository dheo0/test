import React, { PureComponent, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import classNames from 'classnames';
import moment from 'moment';
import { flow, toPairs, map, flatten, orderBy } from 'lodash/fp';
import _ from 'lodash';
import styled from 'styled-components';

import PrintOptionFields from '../../constants/printOptionFields';
import { InsertDate } from '../../constants/printTypes';
import { pixelToNumber } from '../../utils/styleUtils';
import Photo from '../../models/Photo';
import StyleVariables from '../../resources/styles/variables.scss';
import styles from './PrintOptionPanel.module.scss';

const SWITCH_FIELD = 'switch';
const CHECK_FIELD = 'check';
const MARGIN_BETWEEN_CELL_AND_PANEL = 6;

const StyledCloseButton = styled.div`
  background-image: url('images/ic_close.png') !important;

  &:hover {
    background-image: url('images/ic_close_over.png') !important;
  }
`;

const StyledCheckOptionsWrapperRowContent = styled.div`
  &::after {
    background-image: url('images/ic_checkbox.png');
  }

  &:hover {
    &::after {
      background-image: url('images/ic_checkbox_over.png');
    }
  }
`;

const StyledCheckOptionsWrapperRow = styled.div`
  &[data-checked="true"] {
    & > div {
      &::after {
        background-image: url('images/ic_checkbox_checked.png');
      }

      &:hover {
        &::after {
          background-image: url('images/ic_checkbox_checked.png');
        }
      }
    }
  }
`;

function SwitchField({ field, value, disabled, onChange }) {
  return (
    <div
      className={classNames(styles.Row, styles.SwitchField, {
        [styles.disabled]: disabled,
      })}
      data-checked={value === field.positiveOption.key}
    >
      <div onClick={() => onChange(field.negativeOption.key)}>
        { field.negativeOption.value }
      </div>
      <div onClick={() => onChange(field.positiveOption.key)}>
        { field.positiveOption.value }
      </div>
    </div>
  );
}

function CheckField({ field, value, disabled, onChange }) {
  return (
    <StyledCheckOptionsWrapperRow
      className={classNames(styles.Row, styles.CheckField, {
        [styles.disabled]: disabled,
      })}
      data-checked={value === true}
      onClick={() => onChange(!value)}
    >
      <StyledCheckOptionsWrapperRowContent>
        { field.sectionTitle }
      </StyledCheckOptionsWrapperRowContent>
    </StyledCheckOptionsWrapperRow>
  );
}

function DateField({ photo, onChange }) {
  const disabled = !photo.getPrintOption().insertDate ||
    photo.getPrintOption().insertDateManual === InsertDate.AUTO;
  const autoDate = moment.unix(photo.time);

  const manualDateYear = photo.getPrintOption().manualDateYear;
  const manualDateMonth = photo.getPrintOption().manualDateMonth;
  const manualDateDate = photo.getPrintOption().manualDateDate;

  const [year, setYear] = useState(manualDateYear || '');
  const [month, setMonth] = useState(manualDateMonth || '');
  const [date, setDate] = useState(manualDateDate || '');

  useEffect(() => {
    if (manualDateYear !== year) { setYear(manualDateYear || '') }
    if (manualDateMonth !== month) { setMonth(manualDateMonth || '') }
    if (manualDateDate !== date) { setDate(manualDateDate || '') }
  }, [
    manualDateYear, manualDateMonth, manualDateDate,
    year, month, date, setYear, setMonth, setDate,
  ]);

  const handleChange = useCallback((field, length = 2) => (event) => {
    const value = Number(_.truncate(event.target.value, { length, omission: '' }));
    if (!_.isNaN(value)) onChange(field, value);
  }, []);

  return (
    <div
      className={classNames(styles.Row, styles.DateField)}
    >
      <input
        type="number"
        disabled={disabled}
        maxLength="4"
        value={year}
        placeholder={autoDate.format('YYYY')}
        onChange={handleChange('manualDateYear', 4)}
        onKeyPress={e => { if (e.key === 'Enter') e.target.blur() }}
      />년
      <input
        type="number"
        disabled={disabled}
        maxLength="2"
        value={month}
        placeholder={autoDate.format('MM')}
        onChange={handleChange('manualDateMonth')}
        onKeyPress={e => { if (e.key === 'Enter') e.target.blur() }}
      />월
      <input
        type="number"
        disabled={disabled}
        maxLength="2"
        value={date}
        placeholder={autoDate.format('DD')}
        onChange={handleChange('manualDateDate')}
        onKeyPress={e => { if (e.key === 'Enter') e.target.blur() }}
      />일
    </div>
  )
}

class PrintOptionPanel extends PureComponent {
  static propTypes = {
    photo: PropTypes.instanceOf(Photo),
    parentRef: PropTypes.object,
    target: PropTypes.instanceOf(Element),
    onClickBackdrop: PropTypes.func,
    onClickClose: PropTypes.func,
    onChangeOption: PropTypes.func,
  };

  static defaultProps = {
    photo: null,
    parentRef: null,
    target: null,
    onClickBackdrop: _.noop,
    onClickClose: _.noop,
    onChangeOption: _.noop,
  };

  static optionFields = flow(
    toPairs,
    map(([type, fields]) => fields.map(field => ({ type, ...field }))),
    flatten,
    orderBy(['order'], ['asc']),
  )({
    [SWITCH_FIELD]: [
      /*{ ...PrintOptionFields.PAPER, order: 0 }, */  /* 2019.09.27 옵션패널에서 유/무광 옵션 UI 제거 */
      { ...PrintOptionFields.BORDER, order: 1 },
      { ...PrintOptionFields.TRIMMING, order: 2 },
      { ...PrintOptionFields.INSERT_DATE_MANUAL, order: 5 },
      ],
    [CHECK_FIELD]: [
      { ...PrintOptionFields.AUTO_ADJUSTMENT_EACH, order: 3 },
      { ...PrintOptionFields.INSERT_DATE, order: 4, showHelp: true },
    ],
  });

  // NOTE: targetBoundingRect, parentBoundingRect 오브젝트이므로 메모이제이션이 되지 않음.
  // 따라서 매번 새로 계산 되고 있음.
  computeStyle = (targetBoundingRect, targetOffsetTop, parentBoundingRect) => {
    if (targetBoundingRect && parentBoundingRect) {
      const { left, right } = targetBoundingRect;
      const { width: parentWidth } = parentBoundingRect;
      const panelWidth = Math.abs(pixelToNumber(StyleVariables.PRINT_OPTION_PANEL_WIDTH));
      const top = targetOffsetTop - Math.abs(pixelToNumber(StyleVariables.PHOTO_GRID_CELL_TRANSLATE_Y));

      if ((right + panelWidth) >= parentWidth) {
        return {
          left: left - MARGIN_BETWEEN_CELL_AND_PANEL - panelWidth,
          top,
        };
      }

      return {
        left: right + MARGIN_BETWEEN_CELL_AND_PANEL,
        top,
      };
    }
    return null;
  };

  memoizeComputeStyle = memoizeOne(this.computeStyle);

  handleClickBackdrop = () => {};

  handleChangePrintSize = (printSize) => {
    const { photo, onChangeOption } = this.props;
    onChangeOption(photo, 'size', printSize.size);
  };

  handleChangeOption = (field) => (value) => {
    const { photo, onChangeOption } = this.props;
    onChangeOption(photo, field.key, value);
  };

  renderOptionField = (field) => {
    const { photo, onChangeOption } = this.props;
    const printOption = photo.getPrintOption();
    const value = _.get(printOption, field.key);

    switch (field.type) {
      case SWITCH_FIELD: {
        return (
          <SwitchField
            key={field.key}
            field={field}
            value={value}
            disabled={!printOption.canUpdate(field.key)}
            onChange={(value) => onChangeOption(photo, field.key, value)}
          />
        );
      }

      case CHECK_FIELD: {
        return (
          <CheckField
            key={field.key}
            field={field}
            value={value}
            disabled={!printOption.canUpdate(field.key)}
            onChange={(value) => onChangeOption(photo, field.key, value)}
          />
        );
      }

      default:
        return null;
    }
  };

  renderOptions() {
    const { photo, onChangeOption } = this.props;

    return (
      <div className={styles.OptionsWrapper}>
        { PrintOptionPanel.optionFields.map(this.renderOptionField) }

        <DateField
          photo={photo}
          onChange={(fieldKey, value) => onChangeOption(photo, fieldKey, value)}
        />
      </div>
    );
  }

  render() {
    const { photo, parentRef, target, onClickClose, onClickBackdrop } = this.props;

    const shouldRender = (photo && target);
    const targetBoundingRect = target && target.getBoundingClientRect();
    const targetOffsetTop = target && target.offsetTop;
    const parentBoundingRect = parentRef && parentRef.getBoundingClientRect();
    const style = this.memoizeComputeStyle(targetBoundingRect, targetOffsetTop, parentBoundingRect);

    return shouldRender && (
      <>
        <div
          className={styles.Backdrop}
          onClick={onClickBackdrop}
        />

        <div
          className={classNames(styles.PrintOptionPanel)}
          style={style}
        >
          <div className={styles.CloseWrapper}>
            <StyledCloseButton
              className={styles.CloseButton}
              onClick={onClickClose}
            />
          </div>

          { this.renderOptions() }
        </div>
      </>
    );
  }
}

export default PrintOptionPanel
