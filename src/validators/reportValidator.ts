import { body, ValidationChain } from 'express-validator';

export const createReportRules: ValidationChain[] = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 300 }).withMessage('Title must be at most 300 characters'),
  body('quarter')
    .notEmpty().withMessage('Quarter is required')
    .isIn(['Q1', 'Q2', 'Q3', 'Q4']).withMessage('Quarter must be Q1, Q2, Q3 or Q4'),
  body('year')
    .notEmpty().withMessage('Year is required')
    .isInt({ min: 2020, max: 2100 }).withMessage('Year must be between 2020 and 2100'),
  body('isPublished').optional().isBoolean(),
];

export const updateReportRules: ValidationChain[] = [
  body('title').optional().trim().isLength({ max: 300 }).withMessage('Title must be at most 300 characters'),
  body('description').optional().trim(),
  body('quarter')
    .optional()
    .isIn(['Q1', 'Q2', 'Q3', 'Q4']).withMessage('Quarter must be Q1, Q2, Q3 or Q4'),
  body('year')
    .optional()
    .isInt({ min: 2020, max: 2100 }).withMessage('Year must be between 2020 and 2100'),
  body('isPublished').optional().isBoolean(),
];
