const BASE62_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

function toBase62(num) {
  if (num === 0) return BASE62_CHARS[0];
  let result = '';
  while (num > 0) {
    result = BASE62_CHARS[num % 62] + result;
    num = Math.floor(num / 62);
  }
  return result;
}

export function createUrl(db, originalUrl) {
  const stmt = db.prepare(
    'INSERT INTO urls (original_url, short_code) VALUES (?, ?)'
  );
  // Insert with placeholder, then update with Base62-encoded ID
  const result = stmt.run(originalUrl, '__pending__');
  const id = result.lastInsertRowid;
  const shortCode = toBase62(Number(id));
  db.prepare('UPDATE urls SET short_code = ? WHERE id = ?').run(shortCode, id);
  return db.prepare('SELECT * FROM urls WHERE id = ?').get(id);
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
