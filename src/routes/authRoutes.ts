import { Router } from 'express';
import { authController } from '../controllers';
import { verifyToken, validate, authLimiter } from '../middlewares';
import {
  registerRules,
  loginRules,
  refreshTokenRules,
  forgotPasswordRules,
  resetPasswordRules,
  changePasswordRules,
} from '../validators';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication & Authorization
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post(
  '/register',
  authLimiter,
  registerRules,
  validate,
  authController.register,
);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', authLimiter, loginRules, validate, authController.login);

/**
 * @swagger
 * /api/v1/auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 */
router.post(
  '/refresh-token',
  refreshTokenRules,
  validate,
  authController.refreshToken,
);

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Auth]
 */
router.post(
  '/forgot-password',
  authLimiter,
  forgotPasswordRules,
  validate,
  authController.forgotPassword,
);

/**
 * @swagger
 * /api/v1/auth/reset-password/{token}:
 *   post:
 *     summary: Reset password using token
 *     tags: [Auth]
 */
router.post(
  '/reset-password/:token',
  resetPasswordRules,
  validate,
  authController.resetPassword,
);

// ── Protected routes ─────────────────────────────────

router.use(verifyToken);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.get('/me', authController.getMe);

/**
 * @swagger
 * /api/v1/auth/change-password:
 *   put:
 *     summary: Change password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/change-password',
  changePasswordRules,
  validate,
  authController.changePassword,
);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.post('/logout', authController.logout);

/**
 * @swagger
 * /api/v1/auth/logout-all:
 *   post:
 *     summary: Logout from all devices
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.post('/logout-all', authController.logoutAll);

export default router;
