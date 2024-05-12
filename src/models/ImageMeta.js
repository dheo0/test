import Immutable from 'immutable';

const ImageMetaRecord = Immutable.Record({
  uuid: null,
  idx: null,
  ts: 0,

  cmyk: null,
  jpg: null,
  server: null,
  url_domain: null,
  url_gcs_domain: null, // 2021.07.02 GCP
  url_path: null,
  url_file: null,
  url_edit: null,
  url_thumb: null,
  url_ori: null,
  img_width: null,
  img_height: null,
  date: null,
  dateunix: null,
  datekr: null,
  datebool: false,
  dpi: null,
  orientation: null,
  fnumer: null,
  shutterspeed: null,
  iso: null,
  facecount: null,
  faceoutbounds: null,
  uploadFav: null,
  createdate: 0, // 2021.07.02 GCP
  seq_index: 0, // 2024.01.03 사진업로드 순서위한 순서 값
});

class ImageMeta extends ImageMetaRecord {
  constructor(args = {}) {
    super({ ...args });
  }

  // noinspection JSUnusedGlobalSymbols
  equals(other) {
    if (other && Immutable.isRecord(other) && other instanceof ImageMeta) {
      return this.uuid === other.get('uuid');
    }
    return false;
  }

  // noinspection JSUnusedGlobalSymbols
  hashCode() {
    let h;
    for(let i = 0; i < this.uuid.length; i++)
      h = Math.imul(31, h) + this.uuid.charCodeAt(i) | 0;
    return h;
  }
 
  getThumbnailUrl() { // 썸네일 경로
    // 2021.07.02 GCP
    // ex) createdate 기준 24시간이내 -> photo
    //                     24시간이후 -> photo_gcs
    // 1일 => 60(1분)x60(1시간)x24 => 86,400 초
    const condition_time = 60*60*24; // 하루 조건 시간
    const now_time = Math.floor(new Date().getTime() / 1000); // unix time stamp

    let url_domain = this.url_domain;

    //console.log("url_domain", this.url_domain, "url_gcs_domain", this.url_gcs_domain, "createdate", this.createdate);

    if (this.url_gcs_domain && this.url_gcs_domain.length > 0 && this.createdate && this.createdate > 0) {
      if ((now_time-this.createdate) >= condition_time)
        url_domain = this.url_gcs_domain; 
    }

    return [
      url_domain, // this.url_domain,
      this.url_path,
      this.url_thumb,
    ].join('');
  } 

  getEditUrl() { // 편집용 경로
    // 2021.07.02 GCP
    // ex) createdate 기준 24시간이내 -> photo
    //                     24시간이후 -> photo_gcs
    // 1일 => 60(1분)x60(1시간)x24 => 86,400 초
    const condition_time = 60*60*24; // 하루 조건 시간
    const now_time = Math.floor(new Date().getTime() / 1000); // unix time stamp

    let url_domain = this.url_domain;

    if (this.url_gcs_domain && this.url_gcs_domain.length > 0 && this.createdate && this.createdate > 0) {
      if ((now_time-this.createdate) >= condition_time)
        url_domain = this.url_gcs_domain;
    }

    return [
      url_domain, // this.url_domain,
      this.url_path,
      this.url_edit,
    ].join('');
  }
 
  getOriginalUrl() { // 원본 경로
    // 2021.07.02 GCP
    // ex) createdate 기준 24시간이내 -> photo
    //                     24시간이후 -> photo_gcs
    // 1일 => 60(1분)x60(1시간)x24 => 86,400 초
    const condition_time = 60*60*24; // 하루 조건 시간
    const now_time = Math.floor(new Date().getTime() / 1000); // unix time stamp

    let url_domain = this.url_domain;

    if (this.url_gcs_domain && this.url_gcs_domain.length > 0 && this.createdate && this.createdate > 0) {
      if ((now_time-this.createdate) >= condition_time)
        url_domain = this.url_gcs_domain; 
    }

    return [
      url_domain, // this.url_domain,
      this.url_path,
      this.url_ori,
    ].join('');
  }
}

export default ImageMeta
