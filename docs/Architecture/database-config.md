# Database Configuration

## SQLite Database Location

The SQLite database file (`resume.db`) should always be located in the **`packages/api`** directory.

## Database Path Configuration

The database path is configurable through the `DB_PATH` environment variable. If not specified, the default behavior is to create/access the database file in the current working directory, which should be the `packages/api` directory when running the API server.

### Current Implementation

The database path is now centralized in `db.ts` using:

```typescript
// Database should be in the packages/api directory
// DB_PATH can be used to override the default location
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'resume.db');
```

All other files should import and use the `connectDatabase()` function from `db.js` to ensure consistency.

## Best Practice

When working with the database:

- Always run the API server from the `packages/api` directory
- Use `npm run dev` from the project root, which properly sets the working directory
- If manually executing database migrations or scripts, ensure you're in the `packages/api` directory

## Environment Variables

- `DB_PATH`: Override the default database path if needed

## Database Migrations

Database migrations should be run from the `packages/api` directory. See the migrations README in `docs/db migrations/migrations_README.md` for more details.
