import { Router } from 'express';
import { parseFigmaFile } from '../services/figmaParser.js';
import { generateCode } from '../services/codeGenerator.js';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const { fileKey, token, nodeId } = req.body;

    if (!fileKey || !token) {
      const err = new Error('fileKey와 token은 필수입니다.');
      err.status = 400;
      return next(err);
    }

    const ir = await parseFigmaFile({ fileKey, token, nodeId });
    const result = await generateCode(ir);

    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
