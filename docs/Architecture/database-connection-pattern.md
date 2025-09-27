# Database Connection Pattern

## Overview

This document describes the centralized database connection pattern used throughout the Resume Builder 9000 application.

## Core Pattern

All database connections should be made through the centralized connection pattern defined in `packages/api/src/db.ts`. This ensures consistent database access and configuration across the application.

### Key Components

1. **Centralized DB_PATH Definition**:

   ```typescript
   // In db.ts
   const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'resume.db');
   ```

2. **Connection Factory**:

   ```typescript
   // In db.ts
   export function connectDatabase(): SQLiteDatabase {
     if (db) {
       logger.debug('Using existing database connection');
       return db;
     }

     logger.info(`Opening new database connection to ${DB_PATH}`);
     db = new Database(DB_PATH);
     // Initialize tables...
     return db;
   }
   ```

3. **Repository Pattern**:
   Each repository (like `applicationsRepo`) should import and use the connection factory:

   ```typescript
   import { connectDatabase } from '../db.js';
   const db = connectDatabase();
   ```

## Usage Guidelines

### Import Structure

Always import the database connection with the `.js` extension to comply with ES modules requirements:

```typescript
// Correct
import { connectDatabase } from '../db.js';

// Incorrect
import { connectDatabase } from '../db';
```

### Connection Management

- The connection is initialized once and reused for subsequent requests
- The connection is automatically created when first needed
- Don't manually close the connection unless absolutely necessary

### Environment Variables

- `DB_PATH`: Override the default database location if needed
- In development, the default location is in the `packages/api` directory

## Examples

### Service Layer

```typescript
// In a service file
import { connectDatabase } from '../db.js';

export function myServiceFunction() {
  const db = connectDatabase();
  // Use the database connection...
}
```

### Repository Layer

```typescript
// In a repository file
import { connectDatabase } from '../db.js';

const db = connectDatabase();

export const myRepository = {
  getItems() {
    return db.prepare('SELECT * FROM items').all();
  },
  // Other repository methods...
};
```

## Testing Considerations

For testing:

1. Use an in-memory database or a test-specific database file
2. Set the `DB_PATH` environment variable to point to your test database
3. Clear data between tests to ensure isolation
