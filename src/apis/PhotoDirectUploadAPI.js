import _ from 'lodash';
import client from '../utils/client';

export function uploadBulkImageFiles(uploadingServerUrl, userid, files, uploadUUIDs) {
  const formData = new FormData();
  formData.append('userid', userid);
  _.forEach(uploadUUIDs, uploadUUID => formData.append('uuid[]', uploadUUID)); // 2020.06.24 업로드시 uuid 추가   "a30e582b-39a2-438f-ad7a-2eb7e67ca015"
  _.forEach(files, file => formData.append('multi_file[]', file));

  return client.bulkUploadWithoutErrorHandling('', formData, {
    baseURL: uploadingServerUrl,
    timeout: 60 * 1000,
  })
}
