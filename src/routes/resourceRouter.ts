import { Router } from 'express';
import type { Model } from 'mongoose';
import { crudController } from '../controllers/crudController';
import { requireAuth } from '../middleware/auth';

/**
 * Builds a REST router for a content model. Reads are public (the website needs
 * them); writes require a valid admin token.
 */
export function resourceRouter(model: Model<any>): Router {
  const c = crudController(model);
  const router = Router();

  router.get('/', c.list);
  router.get('/:id', c.get);
  router.post('/', requireAuth, c.create);
  router.put('/:id', requireAuth, c.update);
  router.delete('/:id', requireAuth, c.remove);

  return router;
}
