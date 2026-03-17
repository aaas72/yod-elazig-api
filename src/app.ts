import path from 'path';
import express, { Application, Request, Response, NextFunction } from 'express';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import swaggerUi from 'swagger-ui-express';

import corsOptions from './config/cors';
import swaggerSpec from './config/swagger';
import { apiLimiter, errorHandler, notFound } from './middlewares';
import routes from './routes';
import { logger } from './utils';

const app: Application = express();

// ── Compression (gzip/brotli) ────────────────────────
app.use(compression());

// ── Security middleware ──────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  // 1️⃣ Content Security Policy (CSP) - prevents XSS
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'self'"],         // 2️⃣ replaces X-Frame-Options
      upgradeInsecureRequests: [],
    },
  },
  // 2️⃣ Anti-clickjacking
  frameguard: { action: 'sameorigin' },
  // 5️⃣ Strict-Transport-Security (HSTS)
  hsts: {
    maxAge: 31536000,                     // 1 year
    includeSubDomains: true,
    preload: true,
  },
  // 6️⃣ X-Content-Type-Options: nosniff  (helmet enables by default, being explicit)
  noSniff: true,
  // 4️⃣ Hide X-Powered-By (helmet does this by default)
  hidePoweredBy: true,
}));
app.use(cors(corsOptions));
app.use(mongoSanitize());
app.use(hpp());

// 4️⃣ Remove Server header to prevent version leakage
app.disable('x-powered-by');
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.removeHeader('Server');
  next();
});

// 7️⃣ Cache-Control for API responses (prevent caching sensitive data)
app.use('/api/', (_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});
// Note: xss-clean removed globally because RichTextEditor sends valid HTML content.
// XSS protection is handled by helmet headers (CSP) and output encoding on the client.

// ── Body parsers ─────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Static files (uploads) ───────────────────────────
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
app.use(`/${uploadDir}`, express.static(path.join(process.cwd(), uploadDir), {
  maxAge: '30d',              // Cache uploads for 30 days
  immutable: true,
}));
app.use(express.static('public', {
  maxAge: '365d',              // Cache public assets for 365 days
  immutable: true,
}));

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
