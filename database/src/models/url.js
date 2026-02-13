import { nanoid } from 'nanoid';

export function createUrl(db, originalUrl) {
  const shortCode = nanoid(7);
  const stmt = db.prepare(
    'INSERT INTO urls (original_url, short_code) VALUES (?, ?)'
  );
  const result = stmt.run(originalUrl, shortCode);
  return db.prepare('SELECT * FROM urls WHERE id = ?').get(result.lastInsertRowid);
}

export function findByCode(db, shortCode) {
  return db.prepare('SELECT * FROM urls WHERE short_code = ?').get(shortCode);
}

export function findAll(db) {
  return db.prepare('SELECT * FROM urls ORDER BY created_at DESC').all();
}

export function incrementClicks(db, shortCode) {
  return db.prepare(
    'UPDATE urls SET click_count = click_count + 1 WHERE short_code = ?'
  ).run(shortCode);
}

export function deleteUrl(db, shortCode) {
  const result = db.prepare('DELETE FROM urls WHERE short_code = ?').run(shortCode);
  return result.changes > 0;
}
