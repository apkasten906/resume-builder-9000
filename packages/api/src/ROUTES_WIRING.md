# Mounting new API routes

In your Express app setup file (where `app` is created), add:

```ts
import applicationsRoutes from './routes/applications';
import { parseJD } from './controllers/jd';
import { tailorBullets } from './controllers/tailor';
import { downloadResume } from './controllers/resumeDownload';

app.use('/applications', applicationsRoutes);
app.post('/jd/parse', parseJD);
app.post('/tailor', tailorBullets);
app.post('/resume/download', downloadResume);
```

These endpoints are protected by `requireAuth` where appropriate (`/applications/*`). Adjust as needed.
