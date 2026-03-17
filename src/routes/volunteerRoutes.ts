import { Router } from 'express';
import { volunteerController } from '../controllers';
import { verifyToken, authorizeRoles, validate } from '../middlewares';
import { submitVolunteerRules, reviewVolunteerRules } from '../validators';
import { ROLES } from '../constants';

const router = Router();
const OBJECT_ID = ':id([0-9a-fA-F]{24})';

// ── Public routes (submit volunteer application) ─────
router.post('/', submitVolunteerRules, validate, volunteerController.submitVolunteer);

// ── Protected routes (admin management) ──────────────
router.use(verifyToken);

router.get('/', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), volunteerController.getAllVolunteers);
router.get('/stats', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), volunteerController.getVolunteerStats);
router.get('/export', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), volunteerController.exportVolunteers);
router.get('/by-id/:volunteerId', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), volunteerController.getVolunteerByVolunteerId);
router.get(`/${OBJECT_ID}`, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), volunteerController.getVolunteerById);
router.patch(`/${OBJECT_ID}/review`, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), reviewVolunteerRules, validate, volunteerController.reviewVolunteer);
router.put(`/${OBJECT_ID}`, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), volunteerController.updateVolunteer);
router.delete(`/${OBJECT_ID}`, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), volunteerController.deleteVolunteer);

export default router;
