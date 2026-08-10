-- Votes: display-only, never change verdicts. One row per (app, voter-hash).
-- Apply: wrangler d1 migrations apply shouldiselfhost-votes --remote
CREATE TABLE IF NOT EXISTS votes (
  app_id TEXT NOT NULL,
  voter_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (app_id, voter_hash)
);
CREATE INDEX IF NOT EXISTS idx_votes_app ON votes (app_id);
