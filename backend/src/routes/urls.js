import { Router } from 'express';
import { createUrl, findAll, findByCode, incrementClicks, deleteUrl } from 'database';
import { validateUrl } from '../middleware/validateUrl.js';

const router = Router();

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

function formatUrl(row) {
  return {
    id: row.id,
    originalUrl: row.original_url,
    shortCode: row.short_code,
    shortUrl: `${BASE_URL}/r/${row.short_code}`,
    createdAt: row.created_at,
    clickCount: row.click_count,
  };
}

router.post('/api/urls', validateUrl, (req, res, next) => {
  try {
    const row = createUrl(req.app.locals.db, req.body.originalUrl);
    res.status(201).json(formatUrl(row));
  } catch (err) {
    next(err);
  }
});

router.get('/api/urls', (req, res, next) => {
  try {
    const rows = findAll(req.app.locals.db);
    res.json(rows.map(formatUrl));
  } catch (err) {
    next(err);
  }
});

router.get('/api/urls/:shortCode', (req, res, next) => {
  try {
    const row = findByCode(req.app.locals.db, req.params.shortCode);
    if (!row) {
      return res.status(404).json({ error: 'URL not found' });
    }
    res.json(formatUrl(row));
  } catch (err) {
    next(err);
  }
});

router.delete('/api/urls/:shortCode', (req, res, next) => {
  try {
    const deleted = deleteUrl(req.app.locals.db, req.params.shortCode);
    if (!deleted) {
      return res.status(404).json({ error: 'URL not found' });
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.get('/r/:shortCode', (req, res, next) => {
  try {
    const row = findByCode(req.app.locals.db, req.params.shortCode);
    if (!row) {
      return res.status(404).json({ error: 'URL not found' });
    }
    incrementClicks(req.app.locals.db, req.params.shortCode);
    res.redirect(302, row.original_url);
  } catch (err) {
    next(err);
  }
});

export default router;
