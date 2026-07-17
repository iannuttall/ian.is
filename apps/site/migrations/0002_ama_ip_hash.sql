-- Salted hash of the submitter IP, used only to cap submissions per day.
ALTER TABLE ama_questions ADD COLUMN ip_hash TEXT;

CREATE INDEX IF NOT EXISTS ama_questions_ip_created
  ON ama_questions (ip_hash, created_at);
