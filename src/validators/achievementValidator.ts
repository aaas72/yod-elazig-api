import { body, ValidationChain } from 'express-validator';

export const createAchievementRules: ValidationChain[] = [
  body('title.ar').trim().notEmpty().withMessage('Arabic title is required'),
  body('title.en').trim().notEmpty().withMessage('English title is required'),
  body('title.tr').trim().notEmpty().withMessage('Turkish title is required'),
  body('description.ar').trim().notEmpty().withMessage('Arabic description is required'),
  body('description.en').trim().notEmpty().withMessage('English description is required'),
  body('description.tr').trim().notEmpty().withMessage('Turkish description is required'),
  body('image').optional().trim(),
  body('date').optional().isISO8601().withMessage('Date must be a valid date'),
  body('order').optional().isInt({ min: 0 }).withMessage('Order must be a positive integer'),
  body('isPublished').optional().isBoolean(),
];

export const updateAchievementRules: ValidationChain[] = [
  body('title.ar').optional().trim(),
  body('title.en').optional().trim(),
  body('title.tr').optional().trim(),
  body('description.ar').optional().trim(),
  body('description.en').optional().trim(),
  body('description.tr').optional().trim(),
  body('image').optional().trim(),
  body('date').optional().isISO8601().withMessage('Date must be a valid date'),
  body('order').optional().isInt({ min: 0 }),
  body('isPublished').optional().isBoolean(),
];
