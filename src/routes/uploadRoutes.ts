import { Router, Request, Response } from 'express';
import { mediaService } from '../services';
import {
  verifyToken,
  authorizeRoles,
  createUploadMiddleware,
  createUploadErrorHandler,
  UPLOAD_MIME_PRESETS,
} from '../middlewares';
import { ApiResponse, asyncHandler, ApiError } from '../utils';
import { HTTP_STATUS, ROLES } from '../constants';

const upload = createUploadMiddleware({
  maxFileSizeMB: 1,
  allowedMimeTypes: UPLOAD_MIME_PRESETS.image,
  rejectMessage: 'نوع الملف غير مدعوم. يُسمح فقط بـ JPEG, PNG, WebP, GIF',
});
const handleUploadError = createUploadErrorHandler(1);

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
  handleUploadError,
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
