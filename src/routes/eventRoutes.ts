import { Router } from 'express';
import { eventController } from '../controllers';
import { verifyToken, authorizeRoles, validate } from '../middlewares';
import { createEventRules, updateEventRules } from '../validators';
import { ROLES } from '../constants';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Event management
 */

// ── Public routes ────────────────────────────────────

/**
 * @swagger
 * /api/v1/events:
 *   get:
 *     summary: Get published events
 *     tags: [Events]
 */
router.get('/', eventController.getPublishedEvents);

/**
 * @swagger
 * /api/v1/events/upcoming:
 *   get:
 *     summary: Get upcoming events
 *     tags: [Events]
 */
router.get('/upcoming', eventController.getUpcomingEvents);

/**
 * @swagger
 * /api/v1/events/slug/{slug}:
 *   get:
 *     summary: Get event by slug
 *     tags: [Events]
 */
router.get('/slug/:slug', eventController.getEventBySlug);

// ── Protected routes ─────────────────────────────────

router.use(verifyToken);

/**
 * @swagger
 * /api/v1/events/admin:
 *   get:
 *     summary: Get all events (including unpublished)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/admin',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR),
  eventController.getAllEvents,
);

/**
 * @swagger
 * /api/v1/events/{id}:
 *   get:
 *     summary: Get event by ID
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:id',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR),
  eventController.getEventById,
);

/**
 * @swagger
 * /api/v1/events:
 *   post:
 *     summary: Create an event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR),
  createEventRules,
  validate,
  eventController.createEvent,
);

/**
 * @swagger
 * /api/v1/events/{id}:
 *   put:
 *     summary: Update event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/:id',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR),
  updateEventRules,
  validate,
  eventController.updateEvent,
);

/**
 * @swagger
 * /api/v1/events/{id}:
 *   delete:
 *     summary: Delete event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/:id',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  eventController.deleteEvent,
);

/**
 * @swagger
 * /api/v1/events/{id}/register:
 *   post:
 *     summary: Register for event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/register', eventController.registerForEvent);

/**
 * @swagger
 * /api/v1/events/{id}/register:
 *   delete:
 *     summary: Unregister from event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id/register', eventController.unregisterFromEvent);

/**
 * @swagger
 * /api/v1/events/{id}/toggle-publish:
 *   patch:
 *     summary: Toggle event publish status
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/:id/toggle-publish',
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR),
  eventController.togglePublish,
);

export default router;
