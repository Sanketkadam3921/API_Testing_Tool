import { Router } from 'express';
import { HistoryController } from './history.controller.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';

const router = Router();

// All history routes require authentication
router.use(authMiddleware);

// Get request history
router.get('/', HistoryController.getHistory);

// Get history statistics
router.get('/stats', HistoryController.getHistoryStats);

// Get history item by ID
router.get('/:id', HistoryController.getHistoryById);

// Delete history item
router.delete('/:id', HistoryController.deleteHistory);

// Clear all history
router.delete('/', HistoryController.clearHistory);

export default router;

