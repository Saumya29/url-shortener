import { getDatabase } from '../src/connection.js';
import { initializeSchema } from '../src/schema.js';
import { createUrl } from '../src/models/url.js';

const db = getDatabase();
initializeSchema(db);

const sampleUrls = [
  'https://github.com/anthropics/claude-code',
  'https://docs.anthropic.com/en/docs/welcome',
  'https://en.wikipedia.org/wiki/URL_shortening',
];

console.log('Seeding database with sample URLs...\n');

for (const url of sampleUrls) {
  const row = createUrl(db, url);
  console.log(`  ${row.short_code} -> ${row.original_url}`);
}

console.log('\nDone. Seeded 3 sample URLs.');
db.close();
