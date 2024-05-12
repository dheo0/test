import client from '../utils/client';
import { getSafeOrderType, getSafePFYoonMode, getSafeEzwelMode } from '../utils/commonUtils';

export function getPrintSizeInfo(mode = getSafeOrderType()) {
  let url = getSafePFYoonMode() ? 'include/Appinfo/PrintSizeInfo_pfyoon.asp' : getSafeEzwelMode() ? 'include/Appinfo/PrintSizeInfo.asp' : 'include/Appinfo/PrintSizeInfo.asp'; // 2020.10.21 팩토리윤 url 분리
  return client.get(url, { mode });
}

export function getUploadingServerUrl() {
  let url = getSafePFYoonMode() ? 'include/Appinfo/UploadInfo_Print_html5_pfyoon.asp' : getSafeEzwelMode() ? 'include/Appinfo/UploadInfo_Print_html5_ezwell.asp' : 'include/Appinfo/UploadInfo_Print_html5.asp'; // 2020.10.21 팩토리윤 url 분리
  return client.get(url);
}

export function getPlusProducts() {
  let url = getSafePFYoonMode() ? 'include/AppInfo/AddProduct_html5_pfyoon.asp' : getSafeEzwelMode() ? 'include/Appinfo/AddProduct_html5_ezwell.asp' : 'include/AppInfo/AddProduct_html5.asp'; // 2020.10.21 팩토리윤 url 분리
  return client.get(url, { editmode: 'print' });
}

export function getOrderingServerUrl() {
  let url = getSafePFYoonMode() ? 'include/Appinfo/UploadInfo_Print_html5_pfyoon.asp' : getSafeEzwelMode() ? 'include/Appinfo/UploadInfo_Print_html5_ezwell.asp' : 'include/Appinfo/UploadInfo_Print_html5.asp'; // 2020.10.21 팩토리윤 url 분리
  return client.get(url, { ordermode: 'cart' });
}

/*
포토몬 API 연동
인화사이즈+가격정보 -  https://www.photomon.com/include/Appinfo/PrintSizeInfo.asp
사진파일 업로드 정보 - https://www.photomon.com/include/Appinfo/UploadInfo_Print_html5.asp
함께주문 상품정보 -    https://www.photomon.com/include/AppInfo/AddProduct_html5.asp?editmode=print
주문 -                https://www.photomon.com/include/Appinfo/UploadInfo_Print_html5.asp?ordermode=cart


2020.10.26 팩토리윤 API 연동
인화사이즈+가격정보 -  https://www.photomon.com/include/Appinfo/PrintSizeInfo_pfyoon.asp
사진파일 업로드 정보 - https://www.photomon.com/include/Appinfo/UploadInfo_Print_html5_pfyoon.asp
함께주문 상품정보 -    https://www.photomon.com/include/AppInfo/AddProduct_html5_pfyoon.asp?editmode=print
주문 -                https://www.photomon.com/include/Appinfo/UploadInfo_Print_html5_pfyoon.asp?ordermode=cart

2021.03.23 이즈웰 API 연동
인화사이즈+가격정보:   https://www.photomon.com/include/Appinfo/PrintSizeInfo.asp
사진파일 업로드 정보:  https://www.photomon.com/include/Appinfo/UploadInfo_Print_html5_ezwell.asp
함께주문 상품정보 :    https://www.photomon.com/include/Appinfo/AddProduct_html5_ezwell.asp?editmode=print
주문:                 https://www.photomon.com/include/Appinfo/UploadInfo_Print_html5_ezwell.asp

*/