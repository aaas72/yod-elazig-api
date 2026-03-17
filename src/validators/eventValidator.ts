import { body, ValidationChain } from 'express-validator';

/** Create an event */
export const createEventRules: ValidationChain[] = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('startDate')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
  body('endDate')
    .optional()
    .isISO8601().withMessage('End date must be a valid ISO 8601 date'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Location cannot exceed 300 characters'),
  body('category')
    .optional()
    .trim(),
  body('capacity')
    .optional()
    .isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  body('coverImage')
    .optional()
    .trim(),
  body('isPublished')
    .optional()
    .isBoolean().withMessage('isPublished must be a boolean'),
  body('isFeatured')
    .optional()
    .isBoolean().withMessage('isFeatured must be a boolean'),
  body('registrationDeadline')
    .optional()
    .isISO8601().withMessage('Registration deadline must be a valid ISO 8601 date'),
  body('translations')
    .optional()
    .isObject().withMessage('translations must be an object'),
  body('translations.ar.title').optional().trim(),
  body('translations.ar.description').optional().trim(),
  body('translations.ar.location').optional().trim(),
  body('translations.ar.tags').optional().isArray(),
  body('translations.ar.tags.*').optional().trim().isString(),
  body('translations.en.title').optional().trim(),
  body('translations.en.description').optional().trim(),
  body('translations.en.location').optional().trim(),
  body('translations.en.tags').optional().isArray(),
  body('translations.en.tags.*').optional().trim().isString(),
  body('translations.tr.title').optional().trim(),
  body('translations.tr.description').optional().trim(),
  body('translations.tr.location').optional().trim(),
  body('translations.tr.tags').optional().isArray(),
  body('translations.tr.tags.*').optional().trim().isString(),
];

/** Update an event */
export const updateEventRules: ValidationChain[] = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('startDate')
    .optional()
    .isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
  body('endDate')
    .optional()
    .isISO8601().withMessage('End date must be a valid ISO 8601 date'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Location cannot exceed 300 characters'),
  body('category')
    .optional()
    .trim(),
  body('capacity')
    .optional()
    .isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  body('coverImage')
    .optional()
    .trim(),
  body('isPublished')
    .optional()
    .isBoolean().withMessage('isPublished must be a boolean'),
  body('isFeatured')
    .optional()
    .isBoolean().withMessage('isFeatured must be a boolean'),
  body('registrationDeadline')
    .optional()
    .isISO8601().withMessage('Registration deadline must be a valid ISO 8601 date'),
  body('translations').optional().isObject(),
  body('translations.ar.title').optional().trim(),
  body('translations.ar.description').optional().trim(),
  body('translations.ar.location').optional().trim(),
  body('translations.ar.tags').optional().isArray(),
  body('translations.ar.tags.*').optional().trim().isString(),
  body('translations.en.title').optional().trim(),
  body('translations.en.description').optional().trim(),
  body('translations.en.location').optional().trim(),
  body('translations.en.tags').optional().isArray(),
  body('translations.en.tags.*').optional().trim().isString(),
  body('translations.tr.title').optional().trim(),
  body('translations.tr.description').optional().trim(),
  body('translations.tr.location').optional().trim(),
  body('translations.tr.tags').optional().isArray(),
  body('translations.tr.tags.*').optional().trim().isString(),
];
