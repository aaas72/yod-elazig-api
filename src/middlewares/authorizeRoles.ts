import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError';
import HTTP_STATUS from '../constants/httpStatus';
import { Role } from '../constants/roles';

/**
 * Middleware factory: restrict access to specified roles.
 * Must be used AFTER verifyToken.
 *
 * @example
 * router.delete('/users/:id', verifyToken, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), deleteUser);
 */
const authorizeRoles = (...roles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Authentication required.'));
    }

    if (!roles.includes(req.user.role as Role)) {
      return next(
        new ApiError(
          HTTP_STATUS.FORBIDDEN,
          'You do not have permission to perform this action.',
        ),
      );
    }

    next();
  };
};

export default authorizeRoles;
