// packages/api/src/routes/test-support.ts
import { Router } from 'express';
import { applicationsRepo } from '../repositories/applicationsRepo.js';
import { connectDatabase } from '../db.js';

/**
 * This route is ONLY for testing purposes
 * It should never be enabled in production environments
 */
const router = Router();

// Only enable this route in test environments
const isTestEnvironment = process.env.NODE_ENV === 'test';

if (isTestEnvironment) {
  // Test-only endpoint to create an application without authentication
  router.post('/applications', async (req, res) => {
    const { company, role, location } = req.body || {};
    if (!company || !role) {
      return res.status(400).json({ error: 'company and role are required' });
    }
    const created = applicationsRepo.create({ company, role, location });
    return res.status(201).json(created);
  });

  // Test-only endpoint to clear all applications
  router.post('/clear-applications', async (_req, res) => {
    // Get direct DB connection instead of using the repository
    const db = connectDatabase();
    db.prepare('DELETE FROM applications').run();
    return res.status(200).json({ message: 'All applications cleared' });
  });
}

export default router;
