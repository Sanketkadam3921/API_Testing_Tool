import { Router } from "express";
import { MetricsController } from "./metrics.controller.js";

const router = Router();

// Fetch metrics for a monitor
router.get("/:id", MetricsController.getByMonitor);
// Fetch stats for a monitor
router.get("/:id/stats", MetricsController.getStats);

export default router;
