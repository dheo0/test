import React, { useEffect } from 'react';
import ReactTooltip from 'react-tooltip';

import styles from './Tooltip.module.scss'

const defaultProps = {
  className: '',
  placement: 'bottom',
  content: null,
  delayShow: 500,
  delayHide: 0,
  isCapture: false,
  offset: null,
  disabled: null,
};

function Tooltip(props) {
  const { className, tooltip, placement, delayShow, delayHide, isCapture, offset, disabled, children } = props;

  useEffect(() => {
    ReactTooltip.rebuild();
  });

  return (
    <div
      className={className}
      data-class={styles.Tooltip}
      data-tip={tooltip}
      data-place={placement}
      data-delay-show={delayShow}
      data-delay-hide={delayHide}
      data-iscapture={isCapture}
      data-offset={JSON.stringify(offset)}
      data-tip-disable={disabled}
    >
      { children }
    </div>
  )
}

Tooltip.defaultProps = defaultProps;

export default Tooltip
