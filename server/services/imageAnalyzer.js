import fs from 'fs';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:${mimeType};base64,${base64}` },
          },
          { type: 'text', text: 'Analyze this UI and return the IR JSON.' },
        ],
      },
    ],
    max_tokens: 4096,
  });

  const raw = response.choices[0].message.content.trim();

  try {
    // JSON 블록 마크다운 제거 후 파싱
    const jsonStr = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    return JSON.parse(jsonStr);
  } catch {
    throw new Error('Vision API 응답에서 IR JSON 파싱에 실패했습니다.');
  }
}
