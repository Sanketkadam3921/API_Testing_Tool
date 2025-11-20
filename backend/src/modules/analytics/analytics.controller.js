import { AnalyticsService } from "./analytics.service.js";
import { MonitorsService } from "../monitors/monitors.service.js";

// Helper function to verify monitor ownership
const verifyMonitorOwnership = async (monitorId, userId) => {
    const monitor = await MonitorsService.getMonitorById(monitorId, userId);
    if (!monitor) {
        throw new Error("Monitor not found");
    }
    return true;
};

export const AnalyticsController = {
    /**
     * Get response time percentiles
     */
    getPercentiles: async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const { monitor_id } = req.params;
            await verifyMonitorOwnership(monitor_id, userId);
            const { start_date, end_date } = req.query;

            const percentiles = await AnalyticsService.getResponseTimePercentiles(
                monitor_id,
                start_date || null,
                end_date || null
            );

            res.status(200).json({ success: true, percentiles });
        } catch (err) {
            if (err.message === "Monitor not found") {
                return res.status(404).json({ success: false, message: err.message });
            }
            next(err);
        }
    },

    /**
     * Get error rate trend
     */
    getErrorRateTrend: async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const { monitor_id } = req.params;
            await verifyMonitorOwnership(monitor_id, userId);
            const { start_date, end_date, interval = 'hour' } = req.query;

            const trend = await AnalyticsService.getErrorRateTrend(
                monitor_id,
                start_date || null,
                end_date || null,
                interval
            );

            res.status(200).json({ success: true, trend });
        } catch (err) {
            if (err.message === "Monitor not found") {
                return res.status(404).json({ success: false, message: err.message });
            }
            next(err);
        }
    },

    /**
     * Get success rate trend
     */
    getSuccessRateTrend: async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const { monitor_id } = req.params;
            await verifyMonitorOwnership(monitor_id, userId);
            const { start_date, end_date, interval = 'hour' } = req.query;

            const trend = await AnalyticsService.getSuccessRateTrend(
                monitor_id,
                start_date || null,
                end_date || null,
                interval
            );

            res.status(200).json({ success: true, trend });
        } catch (err) {
            if (err.message === "Monitor not found") {
                return res.status(404).json({ success: false, message: err.message });
            }
            next(err);
        }
    },

    /**
     * Get comprehensive analytics
     */
    getComprehensive: async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const { monitor_id } = req.params;
            await verifyMonitorOwnership(monitor_id, userId);
            const { start_date, end_date } = req.query;

            const analytics = await AnalyticsService.getComprehensiveAnalytics(
                monitor_id,
                start_date || null,
                end_date || null
            );

            res.status(200).json({ success: true, analytics });
        } catch (err) {
            if (err.message === "Monitor not found") {
                return res.status(404).json({ success: false, message: err.message });
            }
            next(err);
        }
    },

    /**
     * Get uptime statistics
     */
    getUptime: async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const { monitor_id } = req.params;
            await verifyMonitorOwnership(monitor_id, userId);
            const { start_date, end_date } = req.query;

            const stats = await AnalyticsService.getUptimeStats(
                monitor_id,
                start_date || null,
                end_date || null
            );

            res.status(200).json({ success: true, stats });
        } catch (err) {
            if (err.message === "Monitor not found") {
                return res.status(404).json({ success: false, message: err.message });
            }
            next(err);
        }
    },

    /**
     * Export monitoring data
     */
    exportData: async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const { monitor_id } = req.params;
            await verifyMonitorOwnership(monitor_id, userId);
            const { start_date, end_date, format = 'json' } = req.query;

            const data = await AnalyticsService.getExportData(
                monitor_id,
                start_date || null,
                end_date || null
            );

            if (format === 'csv') {
                // Convert to CSV
                const csvHeader = 'Timestamp,Status Code,Response Time (ms),Success,Error Message\n';
                const csvRows = data.map(row => 
                    `${row.timestamp},${row.statusCode},${row.responseTime},${row.success},"${row.errorMessage || ''}"`
                ).join('\n');
                
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename="monitor_${monitor_id}_export.csv"`);
                res.status(200).send(csvHeader + csvRows);
            } else {
                res.status(200).json({ success: true, data });
            }
        } catch (err) {
            if (err.message === "Monitor not found") {
                return res.status(404).json({ success: false, message: err.message });
            }
            next(err);
        }
    },

    /**
     * Get real-time monitoring data
     */
    getRealTime: async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const { monitor_id } = req.params;
            await verifyMonitorOwnership(monitor_id, userId);
            const { minutes = 60 } = req.query;

            const data = await AnalyticsService.getRealTimeData(monitor_id, parseInt(minutes));

            res.status(200).json({ success: true, data });
        } catch (err) {
            if (err.message === "Monitor not found") {
                return res.status(404).json({ success: false, message: err.message });
            }
            next(err);
        }
    }
};

