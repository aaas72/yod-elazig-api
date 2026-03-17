import { body, ValidationChain } from 'express-validator';

export const createFAQRules: ValidationChain[] = [
  body('question.ar').trim().notEmpty().withMessage('Arabic question is required'),
  body('question.en').trim().notEmpty().withMessage('English question is required'),
  body('question.tr').trim().notEmpty().withMessage('Turkish question is required'),
  body('answer.ar').trim().notEmpty().withMessage('Arabic answer is required'),
  body('answer.en').trim().notEmpty().withMessage('English answer is required'),
  body('answer.tr').trim().notEmpty().withMessage('Turkish answer is required'),
  body('category').optional().trim(),
  body('order').optional().isInt({ min: 0 }),
  body('isPublished').optional().isBoolean(),
];

export const updateFAQRules: ValidationChain[] = [
  body('question.ar').optional().trim(),
  body('question.en').optional().trim(),
  body('question.tr').optional().trim(),
  body('answer.ar').optional().trim(),
  body('answer.en').optional().trim(),
  body('answer.tr').optional().trim(),
  body('category').optional().trim(),
  body('order').optional().isInt({ min: 0 }),
  body('isPublished').optional().isBoolean(),
];

export const reorderFAQRules: ValidationChain[] = [
  body('items').isArray({ min: 1 }).withMessage('Items array is required'),
  body('items.*.id').notEmpty().withMessage('Item id is required'),
  body('items.*.order').isInt({ min: 0 }).withMessage('Order must be a positive integer'),
];
