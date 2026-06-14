import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import {
  uploadImageBuffer,
  isCloudinaryConfigured,
} from '../config/cloudinary';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
});

const router = Router();

/**
 * POST /api/uploads — admin uploads an image (multipart field `file`); the
 * buffer is streamed to Cloudinary and the hosted URL is returned for storing
 * on a Project/Product/News document.
 */
router.post(
  '/',
  requireAuth,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!isCloudinaryConfigured) {
      res.status(503).json({ error: 'Image uploads are not configured' });
      return;
    }
    if (!req.file) {
      res
        .status(400)
        .json({ error: 'No file uploaded (expected field "file")' });
      return;
    }
    const result = await uploadImageBuffer(req.file.buffer);
    res.status(201).json(result);
  })
);

export default router;
