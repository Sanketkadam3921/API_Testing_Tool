export const MetricsQueries = {
  createMetric: `
        INSERT INTO metrics (monitor_id, status_code, response_time, success, error_message)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `,
  getMetricsByMonitor: `
        SELECT * FROM metrics 
        WHERE monitor_id = $1
        ORDER BY created_at DESC
        LIMIT 100
    `,
  getMetricsByMonitorWithDateRange: `
        SELECT * FROM metrics 
        WHERE monitor_id = $1 
        AND created_at >= $2 
        AND created_at <= $3
        ORDER BY created_at DESC
    `,
  getUptimeStats: `
        SELECT 
            COUNT(*) FILTER (WHERE success = true) * 100.0 / NULLIF(COUNT(*), 0) as uptime_percentage,
            AVG(response_time) as avg_response_time,
            MIN(response_time) as min_response_time,
            MAX(response_time) as max_response_time,
            COUNT(*) as total_requests,
            COUNT(*) FILTER (WHERE success = true) as successful_requests,
            COUNT(*) FILTER (WHERE success = false) as failed_requests
        FROM metrics
        WHERE monitor_id = $1
    `,
  getUptimeStatsWithDateRange: `
        SELECT 
            COUNT(*) FILTER (WHERE success = true) * 100.0 / NULLIF(COUNT(*), 0) as uptime_percentage,
            AVG(response_time) as avg_response_time,
            MIN(response_time) as min_response_time,
            MAX(response_time) as max_response_time,
            COUNT(*) as total_requests,
            COUNT(*) FILTER (WHERE success = true) as successful_requests,
            COUNT(*) FILTER (WHERE success = false) as failed_requests
        FROM metrics
        WHERE monitor_id = $1 
        AND created_at >= $2 
        AND created_at <= $3
    `,
  getRecentMetrics: `
        SELECT * FROM metrics 
        WHERE monitor_id = $1
        ORDER BY created_at DESC
        LIMIT $2
    `,
  deleteOldMetrics: `
        DELETE FROM metrics 
        WHERE monitor_id = $1 
        AND created_at < NOW() - INTERVAL '30 days'
    `
};
