import Database from 'better-sqlite3';

const db = new Database('registry.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS registry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    newsdate TEXT,
    reportdate TEXT,
    place TEXT,
    what TEXT,
    actiondate TEXT,
    meta TEXT,
    url TEXT
  )
`);

export default db;