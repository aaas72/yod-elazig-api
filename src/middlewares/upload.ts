import { NextFunction, Request, Response } from 'express';
import multer, { MulterError } from 'multer';
import { HTTP_STATUS } from '../constants';
import { ApiError } from '../utils';

export const UPLOAD_MIME_PRESETS = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
  pdf: ['application/pdf'],
  student: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'],
  media: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
} as const;

interface UploadOptions {
  maxFileSizeMB: number;
  allowedMimeTypes?: readonly string[];
  rejectMessage?: string;
}

export function createUploadMiddleware(options: UploadOptions) {
  const { maxFileSizeMB, allowedMimeTypes, rejectMessage } = options;

  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxFileSizeMB * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (!allowedMimeTypes || allowedMimeTypes.length === 0 || allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
        return;
      }

      cb(new Error(rejectMessage || 'نوع الملف غير مدعوم'));
    },
  });
}

export function createUploadErrorHandler(maxFileSizeMB: number) {
  return (err: Error, _req: Request, _res: Response, next: NextFunction): void => {
    if (err instanceof MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        next(new ApiError(HTTP_STATUS.BAD_REQUEST, `حجم الملف يتجاوز الحد المسموح (${maxFileSizeMB}MB)`));
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
}
