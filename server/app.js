import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';

import convertRouter from './routes/convert.js';
import figmaRouter from './routes/figma.js';
import exportRouter from './routes/export.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { IS_VERCEL, IS_TEST, getUploadDir, getOutputDir } from './utils/env.js';

const app = express();

// 환경별 디렉토리 자동 생성
// - 로컬: ./uploads, ./output
// - Vercel: /tmp/uploads, /tmp/output (서버리스는 /tmp 외 쓰기 불가)
[getUploadDir(), getOutputDir()].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000' }));
app.use(express.json());

app.use('/api/convert', convertRouter);
app.use('/api/figma', figmaRouter);
app.use('/api', exportRouter);

app.use(errorHandler);

// 로컬 개발 서버 실행 (Vercel·테스트 환경에서는 실행 안 함)
if (!IS_VERCEL && !IS_TEST) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`[local] Server running on http://localhost:${PORT}`));
}

export default app;
