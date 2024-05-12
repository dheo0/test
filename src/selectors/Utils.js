import Immutable from 'immutable';
import { createSelector } from 'reselect';
import moment from 'moment';
import _ from 'lodash';

import { OrderOptions, GroupOptions } from '../constants/photoGridOptions';

const getGrouped = createSelector(
  (__, ownProps) => _.get(ownProps, 'imageContainers', Immutable.List()),
  (__, ownProps) => _.get(ownProps, 'orderBy', OrderOptions.BY_RECENT_UPLOAD),
  (__, ownProps) => _.get(ownProps, 'groupBy', GroupOptions.BY_DATE),
  (imageContainers, orderBy, groupBy) => imageContainers
    .filter((imageContainer) => (
      _.has(imageContainer, 'selectedAt') &&
      _.has(imageContainer, 'getImageMeta')
    ))
    .groupBy((imageContainer) => {
      const timeValue = (() => {
        if (
          _.has(imageContainer, 'selectedAt') &&
          (orderBy === OrderOptions.BY_RECENT_UPLOAD || orderBy === OrderOptions.BY_OLD_UPLOAD)
        ) {
          return imageContainer.selectedAt / 1000;
        }
        return imageContainer.getImageMeta().dateunix;
      })();
      return moment.unix(timeValue).startOf(groupBy.groupKey).valueOf()
    })
    .sortBy((__, ts) => (
      (orderBy === OrderOptions.BY_OLD_UPLOAD || orderBy === OrderOptions.BY_OLD_DATE) ? ts : -ts
    ))
    .entrySeq()
    .toList()
    .map(([ts, imageContainers]) => ([
      ts,
      imageContainers.sortBy((imageContainer) => {
        switch (orderBy) {
          case OrderOptions.BY_RECENT_UPLOAD:     { return imageContainer.selectedAt }
          case OrderOptions.BY_OLD_UPLOAD:        { return -imageContainer.selectedAt }
          case OrderOptions.BY_RECENT_DATE:       { return imageContainer.getImageMeta().dateunix }
          case OrderOptions.BY_OLD_DATE: default: { return -imageContainer.getImageMeta().dateunix }
        }
      }),
    ])),
);

export default {
  getGrouped,
}
