-- Create request_history table for tracking all API requests
CREATE TABLE IF NOT EXISTS request_history (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    url TEXT NOT NULL,
    headers JSONB DEFAULT '{}',
    body TEXT,
    params JSONB DEFAULT '[]',
    status_code INTEGER,
    status_text VARCHAR(50),
    response_data JSONB,
    response_headers JSONB DEFAULT '{}',
    response_time INTEGER DEFAULT 0,
    response_size VARCHAR(20),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_history_user_id ON request_history(user_id);
CREATE INDEX IF NOT EXISTS idx_history_created_at ON request_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_history_method ON request_history(method);
CREATE INDEX IF NOT EXISTS idx_history_status_code ON request_history(status_code);
CREATE INDEX IF NOT EXISTS idx_history_user_created ON request_history(user_id, created_at DESC);

-- Create analytics view for quick stats
CREATE OR REPLACE VIEW request_history_stats AS
SELECT 
    user_id,
    COUNT(*) as total_requests,
    COUNT(CASE WHEN status_code >= 200 AND status_code < 300 THEN 1 END) as successful_requests,
    COUNT(CASE WHEN status_code >= 400 THEN 1 END) as failed_requests,
    AVG(response_time) as avg_response_time,
    MIN(response_time) as min_response_time,
    MAX(response_time) as max_response_time,
    COUNT(DISTINCT method) as unique_methods,
    COUNT(DISTINCT url) as unique_urls,
    DATE_TRUNC('day', created_at) as date
FROM request_history
GROUP BY user_id, DATE_TRUNC('day', created_at);

