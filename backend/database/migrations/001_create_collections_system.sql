-- Collections System Database Schema
-- Run this script to create the necessary tables

-- Collections table
CREATE TABLE IF NOT EXISTS collections (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Folders table (supports nested structure)
CREATE TABLE IF NOT EXISTS folders (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    collection_id VARCHAR(255) NOT NULL,
    parent_id VARCHAR(255),
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE CASCADE
);

-- Requests table
CREATE TABLE IF NOT EXISTS requests (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    method VARCHAR(10) DEFAULT 'GET',
    url TEXT NOT NULL,
    headers JSONB DEFAULT '[]',
    body TEXT,
    params JSONB DEFAULT '[]',
    description TEXT,
    collection_id VARCHAR(255),
    folder_id VARCHAR(255),
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
    FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_folders_collection_id ON folders(collection_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_requests_collection_id ON requests(collection_id);
CREATE INDEX IF NOT EXISTS idx_requests_folder_id ON requests(folder_id);

-- Insert sample data for testing
INSERT INTO collections (id, name, description, user_id) VALUES 
('sample-collection-1', 'JSONPlaceholder API', 'Sample REST API for testing', 'sample-user-1'),
('sample-collection-2', 'HTTP Status Codes', 'Test different HTTP status codes', 'sample-user-1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO folders (id, name, description, collection_id, parent_id, "order") VALUES 
('sample-folder-1', 'Posts', 'Post-related endpoints', 'sample-collection-1', NULL, 0),
('sample-folder-2', 'Users', 'User-related endpoints', 'sample-collection-1', NULL, 1),
('sample-folder-3', 'Success Codes', '2xx status codes', 'sample-collection-2', NULL, 0),
('sample-folder-4', 'Error Codes', '4xx and 5xx status codes', 'sample-collection-2', NULL, 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO requests (id, name, method, url, headers, body, params, description, collection_id, folder_id, "order") VALUES 
('sample-request-1', 'Get All Posts', 'GET', 'https://jsonplaceholder.typicode.com/posts', '[]', '', '[]', 'Retrieve all posts', 'sample-collection-1', 'sample-folder-1', 0),
('sample-request-2', 'Get Post by ID', 'GET', 'https://jsonplaceholder.typicode.com/posts/1', '[]', '', '[]', 'Retrieve a specific post', 'sample-collection-1', 'sample-folder-1', 1),
('sample-request-3', 'Create Post', 'POST', 'https://jsonplaceholder.typicode.com/posts', '[{"key": "Content-Type", "value": "application/json"}]', '{"title": "foo", "body": "bar", "userId": 1}', '[]', 'Create a new post', 'sample-collection-1', 'sample-folder-1', 2),
('sample-request-4', '200 OK', 'GET', 'https://httpbin.org/status/200', '[]', '', '[]', 'Test 200 status code', 'sample-collection-2', 'sample-folder-3', 0),
('sample-request-5', '404 Not Found', 'GET', 'https://httpbin.org/status/404', '[]', '', '[]', 'Test 404 status code', 'sample-collection-2', 'sample-folder-4', 0),
('sample-request-6', '500 Server Error', 'GET', 'https://httpbin.org/status/500', '[]', '', '[]', 'Test 500 status code', 'sample-collection-2', 'sample-folder-4', 1)
ON CONFLICT (id) DO NOTHING;
