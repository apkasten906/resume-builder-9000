# Mounting new API routes (thin-routes / services pattern)

Place route wiring in `routes/*` and keep handlers/controllers thin. Handlers should validate/normalize request data and then call a service in `packages/api/src/services` which performs business logic and side-effects.

Example — mount routers in your app setup file:

```ts
import applicationsRoutes from './routes/applications';
import resumeRoutes from './routes/resume';

app.use('/applications', applicationsRoutes);
app.use('/resume', resumeRoutes);
```

Example route (routes/resume.ts):

```ts
import { Router } from 'express';
import multer from 'multer';
import { handleParseRoute } from '../controllers/resumeControllers';

const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });
const router = Router();

// route handler should be thin: validate, then call a service
router.post('/parse', upload.single('file'), handleParseRoute);

export default router;
```

Example controller (controllers/resumeControllers.ts):

```ts
import { Request, Response } from 'express';
import { resumeParseService } from '../services/resumeParseService';

export async function handleParseRoute(req: Request, res: Response) {
  // validate file + DTOs here, then call service
  const file = req.file; // validated earlier by middleware
  const result = await resumeParseService.parseResumeFile(file.buffer, { maxPages: 5 });
  return res.json(result);
}
```

Notes

- Protect endpoints with `requireAuth` where appropriate (for example, `/applications/*`).
- Prefer service-level unit tests and lightweight route/controller tests as described in the repo governance docs.
