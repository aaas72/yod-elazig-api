import { Router } from 'express';
import { tickerController } from '../controllers';
import { verifyToken, authorizeRoles, validate } from '../middlewares';
import { createTickerRules, updateTickerRules } from '../validators';
import { ROLES } from '../constants';

const router = Router();
const OBJECT_ID = ':id([0-9a-fA-F]{24})';

// ── Public routes ────────────────────────────────────
router.get('/', tickerController.getActiveTickers);

// ── Protected routes ─────────────────────────────────
router.use(verifyToken);

router.get('/admin', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), tickerController.getAllTickers);
router.get(`/${OBJECT_ID}`, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), tickerController.getTickerById);
router.post('/', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), createTickerRules, validate, tickerController.createTicker);
router.put(`/${OBJECT_ID}`, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), updateTickerRules, validate, tickerController.updateTicker);
router.delete(`/${OBJECT_ID}`, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), tickerController.deleteTicker);
router.put('/bulk', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), tickerController.bulkUpdateTickers);

export default router;
