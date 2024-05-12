import _ from "lodash";
import isMobile from "ismobilejs";
import { isMobile as Android, iPad } from "../App";
import packageJson from "../../package.json";

const _isMobile = isMobile(window.navigator.userAgent);

export function getEnv() {
  return process.env.REACT_APP_ENV;
}

export function isProduction() {
  return getEnv() === "production";
}

export function isDevelopment() {
  return !isProduction();
}

export function keyMirror(obj) {
  return _.mapValues(obj, (v, k) => `${k}`);
}

export function getUserId() {
  /* NOTE: 전역 변수를 가져옴 */
  // eslint-disable-next-line no-undef
  return AppUserId;
}

export function getSafeUserId() {
  return !_.isEmpty(getUserId()) ? getUserId() : "";
}

export function getSafePFYoonMode() {
  // 2020.10.20 팩토리윤 모드 추가
  /* NOTE: 전역 변수를 가져옴 */
  // eslint-disable-next-line no-undef
  return !_.isEmpty(AppPFYoonMode)
    ? // eslint-disable-next-line no-undef
      AppPFYoonMode === "true"
      ? true
      : false
    : false;
}

export function getSafeEzwelMode() {
  // 2021.03.23 이즈웰 모드 추가
  /* NOTE: 전역 변수를 가져옴 */
  // eslint-disable-next-line no-undef
  return !_.isEmpty(EzwelBool) ? (EzwelBool === "true" ? true : false) : false;
}

export function getOrderKey() {
  /* NOTE: 전역 변수를 가져옴 */
  // eslint-disable-next-line no-undef
  return AppOrderKey;
}

export function getSafeOrderKey() {
  return !_.isEmpty(getOrderKey()) ? getOrderKey() : "";
}

export function getOrderType() {
  /* NOTE: 전역 변수를 가져옴 */
  // eslint-disable-next-line no-undef
  return AppOrderType;
}

export function getSafeOrderType() {
  return !_.isEmpty(getOrderType()) ? getOrderType() : "classic";
}

export function getVersion() {
  return packageJson.version;
}

export function isWindows() {
  try {
    return navigator.appVersion.indexOf("Win") !== -1;
  } catch (e) {}
  return false;
}

export function isIE() {
  if (window.navigator) {
    return _.includes(_.toLower(window.navigator.userAgent), "trident");
  }
  return false;
}

export function isTablet() {
  return _isMobile.tablet;
}

export function isSmartboxAvailable() {
  return !_.isEmpty(getSafeUserId()) && !getSafePFYoonMode();
}

export function deviceCheck() {
  return Android || iPad ? "Mobile" : "Web";
}
