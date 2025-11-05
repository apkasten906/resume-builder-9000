import { z } from 'zod';

export const ParsedRegionSchema = z.object({
  id: z.string().optional(),
  page: z.number().int().nonnegative(),
  // bbox: [x, y, width, height] in PDF points (optional)
  bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]).optional(),
  text: z.string(),
  category: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
});

export type ParsedRegion = z.infer<typeof ParsedRegionSchema>;

export default ParsedRegionSchema;
