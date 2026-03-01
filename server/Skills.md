# server/Skills.md — 서버 개발 가이드

Node.js + Express 기반 변환 API 서버의 구조, 서비스 로직, 미들웨어 패턴을 정의합니다.

---

## 기술 스택

| 라이브러리 | 용도 |
|---|---|
| Node.js 18+ | 런타임 |
| Express | HTTP API 서버 |
| Multer | 파일 업로드 처리 |
| Axios | Figma API 호출 클라이언트 |
| OpenAI SDK | Vision API 이미지 분석 |
| archiver | ZIP 파일 스트리밍 |
| dotenv | 환경 변수 로드 |
| nodemon | 개발 서버 자동 재시작 |
| Jest + supertest | 테스트 |

---

## 디렉토리 구조

```
server/
├── routes/
│   ├── convert.js        # POST /api/convert — 이미지 → 코드
│   ├── figma.js          # POST /api/figma   — Figma → 코드
│   └── export.js         # GET  /api/export/:id, GET /api/preview/:id
├── services/
│   ├── imageAnalyzer.js  # 이미지 → IR (Vision API 호출)
│   ├── figmaParser.js    # Figma JSON → IR
│   ├── codeGenerator.js  # IR → HTML / CSS / JS
│   └── cssExtractor.js   # 스타일 추출 및 CSS 변수화
├── middlewares/
│   ├── upload.js         # Multer 설정 (10MB 제한)
│   └── errorHandler.js   # 공통 에러 응답 처리
├── utils/
│   └── figmaClient.js    # Figma REST API Axios 인스턴스
├── __tests__/            # Jest 유닛 / 통합 테스트
└── app.js                # Express 앱 진입점
```

---

## API 엔드포인트

| 메서드 | 경로 | 설명 | 요청 | 응답 |
|---|---|---|---|---|
| POST | `/api/convert` | 이미지 → 코드 변환 | `multipart/form-data` (`image` 필드) | `{ id, files }` |
| POST | `/api/figma` | Figma → 코드 변환 | `{ fileKey, token, nodeId? }` | `{ id, files }` |
| GET | `/api/export/:id` | 변환 결과 ZIP 다운로드 | — | ZIP 스트림 |
| GET | `/api/preview/:id` | 변환된 HTML 반환 | — | HTML 문자열 |

---

## 라우트 작성 규칙

- 라우트는 **얇게** 유지 — 비즈니스 로직은 `services/`에 위임
- try/catch 불필요 — `errorHandler.js`가 공통 처리
- 응답 형식은 항상 JSON (`res.json()`)

```js
// routes/convert.js 예시
import { analyzeImage } from '../services/imageAnalyzer.js';
import { generateCode } from '../services/codeGenerator.js';

router.post('/', upload.single('image'), async (req, res) => {
  const ir = await analyzeImage(req.file.path);
  const { id, files } = await generateCode(ir);
  res.json({ id, files });
});
```

---

## 중간 표현(IR) 데이터 구조

`imageAnalyzer.js`와 `figmaParser.js`가 공통으로 출력하는 포맷입니다.
`codeGenerator.js`는 IR만 입력으로 받습니다.

```js
{
  type: 'container' | 'text' | 'image' | 'button' | 'input' | 'icon',
  id: 'string',           // 고유 식별자 → CSS 클래스명 생성에 사용
  styles: {
    width: '100px',
    height: '200px',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'row',
    gap: '8px',
    padding: '16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '400',
    color: '#333333',
    // 기타 camelCase CSS 속성
  },
  content: 'string',      // type === 'text' 일 때 텍스트 내용
  src: 'string',          // type === 'image' 일 때 이미지 URL/경로
  children: [ /* 재귀적 IR 노드 배열 */ ],
}
```

---

## services/ 상세

### imageAnalyzer.js

Vision AI 모델을 통해 업로드된 이미지를 분석하고 IR을 생성합니다.

```js
/**
 * @param {string} imagePath - 업로드된 이미지 파일 경로
 * @returns {Promise<IRNode>} 중간 표현 루트 노드
 */
export async function analyzeImage(imagePath) { ... }
```

- OpenAI `gpt-4o` (또는 Vision 지원 모델) 사용
- 이미지를 base64로 인코딩 후 API 전송
- AI 응답에서 JSON IR을 파싱하여 반환
- 파싱 실패 시 `Error('IR 파싱 실패')` throw

### figmaParser.js

Figma REST API 응답 JSON을 IR로 변환합니다.

```js
/**
 * @param {object} figmaNode - Figma 노드 트리
 * @returns {IRNode} 중간 표현 루트 노드
 */
export function parseFigmaNode(figmaNode) { ... }
```

**지원하는 Figma 노드 타입**

| Figma 타입 | IR 타입 | HTML 태그 |
|---|---|---|
| FRAME / GROUP | container | `<div>` |
| TEXT | text | `<p>` / `<span>` / `<h1>`~`<h6>` |
| RECTANGLE | container | `<div>` |
| IMAGE | image | `<img>` |
| VECTOR / ELLIPSE | icon | `<svg>` |
| COMPONENT / INSTANCE | container | `<div>` |
| CANVAS | **무시** | — |

- 지원하지 않는 노드 타입은 `console.warn`으로 경고만 출력 후 `null` 반환
- `CANVAS` 타입은 파싱 대상이 아님 — `FRAME`/`COMPONENT`만 진입점으로 처리

### codeGenerator.js

IR을 받아 `index.html`, `style.css`, `script.js` 파일 문자열을 생성하고 `output/{id}/`에 저장합니다.

```js
/**
 * @param {IRNode} ir - 중간 표현 루트 노드
 * @returns {Promise<{ id: string, files: string[] }>}
 */
export async function generateCode(ir) { ... }
```

**HTML 생성 규칙**
- 시맨틱 태그 우선 (`<header>`, `<main>`, `<section>`, `<button>` 등)
- 불명확하면 `<div>`
- 클래스명: `node-{id}` 형식
- `<img>`에 `alt` 속성 항상 포함

**CSS 생성 규칙**
- 디자인 토큰(색상, 폰트 크기, 간격)은 `:root` CSS 변수로 추출
- BEM 네이밍: `.block__element--modifier`
- `!important` 사용 금지
- 인라인 스타일 생성 금지

**JS 생성 규칙**
- 인터랙션 없는 요소는 JS 생성 안 함
- Vanilla JS만 사용 (jQuery, 라이브러리 금지)
- 이벤트 위임 패턴으로 `document`에 등록
- `var` 금지, `const`/`let`만 사용

### cssExtractor.js

IR의 `styles` 객체에서 반복되는 값을 CSS 변수로 추출합니다.

```js
/**
 * @param {IRNode[]} nodes - IR 노드 배열 (flat)
 * @returns {{ variables: object, processedNodes: IRNode[] }}
 */
export function extractCSSVariables(nodes) { ... }
```

---

## middlewares/ 상세

### upload.js (Multer)

```js
// 설정
const upload = multer({
  dest: process.env.UPLOAD_DIR || './uploads',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  },
});

export default upload;
```

- 10MB 초과 시 `MulterError` throw → `errorHandler.js`가 처리
- 허용되지 않는 MIME 타입은 즉시 거부

### errorHandler.js

```js
// Express 에러 미들웨어 (4개 인자)
export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || '서버 오류가 발생했습니다.';
  res.status(status).json({ error: message });
}
```

- 라우트에서 `next(err)` 또는 `throw`된 에러를 모두 처리
- `MulterError`: 400 응답
- 그 외: 500 응답

---

## utils/figmaClient.js

Figma REST API 전용 Axios 인스턴스입니다. **직접 `axios.get`을 호출하지 말고 이 클라이언트를 재사용하세요.**

```js
import axios from 'axios';

const figmaClient = axios.create({
  baseURL: 'https://api.figma.com/v1',
  headers: {
    'X-Figma-Token': process.env.FIGMA_ACCESS_TOKEN,
  },
  timeout: 15000,
});

export default figmaClient;
```

**사용 예시**

```js
import figmaClient from '../utils/figmaClient.js';

// 파일 전체 트리 조회
const { data } = await figmaClient.get(`/files/${fileKey}`);

// 노드 이미지 URL 조회
const { data } = await figmaClient.get(`/images/${fileKey}`, {
  params: { ids: nodeId, format: 'png', scale: 2 },
});
```

---

## 환경 변수

| 변수명 | 필수 | 기본값 | 설명 |
|---|---|---|---|
| `PORT` | 선택 | `4000` | 서버 포트 |
| `OPENAI_API_KEY` | 필수 | — | OpenAI Vision API 키 |
| `FIGMA_ACCESS_TOKEN` | 조건부 필수 | — | Figma Personal Access Token |
| `UPLOAD_DIR` | 선택 | `./uploads` | 업로드 임시 디렉토리 |
| `OUTPUT_DIR` | 선택 | `./output` | 변환 결과 저장 디렉토리 |
| `CLIENT_ORIGIN` | 선택 | `http://localhost:3000` | CORS 허용 Origin |

> `.env` 파일은 절대 커밋 금지. `.env.example`만 커밋합니다.

---

## app.js 구성

```js
import express from 'express';
import cors from 'cors';
import convertRouter from './routes/convert.js';
import figmaRouter from './routes/figma.js';
import exportRouter from './routes/export.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json());

app.use('/api/convert', convertRouter);
app.use('/api/figma', figmaRouter);
app.use('/api', exportRouter);

app.use(errorHandler); // 반드시 라우트 등록 후 마지막에 추가

export default app;
```

---

## 개발 명령어

```bash
# 개발 서버 실행 (nodemon, 포트 4000)
npm run dev

# 프로덕션 실행
npm start

# 테스트 실행
npm test

# 테스트 커버리지
npm run test:coverage
```

---

## 테스트 작성 규칙

- 위치: `server/__tests__/`
- 프레임워크: Jest
- API 라우트 통합 테스트: `supertest`
- `figmaParser`, `codeGenerator` 등 순수 변환 함수는 **반드시 유닛 테스트** 작성

```js
// __tests__/figmaParser.test.js 예시
import { parseFigmaNode } from '../services/figmaParser.js';

test('TEXT 노드를 text IR로 변환한다', () => {
  const node = { type: 'TEXT', id: '1:1', characters: 'Hello', style: {} };
  const ir = parseFigmaNode(node);
  expect(ir.type).toBe('text');
  expect(ir.content).toBe('Hello');
});
```

```js
// __tests__/convert.test.js 예시 (supertest)
import request from 'supertest';
import app from '../app.js';
import path from 'path';

test('POST /api/convert — 이미지 업로드 후 파일 ID 반환', async () => {
  const res = await request(app)
    .post('/api/convert')
    .attach('image', path.resolve(__dirname, 'fixtures/sample.png'));

  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('id');
  expect(res.body.files).toContain('index.html');
});
```
