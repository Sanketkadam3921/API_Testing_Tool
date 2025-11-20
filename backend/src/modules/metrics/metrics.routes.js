import { Router } from "express";
import { MetricsController } from "./metrics.controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

const router = Router();

// All metrics routes require authentication
router.use(authMiddleware);

// Fetch metrics for a monitor
router.get("/:id", MetricsController.getByMonitor);
// Fetch stats for a monitor
router.get("/:id/stats", MetricsController.getStats);

export default router;
