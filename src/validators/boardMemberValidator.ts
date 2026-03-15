import { body, ValidationChain } from 'express-validator';

export const createBoardMemberRules: ValidationChain[] = [
  body('name.ar').trim().notEmpty().withMessage('Arabic name is required'),
  body('name.en').trim().notEmpty().withMessage('English name is required'),
  body('name.tr').trim().notEmpty().withMessage('Turkish name is required'),
  body('position.ar').trim().notEmpty().withMessage('Arabic position is required'),
  body('position.en').trim().notEmpty().withMessage('English position is required'),
  body('position.tr').trim().notEmpty().withMessage('Turkish position is required'),
  body('department.ar').optional().trim(),
  body('department.en').optional().trim(),
  body('department.tr').optional().trim(),
  body('image').optional().trim(),
  body('socialLinks.facebook').optional().trim(),
  body('socialLinks.instagram').optional().trim(),
  body('socialLinks.linkedin').optional().trim(),
  body('type').notEmpty().isIn(['executive', 'organizational']).withMessage('Type must be executive or organizational'),
  body('order').optional().isInt({ min: 0 }).withMessage('Order must be a positive integer'),
  body('isPublished').optional().isBoolean(),
];

export const updateBoardMemberRules: ValidationChain[] = [
  body('name.ar').optional().trim(),
  body('name.en').optional().trim(),
  body('name.tr').optional().trim(),
  body('position.ar').optional().trim(),
  body('position.en').optional().trim(),
  body('position.tr').optional().trim(),
  body('department.ar').optional().trim(),
  body('department.en').optional().trim(),
  body('department.tr').optional().trim(),
  body('image').optional().trim(),
  body('socialLinks.facebook').optional().trim(),
  body('socialLinks.instagram').optional().trim(),
  body('socialLinks.linkedin').optional().trim(),
  body('type').optional().isIn(['executive', 'organizational']),
  body('order').optional().isInt({ min: 0 }),
  body('isPublished').optional().isBoolean(),
];
