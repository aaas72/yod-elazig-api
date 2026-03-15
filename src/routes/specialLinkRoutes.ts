import { Router } from 'express';
import * as specialLinkController from '../controllers/specialLinkController';
import { verifyToken, authorizeRoles, validate } from '../middlewares';
import { createSpecialLinkRules, updateSpecialLinkRules } from '../validators/specialLinkValidator';
import { ROLES } from '../constants';

const router = Router();
const OBJECT_ID = ':id([0-9a-fA-F]{24})';

// ── Public routes ────────────────────────────────────
router.get('/', specialLinkController.getPublishedSpecialLinks);

// ── Protected routes ─────────────────────────────────
router.use(verifyToken);

router.get('/admin', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), specialLinkController.getAllSpecialLinks);
router.get(`/${OBJECT_ID}`, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), specialLinkController.getSpecialLinkById);
router.post('/', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), createSpecialLinkRules, validate, specialLinkController.createSpecialLink);
router.put(`/${OBJECT_ID}`, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), updateSpecialLinkRules, validate, specialLinkController.updateSpecialLink);
router.delete(`/${OBJECT_ID}`, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), specialLinkController.deleteSpecialLink);

export default router;
