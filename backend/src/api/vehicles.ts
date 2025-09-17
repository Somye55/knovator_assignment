import { Router } from 'express';
import * as vehicleController from '../controllers/vehicleController';
import { vehicleValidation, handleValidationErrors } from '../middleware/validation';

const router = Router();

// Public routes
router.get('/', vehicleController.getAllVehicles);
router.get('/:id', vehicleController.getVehicle);

// Protected routes (would need authentication middleware in production)
router.post('/',
    vehicleValidation,
    handleValidationErrors,
    vehicleController.createVehicle
);

router.put('/:id',
    vehicleValidation,
    handleValidationErrors,
    vehicleController.updateVehicle
);

router.delete('/:id', vehicleController.deleteVehicle);

export default router;