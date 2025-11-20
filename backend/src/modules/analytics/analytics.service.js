import pool from "../../config/db.js";

/**
 * Advanced Analytics Service
 * Provides detailed analytics including percentiles, error rates, trends, and more
 */
export const AnalyticsService = {
    /**
     * Get response time percentiles (p50, p95, p99)
     */
    getResponseTimePercentiles: async (monitorId, startDate = null, endDate = null) => {
        let query;
        let params;

        // Use PERCENTILE_CONT which is available in PostgreSQL 9.4+
        // Fallback to array-based calculation if needed
        if (startDate && endDate) {
            query = `
                SELECT 
                    PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY response_time) as p50,
                    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time) as p95,
                    PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY response_time) as p99,
                    AVG(response_time) as avg,
                    MIN(response_time) as min,
                    MAX(response_time) as max,
                    COUNT(*) as total
                FROM metrics
                WHERE monitor_id = $1 
                AND created_at >= $2 
                AND created_at <= $3
            `;
            params = [monitorId, startDate, endDate];
        } else {
            query = `
                SELECT 
                    PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY response_time) as p50,
                    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time) as p95,
                    PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY response_time) as p99,
                    AVG(response_time) as avg,
                    MIN(response_time) as min,
                    MAX(response_time) as max,
                    COUNT(*) as total
                FROM metrics
                WHERE monitor_id = $1
            `;
            params = [monitorId];
        }

        const result = await pool.query(query, params);
        const row = result.rows[0];
        
        // If no data exists, return zeros
        if (!row || !row.total || parseInt(row.total) === 0) {
            return {
                p50: 0,
                p95: 0,
                p99: 0,
                avg: 0,
                min: 0,
                max: 0,
                total: 0
            };
        }
        
        return {
            p50: row.p50 ? Math.round(row.p50) : 0,
            p95: row.p95 ? Math.round(row.p95) : 0,
            p99: row.p99 ? Math.round(row.p99) : 0,
            avg: row.avg ? Math.round(row.avg) : 0,
            min: row.min ? Math.round(row.min) : 0,
            max: row.max ? Math.round(row.max) : 0,
            total: parseInt(row.total) || 0
        };
    },

    /**
     * Get error rate tracking over time
     */
    getErrorRateTrend: async (monitorId, startDate = null, endDate = null, interval = 'hour') => {
        let dateTrunc;
        switch (interval) {
            case 'minute':
                dateTrunc = 'minute';
                break;
            case 'hour':
                dateTrunc = 'hour';
                break;
            case 'day':
                dateTrunc = 'day';
                break;
            case 'week':
                dateTrunc = 'week';
                break;
            default:
                dateTrunc = 'hour';
        }

        let query;
        let params;

        if (startDate && endDate) {
            query = `
                SELECT 
                    DATE_TRUNC($2, created_at) as time_bucket,
                    COUNT(*) as total_requests,
                    COUNT(*) FILTER (WHERE success = false) as failed_requests,
                    COUNT(*) FILTER (WHERE success = true) as successful_requests,
                    ROUND(COUNT(*) FILTER (WHERE success = false) * 100.0 / NULLIF(COUNT(*), 0), 2) as error_rate,
                    ROUND(COUNT(*) FILTER (WHERE success = true) * 100.0 / NULLIF(COUNT(*), 0), 2) as success_rate,
                    AVG(response_time) as avg_response_time
                FROM metrics
                WHERE monitor_id = $1 
                AND created_at >= $3 
                AND created_at <= $4
                GROUP BY time_bucket
                ORDER BY time_bucket ASC
            `;
            params = [monitorId, dateTrunc, startDate, endDate];
        } else {
            query = `
                SELECT 
                    DATE_TRUNC($2, created_at) as time_bucket,
                    COUNT(*) as total_requests,
                    COUNT(*) FILTER (WHERE success = false) as failed_requests,
                    COUNT(*) FILTER (WHERE success = true) as successful_requests,
                    ROUND(COUNT(*) FILTER (WHERE success = false) * 100.0 / NULLIF(COUNT(*), 0), 2) as error_rate,
                    ROUND(COUNT(*) FILTER (WHERE success = true) * 100.0 / NULLIF(COUNT(*), 0), 2) as success_rate,
                    AVG(response_time) as avg_response_time
                FROM metrics
                WHERE monitor_id = $1
                GROUP BY time_bucket
                ORDER BY time_bucket ASC
            `;
            params = [monitorId, dateTrunc];
        }

        const result = await pool.query(query, params);
        return result.rows.map(row => ({
            time: row.time_bucket,
            totalRequests: parseInt(row.total_requests) || 0,
            failedRequests: parseInt(row.failed_requests) || 0,
            successfulRequests: parseInt(row.successful_requests) || 0,
            errorRate: parseFloat(row.error_rate) || 0,
            successRate: parseFloat(row.success_rate) || 0,
            avgResponseTime: row.avg_response_time ? Math.round(row.avg_response_time) : 0
        }));
    },

    /**
     * Get success rate trends
     */
    getSuccessRateTrend: async (monitorId, startDate = null, endDate = null, interval = 'hour') => {
        // This is similar to error rate trend but focuses on success
        return await AnalyticsService.getErrorRateTrend(monitorId, startDate, endDate, interval);
    },

    /**
     * Get comprehensive analytics for a monitor
     */
    getComprehensiveAnalytics: async (monitorId, startDate = null, endDate = null) => {
        const [percentiles, trends, uptimeStats] = await Promise.all([
            AnalyticsService.getResponseTimePercentiles(monitorId, startDate, endDate),
            AnalyticsService.getErrorRateTrend(monitorId, startDate, endDate, 'hour'),
            AnalyticsService.getUptimeStats(monitorId, startDate, endDate)
        ]);

        return {
            percentiles,
            trends,
            uptime: uptimeStats
        };
    },

    /**
     * Get uptime statistics
     */
    getUptimeStats: async (monitorId, startDate = null, endDate = null) => {
        let query;
        let params;

        if (startDate && endDate) {
            query = `
                SELECT 
                    COUNT(*) FILTER (WHERE success = true) * 100.0 / NULLIF(COUNT(*), 0) as uptime_percentage,
                    COUNT(*) as total_requests,
                    COUNT(*) FILTER (WHERE success = true) as successful_requests,
                    COUNT(*) FILTER (WHERE success = false) as failed_requests,
                    AVG(response_time) as avg_response_time
                FROM metrics
                WHERE monitor_id = $1 
                AND created_at >= $2 
                AND created_at <= $3
            `;
            params = [monitorId, startDate, endDate];
        } else {
            query = `
                SELECT 
                    COUNT(*) FILTER (WHERE success = true) * 100.0 / NULLIF(COUNT(*), 0) as uptime_percentage,
                    COUNT(*) as total_requests,
                    COUNT(*) FILTER (WHERE success = true) as successful_requests,
                    COUNT(*) FILTER (WHERE success = false) as failed_requests,
                    AVG(response_time) as avg_response_time
                FROM metrics
                WHERE monitor_id = $1
            `;
            params = [monitorId];
        }

        const result = await pool.query(query, params);
        const row = result.rows[0];

        // If no data exists, return zeros
        if (!row || !row.total_requests || parseInt(row.total_requests) === 0) {
            return {
                uptimePercentage: 0,
                totalRequests: 0,
                successfulRequests: 0,
                failedRequests: 0,
                avgResponseTime: 0
            };
        }

        return {
            uptimePercentage: row.uptime_percentage ? parseFloat(row.uptime_percentage) : 0,
            totalRequests: parseInt(row.total_requests) || 0,
            successfulRequests: parseInt(row.successful_requests) || 0,
            failedRequests: parseInt(row.failed_requests) || 0,
            avgResponseTime: row.avg_response_time ? Math.round(row.avg_response_time) : 0
        };
    },

    /**
     * Get analytics data for export (CSV/JSON)
     */
    getExportData: async (monitorId, startDate = null, endDate = null) => {
        let query;
        let params;

        if (startDate && endDate) {
            query = `
                SELECT 
                    created_at,
                    status_code,
                    response_time,
                    success,
                    error_message
                FROM metrics
                WHERE monitor_id = $1 
                AND created_at >= $2 
                AND created_at <= $3
                ORDER BY created_at DESC
            `;
            params = [monitorId, startDate, endDate];
        } else {
            query = `
                SELECT 
                    created_at,
                    status_code,
                    response_time,
                    success,
                    error_message
                FROM metrics
                WHERE monitor_id = $1
                ORDER BY created_at DESC
            `;
            params = [monitorId];
        }

        const result = await pool.query(query, params);
        return result.rows.map(row => ({
            timestamp: row.created_at,
            statusCode: row.status_code,
            responseTime: row.response_time,
            success: row.success,
            errorMessage: row.error_message || null
        }));
    },

    /**
     * Get real-time monitoring data (last N minutes)
     */
    getRealTimeData: async (monitorId, minutes = 60) => {
        const query = `
            SELECT 
                created_at,
                status_code,
                response_time,
                success,
                error_message
            FROM metrics
            WHERE monitor_id = $1 
            AND created_at >= NOW() - INTERVAL '${minutes} minutes'
            ORDER BY created_at DESC
        `;

        const result = await pool.query(query, [monitorId]);
        return result.rows.map(row => ({
            timestamp: row.created_at,
            statusCode: row.status_code,
            responseTime: row.response_time,
            success: row.success,
            errorMessage: row.error_message || null
        }));
    }
};

