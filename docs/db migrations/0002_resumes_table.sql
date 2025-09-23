-- 0002_resumes_table.sql
BEGIN;

CREATE TABLE IF NOT EXISTS resumes (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  resume_data TEXT NOT NULL,  -- JSON
  job_details TEXT NOT NULL,  -- JSON
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO schema_migrations (id, applied_at) VALUES ('0002_resumes_table.sql', datetime('now'));

COMMIT;
