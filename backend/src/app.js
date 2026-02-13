import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import healthRouter from './routes/health.js';
import urlsRouter from './routes/urls.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.disable('x-powered-by');
app.use(helmet());

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000'];
app.use(cors({ origin: allowedOrigins }));

app.use(express.json({ limit: '10kb' }));

const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: 'Too many requests, please try again later' },
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later' },
});

app.use('/api/urls', (req, res, next) => {
  if (req.method === 'POST') return createLimiter(req, res, next);
  return generalLimiter(req, res, next);
});
app.use('/r/', generalLimiter);

app.use(healthRouter);
app.use(urlsRouter);

app.use(errorHandler);

export default app;
