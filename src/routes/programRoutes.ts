import { Router } from 'express';
import { programController } from '../controllers';
import { verifyToken, authorizeRoles, validate } from '../middlewares';
import { createProgramRules, updateProgramRules } from '../validators';
import { ROLES } from '../constants';

const router = Router();
const OBJECT_ID = ':id([0-9a-fA-F]{24})';

// ── Public routes ────────────────────────────────────
router.get('/', programController.getPublishedPrograms);
router.get('/slug/:slug', programController.getProgramBySlug);

// ── Protected routes ─────────────────────────────────
router.use(verifyToken);

router.get('/admin', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), programController.getAllPrograms);
router.get(`/${OBJECT_ID}`, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), programController.getProgramById);
router.post('/', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), createProgramRules, validate, programController.createProgram);
router.put(`/${OBJECT_ID}`, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), updateProgramRules, validate, programController.updateProgram);
router.delete(`/${OBJECT_ID}`, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), programController.deleteProgram);
router.patch(`/${OBJECT_ID}/toggle-publish`, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), programController.togglePublish);

export default router;
