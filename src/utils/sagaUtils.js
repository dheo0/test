import _ from 'lodash';
import UUID from 'uuid';

const LARGE = 'large';
const MEDIUM = 'medium';
const SMALL = 'small';
const TINY = 'tiny';

const UPLOAD_GROUP_SIZES = _.toPairs({
  [LARGE]:  1024 * 1024 * 8,
  [MEDIUM]: 1024 * 1024 * 4,
  [SMALL]:  1024 * 1024 * 2,
});

export function groupFilesBySize(files) {
  const fileWithSelectedTime = _.map(files, (file, i) => ([
    file,
    new Date().getTime() + i,
    UUID.v4(),
  ]));
  const groupedBySize = _.groupBy(fileWithSelectedTime, ([file]) => {
    const groupSize = _.find(UPLOAD_GROUP_SIZES, ([, size]) => file.size > size);
    return (groupSize && groupSize[0]) || TINY
  });

  return _.concat(
    _.chunk(groupedBySize[TINY],    2),
    _.chunk(groupedBySize[SMALL],   4),
    _.chunk(groupedBySize[MEDIUM],  2),
    _.chunk(groupedBySize[LARGE],   1),
  );
}
