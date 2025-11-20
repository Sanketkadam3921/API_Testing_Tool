import pool from "../../config/db.js";
import { MonitorQueries } from "./monitors.queries.js";
import { ApiTestService } from "../../services/apiTestService.js";
import { scheduleMonitor, stopMonitor } from "../../utils/monitorScheduler.js";
import { v4 as uuidv4 } from 'uuid';

export const MonitorsService = {
    createMonitor: async (name, description, requestId, userId, intervalMin, thresholdMs) => {
        const id = uuidv4();
        const result = await pool.query(MonitorQueries.createMonitor, [
            id,
            name,
            description,
            requestId,
            userId,
            intervalMin,
            thresholdMs,
            true
        ]);
        const monitor = result.rows[0];

        // Start monitoring (cron job) - stopMonitor is called inside scheduleMonitor to prevent duplicates
        scheduleMonitor(monitor.id, requestId, intervalMin, thresholdMs);

        return monitor;
    },

    getAllMonitors: async (userId) => {
        const result = await pool.query(MonitorQueries.getMonitorsByUser, [userId]);
        return result.rows;
    },

    getMonitorById: async (id, userId) => {
        const result = await pool.query(MonitorQueries.getMonitorById, [id, userId]);
        return result.rows[0];
    },

    getMonitorWithRequest: async (id) => {
        const result = await pool.query(MonitorQueries.getMonitorWithRequest, [id]);
        return result.rows[0];
    },

    getMonitorWithUser: async (id) => {
        const result = await pool.query(MonitorQueries.getMonitorWithUser, [id]);
        return result.rows[0];
    },

    incrementConsecutiveFailures: async (id) => {
        const result = await pool.query(MonitorQueries.incrementConsecutiveFailures, [id]);
        return result.rows[0];
    },

    resetConsecutiveFailures: async (id) => {
        const result = await pool.query(MonitorQueries.resetConsecutiveFailures, [id]);
        return result.rows[0];
    },

    updateLastEmailSent: async (id) => {
        const result = await pool.query(MonitorQueries.updateLastEmailSent, [id]);
        return result.rows[0];
    },

    deleteMonitor: async (id) => {
        await stopMonitor(id);
        const result = await pool.query(MonitorQueries.deleteMonitor, [id]);
        return result.rows[0];
    },

    updateMonitorStatus: async (id, isActive) => {
        // Stop any existing job first to prevent duplicates
        await stopMonitor(id);
        
        const result = await pool.query(MonitorQueries.updateMonitorStatus, [isActive, id]);

        if (isActive) {
            // Get monitor details to restart scheduling
            const monitorResult = await pool.query(MonitorQueries.getMonitorById, [id, null]);
            const monitor = monitorResult.rows[0];
            if (monitor) {
                // Small delay to ensure previous job is fully stopped
                await new Promise(resolve => setTimeout(resolve, 100));
                scheduleMonitor(monitor.id, monitor.request_id, monitor.interval_min, monitor.threshold_ms);
            }
        } else {
            await stopMonitor(id);
        }

        return result.rows[0];
    },

    updateMonitorLastRun: async (id, intervalMin) => {
        const result = await pool.query(MonitorQueries.updateMonitorLastRun, [id, intervalMin]);
        return result.rows[0];
    },

    getActiveMonitors: async () => {
        const result = await pool.query(MonitorQueries.getActiveMonitors);
        return result.rows;
    },

    getMonitorStats: async (userId) => {
        const result = await pool.query(MonitorQueries.getMonitorStats, [userId]);
        const stats = result.rows[0];
        if (stats) {
            // Ensure uptime_percentage is a number
            stats.uptime_percentage = stats.uptime_percentage != null 
                ? parseFloat(stats.uptime_percentage) || 0 
                : 0;
            // Ensure other counts are integers
            stats.total_monitors = parseInt(stats.total_monitors) || 0;
            stats.active_monitors = parseInt(stats.active_monitors) || 0;
            stats.inactive_monitors = parseInt(stats.inactive_monitors) || 0;
        }
        return stats || {
            total_monitors: 0,
            active_monitors: 0,
            inactive_monitors: 0,
            uptime_percentage: 0
        };
    },

    runMonitorTest: async (monitorId) => {
        try {
            const monitor = await MonitorsService.getMonitorWithRequest(monitorId);
            if (!monitor) {
                throw new Error('Monitor not found');
            }

            // Prepare request data
            const requestData = {
                method: monitor.method,
                url: monitor.url,
                headers: monitor.headers || {},
                body: monitor.body || null,
                params: monitor.params || {}
            };

            // Run the API test
            const result = await ApiTestService.testApi(requestData);

            // Update last run time
            await MonitorsService.updateMonitorLastRun(monitorId, monitor.interval_min);

            return result;
        } catch (error) {
            console.error('Monitor test failed:', error);
            throw error;
        }
    }
};
