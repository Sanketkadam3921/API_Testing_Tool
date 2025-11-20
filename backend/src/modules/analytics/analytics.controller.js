import { AnalyticsService } from "./analytics.service.js";

export const AnalyticsController = {
    /**
     * Get response time percentiles
     */
    getPercentiles: async (req, res, next) => {
        try {
            const { monitor_id } = req.params;
            const { start_date, end_date } = req.query;

            const percentiles = await AnalyticsService.getResponseTimePercentiles(
                monitor_id,
                start_date || null,
                end_date || null
            );

            res.status(200).json({ success: true, percentiles });
        } catch (err) {
            next(err);
        }
    },

    /**
     * Get error rate trend
     */
    getErrorRateTrend: async (req, res, next) => {
        try {
            const { monitor_id } = req.params;
            const { start_date, end_date, interval = 'hour' } = req.query;

            const trend = await AnalyticsService.getErrorRateTrend(
                monitor_id,
                start_date || null,
                end_date || null,
                interval
            );

            res.status(200).json({ success: true, trend });
        } catch (err) {
            next(err);
        }
    },

    /**
     * Get success rate trend
     */
    getSuccessRateTrend: async (req, res, next) => {
        try {
            const { monitor_id } = req.params;
            const { start_date, end_date, interval = 'hour' } = req.query;

            const trend = await AnalyticsService.getSuccessRateTrend(
                monitor_id,
                start_date || null,
                end_date || null,
                interval
            );

            res.status(200).json({ success: true, trend });
        } catch (err) {
            next(err);
        }
    },

    /**
     * Get comprehensive analytics
     */
    getComprehensive: async (req, res, next) => {
        try {
            const { monitor_id } = req.params;
            const { start_date, end_date } = req.query;

            const analytics = await AnalyticsService.getComprehensiveAnalytics(
                monitor_id,
                start_date || null,
                end_date || null
            );

            res.status(200).json({ success: true, analytics });
        } catch (err) {
            next(err);
        }
    },

    /**
     * Get uptime statistics
     */
    getUptime: async (req, res, next) => {
        try {
            const { monitor_id } = req.params;
            const { start_date, end_date } = req.query;

            const stats = await AnalyticsService.getUptimeStats(
                monitor_id,
                start_date || null,
                end_date || null
            );

            res.status(200).json({ success: true, stats });
        } catch (err) {
            next(err);
        }
    },

    /**
     * Export monitoring data
     */
    exportData: async (req, res, next) => {
        try {
            const { monitor_id } = req.params;
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
            next(err);
        }
    },

    /**
     * Get real-time monitoring data
     */
    getRealTime: async (req, res, next) => {
        try {
            const { monitor_id } = req.params;
            const { minutes = 60 } = req.query;

            const data = await AnalyticsService.getRealTimeData(monitor_id, parseInt(minutes));

            res.status(200).json({ success: true, data });
        } catch (err) {
            next(err);
        }
    }
};

