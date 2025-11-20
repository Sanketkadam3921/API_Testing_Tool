-- Add columns to track consecutive failures and email notifications
ALTER TABLE monitors 
ADD COLUMN IF NOT EXISTS consecutive_failures INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_email_sent TIMESTAMP,
ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN DEFAULT true;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_monitors_consecutive_failures ON monitors(consecutive_failures) WHERE consecutive_failures > 0;





