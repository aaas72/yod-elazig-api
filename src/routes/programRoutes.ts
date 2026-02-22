import { Router } from 'express';
import { programController } from '../controllers';
import { verifyToken, authorizeRoles, validate } from '../middlewares';
import { createProgramRules, updateProgramRules } from '../validators';
import { ROLES } from '../constants';

const router = Router();

// ── Public routes ────────────────────────────────────
router.get('/', programController.getPublishedPrograms);
router.get('/slug/:slug', programController.getProgramBySlug);

// ── Protected routes ─────────────────────────────────
router.use(verifyToken);

router.get('/admin', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), programController.getAllPrograms);
router.get('/:id', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), programController.getProgramById);
router.post('/', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), createProgramRules, validate, programController.createProgram);
router.put('/:id', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), updateProgramRules, validate, programController.updateProgram);
router.delete('/:id', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), programController.deleteProgram);
router.patch('/:id/toggle-publish', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), programController.togglePublish);

export default router;
