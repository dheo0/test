import _ from 'lodash';

const types = {
  CLASSIC: 'classic',
  GGOM: 'ggom',
  SPEED: 'speed',
};

export const asArray = () => _.values(types);

export default types
