import pool from "../../config/db.js";
import { MetricsQueries } from "./metrics.queries.js";

export const MetricsService = {
    recordMetric: async (monitorId, statusCode, responseTime, success, errorMessage) => {
        const { v4: uuidv4 } = await import('uuid');
        const metricId = uuidv4();
        const result = await pool.query(
            `INSERT INTO metrics (id, monitor_id, status_code, response_time, success, error_message, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW())
             RETURNING *`,
            [metricId, monitorId, statusCode, responseTime, success, errorMessage || null]
        );
        return result.rows[0];
    },

    getMetrics: async (monitorId) => {
        const result = await pool.query(MetricsQueries.getMetricsByMonitor, [monitorId]);
        return result.rows;
    },

    getMetricsWithDateRange: async (monitorId, startDate, endDate) => {
        const result = await pool.query(MetricsQueries.getMetricsByMonitorWithDateRange, [
            monitorId,
            startDate,
            endDate
        ]);
        return result.rows;
    },

    getStats: async (monitorId) => {
        const result = await pool.query(MetricsQueries.getUptimeStats, [monitorId]);
        return result.rows[0];
    },

    getStatsWithDateRange: async (monitorId, startDate, endDate) => {
        const result = await pool.query(MetricsQueries.getUptimeStatsWithDateRange, [
            monitorId,
            startDate,
            endDate
        ]);
        return result.rows[0];
    },

    getRecentMetrics: async (monitorId, limit = 50) => {
        const result = await pool.query(MetricsQueries.getRecentMetrics, [monitorId, limit]);
        return result.rows;
    },

    deleteOldMetrics: async (monitorId) => {
        const result = await pool.query(MetricsQueries.deleteOldMetrics, [monitorId]);
        return result.rowCount;
    }
};
