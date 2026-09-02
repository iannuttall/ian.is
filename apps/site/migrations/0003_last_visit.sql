-- One row: where the most recent human visitor came from, for the footer's
-- "Last visit from City, CC" line. City and country only, never an IP.
-- Written by /api/last-visit, which browsers call after the page loads.
CREATE TABLE IF NOT EXISTS last_visit (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  seen_at TEXT NOT NULL DEFAULT (datetime('now'))
);
