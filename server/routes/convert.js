import { Router } from 'express';
import upload from '../middlewares/upload.js';
import { analyzeImage } from '../services/imageAnalyzer.js';
import { generateCode } from '../services/codeGenerator.js';

const router = Router();

router.post('/', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      const err = new Error('이미지 파일이 필요합니다.');
      err.status = 400;
      return next(err);
    }

    const ir = await analyzeImage(req.file.path);
    const result = await generateCode(ir);

    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
