import { Router } from 'express';
import { boardMemberController } from '../controllers';
import { verifyToken, authorizeRoles, validate } from '../middlewares';
import { createBoardMemberRules, updateBoardMemberRules } from '../validators';
import { ROLES } from '../constants';

const router = Router();
const OBJECT_ID = ':id([0-9a-fA-F]{24})';

// ── Public routes ────────────────────────────────────
router.get('/', boardMemberController.getPublishedBoardMembers);

// ── Protected routes ─────────────────────────────────
router.use(verifyToken);

router.get('/admin', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), boardMemberController.getAllBoardMembers);
router.get(`/${OBJECT_ID}`, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), boardMemberController.getBoardMemberById);
router.post('/', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), createBoardMemberRules, validate, boardMemberController.createBoardMember);
router.put(`/${OBJECT_ID}`, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), updateBoardMemberRules, validate, boardMemberController.updateBoardMember);
router.delete(`/${OBJECT_ID}`, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), boardMemberController.deleteBoardMember);

export default router;
