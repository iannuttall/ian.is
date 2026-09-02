-- Page views per post, counted by the browser after load via
-- /api/views/<slug>, so crawlers never add to it. Slugs are checked
-- against the posts collection before a row is created.
CREATE TABLE IF NOT EXISTS post_views (
  slug TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
