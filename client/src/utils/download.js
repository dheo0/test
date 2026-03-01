import JSZip from 'jszip';

const BASE_URL = process.env.REACT_APP_API_URL || '';

/**
 * 단일 파일 다운로드
 */
export function downloadFile(filename, content, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * 서버에서 ZIP 다운로드
 */
export async function downloadZip(id) {
  const res = await fetch(`${BASE_URL}/api/export/${id}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `code-${id}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * 코드 문자열에서 직접 ZIP 생성 후 다운로드
 */
export async function downloadZipFromCode({ html, css, js }) {
  const zip = new JSZip();
  zip.file('index.html', html);
  zip.file('style.css', css);
  zip.file('script.js', js);

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'converted-code.zip';
  a.click();
  URL.revokeObjectURL(url);
}
