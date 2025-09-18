import { Router } from 'express';
import * as healthController from '../controllers/healthController';

const router = Router();

// Basic health check route
router.get('/', healthController.getHealth);

// Detailed health check route with database ping
router.get('/detailed', healthController.getDetailedHealth);

export default router;