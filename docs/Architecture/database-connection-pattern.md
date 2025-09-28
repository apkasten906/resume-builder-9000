# Database Connection Pattern

## Overview

This document describes the centralized database connection pattern used throughout the Resume Builder 9000 application.

## Core Pattern

All database connections should be made through the centralized connection pattern defined in `packages/api/src/db.ts`. This ensures consistent database access and configuration across the application.

### Key Components

1. **Dynamic Database Path Resolution**:

   ```typescript
   // In db.ts
   // DB_PATH is determined dynamically for better test isolation
   export function connectDatabase(): SQLiteDatabase {
     if (db) {
       logger.debug('Using existing database connection');
       return db;
     }

     // Get DB path from environment or use default
     const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'resume.db');
     logger.info(`Opening new database connection to ${dbPath}`);
     db = new Database(dbPath);
     // ...
   }
   ```

2. **Connection Management**:

   ```typescript
   // In db.ts
   // Module-level connection variable
   let db: SQLiteDatabase | null = null;

   export function connectDatabase(): SQLiteDatabase {
     // ... connection logic as shown above
     return db;
   }

   // Explicit connection closing (useful for tests)
   export function closeDatabase(): void {
     if (db) {
       logger.debug('Closing database connection');
       db.close();
       db = null;
     }
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

For integration testing with the database:

1. **Database Isolation Options**:
   - Use an in-memory database (`:memory:`) for fast tests that don't need persistence
   - Use a test-specific file database with a unique path for tests requiring persistence

2. **Test Setup Best Practices**:
   - Set the `DB_PATH` environment variable to point to your test database before each test
   - Call `closeDatabase()` after each test to ensure a fresh connection on the next test
   - Use unique filenames (e.g., with timestamps) to prevent test interference

3. **Example Integration Test Setup**:

   ```typescript
   import { connectDatabase, closeDatabase } from '../../src/db.js';
   import path from 'path';

   describe('Database Integration Tests', () => {
     // Generate a unique test database path for test isolation
     const testDbPath = path.join(__dirname, `test-db-${Date.now()}.db`);

     beforeEach(() => {
       // Close any existing connection and set up a fresh test database
       closeDatabase();
       process.env.DB_PATH = testDbPath;
       // Initialize the test database...
     });

     afterEach(() => {
       // Clean up after each test
       closeDatabase();
       delete process.env.DB_PATH;
       // Delete the test database file if needed...
     });

     // Test cases...
   });
   ```
