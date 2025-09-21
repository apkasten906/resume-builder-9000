import { Request, Response } from 'express';

// Test/mock resume upload handler
export function handleJsonResume(req: Request, res: Response): Response {
  const { resumeData, jobDetails } = req.body;
  if (!resumeData || !jobDetails) {
    return res.status(400).json({ error: 'Missing resumeData or jobDetails' });
  }
  // Simulate DB insert and return
  const id = 'test-resume-id';
  return res.status(201).json({
    id,
    content: 'Test resume content',
    resumeData,
    jobDetails,
    createdAt: new Date().toISOString(),
  });
}
