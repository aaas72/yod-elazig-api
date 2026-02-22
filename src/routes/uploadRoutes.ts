import { Router, Request, Response, NextFunction } from 'express';
import multer, { MulterError } from 'multer';
import { mediaService } from '../services';
import { verifyToken, authorizeRoles } from '../middlewares';
import { ApiResponse, asyncHandler, ApiError } from '../utils';
import { HTTP_STATUS, ROLES } from '../constants';

/* ── Multer config — memory storage for sharp processing ────────── */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB server-side safeguard
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('نوع الملف غير مدعوم. يُسمح فقط بـ JPEG, PNG, WebP, GIF'));
    }
  },
});

/* ── Multer error handler ───────────────────────────────────────── */
const handleMulterError = (err: Error, _req: Request, _res: Response, next: NextFunction): void => {
  if (err instanceof MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      next(new ApiError(HTTP_STATUS.BAD_REQUEST, 'حجم الملف يتجاوز الحد المسموح (2 MB)'));
      return;
    }
    next(new ApiError(HTTP_STATUS.BAD_REQUEST, err.message));
    return;
  }
  if (err) {
    next(new ApiError(HTTP_STATUS.BAD_REQUEST, err.message));
    return;
  }
  next();
};

const router = Router();

/**
 * POST /api/v1/upload/image
 * Accepts: multipart/form-data  { image: File, folder?: string }
 * Returns: { success, data: { url, filename, size } }
 */
router.post(
  '/image',
  verifyToken,
  authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.EDITOR),
  upload.single('image'),
  handleMulterError,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'لم يتم إرسال صورة');
    }

    const folder = (req.body.folder as string) || 'news';
    const media = await mediaService.upload(req.file, req.user!._id.toString(), folder);

    new ApiResponse(HTTP_STATUS.OK, 'تم رفع الصورة بنجاح', {
      url: media.url,
      filename: media.filename,
      size: media.size,
    }).send(res);
  }),
);

export default router;
