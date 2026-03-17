import { body, ValidationChain } from 'express-validator';

/** Create a student */
export const createStudentRules: ValidationChain[] = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name (Arabic) is required')
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be 2-100 characters'),
  body('fullNameEn')
    .trim()
    .notEmpty().withMessage('Full name (English) is required')
    .isLength({ min: 2, max: 100 }).withMessage('Full name (English) must be 2-100 characters'),
  body('gender')
    .notEmpty().withMessage('Gender is required')
    .isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other'),
  body('dateOfBirth')
    .notEmpty().withMessage('Date of birth is required')
    .isISO8601().withMessage('Date of birth must be a valid date'),
  body('phoneNumber')
    .trim()
    .notEmpty().withMessage('Phone number is required'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('tcNumber')
    .trim()
    .notEmpty().withMessage('TC number is required'),
  body('profileImage')
    .optional()
    .trim(),
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
  body('address')
    .optional()
    .trim(),
];

/** Update a student */
export const updateStudentRules: ValidationChain[] = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be 2-100 characters'),
  body('fullNameEn')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Full name (English) must be 2-100 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('phoneNumber')
    .optional()
    .trim(),
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
  body('address')
    .optional()
    .trim(),
  body('notes')
    .optional()
    .trim(),
];

/** Review a student membership application */
export const reviewStudentRules: ValidationChain[] = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['rejected', 'active', 'suspended', 'graduated'])
    .withMessage('Status must be one of: rejected, active, suspended, graduated'),
  body('reviewNote')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Review note cannot exceed 1000 characters'),
];
