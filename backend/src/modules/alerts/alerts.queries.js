export const AlertsQueries = {
  createAlert: `
        INSERT INTO alerts (id, monitor_id, message, severity)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `,
  getAlertsByUser: `
        SELECT a.*, m.name as monitor_name, r.name as request_name, r.url
        FROM alerts a
        JOIN monitors m ON a.monitor_id = m.id
        JOIN requests r ON m.request_id = r.id
        WHERE m.user_id = $1
        ORDER BY a.created_at DESC
    `,
  getAlertsByMonitor: `
        SELECT a.*, m.name as monitor_name, r.name as request_name, r.url
        FROM alerts a
        JOIN monitors m ON a.monitor_id = m.id
        JOIN requests r ON m.request_id = r.id
        WHERE m.id = $1
        ORDER BY a.created_at DESC
    `,
  getUnreadAlerts: `
        SELECT a.*, m.name as monitor_name, r.name as request_name, r.url
        FROM alerts a
        JOIN monitors m ON a.monitor_id = m.id
        JOIN requests r ON m.request_id = r.id
        WHERE m.user_id = $1 AND a.is_read = false
        ORDER BY a.created_at DESC
    `,
  markAsRead: `
        UPDATE alerts
        SET is_read = true
        WHERE id = $1
        RETURNING *
    `,
  markAllAsRead: `
        UPDATE alerts
        SET is_read = true
        WHERE monitor_id IN (
            SELECT id FROM monitors WHERE user_id = $1
        )
        RETURNING *
    `,
  deleteAlert: `
        DELETE FROM alerts
        WHERE id = $1
        RETURNING *
    `,
  deleteOldAlerts: `
        DELETE FROM alerts
        WHERE created_at < NOW() - INTERVAL '30 days'
        RETURNING *
    `,
  getAlertStats: `
        SELECT 
            COUNT(*) as total_alerts,
            COUNT(CASE WHEN is_read = false THEN 1 END) as unread_alerts,
            COUNT(CASE WHEN severity = 'error' THEN 1 END) as error_alerts,
            COUNT(CASE WHEN severity = 'warning' THEN 1 END) as warning_alerts
        FROM alerts a
        JOIN monitors m ON a.monitor_id = m.id
        WHERE m.user_id = $1
    `
};
