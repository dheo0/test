import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || '';

export async function convertImage(file) {
  const formData = new FormData();
  formData.append('image', file);

  const { data } = await axios.post(`${BASE_URL}/api/convert`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data; // { id, files }
}

export async function fetchCode(id) {
  const [htmlRes, cssRes, jsRes] = await Promise.all([
    axios.get(`${BASE_URL}/api/preview/${id}`),
    axios.get(`${BASE_URL}/api/preview/${id}/style.css`).catch(() => ({ data: '' })),
    axios.get(`${BASE_URL}/api/preview/${id}/script.js`).catch(() => ({ data: '' })),
  ]);

  // preview 엔드포인트는 index.html 전체를 반환하므로 파싱
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlRes.data, 'text/html');
  const bodyHtml = doc.body.innerHTML.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '').trim();
  const inlineStyle = doc.querySelector('style')?.textContent || '';
  const inlineScript = doc.querySelector('script')?.textContent || '';

  return {
    html: bodyHtml,
    css: inlineStyle || cssRes.data,
    js: inlineScript || jsRes.data,
  };
}
