import { body, ValidationChain } from 'express-validator';

/** Create a student */
export const createStudentRules: ValidationChain[] = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('university')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('University name cannot exceed 200 characters'),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Department name cannot exceed 200 characters'),
  body('yearOfStudy')
    .optional()
    .isInt({ min: 1, max: 8 }).withMessage('Year of study must be between 1 and 8'),
  body('phone')
    .optional()
    .trim(),
  body('nationality')
    .optional()
    .trim(),
  body('address')
    .optional()
    .trim(),
];

/** Update a student */
export const updateStudentRules: ValidationChain[] = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('university')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('University name cannot exceed 200 characters'),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Department name cannot exceed 200 characters'),
  body('yearOfStudy')
    .optional()
    .isInt({ min: 1, max: 8 }).withMessage('Year of study must be between 1 and 8'),
  body('phone')
    .optional()
    .trim(),
  body('nationality')
    .optional()
    .trim(),
  body('address')
    .optional()
    .trim(),
  body('notes')
    .optional()
    .trim(),
];
