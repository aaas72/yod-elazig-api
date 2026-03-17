import rateLimit from 'express-rate-limit';
import HTTP_STATUS from '../constants/httpStatus';

const isTest = process.env.NODE_ENV === 'test';

/**
 * General API rate limiter – 100 requests per 15 minutes per IP.
 * Relaxed in test environment.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 50000 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
});

/**
 * Stricter limiter for auth endpoints – 20 requests per 15 minutes.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 50000 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
});
