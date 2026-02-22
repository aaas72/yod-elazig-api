import { Router } from 'express';
import { tickerController } from '../controllers';
import { verifyToken, authorizeRoles, validate } from '../middlewares';
import { createTickerRules, updateTickerRules } from '../validators';
import { ROLES } from '../constants';

const router = Router();

// ── Public routes ────────────────────────────────────
router.get('/', tickerController.getActiveTickers);

// ── Protected routes ─────────────────────────────────
router.use(verifyToken);

router.get('/admin', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), tickerController.getAllTickers);
router.get('/:id', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), tickerController.getTickerById);
router.post('/', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), createTickerRules, validate, tickerController.createTicker);
router.put('/:id', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), updateTickerRules, validate, tickerController.updateTicker);
router.delete('/:id', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), tickerController.deleteTicker);
router.put('/bulk', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), tickerController.bulkUpdateTickers);

export default router;
