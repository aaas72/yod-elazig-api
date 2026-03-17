import { body, ValidationChain } from 'express-validator';

export const createSpecialLinkRules: ValidationChain[] = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('url').trim().notEmpty().withMessage('URL is required').isURL().withMessage('Must be a valid URL'),
  body('description').optional().trim(),
  body('order').optional().isInt({ min: 0 }),
  body('isPublished').optional().isBoolean(),
];

export const updateSpecialLinkRules: ValidationChain[] = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('url').optional().trim().notEmpty().withMessage('URL cannot be empty').isURL().withMessage('Must be a valid URL'),
  body('description').optional().trim(),
  body('order').optional().isInt({ min: 0 }),
  body('isPublished').optional().isBoolean(),
];
