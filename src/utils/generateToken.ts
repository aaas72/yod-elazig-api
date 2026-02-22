import jwt from 'jsonwebtoken';

export interface TokenPayload {
  id: string;
  role: string;
}

/**
 * Generate a JWT access token.
 */
export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  } as jwt.SignOptions);
};

/**
 * Generate a JWT refresh token.
 */
export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: process.env.REFRESH_EXPIRES_IN || '7d',
  } as jwt.SignOptions);
};

/**
 * Verify an access token.
 */
export const verifyAccessToken = (token: string): TokenPayload & jwt.JwtPayload => {
  return jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload & jwt.JwtPayload;
};

/**
 * Verify a refresh token.
 */
export const verifyRefreshToken = (token: string): TokenPayload & jwt.JwtPayload => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as TokenPayload & jwt.JwtPayload;
};
