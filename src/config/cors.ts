import { CorsOptions } from 'cors';

/**
 * CORS configuration.
 * Allowed origins are read from the CLIENT_URL env variable.
 */
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
      .split(',')
      .map((o) => o.trim());

    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 h preflight cache
};

export default corsOptions;
