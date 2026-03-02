import fs from 'fs';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a UI analysis expert. Analyze the given UI screenshot and return a JSON object representing the layout as an Intermediate Representation (IR).

The IR format is:
{
  "type": "container" | "text" | "image" | "button" | "input" | "icon",
  "id": "unique-string",
  "styles": {
    "width": "px value",
    "height": "px value",
    "backgroundColor": "css color",
    "display": "flex",
    "flexDirection": "row" | "column",
    "gap": "px",
    "padding": "px",
    "borderRadius": "px",
    "fontSize": "px",
    "fontWeight": "string",
    "color": "css color"
  },
  "content": "text content if type is text",
  "src": "image src if type is image",
  "children": []
}

Rules:
- Return ONLY the JSON object, no markdown, no explanation.
- Use realistic pixel values based on the image.
- Nest children properly to reflect the visual hierarchy.
- Keep IDs unique (use simple strings like "header", "hero", "btn-1").`;

/**
 * 이미지 파일 경로를 받아 Vision API로 분석 후 IR 반환
 * @param {string} imagePath
 * @returns {Promise<object>} IR 루트 노드
 */
export async function analyzeImage(imagePath) {
  const imageData = fs.readFileSync(imagePath);
  const base64 = imageData.toString('base64');
  const ext = imagePath.split('.').pop().toLowerCase();
  const mimeMap = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp' };
  const mimeType = mimeMap[ext] || 'image/png';

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mimeType, data: base64 },
          },
          { type: 'text', text: 'Analyze this UI and return the IR JSON.' },
        ],
      },
    ],
  });

  const raw = response.content[0].text.trim();

  try {
    // JSON 블록 마크다운 제거 후 파싱
    const jsonStr = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    return JSON.parse(jsonStr);
  } catch {
    throw new Error('Vision API 응답에서 IR JSON 파싱에 실패했습니다.');
  }
}
