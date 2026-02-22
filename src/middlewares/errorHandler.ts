import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import HTTP_STATUS from '../constants/httpStatus';
import ApiError from '../utils/ApiError';

interface MongoError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
  path?: string;
  value?: unknown;
  errors?: Record<string, { message: string }>;
}

/**
 * Global error-handling middleware.
 * Catches all errors forwarded via next(err) and returns a consistent
 * JSON response.
 */
const errorHandler = (err: MongoError | ApiError, _req: Request, res: Response, _next: NextFunction): void => {
  let statusCode = (err as ApiError).statusCode || HTTP_STATUS.INTERNAL_SERVER;
  let message = err.message || 'Internal Server Error';

  // Log the error
  if (statusCode >= 500) {
    logger.error(err);
  } else {
    logger.warn(`${statusCode} - ${message}`);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = `Invalid ${(err as MongoError).path}: ${(err as MongoError).value}`;
  }

  // Mongoose duplicate key
  if ((err as MongoError).code === 11000) {
    statusCode = HTTP_STATUS.CONFLICT;
    const field = Object.keys((err as MongoError).keyValue || {}).join(', ');
    message = `Duplicate value for field(s): ${field}`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = HTTP_STATUS.UNPROCESSABLE;
    const messages = Object.values((err as MongoError).errors || {}).map((e) => e.message);
    message = messages.join('. ');
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: (err as ApiError).errors || [],
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
