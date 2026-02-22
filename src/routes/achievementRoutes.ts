import { Router } from 'express';
import { achievementController } from '../controllers';
import { verifyToken, authorizeRoles, validate } from '../middlewares';
import { createAchievementRules, updateAchievementRules } from '../validators';
import { ROLES } from '../constants';

const router = Router();

// ── Public routes ────────────────────────────────────
router.get('/', achievementController.getPublishedAchievements);

// ── Protected routes ─────────────────────────────────
router.use(verifyToken);

router.get('/admin', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), achievementController.getAllAchievements);
router.get('/:id', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), achievementController.getAchievementById);
router.post('/', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), createAchievementRules, validate, achievementController.createAchievement);
router.put('/:id', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), updateAchievementRules, validate, achievementController.updateAchievement);
router.delete('/:id', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), achievementController.deleteAchievement);

export default router;
