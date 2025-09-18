import { Router } from 'express';
import * as vehicleController from '../controllers/vehicleController';
import { vehicleValidation, handleValidationErrors } from '../middleware/validation';

const router = Router();

// Public routes
router.get('/available', vehicleController.getAvailableVehicles);

// Protected routes (would need authentication middleware in production)
router.post('/',
    vehicleValidation,
    handleValidationErrors,
    vehicleController.createVehicle
);

export default router;