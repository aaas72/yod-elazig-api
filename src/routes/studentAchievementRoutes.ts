import { Router } from 'express';
import { studentAchievementController } from '../controllers';
import { verifyToken, authorizeRoles, validate } from '../middlewares';
import { createStudentAchievementRules, updateStudentAchievementRules } from '../validators';
import { ROLES } from '../constants';

const router = Router();
const OBJECT_ID = ':id([0-9a-fA-F]{24})';

// ── Public routes ────────────────────────────────────
router.get('/', studentAchievementController.getPublishedStudentAchievements);

// ── Protected routes ─────────────────────────────────
router.use(verifyToken);

router.get('/admin', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), studentAchievementController.getAllStudentAchievements);
router.get(`/${OBJECT_ID}`, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), studentAchievementController.getStudentAchievementById);
router.post('/', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), createStudentAchievementRules, validate, studentAchievementController.createStudentAchievement);
router.put(`/${OBJECT_ID}`, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), updateStudentAchievementRules, validate, studentAchievementController.updateStudentAchievement);
router.delete(`/${OBJECT_ID}`, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), studentAchievementController.deleteStudentAchievement);

export default router;
