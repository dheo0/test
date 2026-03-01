import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Preview from '../components/Preview/Preview';
import CodeEditor from '../components/CodeEditor/CodeEditor';
import { fetchCode } from '../services/convertService';
import { downloadZip } from '../utils/download';
import styles from './Result.module.css';

const Result = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [code, setCode] = useState({ html: '', css: '', js: '' });
  const [loading, setLoading] = useState(true);
  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => {
    if (!state?.id) {
      navigate('/');
      return;
    }
    fetchCode(state.id)
      .then(setCode)
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [state, navigate]);

  const handleCodeChange = (type, value) => {
    setCode((prev) => ({ ...prev, [type]: value }));
    setPreviewKey((k) => k + 1);
  };

  const handleDownload = () => downloadZip(state.id);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>변환 결과를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>← 처음으로</button>
        <h1 className={styles.title}>변환 결과</h1>
        <button className={styles.downloadBtn} onClick={handleDownload}>ZIP 다운로드</button>
      </header>

      <div className={styles.body}>
        <section className={styles.previewSection}>
          <h2 className={styles.sectionTitle}>미리보기</h2>
          <Preview key={previewKey} id={state.id} inlineCode={code} />
        </section>

        <section className={styles.editorSection}>
          <h2 className={styles.sectionTitle}>코드 편집</h2>
          <CodeEditor files={code} onChange={handleCodeChange} />
        </section>
      </div>
    </div>
  );
};

export default Result;
