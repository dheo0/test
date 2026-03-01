import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

import convertRouter from './routes/convert.js';
import figmaRouter from './routes/figma.js';
import exportRouter from './routes/export.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// 업로드/출력 디렉토리 자동 생성
const uploadDir = process.env.UPLOAD_DIR || './uploads';
const outputDir = process.env.OUTPUT_DIR || './output';
[uploadDir, outputDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000' }));
app.use(express.json());

app.use('/api/convert', convertRouter);
app.use('/api/figma', figmaRouter);
app.use('/api', exportRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
