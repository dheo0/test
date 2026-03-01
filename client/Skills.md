# client/Skills.md — 클라이언트 개발 가이드

React 기반 변환 도구 UI의 개발 패턴, 컴포넌트 구조, 스타일링 규칙을 정의합니다.

---

## 기술 스택

| 라이브러리 | 용도 |
|---|---|
| React 18+ | UI 프레임워크 |
| React Router DOM | 페이지 라우팅 |
| Axios | HTTP 클라이언트 |
| CodeMirror | 코드 에디터 컴포넌트 |
| JSZip | ZIP 파일 생성 (다운로드) |
| Prettier (standalone) | 코드 자동 포맷 |

---

## 디렉토리 구조

```
client/
└── src/
    ├── components/          # 재사용 가능한 UI 컴포넌트 (presentational)
    │   ├── Uploader/        # 이미지 업로드 드래그앤드롭
    │   ├── FigmaInput/      # Figma URL / 토큰 입력 폼
    │   ├── Preview/         # iframe 기반 변환 결과 미리보기
    │   └── CodeEditor/      # CodeMirror 기반 코드 편집기
    ├── pages/               # 라우트 단위 페이지 컴포넌트
    │   ├── Home.jsx         # 변환 입력 화면
    │   └── Result.jsx       # 변환 결과 화면
    ├── services/            # API 호출 함수 (서버 통신 전담)
    │   ├── figmaService.js  # Figma 관련 API 호출
    │   └── convertService.js # 이미지 변환 API 호출
    ├── utils/               # 순수 유틸리티 함수
    │   ├── download.js      # 파일/ZIP 다운로드
    │   └── format.js        # 코드 포맷팅 (Prettier)
    ├── App.jsx              # 루트 컴포넌트 + 라우팅
    └── index.js             # React 앱 진입점
```

---

## 컴포넌트 작성 규칙

### 기본 형식

```jsx
// 화살표 함수 + export default
const MyComponent = ({ prop1, prop2 }) => {
  return (
    <div className={styles.container}>
      {/* JSX */}
    </div>
  );
};

export default MyComponent;
```

### 파일 네이밍

| 대상 | 컨벤션 | 예시 |
|---|---|---|
| 컴포넌트 파일 | PascalCase | `CodeEditor.jsx` |
| CSS 모듈 | camelCase | `codeEditor.module.css` |
| 서비스 / 유틸 | camelCase | `figmaService.js` |

### 컴포넌트 분류

- **components/**: props만 받아 렌더링하는 순수 UI 컴포넌트. API 호출 금지.
- **pages/**: 라우트 단위 컴포넌트. `services/`를 통해 API 호출 가능. 상태 보유 가능.

---

## 상태 관리

별도 상태 관리 라이브러리 없이 React 내장 훅만 사용합니다.

```js
// 허용
const [loading, setLoading] = useState(false);
const [result, setResult] = useState(null);
useEffect(() => { /* 사이드 이펙트 */ }, [dependency]);

// 금지
// Redux, MobX, Zustand 등 외부 라이브러리 도입 금지
```

### 페이지 간 데이터 전달

- `React Router`의 `state`를 활용 (변환 결과 ID 등 간단한 데이터)
- 전역 상태가 필요한 경우 `Context API` 사용 (라이브러리 추가 금지)

---

## API 호출 규칙

**컴포넌트에서 직접 Axios 호출 금지** — 반드시 `services/` 함수를 통해서만 호출합니다.

```js
// services/convertService.js 예시
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export async function convertImage(file) {
  const formData = new FormData();
  formData.append('image', file);

  const { data } = await axios.post(`${BASE_URL}/api/convert`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data; // { id, files }
}
```

```js
// services/figmaService.js 예시
export async function convertFigma({ fileKey, token, nodeId }) {
  const { data } = await axios.post(`${BASE_URL}/api/figma`, {
    fileKey,
    token,
    nodeId,
  });
  return data; // { id, files }
}
```

```jsx
// pages/Home.jsx — 올바른 사용
import { convertImage } from '../services/convertService';

const Home = () => {
  const handleConvert = async (file) => {
    const result = await convertImage(file);
    navigate('/result', { state: { id: result.id } });
  };
};
```

---

## 컴포넌트별 핵심 명세

### Uploader

- 드래그앤드롭 + 클릭 업로드 모두 지원
- 허용 형식: `image/png`, `image/jpeg`, `image/webp`
- 파일 크기 10MB 초과 시 클라이언트에서 미리 차단
- 선택된 파일 미리보기(썸네일) 표시

```jsx
<Uploader
  onFileSelect={(file) => setSelectedFile(file)}
  accept="image/png, image/jpeg, image/webp"
  maxSizeMB={10}
/>
```

### FigmaInput

- Figma Personal Access Token 입력 필드 (type="password" 처리)
- Figma 파일 URL 또는 파일 키 입력 필드
- 선택적으로 Node ID 입력 가능

```jsx
<FigmaInput
  onSubmit={({ fileKey, token, nodeId }) => handleFigmaConvert(...)}
/>
```

### Preview

- `<iframe>` 으로 변환된 `index.html` 렌더링
- `/api/preview/:id` 엔드포인트의 HTML 응답을 `srcDoc`으로 주입
- 데스크탑 / 모바일 뷰 토글 버튼 포함

```jsx
<Preview id={conversionId} />
```

### CodeEditor

- CodeMirror 기반 HTML / CSS / JS 탭 전환 에디터
- 코드 수정 후 미리보기에 실시간 반영
- 복사 버튼, 다운로드 버튼 포함

```jsx
<CodeEditor
  files={{ html: '...', css: '...', js: '...' }}
  onChange={(type, value) => handleCodeChange(type, value)}
/>
```

---

## 스타일링 규칙

- **CSS 모듈** 사용: `[ComponentName].module.css`
- 전역 스타일은 `src/index.css` 또는 `src/App.module.css`에만 작성
- 인라인 `style={{}}` 사용 금지 (애니메이션 등 동적 값은 CSS 변수 활용)
- 반응형: 모바일 우선 (`min-width` 미디어 쿼리)

```css
/* codeEditor.module.css 예시 */
.container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tabBar {
  display: flex;
  border-bottom: 1px solid var(--color-border);
}
```

---

## 다운로드 유틸 (`utils/download.js`)

```js
// 단일 파일 다운로드
export function downloadFile(filename, content, mimeType = 'text/plain') { ... }

// ZIP 묶음 다운로드 (JSZip 사용)
export async function downloadZip(files) {
  // files: [{ name: 'index.html', content: '...' }, ...]
}
```

---

## 코드 포맷 유틸 (`utils/format.js`)

Prettier standalone을 사용해 생성된 코드를 포맷합니다.

```js
export async function formatHTML(code) { ... }
export async function formatCSS(code) { ... }
export async function formatJS(code) { ... }
```

- 서버에서 받은 코드를 CodeEditor에 표시하기 전에 반드시 포맷 적용
- Prettier 설정: 싱글쿼트, 세미콜론 사용, 탭 폭 2

---

## 환경 변수

```env
REACT_APP_API_URL=http://localhost:4000   # 서버 API 베이스 URL
```

- `process.env.REACT_APP_*` 형식만 사용 가능 (CRA 규칙)
- `.env.local`에 로컬 설정, `.env.production`에 배포 설정

---

## 개발 명령어

```bash
# 개발 서버 실행 (포트 3000)
npm start

# 프로덕션 빌드
npm run build

# 테스트 실행
npm test
```

---

## 테스트 작성 규칙

- 테스트 파일 위치: `src/__tests__/` 또는 컴포넌트와 같은 폴더에 `*.test.jsx`
- 프레임워크: Jest + React Testing Library
- 각 컴포넌트는 최소 렌더 스모크 테스트 작성
- API 호출(`services/`)은 `jest.mock`으로 모킹 처리

```jsx
// 예시
import { render, screen } from '@testing-library/react';
import Uploader from './Uploader';

test('업로더가 정상 렌더링된다', () => {
  render(<Uploader onFileSelect={() => {}} />);
  expect(screen.getByText(/파일을 드래그/i)).toBeInTheDocument();
});
```
