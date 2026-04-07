-- Migration: Add translation columns for multilingual support
-- Run with: sqlite3 local.db < scripts/migrate-translations.sql

-- Create polls table with translation columns (if not exists)
CREATE TABLE IF NOT EXISTS polls (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  description_en TEXT,
  logo_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Create poll_questions table with translation columns (if not exists)
CREATE TABLE IF NOT EXISTS poll_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  poll_id TEXT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  question TEXT NOT NULL,
  question_en TEXT,
  options TEXT,
  options_en TEXT,
  required INTEGER NOT NULL DEFAULT 1,
  order_index INTEGER NOT NULL
);

-- Create poll_responses table (if not exists)
CREATE TABLE IF NOT EXISTS poll_responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  poll_id TEXT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  answers TEXT NOT NULL,
  ip_address TEXT,
  country TEXT,
  city TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- If tables already exist, add columns (SQLite doesn't support IF NOT EXISTS for columns)
-- Uncomment these if you need to add columns to existing tables:
-- ALTER TABLE polls ADD COLUMN title_en TEXT;
-- ALTER TABLE polls ADD COLUMN description_en TEXT;
-- ALTER TABLE poll_questions ADD COLUMN question_en TEXT;
-- ALTER TABLE poll_questions ADD COLUMN options_en TEXT;
