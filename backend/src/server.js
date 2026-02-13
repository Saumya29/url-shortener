import { getDatabase, initializeSchema } from 'database';
import app from './app.js';

const PORT = process.env.PORT || 3001;

const db = getDatabase();
initializeSchema(db);

app.locals.db = db;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
