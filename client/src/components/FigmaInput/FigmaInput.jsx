import { useState } from 'react';
import styles from './FigmaInput.module.css';

const FigmaInput = ({ onConvert, loading }) => {
  const [token, setToken] = useState('');
  const [fileKey, setFileKey] = useState('');
  const [nodeId, setNodeId] = useState('');

  // Figma URL에서 fileKey 자동 추출
  const handleUrlPaste = (e) => {
    const val = e.target.value;
    const match = val.match(/figma\.com\/(?:file|design)\/([a-zA-Z0-9]+)/);
    if (match) {
      setFileKey(match[1]);
    } else {
      setFileKey(val);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fileKey || !token) return;
    onConvert({ fileKey, token, nodeId: nodeId || undefined });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label className={styles.label}>Personal Access Token</label>
        <input
          className={styles.input}
          type='password'
          placeholder='figd_...'
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
        />
        <span className={styles.help}>
          Figma → 계정 설정 → Security → Personal access tokens
        </span>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Figma 파일 URL 또는 파일 키</label>
        <input
          className={styles.input}
          type='text'
          placeholder='https://www.figma.com/file/xxxx 또는 파일 키'
          onChange={handleUrlPaste}
          required
        />
        {fileKey && <span className={styles.parsed}>파일 키: {fileKey}</span>}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Node ID (선택)</label>
        <input
          className={styles.input}
          type='text'
          placeholder='특정 프레임 ID (예: 1:2)'
          value={nodeId}
          onChange={(e) => setNodeId(e.target.value)}
        />
      </div>

      <button className={styles.submitBtn} type='submit' disabled={!fileKey || !token || loading}>
        {loading ? '변환 중...' : '변환 시작'}
      </button>
    </form>
  );
};

export default FigmaInput;
