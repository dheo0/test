import { createSelector } from 'reselect'

const getSortedUploadingFiles = createSelector(
  state => state.PhotoDirectUploadReducer.allUploadFiles,
  state => state.PhotoDirectUploadReducer.uploadMetas,
  state => state.PhotoDirectUploadReducer.uploadErrors,
  state => state.PhotoDirectUploadReducer.deletedFileUUIDs,
  (allUploadFiles, uploadMetas, uploadErrors, deletedFileUUIDs) => (
    allUploadFiles
      .filter((imageUpload) => !deletedFileUUIDs.includes(imageUpload.uuid))
      .map((imageUpload) => {
        const uploadMeta = uploadMetas.find(meta => meta.uuid === imageUpload.uuid);
        const uploadError = uploadErrors.find(error => error.uuid === imageUpload.uuid);
        if (uploadMeta) { imageUpload = imageUpload.releaseLocalImage() }
        return imageUpload
          .setImageMeta(uploadMeta)
          .setError(uploadError);
      })
      .sortBy(imageUpload => -imageUpload.selectedAt)
  )
);

const getUploadEndedFiles = createSelector(
  getSortedUploadingFiles,
  (sortedImageUploads) =>sortedImageUploads.filter(imageUpload => imageUpload.hasCompleted())
);

const getUploadCompletedFiles = createSelector(
  getSortedUploadingFiles,
  (sortedImageUploads) => sortedImageUploads.filter(imageUpload => imageUpload.hasImageMeta())
);

const getMarkedFiles = createSelector(
  getSortedUploadingFiles,
  state => state.PhotoAppenderReducer.markedPhotoUUIDs,
  (availableUploadingFiles, markedPhotoUUIDs) =>
    availableUploadingFiles.filter(imageUpload => markedPhotoUUIDs.includes(imageUpload.uuid))
);

const isAllUploadingFilesSelected = createSelector(
  getUploadCompletedFiles,
  state => state.PhotoAppenderReducer.markedPhotoUUIDs,
  (availableUploadingFiles, markedPhotoUUIDs) =>
    !availableUploadingFiles.isEmpty() &&
    availableUploadingFiles.every(imageUpload => markedPhotoUUIDs.includes(imageUpload.uuid))
);

const getQueue = state => state.PhotoDirectUploadReducer.uploadQueue;

export default {
  getSortedUploadingFiles,
  getUploadEndedFiles,
  getUploadCompletedFiles,
  getMarkedFiles,
  isAllUploadingFilesSelected,
  getQueue,
}
