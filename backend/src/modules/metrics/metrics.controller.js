import { MetricsService } from "./metrics.service.js";
import { MonitorsService } from "../monitors/monitors.service.js";

export const MetricsController = {
    getByMonitor: async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            // Verify monitor belongs to user
            const monitor = await MonitorsService.getMonitorById(req.params.id, userId);
            if (!monitor) {
                return res.status(404).json({ success: false, message: "Monitor not found" });
            }
            const metrics = await MetricsService.getMetrics(req.params.id);
            res.status(200).json({
                success: true,
                metrics,
            });
        } catch (err) {
            next(err);
        }
    },
    getStats: async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            // Verify monitor belongs to user
            const monitor = await MonitorsService.getMonitorById(req.params.id, userId);
            if (!monitor) {
                return res.status(404).json({ success: false, message: "Monitor not found" });
            }
            const stats = await MetricsService.getStats(req.params.id);
            res.status(200).json({
                success: true,
                stats,
            });
        } catch (err) {
            next(err);
        }
    },
};
