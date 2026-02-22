import { Router } from 'express';
import { dashboardController } from '../controllers';
import { verifyToken, authorizeRoles } from '../middlewares';
import { ROLES } from '../constants';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard statistics
 */

router.use(verifyToken);

/**
 * @swagger
 * /api/v1/dashboard:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  dashboardController.getStats,
);

export default router;
