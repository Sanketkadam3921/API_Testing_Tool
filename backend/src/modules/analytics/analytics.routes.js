import { Router } from "express";
import { AnalyticsController } from "./analytics.controller.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

const router = Router();

// All analytics routes require authentication
router.use(authMiddleware);

// Analytics routes
router.get("/monitors/:monitor_id/percentiles", AnalyticsController.getPercentiles);
router.get("/monitors/:monitor_id/error-rate-trend", AnalyticsController.getErrorRateTrend);
router.get("/monitors/:monitor_id/success-rate-trend", AnalyticsController.getSuccessRateTrend);
router.get("/monitors/:monitor_id/comprehensive", AnalyticsController.getComprehensive);
router.get("/monitors/:monitor_id/uptime", AnalyticsController.getUptime);
router.get("/monitors/:monitor_id/export", AnalyticsController.exportData);
router.get("/monitors/:monitor_id/realtime", AnalyticsController.getRealTime);

export default router;

