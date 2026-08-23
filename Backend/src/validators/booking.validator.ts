import { body, param, query } from 'express-validator';

export const createBookingRules = [
  body('event_id')
    .notEmpty().withMessage('event_id is required.')
    .isInt({ min: 1 }).withMessage('event_id must be a positive whole number.')
    .toInt(),

  body('quantity')
    .optional()
    .isInt({ min: 1, max: 10 }).withMessage('quantity must be between 1 and 10.')
    .toInt(),
];

export const bookingIdRules = [
  param('id').isInt({ min: 1 }).withMessage('Invalid booking id.').toInt(),
];

export const listBookingsRules = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];
