import { body, ValidationChain } from 'express-validator';

export const createStudentAchievementRules: ValidationChain[] = [
  body('studentName.ar').trim().notEmpty().withMessage('Arabic student name is required'),
  body('studentName.en').trim().notEmpty().withMessage('English student name is required'),
  body('studentName.tr').trim().notEmpty().withMessage('Turkish student name is required'),
  body('description.ar').trim().notEmpty().withMessage('Arabic description is required'),
  body('description.en').trim().notEmpty().withMessage('English description is required'),
  body('description.tr').trim().notEmpty().withMessage('Turkish description is required'),
  body('image').optional().trim(),
  body('socialLinks.facebook').optional().trim(),
  body('socialLinks.instagram').optional().trim(),
  body('socialLinks.linkedin').optional().trim(),
  body('category.ar').optional().trim(),
  body('category.en').optional().trim(),
  body('category.tr').optional().trim(),
  body('order').optional().isInt({ min: 0 }).withMessage('Order must be a positive integer'),
  body('isPublished').optional().isBoolean(),
];

export const updateStudentAchievementRules: ValidationChain[] = [
  body('studentName.ar').optional().trim(),
  body('studentName.en').optional().trim(),
  body('studentName.tr').optional().trim(),
  body('description.ar').optional().trim(),
  body('description.en').optional().trim(),
  body('description.tr').optional().trim(),
  body('image').optional().trim(),
  body('socialLinks.facebook').optional().trim(),
  body('socialLinks.instagram').optional().trim(),
  body('socialLinks.linkedin').optional().trim(),
  body('category.ar').optional().trim(),
  body('category.en').optional().trim(),
  body('category.tr').optional().trim(),
  body('order').optional().isInt({ min: 0 }),
  body('isPublished').optional().isBoolean(),
];
