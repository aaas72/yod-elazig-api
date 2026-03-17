import { body, ValidationChain } from 'express-validator';

const i18nRequired = (field: string, label: string): ValidationChain[] => [
  body(`${field}.ar`).trim().notEmpty().withMessage(`Arabic ${label} is required`),
  body(`${field}.en`).trim().notEmpty().withMessage(`English ${label} is required`),
  body(`${field}.tr`).trim().notEmpty().withMessage(`Turkish ${label} is required`),
];

const i18nOptional = (field: string): ValidationChain[] => [
  body(`${field}.ar`).optional().trim(),
  body(`${field}.en`).optional().trim(),
  body(`${field}.tr`).optional().trim(),
];

export const createProgramRules: ValidationChain[] = [
  ...i18nRequired('title', 'title'),
  ...i18nRequired('description', 'description'),
  ...i18nOptional('summary'),
  body('startDate').notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Start date must be a valid date'),
  body('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
  body('location').optional().trim(),
  body('category').optional().trim(),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('coverImage').optional().trim(),
  body('isPublished').optional().isBoolean(),
];

export const updateProgramRules: ValidationChain[] = [
  ...i18nOptional('title'),
  ...i18nOptional('description'),
  ...i18nOptional('summary'),
  body('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
  body('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
  body('location').optional().trim(),
  body('category').optional().trim(),
  body('tags').optional().isArray(),
  body('coverImage').optional().trim(),
  body('isPublished').optional().isBoolean(),
];
