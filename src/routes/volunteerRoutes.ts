import { Router } from 'express';
import { volunteerController } from '../controllers';
import { verifyToken, authorizeRoles, validate } from '../middlewares';
import { submitVolunteerRules, reviewVolunteerRules } from '../validators';
import { ROLES } from '../constants';

const router = Router();

// ── Public routes (submit volunteer application) ─────
router.post('/', submitVolunteerRules, validate, volunteerController.submitVolunteer);

// ── Protected routes (admin management) ──────────────
router.use(verifyToken);

router.get('/', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), volunteerController.getAllVolunteers);
router.get('/stats', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), volunteerController.getVolunteerStats);
router.get('/export', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), volunteerController.exportVolunteers);
router.get('/:id', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), volunteerController.getVolunteerById);
router.patch('/:id/review', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), reviewVolunteerRules, validate, volunteerController.reviewVolunteer);
router.delete('/:id', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), volunteerController.deleteVolunteer);

export default router;
