import { body, ValidationChain } from 'express-validator';

export const createAlbumRules: ValidationChain[] = [
  body('title.ar').trim().notEmpty().withMessage('Arabic title is required'),
  body('title.en').trim().notEmpty().withMessage('English title is required'),
  body('title.tr').trim().notEmpty().withMessage('Turkish title is required'),
  body('description.ar').optional().trim(),
  body('description.en').optional().trim(),
  body('description.tr').optional().trim(),
  body('coverImage').optional().trim(),
  body('category').optional().trim(),
  body('order').optional().isInt({ min: 0 }),
  body('isPublished').optional().isBoolean(),
];

export const updateAlbumRules: ValidationChain[] = [
  body('title.ar').optional().trim(),
  body('title.en').optional().trim(),
  body('title.tr').optional().trim(),
  body('description.ar').optional().trim(),
  body('description.en').optional().trim(),
  body('description.tr').optional().trim(),
  body('coverImage').optional().trim(),
  body('category').optional().trim(),
  body('order').optional().isInt({ min: 0 }),
  body('isPublished').optional().isBoolean(),
];

export const addPhotosRules: ValidationChain[] = [
  body('photos').isArray({ min: 1 }).withMessage('Photos array is required'),
  body('photos.*.url').trim().notEmpty().withMessage('Photo URL is required'),
  body('photos.*.caption.ar').optional().trim(),
  body('photos.*.caption.en').optional().trim(),
  body('photos.*.caption.tr').optional().trim(),
  body('photos.*.order').optional().isInt({ min: 0 }),
];
