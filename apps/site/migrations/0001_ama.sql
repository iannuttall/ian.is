-- AMA question inbox. Public visitors insert via /api/ama; only the local
-- `ian ama` CLI reads it. Answers live in git (src/content/ama), not here.
CREATE TABLE IF NOT EXISTS ama_questions (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  context TEXT,
  -- pending | answered | hidden
  status TEXT NOT NULL DEFAULT 'pending',
  -- Set when answered; matches the src/content/ama/<slug>.md filename.
  slug TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  answered_at TEXT
);

CREATE INDEX IF NOT EXISTS ama_questions_status_created
  ON ama_questions (status, created_at DESC);
