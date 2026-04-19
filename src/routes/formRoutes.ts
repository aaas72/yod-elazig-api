import { Router } from 'express';
import { formController } from '../controllers';
import {
  verifyToken,
  authorizeRoles,
  createUploadMiddleware,
  createUploadErrorHandler,
} from '../middlewares';
import { ROLES } from '../constants';

const router = Router();
const OBJECT_ID = ':id([0-9a-fA-F]{24})';
const upload = createUploadMiddleware({ maxFileSizeMB: 10 });
const handleUploadError = createUploadErrorHandler(10);

// Public Routes
router.get('/public/:slug', formController.getFormBySlug);
router.post('/submit', upload.any(), handleUploadError, formController.submitForm);

// Admin Routes
router.use(verifyToken);
router.use(authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR));

router.get('/', formController.getAllForms);
router.get(`/${OBJECT_ID}`, formController.getFormById);
router.post('/', formController.createForm);
router.put(`/${OBJECT_ID}`, formController.updateForm);
router.delete(`/${OBJECT_ID}`, formController.deleteForm);

router.get(`/:formId([0-9a-fA-F]{24})/submissions`, formController.getFormSubmissions);

export default router;
