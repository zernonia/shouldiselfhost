-- Newsletter signups (bootstrap also happens lazily in server/api/subscribe.post.ts)
CREATE TABLE IF NOT EXISTS subscribers (
  email TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
