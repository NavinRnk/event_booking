import { Router } from 'express';
import {
  createEvent,
  listEvents,
  getEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/event.controller';
import {
  createEventRules,
  updateEventRules,
  eventIdRules,
  listEventsRules,
} from '../validators/event.validator';
import { validate } from '../middlewares/validate';
import { adminOnly } from '../middlewares/verify-token';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', validate(listEventsRules), asyncHandler(listEvents));
router.get('/:id', validate(eventIdRules), asyncHandler(getEvent));

router.post('/', adminOnly, validate(createEventRules), asyncHandler(createEvent));
router.put('/:id', adminOnly, validate(updateEventRules), asyncHandler(updateEvent));
router.delete('/:id', adminOnly, validate(eventIdRules), asyncHandler(deleteEvent));

export default router;
