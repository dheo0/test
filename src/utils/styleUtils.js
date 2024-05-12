import _ from 'lodash';
import numeral from 'numeral';

export const getZoomClassNameByRatio = (zoomRatio) =>
  (!_.isNil(zoomRatio) && _.isNumber(zoomRatio))
    ? `z${numeral(zoomRatio).format('0.0').replace('.', '')}`
    : '';

export const styleObjectToString = (object) =>
  _.toPairs(object)
    .map(([key, value]) => ([_.kebabCase(key), value]))
    .map(([key, value]) => `${key}: ${value};`)
    .join(' ');

export const pixelToNumber = (px) => Number(_.replace(px, 'px', ''));
