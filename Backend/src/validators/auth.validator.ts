import { body } from 'express-validator';

export const registerRules = [
  body('user_name')
    .trim()
    .notEmpty().withMessage('user_name is required.')
    .isLength({ min: 2, max: 100 }).withMessage('user_name must be 2-100 characters.'),

  body('user_email_id')
    .trim()
    .notEmpty().withMessage('user_email_id is required.')
    .isEmail().withMessage('user_email_id must be a valid email address.')
    .isLength({ max: 150 }).withMessage('user_email_id must be at most 150 characters.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8, max: 72 }).withMessage('Password must be 8-72 characters.')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter.')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter.')
    .matches(/[0-9]/).withMessage('Password must contain a number.'),

  body('role')
    .optional()
    .isIn(['user', 'admin']).withMessage('Role must be either "user" or "admin".'),
];

export const loginRules = [
  body('user_email_id')
    .trim()
    .notEmpty().withMessage('user_email_id is required.')
    .isEmail().withMessage('user_email_id must be a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.'),
];
