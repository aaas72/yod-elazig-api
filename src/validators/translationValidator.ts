import { body, ValidationChain } from 'express-validator';

export const upsertTranslationRules: ValidationChain[] = [
  body('lang').notEmpty().withMessage('Language is required')
    .isIn(['ar', 'en', 'tr']).withMessage('Language must be ar, en, or tr'),
  body('namespace').trim().notEmpty().withMessage('Namespace is required'),
  body('key').trim().notEmpty().withMessage('Key is required'),
  body('value').trim().notEmpty().withMessage('Value is required'),
];

export const bulkTranslationRules: ValidationChain[] = [
  body('lang').notEmpty().withMessage('Language is required')
    .isIn(['ar', 'en', 'tr']).withMessage('Language must be ar, en, or tr'),
  body('namespace').trim().notEmpty().withMessage('Namespace is required'),
  body('translations').isObject().withMessage('Translations must be an object'),
];
