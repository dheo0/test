import client from '../utils/client';
import { getSafeUserId } from '../utils/commonUtils';
import AlbumTypes from '../constants/smartboxAlbumTypes';
import _ from 'lodash';

export function getSmartboxAgreementState(userid = getSafeUserId()) {
  return client.get('smartbox/appapi/cloud_check.asp', { userid, act: 'infoview' });
}

export function updateSmartboxAgreementState(userid = getSafeUserId()) {
  return client.get('smartbox/appapi/cloud_check.asp', { userid, act: 'infoproc' });
}

export function getSmartboxEndpoints() {
  return client.get('smartbox/appapi/uploadinfo.asp');
  //return client.get('smartbox/appapi/uploadinfo_gcs.asp'); // 2021.10.18 gcs
}

export function getSmartboxPhotos(
  listingServerUrl,
  userid = getSafeUserId(),
  type = AlbumTypes.ALL_PHOTOS,
  code = null,
  offset = 1,
  limit = 200,
) {
  
  //console.log("getSmartboxPhotos", listingServerUrl, userid, type, offset, limit);

  return client.get('', {
    userid,
    type,
    code,
    offset,
    offsetsize: limit,
  }, {
    baseURL: listingServerUrl,
    timeout: 10 * 1000,
  });
}

export function uploadBulkImageFiles(uploadingServerUrl, userid = getSafeUserId(), files, uploadUUIDs) {
  const formData = new FormData();
  formData.append('userid', userid);
  _.forEach(uploadUUIDs, uploadUUID => formData.append('uuid[]', uploadUUID)); // 2020.06.24 업로드시 uuid 추가   "a30e582b-39a2-438f-ad7a-2eb7e67ca015"
  _.forEach(files, file => formData.append('multi_file[]', file)); 

  //console.log("uploadBulkImageFiles", uploadingServerUrl);
  return client.bulkUploadWithoutErrorHandling('', formData, {
    baseURL: uploadingServerUrl,
    timeout: 60 * 1000,
  })
}

/* Albums */

export function getSmartboxAlbums(listingServerUrl, userid = getSafeUserId()) {
  return client.get('', {
    userid,
    type: 'album_list',
  }, {
    baseURL: listingServerUrl,
    timeout: 10 * 1000,
  });
}

export function addToNewAlbum(userid = getSafeUserId(), idxs = []) {
  return client.get('smartbox/appapi/list.asp', {
    mc: 'newalbum_add',
    chk_val: `${userid}/${idxs.join(',')}`,
  });
}

export function addToAlbum(userid = getSafeUserId(), albumCode, idxs = []) {
  return client.get('smartbox/appapi/list.asp', {
    mc: 'insert_albumimg',
    chk_val: `${userid}/${albumCode}/${idxs.join(',')}`,
  });
}

export function addAlbum(userid = getSafeUserId(), name) {
  return client.get('smartbox/appapi/list.asp', {
    mc: 'album_add',
    chk_val: `${userid}/${name}`,
  });
}

/* ETC */

export function addFavorites(idx) {
  return client.get('smartbox/appapi/list.asp', {
    mc: 'img_fav',
    chk_val: idx,
  });
}

export function deleteFavorites(idx) {
  return client.get('smartbox/appapi/list.asp', {
    mc: 'img_delfav',
    chk_val: idx,
  });
}

export function deletePhotos(userid = getSafeUserId(), idx) {
  return client.get('smartbox/appapi/list.asp', {
    mc: 'delete_img',
    chk_val: `${userid}/${idx}`,
  });
}

export function addTags(userid = getSafeUserId(), idx, tag) {
  return client.get('smartbox/appapi/list.asp', {
    mc: 'insert_tag',
    chk_val: `${userid}/${idx}/${tag}`,
  });
}
