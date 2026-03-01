import { useState, useMemo } from 'react';
import styles from './Preview.module.css';

const API_URL = process.env.REACT_APP_API_URL || '';

const VIEWPORTS = [
  { label: '데스크탑', width: '100%' },
  { label: '태블릿', width: '768px' },
  { label: '모바일', width: '375px' },
];

const Preview = ({ id, inlineCode }) => {
  const [viewport, setViewport] = useState(0);

  // inlineCode가 있으면 실시간 반영, 없으면 서버 URL 사용
  const srcDoc = useMemo(() => {
    if (!inlineCode?.html) return '';
    return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8"/>
<style>${inlineCode.css || ''}</style>
</head>
<body>
${inlineCode.html}
<script>${inlineCode.js || ''}</script>
</body>
</html>`;
  }, [inlineCode]);

  const iframeSrc = !inlineCode?.html && id ? `${API_URL}/api/preview/${id}` : undefined;

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        {VIEWPORTS.map((v, i) => (
          <button
            key={v.label}
            className={`${styles.vpBtn} ${viewport === i ? styles.active : ''}`}
            onClick={() => setViewport(i)}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className={styles.frame}>
        <iframe
          className={styles.iframe}
          style={{ width: VIEWPORTS[viewport].width }}
          title='미리보기'
          sandbox='allow-scripts'
          {...(srcDoc ? { srcDoc } : { src: iframeSrc })}
        />
      </div>
    </div>
  );
};

export default Preview;
