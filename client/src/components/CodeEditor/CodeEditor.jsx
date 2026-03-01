import { useState } from 'react';
import ReactCodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { downloadFile } from '../../utils/download';
import styles from './CodeEditor.module.css';

const TABS = [
  { id: 'html', label: 'HTML', lang: html(), filename: 'index.html', mime: 'text/html' },
  { id: 'css', label: 'CSS', lang: css(), filename: 'style.css', mime: 'text/css' },
  { id: 'js', label: 'JS', lang: javascript(), filename: 'script.js', mime: 'text/javascript' },
];

const CodeEditor = ({ files, onChange }) => {
  const [activeTab, setActiveTab] = useState('html');
  const [copied, setCopied] = useState(false);

  const current = TABS.find((t) => t.id === activeTab);
  const code = files[activeTab] || '';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    downloadFile(current.filename, code, current.mime);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.tabBar}>
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`${styles.tab} ${activeTab === t.id ? styles.active : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={handleCopy}>
            {copied ? '복사됨!' : '복사'}
          </button>
          <button className={styles.actionBtn} onClick={handleDownload}>
            저장
          </button>
        </div>
      </div>

      <div className={styles.editor}>
        <ReactCodeMirror
          value={code}
          height='420px'
          extensions={[current.lang]}
          onChange={(val) => onChange(activeTab, val)}
          theme='light'
          basicSetup={{ lineNumbers: true, foldGutter: true }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
