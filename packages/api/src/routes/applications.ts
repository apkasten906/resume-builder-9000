// packages/api/src/routes/applications.ts
import { Router } from 'express';
import {
  listApplications,
  createApplication,
  updateStage,
  addAttachment,
} from '../controllers/applications.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();
router.use(requireAuth);
router.get('/', listApplications);
router.post('/', createApplication);
router.patch('/:id/stage', updateStage);
router.post('/:id/attachments', addAttachment);

export default router;
