import { Router } from 'express';
import { faqController } from '../controllers';
import { verifyToken, authorizeRoles, validate } from '../middlewares';
import { createFAQRules, updateFAQRules, reorderFAQRules } from '../validators';
import { ROLES } from '../constants';

const router = Router();

// ── Public routes ────────────────────────────────────
router.get('/', faqController.getPublishedFAQs);

// ── Protected routes ─────────────────────────────────
router.use(verifyToken);

router.get('/admin', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), faqController.getAllFAQs);
router.get('/:id', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), faqController.getFAQById);
router.post('/', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), createFAQRules, validate, faqController.createFAQ);
router.put('/:id', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), updateFAQRules, validate, faqController.updateFAQ);
router.delete('/:id', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), faqController.deleteFAQ);
router.patch('/reorder', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), reorderFAQRules, validate, faqController.reorderFAQs);

export default router;
