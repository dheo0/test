# CLAUDE.md — AI 어시스턴트 가이드

이 파일은 Claude 등 AI 어시스턴트가 이 프로젝트를 이해하고 올바르게 기여하기 위한 가이드입니다.

---

## 프로젝트 한 줄 요약

> 이미지(PNG/JPG/WebP) 또는 Figma 디자인을 입력받아 **HTML + CSS + JavaScript** 코드를 자동 생성하는 변환 도구

---

## 레포지토리 구조

```
/
├── client/                        # React 기반 변환 도구 UI
│   └── src/
│       ├── components/            # 재사용 가능한 UI 컴포넌트
│       │   ├── Uploader/          # 이미지 업로드 드래그앤드롭
│       │   ├── FigmaInput/        # Figma URL / 토큰 입력 폼
│       │   ├── Preview/           # iframe 기반 변환 결과 미리보기
│       │   └── CodeEditor/        # CodeMirror 기반 코드 편집기
│       ├── pages/
│       │   ├── Home.jsx           # 변환 입력 페이지
│       │   └── Result.jsx         # 변환 결과 페이지
│       ├── services/
│       │   ├── figmaService.js    # Figma API 호출 함수 모음
│       │   └── convertService.js  # 이미지 변환 API 호출 함수 모음
│       └── utils/
│           ├── download.js        # ZIP / 단일 파일 다운로드
│           └── format.js          # 생성된 코드 prettier 포맷
│
├── server/                        # Node.js + Express API 서버
│   ├── routes/
│   │   ├── convert.js             # POST /api/convert
│   │   ├── figma.js               # POST /api/figma
│   │   └── export.js              # GET  /api/export/:id
│   ├── services/
│   │   ├── imageAnalyzer.js       # Vision API 연동 → 레이아웃 분석
│   │   ├── figmaParser.js         # Figma JSON → 중간 표현(IR) 변환
│   │   ├── codeGenerator.js       # IR → HTML / CSS / JS 문자열 생성
│   │   └── cssExtractor.js        # 스타일 추출 및 CSS 변수화
│   ├── middlewares/
│   │   ├── upload.js              # Multer 설정 (10MB 제한)
│   │   └── errorHandler.js        # 공통 에러 응답 처리
│   ├── utils/
│   │   └── figmaClient.js         # Figma REST API Axios 클라이언트
│   └── app.js                     # Express 앱 진입점
│
├── output/                        # 변환된 코드 임시 저장 (git 제외)
├── .env.example                   # 환경 변수 템플릿
├── README.md                      # 사용자용 프로젝트 문서
└── CLAUDE.md                      # AI 어시스턴트용 가이드 (현재 파일)
```

---

## 실행 및 개발 명령어

```bash
# 서버 개발 서버 실행 (포트 4000, nodemon)
cd server && npm run dev

# 클라이언트 개발 서버 실행 (포트 3000)
cd client && npm start

# 전체 테스트 실행
cd server && npm test
cd client && npm test

# 클라이언트 프로덕션 빌드
cd client && npm run build
```

---

## 핵심 변환 파이프라인

AI가 코드를 수정할 때 이 흐름을 반드시 이해해야 합니다.

### 이미지 → 코드

```
[사용자 이미지 업로드]
        ↓
upload.js (Multer) → 파일 저장
        ↓
routes/convert.js → POST /api/convert
        ↓
services/imageAnalyzer.js → OpenAI Vision API 호출
        ↓
중간 표현(IR) JSON 생성
  {
    type: 'container' | 'text' | 'image' | 'button',
    styles: { ... },
    children: [ ... ]
  }
        ↓
services/codeGenerator.js → IR를 HTML/CSS/JS 문자열로 변환
        ↓
output/{id}/ 에 index.html, style.css, script.js 저장
        ↓
클라이언트에 변환 ID 응답
```

### Figma → 코드

```
[사용자 Figma URL + Token 입력]
        ↓
utils/figmaClient.js → GET https://api.figma.com/v1/files/{fileKey}
        ↓
Figma 노드 트리(JSON) 수신
        ↓
services/figmaParser.js → Figma 노드 → 중간 표현(IR) 변환
        ↓
services/codeGenerator.js → IR → HTML/CSS/JS 생성
        ↓
output/{id}/ 저장 후 ID 응답
```

---

## API 엔드포인트 명세

| 메서드 | 경로 | 설명 | 요청 | 응답 |
|---|---|---|---|---|
| POST | `/api/convert` | 이미지 → 코드 변환 | `multipart/form-data` (image 필드) | `{ id, files: ['index.html', 'style.css', 'script.js'] }` |
| POST | `/api/figma` | Figma → 코드 변환 | `{ fileKey, token, nodeId? }` | `{ id, files: [...] }` |
| GET | `/api/export/:id` | 변환 결과 ZIP 다운로드 | — | ZIP 파일 스트림 |
| GET | `/api/preview/:id` | 미리보기 HTML 반환 | — | HTML 문자열 |

---

## 중간 표현(IR) 데이터 구조

`imageAnalyzer.js`와 `figmaParser.js` 모두 동일한 IR 형식을 출력합니다.
`codeGenerator.js`는 이 IR만 입력으로 받습니다.

```js
// IR 노드 타입 정의
{
  type: 'container' | 'text' | 'image' | 'button' | 'input' | 'icon',
  id: 'string',           // 고유 식별자 (CSS 클래스명 생성에 사용)
  styles: {
    width: '100px',
    height: '200px',
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'row',
    gap: '8px',
    padding: '16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '400',
    color: '#333',
    // ... 기타 CSS 속성
  },
  content: 'string',      // type=text일 때 텍스트 내용
  src: 'string',          // type=image일 때 이미지 경로
  children: [ /* 재귀적 IR 노드 */ ]
}
```

---

## 코드 생성 규칙 (codeGenerator.js)

새로운 코드 생성 로직을 추가하거나 수정할 때 반드시 따라야 할 규칙입니다.

### HTML 생성
- 모든 요소는 시맨틱 태그 우선 사용 (`<header>`, `<main>`, `<section>`, `<button>` 등)
- 시맨틱 태그가 불명확하면 `<div>` 사용
- 클래스명은 IR의 `id` 필드 기반으로 자동 생성 (예: `node-abc123`)
- `alt` 속성은 이미지에 항상 포함

### CSS 생성
- 색상, 폰트 크기, 간격 등 디자인 토큰은 `:root` CSS 변수로 추출
- BEM 네이밍 적용: `.block__element--modifier`
- `!important` 사용 금지
- 인라인 스타일 생성 금지 — 반드시 외부 `style.css`에 작성

### JS 생성
- 인터랙션이 없는 요소는 JS 생성 안 함
- Vanilla JS만 사용 (jQuery, 외부 라이브러리 금지)
- 이벤트는 이벤트 위임 패턴으로 `document`에 등록
- `var` 사용 금지, `const`/`let`만 사용

---

## Figma API 사용 시 주의사항

- `figmaClient.js`의 Axios 인스턴스를 반드시 재사용 (직접 `axios.get` 호출 금지)
- API 호출 실패 시 `errorHandler.js`가 처리하므로 라우트에서 별도 try/catch 불필요
- Figma `CANVAS` 타입 노드는 파싱 대상이 아님 — `FRAME` 또는 `COMPONENT`만 처리
- `figmaParser.js`에서 지원하지 않는 Figma 노드 타입은 무시하고 경고 로그 출력

### 지원 Figma 노드 타입

| Figma 타입 | IR 타입 | HTML 태그 |
|---|---|---|
| FRAME / GROUP | container | `<div>` |
| TEXT | text | `<p>` / `<span>` / `<hN>` |
| RECTANGLE | container | `<div>` |
| IMAGE | image | `<img>` |
| VECTOR / ELLIPSE | icon | `<svg>` |
| COMPONENT / INSTANCE | container | `<div>` |

---

## 환경 변수

| 변수명 | 필수 | 설명 |
|---|---|---|
| `PORT` | 선택 | 서버 포트 (기본값: 4000) |
| `OPENAI_API_KEY` | 필수 | OpenAI Vision API 키 |
| `FIGMA_ACCESS_TOKEN` | 필수* | Figma Personal Access Token (*Figma 기능 사용 시) |
| `UPLOAD_DIR` | 선택 | 업로드 임시 경로 (기본값: `./uploads`) |
| `OUTPUT_DIR` | 선택 | 변환 결과 저장 경로 (기본값: `./output`) |
| `CLIENT_ORIGIN` | 선택 | CORS 허용 Origin (기본값: `http://localhost:3000`) |

> `.env` 파일은 절대 커밋하지 마세요. `.env.example`만 커밋 대상입니다.

---

## 파일 네이밍 컨벤션

| 대상 | 컨벤션 | 예시 |
|---|---|---|
| React 컴포넌트 | PascalCase | `CodeEditor.jsx` |
| 서버 서비스 / 유틸 | camelCase | `figmaParser.js` |
| 서버 라우트 | camelCase | `convert.js` |
| CSS / SCSS 파일 | camelCase | `codeEditor.module.css` |

---

## 코드 스타일

- **들여쓰기**: 공백 2칸
- **따옴표**: 싱글 쿼트 (`'`)
- **세미콜론**: 항상 사용
- **변수 선언**: `const` 우선, 재할당 필요 시 `let`, `var` 금지
- **함수 선언**: 서비스/유틸은 `export function` 명명 함수, 컴포넌트는 화살표 함수 + `export default`

---

## 커밋 메시지 규칙

```
feat:     새로운 기능 추가
fix:      버그 수정
refactor: 기능 변경 없이 코드 구조 개선
style:    포맷, 세미콜론 등 동작 무관한 변경
docs:     문서 수정 (README, CLAUDE.md 등)
test:     테스트 추가 또는 수정
chore:    빌드 설정, 패키지 변경
```

---

## AI 어시스턴트를 위한 작업 지침

### 새 변환 기능 추가 시
1. `figmaParser.js` 또는 `imageAnalyzer.js`에서 IR 생성 로직 수정
2. `codeGenerator.js`에서 새 IR 타입에 대한 HTML/CSS 생성 로직 추가
3. 해당 라우트(`routes/convert.js` 또는 `routes/figma.js`)는 가급적 수정하지 않음

### 클라이언트 컴포넌트 수정 시
- `services/` 폴더의 함수를 통해서만 API 호출 (컴포넌트에서 직접 Axios 호출 금지)
- 상태 관리는 React 훅(`useState`, `useEffect`) 사용

### 테스트 작성 시
- 서버 유닛 테스트: `server/__tests__/` 디렉토리, Jest 사용
- IR 변환 함수(`figmaParser`, `codeGenerator`)는 반드시 단위 테스트 작성
- API 라우트 테스트는 `supertest` 사용

### 절대 하지 말아야 할 것
- `.env` 파일에 실제 API 키 하드코딩 후 커밋
- `output/` 디렉토리 내 파일 커밋
- `codeGenerator.js`에서 특정 프레임워크(React, Vue 등) 의존 코드 생성
- 생성된 HTML에 인라인 `style=""` 속성 사용
