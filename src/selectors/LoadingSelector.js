import { createSelector } from 'reselect'

const isFetchingEssentials = createSelector(
  state => state.AppInfoReducer.isFetchingPrintSizeInfo,
  state => state.AppInfoReducer.isFetchingUploadingServerUrl,
  (...args) => args.reduce((ret, isFetching) => ret || isFetching, false)
);

export default {
  isFetchingEssentials,
}
