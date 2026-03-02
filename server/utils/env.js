/**
 * 실행 환경 감지 및 환경별 설정값을 제공하는 유틸리티
 *
 * 로컬:  uploads/ output/ 디렉토리를 프로젝트 루트 기준으로 사용
 * Vercel: 서버리스 환경에서는 /tmp 외 쓰기 불가 → /tmp/uploads, /tmp/output 사용
 */

export const IS_VERCEL = !!process.env.VERCEL;
export const IS_TEST = process.env.NODE_ENV === 'test';

export function getUploadDir() {
  if (IS_VERCEL) return '/tmp/uploads';
  return process.env.UPLOAD_DIR || './uploads';
}

export function getOutputDir() {
  if (IS_VERCEL) return '/tmp/output';
  return process.env.OUTPUT_DIR || './output';
}
