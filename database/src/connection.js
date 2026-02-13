import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

let instance = null;

export function getDatabase(dbPath) {
  if (instance) return instance;

  const resolvedPath = dbPath || path.join(process.cwd(), 'data', 'urls.db');
  const dir = path.dirname(resolvedPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  instance = new Database(resolvedPath);
  instance.pragma('journal_mode = WAL');

  return instance;
}
