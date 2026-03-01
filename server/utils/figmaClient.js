import axios from 'axios';

const figmaClient = axios.create({
  baseURL: 'https://api.figma.com/v1',
  timeout: 15000,
});

// 토큰은 요청 시 동적으로 주입 (사용자 입력 토큰 지원)
export function getFigmaClient(token) {
  return axios.create({
    baseURL: 'https://api.figma.com/v1',
    headers: { 'X-Figma-Token': token || process.env.FIGMA_ACCESS_TOKEN },
    timeout: 15000,
  });
}

export default figmaClient;
