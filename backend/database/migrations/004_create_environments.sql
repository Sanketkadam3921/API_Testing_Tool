-- Create environments table for managing environment variables
CREATE TABLE IF NOT EXISTS environments (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    variables JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_environments_user_id ON environments(user_id);
CREATE INDEX IF NOT EXISTS idx_environments_user_created ON environments(user_id, created_at DESC);

