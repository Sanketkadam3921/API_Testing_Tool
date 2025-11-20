import { Router } from 'express';
import { EnvironmentsController } from './environments.controller.js';

const router = Router();

// Create environment
router.post('/', EnvironmentsController.createEnvironment);

// Get environments
router.get('/', EnvironmentsController.getEnvironments);

// Get environment by ID
router.get('/:id', EnvironmentsController.getEnvironment);

// Update environment
router.put('/:id', EnvironmentsController.updateEnvironment);

// Delete environment
router.delete('/:id', EnvironmentsController.deleteEnvironment);

export default router;

