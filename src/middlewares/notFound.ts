import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError';
import HTTP_STATUS from '../constants/httpStatus';

/**
 * Middleware: catch 404 for undefined routes.
 */
const notFound = (req: Request, _res: Response, next: NextFunction): void => {
  next(new ApiError(HTTP_STATUS.NOT_FOUND, `Route not found: ${req.originalUrl}`));
};

export default notFound;
