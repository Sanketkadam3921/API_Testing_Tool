import { Router } from 'express';
import { BatchController } from './batch.controller.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';

const router = Router();

// Batch routes require authentication
router.use(authMiddleware);

// Execute batch of requests
router.post('/execute', BatchController.executeBatch);

export default router;

