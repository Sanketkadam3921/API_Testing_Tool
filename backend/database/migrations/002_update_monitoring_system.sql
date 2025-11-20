-- Migration: Update monitoring system to work with Request model
-- Date: 2024-01-01

-- Drop existing foreign key constraints
ALTER TABLE monitors DROP CONSTRAINT IF EXISTS monitors_test_id_fkey;
ALTER TABLE alerts DROP CONSTRAINT IF EXISTS alerts_monitor_id_fkey;
ALTER TABLE metrics DROP CONSTRAINT IF EXISTS metrics_test_id_fkey;

-- Drop existing indexes
DROP INDEX IF EXISTS idx_monitors_test_id;
DROP INDEX IF EXISTS idx_alerts_monitor_id;
DROP INDEX IF EXISTS idx_metrics_test_id;

-- Update monitors table
ALTER TABLE monitors 
  DROP COLUMN IF EXISTS test_id,
  ADD COLUMN IF NOT EXISTS name VARCHAR(255) NOT NULL DEFAULT 'Untitled Monitor',
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS request_id VARCHAR(255) NOT NULL,
  ADD COLUMN IF NOT EXISTS user_id VARCHAR(255) NOT NULL,
  ADD COLUMN IF NOT EXISTS interval_min INTEGER NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS last_run TIMESTAMP,
  ADD COLUMN IF NOT EXISTS next_run TIMESTAMP;

-- Rename interval_sec to interval_min (keeping both for compatibility)
ALTER TABLE monitors 
  ADD COLUMN IF NOT EXISTS interval_min INTEGER NOT NULL DEFAULT 5;

-- Update metrics table
ALTER TABLE metrics 
  DROP COLUMN IF EXISTS test_id,
  ADD COLUMN IF NOT EXISTS monitor_id VARCHAR(255) NOT NULL,
  ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Add foreign key constraints
ALTER TABLE monitors 
  ADD CONSTRAINT monitors_request_id_fkey 
  FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE;

ALTER TABLE monitors 
  ADD CONSTRAINT monitors_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE alerts 
  ADD CONSTRAINT alerts_monitor_id_fkey 
  FOREIGN KEY (monitor_id) REFERENCES monitors(id) ON DELETE CASCADE;

ALTER TABLE metrics 
  ADD CONSTRAINT metrics_monitor_id_fkey 
  FOREIGN KEY (monitor_id) REFERENCES monitors(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_monitors_request_id ON monitors(request_id);
CREATE INDEX IF NOT EXISTS idx_monitors_user_id ON monitors(user_id);
CREATE INDEX IF NOT EXISTS idx_monitors_is_active ON monitors(is_active);
CREATE INDEX IF NOT EXISTS idx_alerts_monitor_id ON alerts(monitor_id);
CREATE INDEX IF NOT EXISTS idx_alerts_is_read ON alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_metrics_monitor_id ON metrics(monitor_id);
CREATE INDEX IF NOT EXISTS idx_metrics_created_at ON metrics(created_at);

-- Update existing data (if any)
-- This assumes we're migrating from test-based monitoring to request-based monitoring
-- You may need to adjust this based on your existing data structure
UPDATE monitors 
SET request_id = (
  SELECT r.id 
  FROM requests r 
  JOIN tests t ON t.url = r.url AND t.method = r.method 
  WHERE t.id = monitors.test_id 
  LIMIT 1
)
WHERE request_id IS NULL AND test_id IS NOT NULL;

-- Clean up old test_id column after migration
-- ALTER TABLE monitors DROP COLUMN IF EXISTS test_id;














