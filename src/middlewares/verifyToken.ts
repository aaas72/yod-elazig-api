import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError';
import { verifyAccessToken } from '../utils/generateToken';
import User from '../models/User';
import HTTP_STATUS from '../constants/httpStatus';

/**
 * Middleware: verify JWT access token from Authorization header.
 * Attaches the authenticated user to `req.user`.
 */
const verifyToken = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    // 1) Extract token
    let token: string | undefined;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Access denied. No token provided.'));
    }

    // 2) Verify token
    const decoded = verifyAccessToken(token);

    // 3) Check if user still exists
    const user = await User.findById(decoded.id).select('+password');
    if (!user) {
      return next(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User belonging to this token no longer exists.'));
    }

    // 4) Check if user changed password after token was issued
    if (decoded.iat && user.changedPasswordAfter(decoded.iat)) {
      return next(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Password recently changed. Please log in again.'));
    }

    // 5) Check if user is active
    if (!user.isActive) {
      return next(new ApiError(HTTP_STATUS.FORBIDDEN, 'Account has been deactivated.'));
    }

    // 6) Grant access
    req.user = user;
    next();
  } catch (error) {
    if ((error as Error).name === 'JsonWebTokenError') {
      return next(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid token.'));
    }
    if ((error as Error).name === 'TokenExpiredError') {
      return next(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Token has expired.'));
    }
    next(error);
  }
};

export default verifyToken;
