import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import './Divider.scss';

const Divider = ({ className, direction, size }) => (
  <div
    className={classNames('Divider', {
      'row': direction === 'row',
      'column': direction === 'column',
    }, className)}
    style={{
      ...(() => {
        if (size) {
          if (direction === 'row') {
            return { height: size };
          }
          return { width: size };
        }
      })()
    }}
  />
);

Divider.propTypes = {
  className: PropTypes.string,
  direction: PropTypes.oneOf(['row', 'column']),
  size: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]),
};

Divider.defaultProps = {
  className: null,
  direction: 'row',
  size: null,
};

export default Divider
