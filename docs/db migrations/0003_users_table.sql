-- 0003_users_table.sql
BEGIN;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO users (id, email, password_hash, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'user@example.com',
  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZag0u6Y4ZC1rQZ1rQZ1rQZ1rQZ1G',
  datetime('now')
);

INSERT OR IGNORE INTO schema_migrations (id, applied_at) VALUES ('0003_users_table.sql', datetime('now'));

COMMIT;
