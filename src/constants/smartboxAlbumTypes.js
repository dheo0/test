const albumTypes = {
  ALL_PHOTOS: 'allphoto',
  TAG: 'tag',
  PEOPLE: 'people',
  PLACE: 'place',
  ALBUM: 'album',
  FAVORITE: 'favorite',
};

export const ReservedTypes = [
  albumTypes.ALL_PHOTOS,
  albumTypes.TAG,
  albumTypes.PEOPLE,
  albumTypes.PLACE,
  albumTypes.FAVORITE,
];

export const AlbumTypeNames = {
  [albumTypes.ALL_PHOTOS]: '전체 사진',
  [albumTypes.TAG]: '태그',
  [albumTypes.PEOPLE]: '인물',
  [albumTypes.PLACE]: '장소',
  [albumTypes.FAVORITE]: '즐겨찾기',
};

export default albumTypes
