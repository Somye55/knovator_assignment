import { Router } from 'express';
import * as bookingController from '../controllers/bookingController';
import { bookingValidation, handleValidationErrors } from '../middleware/validation';

const router = Router();

// Protected routes (would need authentication middleware in production)
router.post('/',
  bookingValidation,
  handleValidationErrors,
  bookingController.createBooking
);

// Return bookings for a customer (frontend uses this to show "My bookings").
// Accepts optional query param `customerId`; defaults to the frontend static id.
router.get('/my-bookings', bookingController.getMyBookings);

// Cancel a booking
router.put('/:id/cancel', bookingController.cancelBooking);

export default router;