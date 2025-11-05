import { Router } from 'express';
import {
  parseResumeHandler,
  postResumeHandler,
  getResumeHandler,
  listResumesHandler,
  parseOnlyHandler,
  saveResumeHandler,
} from '../controllers/resume.js';

const router = Router();

// POST /api/resumes/ -> upload a resume file and parse it
router.post('/', parseResumeHandler, postResumeHandler);

// Compatibility: POST /api/resumes/parse -> return raw parsed regions (used by tests)
router.post('/parse', parseResumeHandler, parseOnlyHandler);

// POST /api/resumes/save -> save parsed resume (minimal stub)
router.post('/save', saveResumeHandler);

// GET /api/resumes/:id -> get a parsed resume
router.get('/:id', getResumeHandler);

// GET /api/resumes -> list resumes
router.get('/', listResumesHandler);

export default router;
