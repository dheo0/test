import React, { useMemo, useCallback } from 'react';
import moment from 'moment';
import _ from 'lodash';

import printOptionFields from '../../constants/printOptionFields';
import Checkbox from '../Checkbox';
import styles from './OptionHelpModal.module.scss';

const PaperImage = 'images/layer-info-coating.png';
const BorderImage = 'images/layer-info-outline.png';
const TrimmingImage = 'images/layer-info-trmming.png';
const TrimmingImage34 = 'images/layer-info-trmming34.png';
const AutoAdjustmentImage = 'images/layer-info-bright.png';
const InsertDateImage = 'images/layer-info-date.png';

const typeContents = {
  paper: {
    key: printOptionFields.PAPER.key,
    img: PaperImage,
  },
  border: {
    key: printOptionFields.BORDER.key,
    img: BorderImage,
  },
  trimming: {
    key: printOptionFields.TRIMMING.key,
    img: TrimmingImage,
  },
  trimming34: {
    key: printOptionFields.TRIMMING.key,
    img: TrimmingImage34,
  },
  autoAdjustment: {
    key: printOptionFields.AUTO_ADJUSTMENT.key,
    img: AutoAdjustmentImage,
  },
  insertDate: {
    key: printOptionFields.INSERT_DATE.key,
    img: InsertDateImage,
  },
};

function OptionHelpModal({
  target,
  type,
  show34SizeInfo,
}) {
  //console.log(target, type, show34SizeInfo);
  const [typeContent, storageKey] = useMemo(() => {
    if (type) {
      const content = typeContents[type=== 'trimming' && show34SizeInfo ? type+'34' : type]; // 2020.07.09 3x4 사이즈는 트리밍 도움말 따로 표시
      return [content, `guide-modal-${content.key}`]
    }
    return []
  }, []);

  const styleObj = useMemo(() => {
    if (target && type) {
      const typeContent = typeContents[type];

      if (typeContent) {
        const rect = target.getBoundingClientRect();
        return {
          top: rect.top + rect.height,
          left: rect.left - 42,
        };
      }
    }
    return null;
  }, [target, type]);

  const handleCheckChange = useCallback((checked) => {
    if (checked) {
      localStorage.setItem(storageKey, `${moment().add(24, 'hours').valueOf()}`);
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  const shouldDisplay = (() => {
    const va = localStorage.getItem(storageKey);
    return typeContent && (_.isEmpty(va) || moment().isAfter(moment(parseInt(va))));
  })();

  return (shouldDisplay && (
    <div
      className={styles.OptionHelpModal}
      style={styleObj}
    >
      <img src={typeContent.img} alt="Guide" />

      <Checkbox
        className={styles.Checkbox}
        onChange={handleCheckChange}
      />
    </div>
  )) || null;
}

export default OptionHelpModal
