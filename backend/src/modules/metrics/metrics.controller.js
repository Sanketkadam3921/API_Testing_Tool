import { MetricsService } from "./metrics.service.js";

export const MetricsController = {
    getByMonitor: async (req, res, next) => {
        try {
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
