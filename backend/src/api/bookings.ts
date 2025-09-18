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

export default router;