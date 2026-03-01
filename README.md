# Design to Code Converter

이미지 또는 Figma 디자인을 HTML, CSS, JavaScript로 자동 변환하는 프로젝트입니다.

---

## 목차

- [프로젝트 개요](#프로젝트-개요)
- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [시작하기](#시작하기)
- [사용 방법](#사용-방법)
- [Figma 연동](#figma-연동)
- [이미지 변환](#이미지-변환)
- [출력 결과](#출력-결과)
- [환경 변수](#환경-변수)
- [개발 규칙](#개발-규칙)

---

## 프로젝트 개요

디자이너가 만든 시각적 결과물(이미지 파일 또는 Figma 디자인)을 입력받아,
실제 브라우저에서 동작하는 **HTML / CSS / JavaScript** 코드로 자동 변환합니다.

```
[이미지 / Figma] → [분석 엔진] → [HTML + CSS + JS 코드]
```

---

## 주요 기능

| 기능 | 설명 |
|---|---|
| 이미지 → 코드 | PNG, JPG, WebP 등 이미지를 업로드하면 레이아웃을 분석해 코드 생성 |
| Figma → 코드 | Figma API를 통해 프레임/컴포넌트를 직접 불러와 코드 변환 |
| 코드 미리보기 | 변환된 HTML/CSS/JS를 실시간으로 브라우저에서 미리보기 |
| 코드 편집기 | 생성된 코드를 인라인으로 수정 가능 |
| 코드 내보내기 | HTML, CSS, JS 파일을 개별 또는 ZIP으로 다운로드 |
| 반응형 변환 | 데스크탑/모바일 레이아웃을 각각 변환 |

---

## 기술 스택

### Frontend
- **HTML5 / CSS3 / Vanilla JavaScript** — 출력 타겟 언어
- **React** — 변환 도구 UI
- **CodeMirror** — 코드 에디터
- **Axios** — HTTP 클라이언트

### Backend / API
- **Node.js + Express** — API 서버
- **Figma REST API** — Figma 디자인 데이터 수신
- **OpenAI Vision API** (또는 유사 Vision 모델) — 이미지 분석 및 코드 생성
- **Multer** — 이미지 파일 업로드 처리

### 인프라
- **dotenv** — 환경 변수 관리
- **Jest** — 테스트

---

## 프로젝트 구조

```
/
├── client/                    # 변환 도구 프론트엔드 (React)
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Uploader/      # 이미지 업로드 UI
│   │   │   ├── FigmaInput/    # Figma URL/토큰 입력
│   │   │   ├── Preview/       # 변환 결과 미리보기
│   │   │   └── CodeEditor/    # 코드 편집기
│   │   ├── pages/
│   │   │   ├── Home.jsx       # 메인 페이지
│   │   │   └── Result.jsx     # 변환 결과 페이지
│   │   ├── services/
│   │   │   ├── figmaService.js  # Figma API 호출
│   │   │   └── convertService.js # 변환 API 호출
│   │   ├── utils/
│   │   │   ├── download.js    # 파일 다운로드 유틸
│   │   │   └── format.js      # 코드 포맷터
│   │   ├── App.jsx
│   │   └── index.js
│   └── package.json
│
├── server/                    # 변환 백엔드 (Node.js)
│   ├── routes/
│   │   ├── convert.js         # POST /api/convert (이미지 변환)
│   │   ├── figma.js           # POST /api/figma (Figma 변환)
│   │   └── export.js          # GET /api/export (파일 내보내기)
│   ├── services/
│   │   ├── imageAnalyzer.js   # 이미지 분석 (Vision API 연동)
│   │   ├── figmaParser.js     # Figma JSON → 코드 변환
│   │   ├── codeGenerator.js   # HTML/CSS/JS 코드 생성
│   │   └── cssExtractor.js    # 스타일 추출 및 최적화
│   ├── middlewares/
│   │   ├── upload.js          # Multer 파일 업로드 미들웨어
│   │   └── errorHandler.js
│   ├── utils/
│   │   └── figmaClient.js     # Figma API 클라이언트
│   ├── app.js                 # Express 앱
│   └── package.json
│
├── output/                    # 변환된 코드 임시 저장소
├── .env.example               # 환경 변수 예시
├── .gitignore
└── README.md
```

---

## 시작하기

### 요구 사항

- Node.js 18 이상
- npm 또는 yarn
- Figma 계정 및 Personal Access Token (Figma 변환 기능 사용 시)
- OpenAI API Key (이미지 변환 기능 사용 시)

### 설치

```bash
# 레파지토리 클론
git clone <repo-url>
cd design-to-code

# 서버 의존성 설치
cd server && npm install

# 클라이언트 의존성 설치
cd ../client && npm install
```

### 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성합니다 (`.env.example` 참고):

```bash
cp .env.example .env
```

`.env` 파일을 열고 값을 채워넣습니다.

### 실행

```bash
# 서버 실행 (포트 4000)
cd server && npm run dev

# 클라이언트 실행 (포트 3000) — 새 터미널에서
cd client && npm start
```

브라우저에서 `http://localhost:3000` 접속

---

## 사용 방법

### 이미지로 변환하기

1. 홈 화면에서 **"이미지 업로드"** 선택
2. PNG / JPG / WebP 이미지 파일을 드래그 앤 드롭 또는 클릭하여 업로드
3. **"변환 시작"** 버튼 클릭
4. 변환이 완료되면 결과 페이지에서 HTML/CSS/JS 코드 확인
5. 코드 에디터에서 수정 후 **"다운로드"** 버튼으로 파일 저장

### Figma로 변환하기

1. 홈 화면에서 **"Figma 연동"** 선택
2. Figma Personal Access Token 입력
3. 변환할 Figma 파일 URL 또는 파일 키 입력
4. (선택) 특정 프레임 이름 또는 Node ID 입력
5. **"변환 시작"** 클릭
6. 결과 확인 및 다운로드

---

## Figma 연동

### Personal Access Token 발급

1. Figma → 계정 설정 (우측 상단 프로필 클릭)
2. **Security** 탭 → **Personal access tokens**
3. 토큰 이름 입력 후 생성
4. 생성된 토큰을 `.env`의 `FIGMA_ACCESS_TOKEN`에 저장

### Figma 파일 키 확인

Figma 파일 URL 구조:

```
https://www.figma.com/file/{FILE_KEY}/{FILE_NAME}
```

`FILE_KEY` 부분이 API 호출 시 사용하는 파일 키입니다.

### Figma API 호출 흐름

```
1. GET https://api.figma.com/v1/files/{fileKey}
   → 전체 디자인 트리(JSON) 수신

2. GET https://api.figma.com/v1/images/{fileKey}?ids={nodeIds}
   → 특정 노드의 렌더링 이미지 URL 수신

3. 서버에서 JSON 파싱 → codeGenerator가 HTML/CSS 생성
```

### 지원하는 Figma 속성

| Figma 속성 | 변환 결과 |
|---|---|
| Frame / Group | `<div>` + flexbox/grid 레이아웃 |
| Text | `<p>`, `<h1>`~`<h6>`, `<span>` + 폰트 스타일 |
| Rectangle | `<div>` + border, border-radius, background |
| Image | `<img>` 또는 CSS background-image |
| Auto Layout | CSS Flexbox / Grid |
| Fill (색상) | CSS `background-color`, `color` |
| Stroke | CSS `border` |
| Shadow | CSS `box-shadow` |
| Opacity | CSS `opacity` |

---

## 이미지 변환

이미지 파일은 **Vision AI 모델**을 통해 레이아웃과 구성 요소를 분석한 후 코드로 변환됩니다.

### 변환 흐름

```
이미지 업로드
    ↓
서버에서 Vision API로 이미지 전송
    ↓
AI가 레이아웃 구조, 색상, 폰트, 여백 등 분석
    ↓
구조화된 JSON으로 중간 표현 생성
    ↓
codeGenerator가 HTML + CSS + JS 출력
```

### 지원 형식

- PNG, JPG, JPEG, WebP
- 최대 파일 크기: 10MB
- 권장 해상도: 1280px 이상 (고해상도일수록 정확도 향상)

---

## 출력 결과

변환 결과는 세 파일로 구성됩니다:

### `index.html`
```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="style.css" />
  <title>Generated Page</title>
</head>
<body>
  <!-- 변환된 마크업 -->
  <script src="script.js"></script>
</body>
</html>
```

### `style.css`
- CSS 변수(`:root`)로 색상 및 폰트 정의
- BEM 네이밍 컨벤션 적용
- 미디어 쿼리로 반응형 처리

### `script.js`
- 인터랙션이 있는 요소에만 생성 (클릭, 호버, 토글 등)
- 순수 Vanilla JS (프레임워크 의존 없음)
- 이벤트 위임 패턴 사용

---

## 환경 변수

`.env` 파일에 설정해야 하는 환경 변수 목록:

```env
# 서버 포트
PORT=4000

# OpenAI API (이미지 분석용)
OPENAI_API_KEY=sk-...

# Figma API
FIGMA_ACCESS_TOKEN=figd_...

# 파일 업로드 임시 경로
UPLOAD_DIR=./uploads

# 변환 출력 경로
OUTPUT_DIR=./output

# 클라이언트 Origin (CORS)
CLIENT_ORIGIN=http://localhost:3000
```

> **주의**: `.env` 파일은 절대 커밋하지 마세요. `.gitignore`에 포함되어 있습니다.

---

## 개발 규칙

### 코드 스타일

- **들여쓰기**: 공백 2칸
- **따옴표**: 싱글 쿼트(`'`) 사용
- **세미콜론**: 사용
- **변수 선언**: `const` 우선, 필요 시 `let`, `var` 금지

### 파일 네이밍

| 대상 | 컨벤션 | 예시 |
|---|---|---|
| React 컴포넌트 | PascalCase | `CodeEditor.jsx` |
| 서비스/유틸 | camelCase | `figmaParser.js` |
| 라우트 | camelCase | `convert.js` |
| 스타일 | camelCase 또는 kebab-case | `style.css` |

### API 엔드포인트 설계

```
POST /api/convert          # 이미지 업로드 후 코드 변환
POST /api/figma            # Figma 파일 키로 코드 변환
GET  /api/export/:id       # 변환 결과 파일 다운로드
GET  /api/preview/:id      # 변환 결과 미리보기 HTML 반환
```

### 브랜치 전략

```
main        ← 배포용 (직접 커밋 금지)
develop     ← 개발 통합 브랜치
feature/*   ← 기능 개발
fix/*       ← 버그 수정
```

### 커밋 메시지 컨벤션

```
feat: 새로운 기능 추가
fix: 버그 수정
refactor: 코드 리팩터링
style: 코드 스타일 변경 (동작 변화 없음)
docs: 문서 수정
test: 테스트 추가/수정
chore: 빌드 설정, 패키지 변경
```

예시:
```
feat: Figma Auto Layout → CSS Flexbox 변환 지원
fix: 이미지 업로드 10MB 초과 시 에러 처리 누락 수정
```

---

## 라이선스

MIT
