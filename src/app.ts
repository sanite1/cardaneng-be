import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { connectDb } from './config/db';
import authRoutes from './routes/authRoutes';
import uploadRoutes, { uploadsDir } from './routes/uploadRoutes';
import contactRoutes from './routes/contactRoutes';
import messageRoutes from './routes/messageRoutes';
import { resourceRouter } from './routes/resourceRouter';
import { Project } from './models/Project';
import { Product } from './models/Product';
import { News } from './models/News';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();

  // Behind a reverse proxy (Render/Railway/Nginx) so req.ip and rate limiting
  // see the real client IP rather than the proxy's.
  app.set('trust proxy', 1);

  app.use(cors({ origin: env.corsOrigin }));
  // Large limit because uploaded images may arrive as base64 data URLs for now.
  app.use(express.json({ limit: '12mb' }));

  // Serve disk-stored uploads (used when Cloudinary is not configured).
  app.use('/uploads', express.static(uploadsDir));

  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  // Ensure MongoDB is connected before handling data routes. On a persistent
  // server it is already connected (no-op); on serverless it connects lazily
  // and reuses the cached connection.
  app.use((_req, _res, next) => {
    connectDb()
      .then(() => next())
      .catch(next);
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/uploads', uploadRoutes);
  app.use('/api/contact', contactRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/projects', resourceRouter(Project));
  app.use('/api/products', resourceRouter(Product));
  app.use('/api/news', resourceRouter(News));

  app.use(errorHandler);

  return app;
}
