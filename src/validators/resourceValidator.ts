import { body, ValidationChain } from 'express-validator';

export const createResourceRules: ValidationChain[] = [
  body('title.ar').trim().notEmpty().withMessage('Arabic title is required'),
  body('title.en').trim().notEmpty().withMessage('English title is required'),
  body('title.tr').trim().notEmpty().withMessage('Turkish title is required'),
  body('description.ar').optional().trim(),
  body('description.en').optional().trim(),
  body('description.tr').optional().trim(),
  body('url').trim().notEmpty().withMessage('URL is required'),
  body('type').optional().isIn(['document', 'video', 'link', 'image', 'other'])
    .withMessage('Invalid resource type'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('isPublic').optional().isBoolean(),
  body('allowedRoles').optional().isArray(),
  body('order').optional().isInt({ min: 0 }),
  body('isPublished').optional().isBoolean(),
];

export const updateResourceRules: ValidationChain[] = [
  body('title.ar').optional().trim(),
  body('title.en').optional().trim(),
  body('title.tr').optional().trim(),
  body('description.ar').optional().trim(),
  body('description.en').optional().trim(),
  body('description.tr').optional().trim(),
  body('url').optional().trim(),
  body('type').optional().isIn(['document', 'video', 'link', 'image', 'other']),
  body('category').optional().trim(),
  body('isPublic').optional().isBoolean(),
  body('allowedRoles').optional().isArray(),
  body('order').optional().isInt({ min: 0 }),
  body('isPublished').optional().isBoolean(),
];
