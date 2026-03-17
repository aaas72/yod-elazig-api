import { Router } from 'express';
import multer from 'multer';
import { mediaController } from '../controllers';
import { verifyToken, authorizeRoles } from '../middlewares';
import { ROLES } from '../constants';

// ── Multer configuration (memory storage for sharp processing) ──
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1 * 1024 * 1024, // 1MB max
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'));
    }
  },
});

const router = Router();
const OBJECT_ID = ':id([0-9a-fA-F]{24})';

// ── All routes are protected ─────────────────────────
router.use(verifyToken);

router.get('/', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), mediaController.getAllMedia);
router.get(`/${OBJECT_ID}`, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), mediaController.getMediaById);
router.post('/upload', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), upload.single('file'), mediaController.uploadMedia);
router.post('/upload/multiple', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), upload.array('files', 10), mediaController.uploadMultipleMedia);
router.patch(`/${OBJECT_ID}`, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), mediaController.updateMediaAlt);
router.delete(`/${OBJECT_ID}`, authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR), mediaController.deleteMedia);

export default router;
