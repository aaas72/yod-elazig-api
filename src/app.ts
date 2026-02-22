import path from 'path';
import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import xss from 'xss-clean';
import swaggerUi from 'swagger-ui-express';

import corsOptions from './config/cors';
import swaggerSpec from './config/swagger';
import { apiLimiter } from './middlewares';
import { errorHandler, notFound } from './middlewares';
import routes from './routes';
import { logger } from './utils';

const app: Application = express();

// ── Security middleware ──────────────────────────────
app.use(helmet());
app.use(cors(corsOptions));
app.use(mongoSanitize());
app.use(hpp());
app.use(xss());

// ── Body parsers ─────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Static files (uploads) ───────────────────────────
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ── Accept-Language middleware (i18n) ────────────────
app.use((req: Request, _res: Response, next: NextFunction) => {
  const lang = (req.headers['accept-language'] || 'tr').split(',')[0].split('-')[0].trim();
  req.lang = ['ar', 'en', 'tr'].includes(lang) ? lang : 'tr';
  next();
});

// ── Logging ──────────────────────────────────────────
app.use(
  morgan('combined', {
    stream: { write: (message: string) => logger.info(message.trim()) },
  }),
);

// ── Rate limiting ────────────────────────────────────
app.use('/api/', apiLimiter);

// ── API Documentation ────────────────────────────────
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ── Health check ─────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ── API routes ───────────────────────────────────────
app.use('/api/v1', routes);

// ── Error handling ───────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
