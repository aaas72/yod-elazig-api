import { Router } from 'express';
import multer from 'multer';
import { formController } from '../controllers';
import { verifyToken, authorizeRoles } from '../middlewares';
import { ROLES } from '../constants';

const router = Router();
const OBJECT_ID = ':id([0-9a-fA-F]{24})';
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (_req, file, cb) => {
        // Accept any image type or generic binary stream (to be safe)
        // We rely on sharp/mediaService to handle the content
        cb(null, true);
    },
});

const handleUpload = (req: any, res: any, next: any) => {
    const uploadMiddleware = upload.any();
    uploadMiddleware(req, res, (err) => {
        if (err) {
            return res.status(422).json({
                success: false,
                message: err.message || 'File upload error',
                code: err.code
            });
        }

        // Ensure body is populated even if empty
        if (!req.body) req.body = {};

        return next();
    });
};

// Public Routes
router.get('/public/:slug', formController.getFormBySlug);
router.post('/submit', handleUpload, formController.submitForm);

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
