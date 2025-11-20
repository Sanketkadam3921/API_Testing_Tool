import { Router } from 'express';
import { BatchController } from './batch.controller.js';

const router = Router();

// Execute batch of requests
router.post('/execute', BatchController.executeBatch);

export default router;

