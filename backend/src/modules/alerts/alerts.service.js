import pool from "../../config/db.js";
import { AlertsQueries } from "./alerts.queries.js";
import { v4 as uuidv4 } from 'uuid';

export const AlertsService = {
    createAlert: async (monitorId, message, severity = "warning") => {
        try {
            const alertId = uuidv4();
            const result = await pool.query(AlertsQueries.createAlert, [
                alertId,
                monitorId,
                message,
                severity
            ]);
            return result.rows[0];
        } catch (error) {
            // Log error but don't throw - we don't want alert creation failures to break monitoring
            console.error('Failed to create alert:', error.message);
            return null;
        }
    },

    getAlerts: async (userId) => {
        const result = await pool.query(AlertsQueries.getAlertsByUser, [userId]);
        return result.rows;
    },

    getAlertsByMonitor: async (monitorId) => {
        const result = await pool.query(AlertsQueries.getAlertsByMonitor, [monitorId]);
        return result.rows;
    },

    getUnreadAlerts: async (userId) => {
        const result = await pool.query(AlertsQueries.getUnreadAlerts, [userId]);
        return result.rows;
    },

    markAsRead: async (alertId) => {
        const result = await pool.query(AlertsQueries.markAsRead, [alertId]);
        return result.rows[0];
    },

    markAllAsRead: async (userId) => {
        const result = await pool.query(AlertsQueries.markAllAsRead, [userId]);
        return result.rowCount;
    },

    deleteAlert: async (alertId) => {
        const result = await pool.query(AlertsQueries.deleteAlert, [alertId]);
        return result.rows[0];
    },

    deleteOldAlerts: async () => {
        const result = await pool.query(AlertsQueries.deleteOldAlerts);
        return result.rowCount;
    },

    getAlertStats: async (userId) => {
        const result = await pool.query(AlertsQueries.getAlertStats, [userId]);
        return result.rows[0];
    }
};
