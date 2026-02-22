import { Router } from 'express';
import { contactController } from '../controllers';
import { verifyToken, authorizeRoles, validate } from '../middlewares';
import { submitContactRules, replyContactRules } from '../validators';
import { ROLES } from '../constants';

const router = Router();

// ── Public routes (submit contact form) ──────────────
router.post('/', submitContactRules, validate, contactController.submitContact);

// ── Protected routes (admin management) ──────────────
router.use(verifyToken);

router.get('/', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), contactController.getAllContacts);
router.get('/stats', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), contactController.getContactStats);
router.get('/:id', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), contactController.getContactById);
router.patch('/:id/read', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), contactController.markAsRead);
router.post('/:id/reply', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), replyContactRules, validate, contactController.replyToContact);
router.delete('/:id', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), contactController.deleteContact);

export default router;
