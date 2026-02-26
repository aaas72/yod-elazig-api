import { body, ValidationChain } from 'express-validator';

export const createTickerRules: ValidationChain[] = [
  body('text.ar').trim().notEmpty().withMessage('Arabic text is required')
    .isLength({ max: 300 }).withMessage('Text cannot exceed 300 characters'),
  body('text.en').trim().notEmpty().withMessage('English text is required')
    .isLength({ max: 300 }).withMessage('Text cannot exceed 300 characters'),
  body('text.tr').trim().notEmpty().withMessage('Turkish text is required')
    .isLength({ max: 300 }).withMessage('Text cannot exceed 300 characters'),
  body('url').optional().trim(),
  body('image').optional().trim(),
  body('order').optional().isInt({ min: 0 }),
  body('isActive').optional().isBoolean(),
  body('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
  body('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
];

export const updateTickerRules: ValidationChain[] = [
  body('text.ar').optional().trim().isLength({ max: 300 }),
  body('text.en').optional().trim().isLength({ max: 300 }),
  body('text.tr').optional().trim().isLength({ max: 300 }),
  body('url').optional().trim(),
  body('image').optional().trim(),
  body('order').optional().isInt({ min: 0 }),
  body('isActive').optional().isBoolean(),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
];
