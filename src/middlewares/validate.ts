import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError';
import HTTP_STATUS from '../constants/httpStatus';

/**
 * Middleware: run express-validator checks and return errors if any.
 * Place AFTER the validation chain array in the route definition.
 */
const validate = (req: Request, _res: Response, next: NextFunction): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: (err as { path?: string }).path,
      message: err.msg as string,
    }));

    return next(new ApiError(HTTP_STATUS.UNPROCESSABLE, 'Validation failed', extractedErrors));
  }

  next();
};

export default validate;
