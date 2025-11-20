import { AlertsService } from "./alerts.service.js";

export const AlertsController = {
    getAll: async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const monitorId = req.query.monitor_id;
            const alerts = monitorId 
                ? await AlertsService.getAlertsByMonitor(monitorId, userId)
                : await AlertsService.getAlerts(userId);
            res.status(200).json({ success: true, alerts });
        } catch (err) {
            next(err);
        }
    },

    configure: async (req, res, next) => {
        try {
            const { monitor_id, threshold_ms } = req.body;
            const monitor = await AlertsService.configureAlert(threshold_ms, monitor_id);
            res.status(200).json({ success: true, monitor });
        } catch (err) {
            next(err);
        }
    },
};
