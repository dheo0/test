import { PaperTypes, BorderTypes, TrimmingTypes, InsertDate } from './printTypes';
import { getSafePFYoonMode } from '../utils/commonUtils';

export default {
  SIZE: {
    key: 'size',
    tooltipKey: 'size',
    defaultValue: getSafePFYoonMode() ? '4x6' : '3x5', // 2020.10.20 팩토리윤 기본 사이즈표시 추가
  },
  PAPER: {
    key: 'paper',
    tooltipKey: 'paper',
    sectionTitle: '인화지',
    defaultValue: PaperTypes.GLOSS,
    negativeOption: {
      key: PaperTypes.MATTE,
      value: '무광',
    },
    positiveOption: {
      key: PaperTypes.GLOSS,
      value: '유광',
    }
  },
  BORDER: {
    key: 'border',
    tooltipKey: 'border',
    sectionTitle: '테두리',
    defaultValue: BorderTypes.NONE,
    negativeOption: {
      key: BorderTypes.NONE,
      value: '무테',
    },
    positiveOption: {
      key: BorderTypes.BORDER,
      value: '유테',
    },
  },
  TRIMMING: {
    key: 'trimming',
    tooltipKey: 'trimming',
    sectionTitle: '트리밍',
    defaultValue: TrimmingTypes.PAPER_FULL,
    negativeOption: {
      key: TrimmingTypes.PAPER_FULL,
      value: '인화지풀',
    },
    positiveOption: {
      key: TrimmingTypes.IMAGE_FULL,
      value: '이미지풀',
    },
  },
  AUTO_ADJUSTMENT: {
    key: 'autoAdjustment',
    tooltipKey: 'autoAdjustment',
    sectionTitle: '밝기 자동보정',
    defaultValue: getSafePFYoonMode() ? false : true, // 2021.11.08
  },
  AUTO_ADJUSTMENT_EACH: {
    key: 'autoAdjustment',
    tooltipKey: 'autoAdjustment',
    sectionTitle: '사진밝기 자동보정',
    defaultValue: getSafePFYoonMode() ? false : true, // 2021.11.08
  },
  INSERT_DATE: {
    key: 'insertDate',
    tooltipKey: 'insertDate',
    sectionTitle: '날짜입력',
    defaultValue: false,
  },
  INSERT_DATE_MANUAL: {
    key: 'insertDateManual',
    sectionTitle: '직접 날짜입력',
    defaultValue: InsertDate.AUTO,
    negativeOption: {
      key: InsertDate.AUTO,
      value: '자동입력',
    },
    positiveOption: {
      key: InsertDate.MANUAL,
      value: '직접입력',
    },
  },
  PRINT_QUANTITY: {
    key: 'printQuantity',
    sectionTitle: '인화수량',
    defaultValue: 1,
  },
};
