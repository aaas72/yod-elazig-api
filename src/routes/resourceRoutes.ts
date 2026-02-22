import { Router } from 'express';
import { resourceController } from '../controllers';
import { verifyToken, authorizeRoles, validate } from '../middlewares';
import { createResourceRules, updateResourceRules } from '../validators';
import { ROLES } from '../constants';

const router = Router();

// ── Public routes ────────────────────────────────────
router.get('/', resourceController.getPublicResources);

// ── Protected routes ─────────────────────────────────
router.use(verifyToken);

router.get('/admin', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), resourceController.getAllResources);
router.get('/:id', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), resourceController.getResourceById);
router.post('/', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), createResourceRules, validate, resourceController.createResource);
router.put('/:id', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), updateResourceRules, validate, resourceController.updateResource);
router.delete('/:id', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), resourceController.deleteResource);

export default router;
