import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { requireAuth } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import {
  uploadImageBuffer,
  isCloudinaryConfigured,
} from '../config/cloudinary';
import { env } from '../config/env';

// Where disk-stored uploads live (used when Cloudinary is not configured).
export const uploadsDir = path.join(process.cwd(), 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const EXT: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
  'image/avif': '.avif',
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
  fileFilter: (_req, file, cb) => {
    cb(null, file.mimetype.startsWith('image/'));
  },
});

const router = Router();

/**
 * POST /api/uploads — admin uploads an image (multipart field `file`).
 * Prefers Cloudinary when configured (persistent CDN); otherwise stores the
 * file on local disk and serves it back. Returns `{ url, publicId }`.
 */
router.post(
  '/',
  requireAuth,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res
        .status(400)
        .json({ error: 'No image uploaded (expected field "file")' });
      return;
    }

    if (isCloudinaryConfigured) {
      const result = await uploadImageBuffer(req.file.buffer);
      res.status(201).json(result);
      return;
    }

    // Disk fallback.
    const ext =
      EXT[req.file.mimetype] || path.extname(req.file.originalname) || '.img';
    const filename = `${crypto.randomUUID()}${ext}`;
    await fs.promises.writeFile(
      path.join(uploadsDir, filename),
      req.file.buffer
    );
    const base = env.publicUrl || `${req.protocol}://${req.get('host')}`;
    res.status(201).json({
      url: `${base}/uploads/${filename}`,
      publicId: filename,
    });
  })
);

export default router;
