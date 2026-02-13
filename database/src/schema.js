export function initializeSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS urls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      original_url TEXT NOT NULL,
      short_code TEXT NOT NULL UNIQUE,
      created_at TEXT DEFAULT (datetime('now')),
      click_count INTEGER DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_short_code ON urls(short_code);
  `);
}
