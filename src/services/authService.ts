import { Types } from 'mongoose';
import { User, RefreshToken } from '../models';
import { IUser } from '../models/User';
import { ApiError, generateToken, verifyToken } from '../utils';
import { HTTP_STATUS } from '../constants';
import crypto from 'crypto';

class AuthService {
  /**
   * Register a new user
   */
  async register(data: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Email already registered');
    }

    const user = await User.create(data);
    const accessToken = generateToken.accessToken({
      id: (user._id as Types.ObjectId).toString(),
      role: user.role,
    });
    const refreshToken = await this.createRefreshToken(
      (user._id as Types.ObjectId).toString(),
    );

    return { user, accessToken, refreshToken };
  }

  /**
   * Login user
   */
  async login(
    email: string,
    password: string,
  ): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid email or password');
    }

    if (!user.isActive) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Account is deactivated');
    }

    const accessToken = generateToken.accessToken({
      id: (user._id as Types.ObjectId).toString(),
      role: user.role,
    });
    const refreshToken = await this.createRefreshToken(
      (user._id as Types.ObjectId).toString(),
    );

    return { user, accessToken, refreshToken };
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(
    token: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const storedToken = await RefreshToken.findOne({ token });
    if (!storedToken) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid refresh token');
    }

    if (storedToken.expiresAt < new Date()) {
      await RefreshToken.deleteOne({ _id: storedToken._id });
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Refresh token expired');
    }

    const decoded = verifyToken.refreshToken(token);
    if (!decoded) {
      await RefreshToken.deleteOne({ _id: storedToken._id });
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid refresh token');
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      await RefreshToken.deleteOne({ _id: storedToken._id });
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User not found or deactivated');
    }

    // Delete old refresh token
    await RefreshToken.deleteOne({ _id: storedToken._id });

    const accessToken = generateToken.accessToken({
      id: (user._id as Types.ObjectId).toString(),
      role: user.role,
    });
    const refreshToken = await this.createRefreshToken(
      (user._id as Types.ObjectId).toString(),
    );

    return { accessToken, refreshToken };
  }

  /**
   * Logout user - delete refresh token
   */
  async logout(token: string): Promise<void> {
    await RefreshToken.deleteOne({ token });
  }

  /**
   * Logout from all devices
   */
  async logoutAll(userId: string): Promise<void> {
    await RefreshToken.deleteMany({ user: new Types.ObjectId(userId) });
  }

  /**
   * Forgot password - generate reset token
   */
  async forgotPassword(email: string): Promise<string> {
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'No user found with this email');
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    return resetToken;
  }

  /**
   * Reset password using token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Token is invalid or has expired');
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Delete all refresh tokens for this user
    await RefreshToken.deleteMany({ user: user._id });
  }

  /**
   * Change password (authenticated)
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    if (!(await user.comparePassword(currentPassword))) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    // Delete all refresh tokens except current session
    await RefreshToken.deleteMany({ user: user._id });
  }

  /**
   * Get current user profile
   */
  async getProfile(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }
    return user;
  }

  // ──────────────── Private helpers ────────────────

  private async createRefreshToken(userId: string, role: string = ''): Promise<string> {
    const token = generateToken.refreshToken({ id: userId, role });

    await RefreshToken.create({
      token,
      user: new Types.ObjectId(userId),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return token;
  }
}

export default new AuthService();
