const Database = require("better-sqlite3");

const db = new Database("navira.db");

db.exec(`
CREATE TABLE IF NOT EXISTS profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE,
  partition TEXT,
  created_at INTEGER
);

CREATE TABLE IF NOT EXISTS tabs (
  id INTEGER PRIMARY KEY,
  profile_id INTEGER,
  url TEXT,
  title TEXT,
  favicon TEXT,
  partition_name TEXT,
  is_active INTEGER,
  created_at INTEGER
);

CREATE TABLE IF NOT EXISTS history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT,
  title TEXT,
  visited_at INTEGER
);

CREATE TABLE IF NOT EXISTS downloads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT,
  file_path TEXT,
  status TEXT,
  created_at INTEGER
);

CREATE TABLE IF NOT EXISTS permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  domain TEXT,
  permission TEXT,
  status TEXT,
  created_at INTEGER
);
`);

module.exports = db;