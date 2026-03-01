import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || '';

export async function convertFigma({ fileKey, token, nodeId }) {
  const { data } = await axios.post(`${BASE_URL}/api/figma`, {
    fileKey,
    token,
    nodeId,
  });
  return data; // { id, files }
}
