# Import Order Fix Example

## Issue from Review
"The function `getAllResumesFromDb` is defined before the necessary imports. This violates JavaScript/TypeScript module structure where imports should come first."

## Current Structure (Problematic)
```typescript
export function getAllResumesFromDb(): StoredResume[] {
  const database = connectDatabase();
  logger.debug('Fetching all resumes from database');
  // ... function implementation
}

import { randomUUID } from 'crypto';
import BetterSQLite3 from 'better-sqlite3';
import { logger } from './utils/logger.js';
import { StoredResume, DatabaseRow } from './types/database.js';
```

## Fixed Structure
```typescript
// All imports must come first
import { randomUUID } from 'crypto';
import BetterSQLite3 from 'better-sqlite3';
import { logger } from './utils/logger.js';
import { StoredResume, DatabaseRow } from './types/database.js';

// Then function definitions
export function getAllResumesFromDb(): StoredResume[] {
  const database = connectDatabase();
  logger.debug('Fetching all resumes from database');
  try {
    const stmt = database.prepare('SELECT * FROM resumes ORDER BY created_at DESC');
    const results = stmt.all() as DatabaseRow[];
    return results.map(result => ({
      id: result.id,
      content: result.content,
      resumeData: JSON.parse(result.resume_data),
      jobDetails: JSON.parse(result.job_details),
      createdAt: result.created_at,
    }));
  } catch (error) {
    logger.error('Error retrieving all resumes from database', { error });
    throw error;
  }
}

// Other existing functions...
export function connectDatabase(): BetterSQLite3.Database {
  // existing implementation
}
```

## Key Points
1. **All imports at the top**: Essential for proper module structure
2. **Group imports logically**: Node.js built-ins, external packages, internal modules
3. **Consistent ordering**: Maintains readability and prevents circular dependency issues
4. **ESLint integration**: Can be automated with import/order rules

## ESLint Rule Configuration
```json
{
  "rules": {
    "import/order": [
      "error",
      {
        "groups": [
          "builtin",
          "external", 
          "internal",
          "parent",
          "sibling",
          "index"
        ],
        "newlines-between": "always"
      }
    ]
  }
}
```

This ensures consistent import ordering across the codebase.