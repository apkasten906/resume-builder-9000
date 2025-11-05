import { z } from 'zod';
import ParsedRegionSchema from './parsed-region.dto.js';

export const ResumeUploadSchema = z.object({
  userId: z.string().optional(),
  sourceResumeId: z.string().nullable().optional(),
  regions: z.array(ParsedRegionSchema),
});

export type ResumeUpload = z.infer<typeof ResumeUploadSchema>;

export default ResumeUploadSchema;
