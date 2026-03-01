import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Uploader from '../components/Uploader/Uploader';
import FigmaInput from '../components/FigmaInput/FigmaInput';
import { convertImage } from '../services/convertService';
import { convertFigma } from '../services/figmaService';
import styles from './Home.module.css';

const TABS = [
  { id: 'image', label: '이미지 업로드' },
  { id: 'figma', label: 'Figma 연동' },
];

const Home = () => {
  const [tab, setTab] = useState('image');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleImageConvert = async (file) => {
    setError('');
    setLoading(true);
    try {
      const result = await convertImage(file);
      navigate('/result', { state: { id: result.id, files: result.files } });
    } catch (e) {
      setError(e.response?.data?.error || '변환 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleFigmaConvert = async (params) => {
    setError('');
    setLoading(true);
    try {
      const result = await convertFigma(params);
      navigate('/result', { state: { id: result.id, files: result.files } });
    } catch (e) {
      setError(e.response?.data?.error || 'Figma 변환 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Design to Code</h1>
        <p className={styles.subtitle}>이미지 또는 Figma 디자인을 HTML · CSS · JS로 변환합니다</p>
      </header>

      <main className={styles.main}>
        <div className={styles.tabBar}>
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`${styles.tabBtn} ${tab === t.id ? styles.active : ''}`}
              onClick={() => { setTab(t.id); setError(''); }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className={styles.panel}>
          {tab === 'image' && <Uploader onConvert={handleImageConvert} loading={loading} />}
          {tab === 'figma' && <FigmaInput onConvert={handleFigmaConvert} loading={loading} />}
          {error && <p className={styles.error}>{error}</p>}
        </div>
      </main>
    </div>
  );
};

export default Home;
