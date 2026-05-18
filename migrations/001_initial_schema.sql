-- Initial schema for MurMur Core Engine production runtime

CREATE TABLE IF NOT EXISTS executions (
  execution_id  TEXT PRIMARY KEY,
  variant_id    TEXT NOT NULL,
  seed          INTEGER NOT NULL,
  status        TEXT NOT NULL CHECK (status IN ('PENDING','RUNNING','COMPLETED','FAILED','TIMEOUT')),
  started_at    TEXT NOT NULL,
  completed_at  TEXT,
  reward        REAL,
  error         TEXT,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS variants (
  variant_id        TEXT PRIMARY KEY,
  version           TEXT NOT NULL,
  config            TEXT NOT NULL,  -- JSON
  is_baseline       INTEGER NOT NULL DEFAULT 0 CHECK (is_baseline IN (0,1)),
  created_at        TEXT NOT NULL,
  cumulative_reward REAL NOT NULL DEFAULT 0,
  execution_count   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS events (
  id           TEXT PRIMARY KEY,
  execution_id TEXT NOT NULL REFERENCES executions(execution_id),
  type         TEXT NOT NULL,
  timestamp    TEXT NOT NULL,
  payload      TEXT NOT NULL  -- JSON
);

CREATE INDEX IF NOT EXISTS idx_events_execution_id ON events (execution_id);
CREATE INDEX IF NOT EXISTS idx_executions_variant_id ON executions (variant_id);
