import { Router } from 'express';
import { crudController } from '../controllers/crudController';
import { requireAuth } from '../middleware/auth';
import { Message } from '../models/Message';

// Contact-form messages are private, so every route here requires admin auth.
// Creation happens via the public POST /api/contact, not here.
const c = crudController(Message);
const router = Router();

router.get('/', requireAuth, c.list);
router.get('/:id', requireAuth, c.get);
router.put('/:id', requireAuth, c.update); // e.g. mark handled
router.delete('/:id', requireAuth, c.remove);

export default router;
