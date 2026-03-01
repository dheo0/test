import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

const router = Router();

const getOutputDir = (id) =>
  path.join(process.env.OUTPUT_DIR || './output', id);

// ZIP 다운로드
router.get('/export/:id', (req, res, next) => {
  try {
    const dir = getOutputDir(req.params.id);

    if (!fs.existsSync(dir)) {
      const err = new Error('변환 결과를 찾을 수 없습니다.');
      err.status = 404;
      return next(err);
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="code-${req.params.id}.zip"`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', next);
    archive.pipe(res);
    archive.directory(dir, false);
    archive.finalize();
  } catch (err) {
    next(err);
  }
});

// HTML 미리보기
router.get('/preview/:id', (req, res, next) => {
  try {
    const filePath = path.join(getOutputDir(req.params.id), 'index.html');

    if (!fs.existsSync(filePath)) {
      const err = new Error('미리보기 파일을 찾을 수 없습니다.');
      err.status = 404;
      return next(err);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    next(err);
  }
});

export default router;
