import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

/** Custom log format */
const logFormat = printf(({ level, message, timestamp: ts, stack }) => {
  return `${ts} [${level}]: ${(stack as string) || message}`;
});

/**
 * Application-wide logger (Winston).
 * - Console transport for all environments.
 * - File transports for error & combined logs in production.
 */
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), logFormat),
  defaultMeta: { service: 'yod-elazig-api' },
  transports: [
    new winston.transports.Console({
      format: combine(colorize(), logFormat),
    }),
  ],
});

// Production-only file transports
if (process.env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({ filename: 'logs/error.log', level: 'error', maxsize: 5242880 }),
  );
  logger.add(
    new winston.transports.File({ filename: 'logs/combined.log', maxsize: 5242880 }),
  );
}

export default logger;
