import { body, ValidationChain } from 'express-validator';

/** Create a news article */
export const createNewsRules: ValidationChain[] = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters'),
  body('content')
    .trim()
    .notEmpty().withMessage('Content is required')
    .isLength({ min: 10 }).withMessage('Content must be at least 10 characters'),
  body('summary')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Summary cannot exceed 500 characters'),
  body('category')
    .optional()
    .trim(),
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isString().withMessage('Each tag must be a string'),
  body('coverImage')
    .optional({ values: 'falsy' })
    .trim()
    .isString().withMessage('Cover image must be a string'),
  body('isPublished')
    .optional()
    .isBoolean().withMessage('isPublished must be a boolean'),
  body('isFeatured')
    .optional()
    .isBoolean().withMessage('isFeatured must be a boolean'),
  // Translations (multilingual)
  body('translations')
    .optional()
    .isObject().withMessage('translations must be an object'),
  body('translations.ar.title').optional().trim(),
  body('translations.ar.content').optional().trim(),
  body('translations.ar.summary').optional().trim(),
  body('translations.en.title').optional().trim(),
  body('translations.en.content').optional().trim(),
  body('translations.en.summary').optional().trim(),
  body('translations.tr.title').optional().trim(),
  body('translations.tr.content').optional().trim(),
  body('translations.tr.summary').optional().trim(),
];

/** Update a news article */
export const updateNewsRules: ValidationChain[] = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters'),
  body('content')
    .optional()
    .trim()
    .isLength({ min: 10 }).withMessage('Content must be at least 10 characters'),
  body('summary')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Summary cannot exceed 500 characters'),
  body('category')
    .optional()
    .trim(),
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isString().withMessage('Each tag must be a string'),
  body('coverImage')
    .optional({ values: 'falsy' })
    .trim()
    .isString().withMessage('Cover image must be a string'),
  body('isPublished')
    .optional()
    .isBoolean().withMessage('isPublished must be a boolean'),
  body('isFeatured')
    .optional()
    .isBoolean().withMessage('isFeatured must be a boolean'),
  // Translations (multilingual)
  body('translations')
    .optional()
    .isObject().withMessage('translations must be an object'),
  body('translations.ar.title').optional().trim(),
  body('translations.ar.content').optional().trim(),
  body('translations.ar.summary').optional().trim(),
  body('translations.en.title').optional().trim(),
  body('translations.en.content').optional().trim(),
  body('translations.en.summary').optional().trim(),
  body('translations.tr.title').optional().trim(),
  body('translations.tr.content').optional().trim(),
  body('translations.tr.summary').optional().trim(),
];
