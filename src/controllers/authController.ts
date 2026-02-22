import { Request, Response } from 'express';
import { authService } from '../services';
import { ApiResponse, asyncHandler } from '../utils';
import { HTTP_STATUS } from '../constants';

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body);
  new ApiResponse(HTTP_STATUS.CREATED, 'User registered successfully', {
    user,
    accessToken,
    refreshToken,
  }).send(res);
});

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.login(email, password);
  new ApiResponse(HTTP_STATUS.OK, 'Login successful', {
    user,
    accessToken,
    refreshToken,
  }).send(res);
});

/**
 * @desc    Refresh access token
 * @route   POST /api/v1/auth/refresh-token
 * @access  Public
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken: token } = req.body;
  const tokens = await authService.refreshAccessToken(token);
  new ApiResponse(HTTP_STATUS.OK, 'Token refreshed successfully', tokens).send(res);
});

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken: token } = req.body;
  await authService.logout(token);
  new ApiResponse(HTTP_STATUS.OK, 'Logged out successfully').send(res);
});

/**
 * @desc    Logout from all devices
 * @route   POST /api/v1/auth/logout-all
 * @access  Private
 */
export const logoutAll = asyncHandler(async (req: Request, res: Response) => {
  await authService.logoutAll(req.user!._id.toString());
  new ApiResponse(HTTP_STATUS.OK, 'Logged out from all devices').send(res);
});

/**
 * @desc    Forgot password
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const resetToken = await authService.forgotPassword(req.body.email);
  // In production, send this via email instead of response
  new ApiResponse(HTTP_STATUS.OK, 'Password reset token generated', {
    resetToken,
    resetUrl: `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`,
  }).send(res);
});

/**
 * @desc    Reset password
 * @route   POST /api/v1/auth/reset-password/:token
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.resetPassword(req.params.token as string, req.body.password);
  new ApiResponse(HTTP_STATUS.OK, 'Password reset successfully').send(res);
});

/**
 * @desc    Change password
 * @route   PUT /api/v1/auth/change-password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(
    req.user!._id.toString(),
    currentPassword,
    newPassword,
  );
  new ApiResponse(HTTP_STATUS.OK, 'Password changed successfully').send(res);
});

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getProfile(req.user!._id.toString());
  new ApiResponse(HTTP_STATUS.OK, 'Profile retrieved', { user }).send(res);
});
