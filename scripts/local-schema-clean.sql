CREATE TABLE resumes (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  resume_data TEXT NOT NULL,
  job_details TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE sqlite_stat1 (tbl, idx, stat);

CREATE TABLE sqlite_stat4 (tbl, idx, neq, nlt, ndlt, sample);

CREATE TABLE schema_migrations (id TEXT PRIMARY KEY, applied_at TEXT NOT NULL);

CREATE TABLE applications (
  id TEXT PRIMARY KEY,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  location TEXT,
  stage TEXT NOT NULL CHECK (
    stage IN (
      'Prospect',
      'Applied',
      'Interview',
      'Offer',
      'Rejected',
      'Accepted'
    )
  ),
  last_updated TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime ('now')),
  jd_text TEXT,
  currency TEXT CHECK (currency IN ('USD', 'EUR', 'GBP', 'CAD', 'AUD')),
  salary_base REAL,
  salary_bonus REAL,
  salary_equity TEXT,
  salary_notes TEXT
);

CREATE TABLE application_status_history (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL,
  from_stage TEXT,
  to_stage TEXT NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime ('now')),
  FOREIGN KEY (application_id) REFERENCES applications (id) ON DELETE CASCADE
);

CREATE TABLE attachments (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('resume', 'cover_letter', 'other')),
  filename TEXT,
  mime_type TEXT,
  url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime ('now')),
  FOREIGN KEY (application_id) REFERENCES applications (id) ON DELETE CASCADE
);

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sqlite_sequence (name, seq);
