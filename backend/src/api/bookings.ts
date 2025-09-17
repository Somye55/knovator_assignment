import { Router } from 'express';
import * as bookingController from '../controllers/bookingController';
import { bookingValidation, handleValidationErrors } from '../middleware/validation';

const router = Router();

// Public routes
router.get('/available', bookingController.getAvailableVehicles);

// Protected routes (would need authentication middleware in production)
router.post('/', 
  bookingValidation, 
  handleValidationErrors, 
  bookingController.createBooking
);

router.get('/my-bookings', bookingController.getMyBookings);

router.put('/:id/cancel', bookingController.cancelBooking);

router.delete('/:id', bookingController.deleteBooking);

export default router;