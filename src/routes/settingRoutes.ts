import { Router } from 'express';
import { settingController } from '../controllers';
import { verifyToken, authorizeRoles } from '../middlewares';
import { ROLES } from '../constants';

const router = Router();

// ── Public routes ────────────────────────────────────
router.get('/', settingController.getSettings);

// ── Protected routes ─────────────────────────────────
router.use(verifyToken);

router.put('/', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), settingController.updateSettings);

export default router;
