import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from './generateToken';

export { default as ApiError } from './ApiError';
export { default as ApiResponse } from './ApiResponse';
export { default as asyncHandler } from './asyncHandler';
export { default as logger } from './logger';
export { createSlug } from './slugify';
export type { TokenPayload } from './generateToken';

export const generateToken = {
  accessToken: generateAccessToken,
  refreshToken: generateRefreshToken,
};

export const verifyToken = {
  accessToken: verifyAccessToken,
  refreshToken: verifyRefreshToken,
};
