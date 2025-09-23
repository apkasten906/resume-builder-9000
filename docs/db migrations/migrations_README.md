# Database Migrations (better-sqlite3)

## Run

```bash
# from packages/api
node --loader ts-node/esm src/migrate.ts
# or compile, then:
# tsx src/migrate.ts

# actually ran the command from powershell: npx tsx .\src\migrate.ts DB_PATH="../../resume.db"
```

- Reads SQL files from `src/migrations` in lexical order.
- Tracks applied migrations in `schema_migrations`.
- Default DB path: `resume.db` (override with `DB_PATH=/path/to/file.sqlite`).
