import { Router } from 'express';
import { reportController } from '../controllers';
import { verifyToken, authorizeRoles, validate } from '../middlewares';
import { createReportRules, updateReportRules } from '../validators';
import { ROLES } from '../constants';
import multer from 'multer';
import fs from 'fs';
import { logger } from '../utils';

// ── Multer config for PDF uploads ────────────────────
const upload = multer({
  storage: multer.diskStorage({
    destination: function (_req, _file, cb) {
      const dir = 'uploads/reports';
      try {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
      } catch (err) {
        logger.error('Error creating directory:', err);
        cb(err as Error, dir);
      }
    },
    filename: function (_req, file, cb) {
      const ext = file.originalname.split('.').pop();
      cb(null, `report-${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`);
    },
  }),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

const router = Router();

// ── Public routes ────────────────────────────────────
router.get('/published', reportController.getPublishedReports);

// ── Protected routes ─────────────────────────────────
router.use(verifyToken);

router.get('/', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), reportController.getAllReports);
router.get('/:id', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), reportController.getReportById);
router.post('/', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), upload.single('file'), createReportRules, validate, reportController.createReport);
router.put('/:id', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), upload.single('file'), updateReportRules, validate, reportController.updateReport);
router.delete('/:id', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), reportController.deleteReport);

export default router;
