import { Router } from 'express';
import { reportController } from '../controllers';
import {
  verifyToken,
  authorizeRoles,
  validate,
  createUploadMiddleware,
  createUploadErrorHandler,
  UPLOAD_MIME_PRESETS,
} from '../middlewares';
import { createReportRules, updateReportRules } from '../validators';
import { ROLES } from '../constants';

const upload = createUploadMiddleware({
  maxFileSizeMB: 20,
  allowedMimeTypes: UPLOAD_MIME_PRESETS.pdf,
  rejectMessage: 'Only PDF files are allowed',
});
const handleUploadError = createUploadErrorHandler(20);

const router = Router();
const OBJECT_ID = ':id([0-9a-fA-F]{24})';

// ── Public routes ────────────────────────────────────
router.get('/published', reportController.getPublishedReports);

// ── Protected routes ─────────────────────────────────
router.use(verifyToken);

router.get('/', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), reportController.getAllReports);
router.get(`/${OBJECT_ID}`, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), reportController.getReportById);
router.post('/', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), upload.single('file'), handleUploadError, createReportRules, validate, reportController.createReport);
router.put(`/${OBJECT_ID}`, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), upload.single('file'), handleUploadError, updateReportRules, validate, reportController.updateReport);
router.delete(`/${OBJECT_ID}`, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), reportController.deleteReport);

export default router;
