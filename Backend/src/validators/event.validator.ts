import { body, param, query } from 'express-validator';

export const createEventRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required.')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters.'),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required.')
    .isLength({ min: 10, max: 2000 }).withMessage('Description must be 10-2000 characters.'),

  body('event_date')
    .notEmpty().withMessage('event_date is required.')
    .isISO8601().withMessage('event_date must be an ISO-8601 datetime, e.g. 2026-12-01T18:30:00Z')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('event_date must be in the future.');
      }
      return true;
    }),

  body('location')
    .trim()
    .notEmpty().withMessage('Location is required.')
    .isLength({ max: 200 }).withMessage('Location must be at most 200 characters.'),

  body('total_tickets')
    .notEmpty().withMessage('total_tickets is required.')
    .isInt({ min: 1, max: 1000000 }).withMessage('total_tickets must be a whole number between 1 and 1000000.')
    .toInt(),

  body('metadata')
    .optional()
    .isObject().withMessage('metadata must be a JSON object.'),
];

export const updateEventRules = [
  param('id').isInt({ min: 1 }).withMessage('Invalid event id.').toInt(),

  body('title').optional().trim().isLength({ min: 3, max: 200 }),
  body('description').optional().trim().isLength({ min: 10, max: 2000 }),
  body('event_date').optional().isISO8601().withMessage('event_date must be ISO-8601.'),
  body('location').optional().trim().isLength({ max: 200 }),
  body('metadata').optional().isObject().withMessage('metadata must be a JSON object.'),

];

export const eventIdRules = [
  param('id').isInt({ min: 1 }).withMessage('Invalid event id.').toInt(),
];

export const listEventsRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be >= 1.').toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1-100.').toInt(),
  query('search').optional().trim().isLength({ max: 100 }),
  query('upcomingOnly').optional().isBoolean().withMessage('upcomingOnly must be true or false.'),
];
