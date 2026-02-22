import { body, ValidationChain } from 'express-validator';

export const submitVolunteerRules: ValidationChain[] = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('email').trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('university').optional().trim(),
  body('department').optional().trim(),
  body('yearOfStudy').optional().isInt({ min: 1, max: 8 }).withMessage('Year must be 1-8'),
  body('skills').optional().isArray().withMessage('Skills must be an array'),
  body('skills.*').optional().trim().isString(),
  body('motivation').trim().notEmpty().withMessage('Motivation is required')
    .isLength({ max: 2000 }).withMessage('Motivation cannot exceed 2000 characters'),
  body('availableHours').optional().isInt({ min: 0 }).withMessage('Hours must be positive'),
];

export const reviewVolunteerRules: ValidationChain[] = [
  body('status').notEmpty().withMessage('Status is required')
    .isIn(['accepted', 'rejected']).withMessage('Status must be accepted or rejected'),
  body('reviewNote').optional().trim(),
];
