import { useState, useRef } from 'react';
import styles from './Uploader.module.css';

const MAX_SIZE_MB = 10;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

const Uploader = ({ onConvert, loading }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState('');
  const inputRef = useRef(null);

  const validateAndSet = (f) => {
    setFileError('');
    if (!ALLOWED_TYPES.includes(f.type)) {
      setFileError('PNG, JPG, WebP 파일만 업로드할 수 있습니다.');
      return;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setFileError(`파일 크기는 ${MAX_SIZE_MB}MB를 초과할 수 없습니다.`);
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) validateAndSet(dropped);
  };

  const handleChange = (e) => {
    const selected = e.target.files[0];
    if (selected) validateAndSet(selected);
  };

  const handleConvert = () => {
    if (file) onConvert(file);
  };

  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.dropZone} ${dragOver ? styles.dragOver : ''} ${file ? styles.hasFile : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type='file'
          accept='image/png,image/jpeg,image/webp'
          className={styles.hiddenInput}
          onChange={handleChange}
        />
        {preview ? (
          <img src={preview} alt='미리보기' className={styles.thumbnail} />
        ) : (
          <div className={styles.placeholder}>
            <span className={styles.icon}>📁</span>
            <p className={styles.hint}>클릭하거나 이미지를 드래그하세요</p>
            <p className={styles.sub}>PNG, JPG, WebP · 최대 10MB</p>
          </div>
        )}
      </div>

      {fileError && <p className={styles.error}>{fileError}</p>}

      {file && (
        <p className={styles.fileName}>{file.name}</p>
      )}

      <button
        className={styles.convertBtn}
        onClick={handleConvert}
        disabled={!file || loading}
      >
        {loading ? '변환 중...' : '변환 시작'}
      </button>
    </div>
  );
};

export default Uploader;
