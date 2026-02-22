import { Router } from 'express';
import { translationController } from '../controllers';
import { verifyToken, authorizeRoles, validate } from '../middlewares';
import { upsertTranslationRules, bulkTranslationRules } from '../validators';
import { ROLES } from '../constants';

const router = Router();

// ── Public routes ────────────────────────────────────
router.get('/:lang', translationController.getTranslations);
router.get('/:lang/:namespace', translationController.getTranslationsByNamespace);

// ── Protected routes ─────────────────────────────────
router.use(verifyToken);

router.post('/', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), upsertTranslationRules, validate, translationController.upsertTranslation);
router.post('/bulk', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), bulkTranslationRules, validate, translationController.bulkUpsertTranslations);
router.delete('/:lang/:namespace/:key', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), translationController.deleteTranslation);

export default router;
