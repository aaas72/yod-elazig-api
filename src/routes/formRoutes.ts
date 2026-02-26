import { Router } from 'express';
import { formController } from '../controllers';
import { verifyToken, authorizeRoles } from '../middlewares';
import { ROLES } from '../constants';

const router = Router();

// Public Routes
router.get('/public/:slug', formController.getFormBySlug);
router.post('/submit', formController.submitForm);

// Admin Routes
router.use(verifyToken);
router.use(authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR));

router.get('/', formController.getAllForms);
router.get('/:id', formController.getFormById);
router.post('/', formController.createForm);
router.put('/:id', formController.updateForm);
router.delete('/:id', formController.deleteForm);

router.get('/:formId/submissions', formController.getFormSubmissions);

export default router;
