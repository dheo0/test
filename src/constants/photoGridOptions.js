export const SizeOptions = {
  NORMAL: 'normal',
  SMALLER: 'smaller',
};

export const OrderOptions = {
  BY_RECENT_UPLOAD: {
    key: 'by_recent_upload',
    value: '최근 업로드 순',
  },
  BY_OLD_UPLOAD: {
    key: 'by_old_upload',
    value: '오래된 업로드 순',
  },
  BY_RECENT_DATE: {
    key: 'by_recent_date',
    value: '최근 촬영일 순',
  },
  BY_OLD_DATE: {
    key: 'by_ole_date',
    value: '오래된 촬영일 순',
  },
};

export const GroupOptions = {
  BY_DATE: {
    key: 'by_date',
    value: '일별',
    groupKey: 'day',
    groupFormat: 'YYYY[년] MM[월] DD[일]',
  },
  BY_MONTH: {
    key: 'by_month',
    value: '월별',
    groupKey: 'month',
    groupFormat: 'YYYY[년] MM[월]',
  },
  BY_YEAR: {
    key: 'by_year',
    value: '연도별',
    groupKey: 'year',
    groupFormat: 'YYYY[년]',
  },
};

export const GridSize = {
  NORMAL: 'normal',
  SMALLER: 'smaller',
};

export const PartitionOptions = {
  NONE: -1,
  NORMAL: 2,
  SMALLER: 3,
};
