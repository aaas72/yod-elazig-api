import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps an async Express handler so that rejected promises are
 * forwarded to the global error-handling middleware automatically.
 */
const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
