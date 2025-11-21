export const MonitorQueries = {
  createMonitor: `
        INSERT INTO monitors (id, name, description, request_id, user_id, interval_min, threshold_ms, is_active, email_notifications_enabled, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW(), NOW())
        RETURNING *
    `,
  getMonitorsByUser: `
        SELECT m.*, r.name as request_name, r.method, r.url, r.description as request_description
        FROM monitors m
        JOIN requests r ON m.request_id = r.id
        WHERE m.user_id = $1
        ORDER BY m.created_at DESC
    `,
  getMonitorById: `
        SELECT m.*, r.name as request_name, r.method, r.url, r.description as request_description
        FROM monitors m
        JOIN requests r ON m.request_id = r.id
        WHERE m.id = $1 AND m.user_id = $2
    `,
  getMonitorWithRequest: `
        SELECT m.*, r.name as request_name, r.method, r.url, r.headers, r.body, r.params
        FROM monitors m
        JOIN requests r ON m.request_id = r.id
        WHERE m.id = $1 AND m.is_active = true
    `,
  getMonitorWithUser: `
        SELECT m.*, r.name as request_name, r.method, r.url, r.headers, r.body, r.params, u.email as user_email, u.name as user_name
        FROM monitors m
        JOIN requests r ON m.request_id = r.id
        JOIN users u ON m.user_id = u.id
        WHERE m.id = $1
    `,
  deleteMonitor: `
        DELETE FROM monitors 
        WHERE id = $1
        RETURNING *
    `,
  updateMonitorStatus: `
        UPDATE monitors
        SET is_active = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING *
    `,
  updateMonitorLastRun: `
        UPDATE monitors
        SET last_run = NOW(), next_run = NOW() + INTERVAL '1 minutes' * $2, updated_at = NOW()
        WHERE id = $1
        RETURNING *
    `,
  incrementConsecutiveFailures: `
        UPDATE monitors
        SET consecutive_failures = consecutive_failures + 1, updated_at = NOW()
        WHERE id = $1
        RETURNING *
    `,
  resetConsecutiveFailures: `
        UPDATE monitors
        SET consecutive_failures = 0, updated_at = NOW()
        WHERE id = $1
        RETURNING *
    `,
  updateLastEmailSent: `
        UPDATE monitors
        SET last_email_sent = NOW(), updated_at = NOW()
        WHERE id = $1
        RETURNING *
    `,
  getActiveMonitors: `
        SELECT m.*, r.name as request_name, r.method, r.url, r.headers, r.body, r.params
        FROM monitors m
        JOIN requests r ON m.request_id = r.id
        WHERE m.is_active = true
        ORDER BY m.next_run ASC NULLS FIRST
    `,
  getMonitorStats: `
        SELECT 
            COUNT(*) as total_monitors,
            COUNT(CASE WHEN is_active = true THEN 1 END) as active_monitors,
            COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_monitors,
            COALESCE(
                (
                    SELECT 
                        CASE 
                            WHEN COUNT(*) = 0 THEN 0
                            ELSE ROUND(COUNT(*) FILTER (WHERE success = true) * 100.0 / NULLIF(COUNT(*), 0), 2)
                        END as uptime_percentage
                    FROM metrics m
                    INNER JOIN monitors mon ON m.monitor_id = mon.id
                    WHERE mon.user_id = $1
                ),
                0
            ) as uptime_percentage
        FROM monitors
        WHERE user_id = $1
    `,
};
