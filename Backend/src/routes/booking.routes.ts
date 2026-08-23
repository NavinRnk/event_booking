import { Router } from 'express';
import { createBooking, myBookings, cancelBooking } from '../controllers/booking.controller';
import {
  createBookingRules,
  bookingIdRules,
  listBookingsRules,
} from '../validators/booking.validator';
import { validate } from '../middlewares/validate';

import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/', validate(createBookingRules), asyncHandler(createBooking));
router.get('/my', validate(listBookingsRules), asyncHandler(myBookings));
router.delete('/:id', validate(bookingIdRules), asyncHandler(cancelBooking));

export default router;
