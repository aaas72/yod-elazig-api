import { Router } from 'express';
import { newsController } from '../controllers';
import { verifyToken, authorizeRoles, validate } from '../middlewares';
import { createNewsRules, updateNewsRules } from '../validators';
import { ROLES } from '../constants';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: News
 *   description: News management
 */

// ── Public routes ────────────────────────────────────

/**
 * @swagger
 * /api/v1/news:
 *   get:
 *     summary: Get published news
 *     tags: [News]
 */
router.get('/', newsController.getPublishedNews);

/**
 * @swagger
 * /api/v1/news/slug/{slug}:
 *   get:
 *     summary: Get news article by slug
 *     tags: [News]
 */
router.get('/slug/:slug', newsController.getNewsBySlug);

// ── Protected routes ─────────────────────────────────

router.use(verifyToken);

/**
 * @swagger
 * /api/v1/news/admin:
 *   get:
 *     summary: Get all news (including drafts)
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/admin',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR),
  newsController.getAllNews,
);

/**
 * @swagger
 * /api/v1/news/{id}:
 *   get:
 *     summary: Get news by ID
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:id',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR),
  newsController.getNewsById,
);

/**
 * @swagger
 * /api/v1/news:
 *   post:
 *     summary: Create a news article
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR),
  createNewsRules,
  validate,
  newsController.createNews,
);

/**
 * @swagger
 * /api/v1/news/{id}:
 *   put:
 *     summary: Update news article
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/:id',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR),
  updateNewsRules,
  validate,
  newsController.updateNews,
);

/**
 * @swagger
 * /api/v1/news/{id}:
 *   delete:
 *     summary: Delete news article
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/:id',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  newsController.deleteNews,
);

/**
 * @swagger
 * /api/v1/news/{id}/toggle-publish:
 *   patch:
 *     summary: Toggle news publish status
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/:id/toggle-publish',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR),
  newsController.togglePublish,
);

export default router;
