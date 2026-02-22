import { body, ValidationChain } from 'express-validator';

export const submitContactRules: ValidationChain[] = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('email').trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('subject').trim().notEmpty().withMessage('Subject is required')
    .isLength({ max: 200 }).withMessage('Subject cannot exceed 200 characters'),
  body('message').trim().notEmpty().withMessage('Message is required')
    .isLength({ max: 2000 }).withMessage('Message cannot exceed 2000 characters'),
];

export const replyContactRules: ValidationChain[] = [
  body('replyMessage').trim().notEmpty().withMessage('Reply message is required')
    .isLength({ max: 2000 }).withMessage('Reply cannot exceed 2000 characters'),
];
