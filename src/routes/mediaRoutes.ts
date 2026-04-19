import { Router } from 'express';
import { mediaController } from '../controllers';
import {
  verifyToken,
  authorizeRoles,
  createUploadMiddleware,
  createUploadErrorHandler,
  UPLOAD_MIME_PRESETS,
} from '../middlewares';
import { ROLES } from '../constants';

const upload = createUploadMiddleware({
  maxFileSizeMB: 1,
  allowedMimeTypes: UPLOAD_MIME_PRESETS.media,
  rejectMessage: 'File type not allowed',
});
const handleUploadError = createUploadErrorHandler(1);

const router = Router();
const OBJECT_ID = ':id([0-9a-fA-F]{24})';

// ── All routes are protected ─────────────────────────
router.use(verifyToken);

router.get('/', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), mediaController.getAllMedia);
router.get(`/${OBJECT_ID}`, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), mediaController.getMediaById);
router.post('/upload', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), upload.single('file'), handleUploadError, mediaController.uploadMedia);
router.post('/upload/multiple', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), upload.array('files', 10), handleUploadError, mediaController.uploadMultipleMedia);
router.patch(`/${OBJECT_ID}`, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), mediaController.updateMediaAlt);
router.delete(`/${OBJECT_ID}`, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), mediaController.deleteMedia);

export default router;
