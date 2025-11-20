# Backend API Documentation

Complete API documentation for the API Testing Tool backend service.

## Table of Contents

- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [API Endpoints](#api-endpoints)
  - [Health Check](#health-check)
  - [Authentication](#authentication-endpoints)
  - [API Testing](#api-testing)
  - [Tests Management](#tests-management)
  - [Collections](#collections)
  - [Monitors](#monitors)
  - [Metrics](#metrics)
  - [Alerts](#alerts)

---

## Overview

The API Testing Tool backend is a RESTful API built with Node.js and Express.js. It provides comprehensive functionality for:
- User authentication and authorization
- API request testing
- Collections management (collections, folders, requests)
- Automated monitoring system
- Metrics tracking and analytics
- Alert management

### Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, Rate Limiting
- **Monitoring**: Cron jobs for scheduled monitoring

### Security Features
- JWT-based authentication
- Rate limiting (100 requests per 15 minutes per IP)
- Helmet security headers
- CORS configuration
- Input validation middleware
- Password hashing with bcrypt

---

## Base URL

```
http://localhost:3000
```

All API endpoints are prefixed with `/api` except the health check endpoint.

---

## Authentication

Most endpoints require authentication using JWT (JSON Web Tokens).

### Authentication Header Format
```
Authorization: Bearer <token>
```

### Token Expiration
- JWT tokens expire after **1 day**

### Protected Routes
All routes except the following require authentication:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/test`
- `GET /health`

---

## Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information (optional)"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## API Endpoints

### Health Check

#### GET /health
Check if the API server is running.

**Authentication**: Not required

**Response**:
```json
{
  "success": true,
  "message": "API Testing Tool is running",
  "timestamp": "2025-01-26T10:30:00.000Z",
  "version": "1.0.0"
}
```

---

## Authentication Endpoints

### POST /api/auth/register
Register a new user account.

**Authentication**: Not required

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response** (201):
```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2025-01-26T10:30:00.000Z"
  }
}
```

**Error Responses**:
- `400` - Missing required fields
- `500` - Server error

---

### POST /api/auth/login
Authenticate user and receive JWT token.

**Authentication**: Not required

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response** (200):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses**:
- `400` - Missing email or password
- `401` - Invalid credentials
- `404` - User not found

---

### GET /api/auth/profile
Get the authenticated user's profile.

**Authentication**: Required

**Response** (200):
```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2025-01-26T10:30:00.000Z"
  }
}
```

**Error Responses**:
- `401` - Unauthorized
- `404` - User not found

---

## API Testing

### POST /api/test
Execute an API test request.

**Authentication**: Not required (but can be used with auth)

**Request Body**:
```json
{
  "method": "GET",
  "url": "https://api.example.com/users",
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "Bearer token123"
  },
  "body": null
}
```

**Response** (200):
```json
{
  "success": true,
  "status": 200,
  "statusText": "OK",
  "data": {
    "users": [...]
  },
  "headers": {
    "content-type": "application/json"
  },
  "responseTime": 245,
  "size": "2.5 KB"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Connection refused - the server is not responding",
  "status": null,
  "responseTime": 30000
}
```

**Notes**:
- Supports all HTTP methods (GET, POST, PUT, PATCH, DELETE, etc.)
- Timeout: 30 seconds
- Automatically calculates response size
- Handles various error types (ECONNREFUSED, ENOTFOUND, ETIMEDOUT)

---

## Tests Management

### POST /api/tests/create
Create a new test request.

**Authentication**: Required

**Request Body**:
```json
{
  "name": "Get Users Test",
  "method": "GET",
  "url": "https://api.example.com/users",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": null
}
```

**Response** (201):
```json
{
  "success": true,
  "test": {
    "id": "test-uuid",
    "user_id": "user-uuid",
    "name": "Get Users Test",
    "method": "GET",
    "url": "https://api.example.com/users",
    "headers": {...},
    "body": null,
    "created_at": "2025-01-26T10:30:00.000Z"
  }
}
```

---

### GET /api/tests
Get all tests for the authenticated user.

**Authentication**: Required

**Response** (200):
```json
{
  "success": true,
  "tests": [
    {
      "id": "test-uuid",
      "user_id": "user-uuid",
      "name": "Get Users Test",
      "method": "GET",
      "url": "https://api.example.com/users",
      "headers": {...},
      "body": null,
      "created_at": "2025-01-26T10:30:00.000Z"
    }
  ]
}
```

---

### GET /api/tests/:id
Get a specific test by ID.

**Authentication**: Required

**Response** (200):
```json
{
  "success": true,
  "test": {
    "id": "test-uuid",
    "user_id": "user-uuid",
    "name": "Get Users Test",
    "method": "GET",
    "url": "https://api.example.com/users",
    "headers": {...},
    "body": null,
    "created_at": "2025-01-26T10:30:00.000Z"
  }
}
```

**Error Responses**:
- `404` - Test not found

---

### PUT /api/tests/:id
Update an existing test.

**Authentication**: Required

**Request Body**:
```json
{
  "name": "Updated Test Name",
  "method": "POST",
  "url": "https://api.example.com/users",
  "headers": {...},
  "body": "{\"name\": \"John\"}"
}
```

**Response** (200):
```json
{
  "success": true,
  "test": {
    "id": "test-uuid",
    "name": "Updated Test Name",
    "method": "POST",
    "url": "https://api.example.com/users",
    ...
  }
}
```

**Error Responses**:
- `404` - Test not found

---

### DELETE /api/tests/:id
Delete a test.

**Authentication**: Required

**Response** (200):
```json
{
  "success": true,
  "message": "Test deleted"
}
```

**Error Responses**:
- `404` - Test not found

---

### POST /api/tests/:id/run
Execute a saved test.

**Authentication**: Required

**Response** (200):
```json
{
  "success": true,
  "test": {
    "id": "test-uuid",
    "name": "Get Users Test",
    ...
  },
  "runResult": {
    "success": true,
    "status": 200,
    "statusText": "OK",
    "data": {...},
    "headers": {...},
    "responseTime": 245,
    "size": "2.5 KB"
  }
}
```

**Error Responses**:
- `404` - Test not found

---

## Collections

The Collections API provides a hierarchical organization system for API requests:
- **Collections**: Top-level containers
- **Folders**: Nested containers within collections
- **Requests**: Individual API requests

### Collections CRUD

#### POST /api/collections
Create a new collection.

**Authentication**: Required

**Request Body**:
```json
{
  "name": "My API Collection",
  "description": "Collection for testing user APIs"
}
```

**Response** (201):
```json
{
  "success": true,
  "collection": {
    "id": "collection-uuid",
    "user_id": "user-uuid",
    "name": "My API Collection",
    "description": "Collection for testing user APIs",
    "created_at": "2025-01-26T10:30:00.000Z",
    "updated_at": "2025-01-26T10:30:00.000Z"
  }
}
```

**Validation**:
- `name` is required
- `name` cannot be empty

---

#### GET /api/collections
Get all collections for the authenticated user.

**Authentication**: Required

**Response** (200):
```json
{
  "success": true,
  "collections": [
    {
      "id": "collection-uuid",
      "user_id": "user-uuid",
      "name": "My API Collection",
      "description": "Collection description",
      "created_at": "2025-01-26T10:30:00.000Z",
      "updated_at": "2025-01-26T10:30:00.000Z"
    }
  ]
}
```

---

#### GET /api/collections/:id
Get a specific collection by ID.

**Authentication**: Required

**Response** (200):
```json
{
  "success": true,
  "collection": {
    "id": "collection-uuid",
    "user_id": "user-uuid",
    "name": "My API Collection",
    "description": "Collection description",
    "created_at": "2025-01-26T10:30:00.000Z",
    "updated_at": "2025-01-26T10:30:00.000Z"
  }
}
```

**Error Responses**:
- `404` - Collection not found

---

#### PUT /api/collections/:id
Update a collection.

**Authentication**: Required

**Request Body**:
```json
{
  "name": "Updated Collection Name",
  "description": "Updated description"
}
```

**Response** (200):
```json
{
  "success": true,
  "collection": {
    "id": "collection-uuid",
    "name": "Updated Collection Name",
    "description": "Updated description",
    ...
  }
}
```

**Error Responses**:
- `404` - Collection not found

---

#### DELETE /api/collections/:id
Delete a collection (cascades to folders and requests).

**Authentication**: Required

**Response** (200):
```json
{
  "success": true,
  "message": "Collection deleted successfully"
}
```

**Error Responses**:
- `404` - Collection not found

---

### Folders CRUD

#### POST /api/collections/:collectionId/folders
Create a new folder within a collection.

**Authentication**: Required

**Request Body**:
```json
{
  "name": "User Endpoints",
  "description": "Folder for user-related endpoints",
  "parentId": null,
  "order": 0
}
```

**Response** (201):
```json
{
  "success": true,
  "folder": {
    "id": "folder-uuid",
    "collection_id": "collection-uuid",
    "name": "User Endpoints",
    "description": "Folder for user-related endpoints",
    "parent_id": null,
    "order": 0,
    "created_at": "2025-01-26T10:30:00.000Z",
    "updated_at": "2025-01-26T10:30:00.000Z"
  }
}
```

**Validation**:
- `name` is required
- `parentId` is optional (for nested folders)
- `order` defaults to 0

---

#### GET /api/collections/:collectionId/folders
Get all folders in a collection.

**Authentication**: Required

**Response** (200):
```json
{
  "success": true,
  "folders": [
    {
      "id": "folder-uuid",
      "collection_id": "collection-uuid",
      "name": "User Endpoints",
      "description": "Folder description",
      "parent_id": null,
      "order": 0,
      ...
    }
  ]
}
```

---

#### PUT /api/collections/folders/:id
Update a folder.

**Authentication**: Required

**Request Body**:
```json
{
  "name": "Updated Folder Name",
  "description": "Updated description",
  "parentId": null,
  "order": 1
}
```

**Response** (200):
```json
{
  "success": true,
  "folder": {
    "id": "folder-uuid",
    "name": "Updated Folder Name",
    ...
  }
}
```

**Error Responses**:
- `404` - Folder not found

---

#### DELETE /api/collections/folders/:id
Delete a folder (cascades to requests).

**Authentication**: Required

**Response** (200):
```json
{
  "success": true,
  "message": "Folder deleted successfully"
}
```

**Error Responses**:
- `404` - Folder not found

---

### Requests CRUD

#### POST /api/collections/:collectionId/requests
Create a new request in a collection or folder.

**Authentication**: Required

**Request Body**:
```json
{
  "name": "Get All Users",
  "method": "GET",
  "url": "https://api.example.com/users",
  "headers": [
    {"key": "Content-Type", "value": "application/json"},
    {"key": "Authorization", "value": "Bearer token"}
  ],
  "body": "",
  "params": [
    {"key": "page", "value": "1"},
    {"key": "limit", "value": "10"}
  ],
  "description": "Fetch all users from the API",
  "folderId": null,
  "order": 0
}
```

**Response** (201):
```json
{
  "success": true,
  "request": {
    "id": "request-uuid",
    "collection_id": "collection-uuid",
    "folder_id": null,
    "name": "Get All Users",
    "method": "GET",
    "url": "https://api.example.com/users",
    "headers": [...],
    "body": "",
    "params": [...],
    "description": "Fetch all users from the API",
    "order": 0,
    "created_at": "2025-01-26T10:30:00.000Z",
    "updated_at": "2025-01-26T10:30:00.000Z"
  }
}
```

**Validation**:
- `name` is required
- `url` is required
- `headers` and `params` are arrays of key-value objects

---

#### GET /api/collections/:collectionId/requests
Get all requests in a collection.

**Authentication**: Required

**Query Parameters**:
- `folderId` (optional) - Filter requests by folder ID

**Example**: `/api/collections/:collectionId/requests?folderId=folder-uuid`

**Response** (200):
```json
{
  "success": true,
  "requests": [
    {
      "id": "request-uuid",
      "collection_id": "collection-uuid",
      "folder_id": null,
      "name": "Get All Users",
      "method": "GET",
      "url": "https://api.example.com/users",
      "headers": [...],
      "params": [...],
      "body": "",
      ...
    }
  ]
}
```

---

#### GET /api/collections/requests/:id
Get a specific request by ID.

**Authentication**: Required

**Response** (200):
```json
{
  "success": true,
  "request": {
    "id": "request-uuid",
    "collection_id": "collection-uuid",
    "folder_id": null,
    "name": "Get All Users",
    "method": "GET",
    "url": "https://api.example.com/users",
    "headers": [...],
    "params": [...],
    "body": "",
    ...
  }
}
```

**Error Responses**:
- `404` - Request not found

---

#### PUT /api/collections/requests/:id
Update a request.

**Authentication**: Required

**Request Body**:
```json
{
  "name": "Updated Request Name",
  "method": "POST",
  "url": "https://api.example.com/users",
  "headers": [...],
  "body": "{\"name\": \"John\"}",
  "params": [...],
  "description": "Updated description",
  "folderId": "folder-uuid",
  "order": 1
}
```

**Response** (200):
```json
{
  "success": true,
  "request": {
    "id": "request-uuid",
    "name": "Updated Request Name",
    ...
  }
}
```

**Error Responses**:
- `404` - Request not found

---

#### DELETE /api/collections/requests/:id
Delete a request.

**Authentication**: Required

**Response** (200):
```json
{
  "success": true,
  "message": "Request deleted successfully"
}
```

**Error Responses**:
- `404` - Request not found

---

#### POST /api/collections/requests/:id/move
Move a request to a different folder or collection.

**Authentication**: Required

**Request Body**:
```json
{
  "folderId": "new-folder-uuid",
  "collectionId": "new-collection-uuid"
}
```

**Response** (200):
```json
{
  "success": true,
  "request": {
    "id": "request-uuid",
    "folder_id": "new-folder-uuid",
    "collection_id": "new-collection-uuid",
    ...
  }
}
```

**Error Responses**:
- `404` - Request not found

---

### Collection Structure

#### GET /api/collections/:collectionId/structure
Get the complete hierarchical structure of a collection (collections, folders, and requests).

**Authentication**: Required

**Response** (200):
```json
{
  "success": true,
  "structure": [
    {
      "id": "folder-uuid",
      "name": "User Endpoints",
      "type": "folder",
      "parent_id": null,
      "order": 0,
      "requests": [
        {
          "id": "request-uuid",
          "name": "Get All Users",
          "method": "GET",
          "url": "https://api.example.com/users",
          "headers": [...],
          "params": [...],
          "order": 0
        }
      ]
    },
    {
      "id": "request-uuid",
      "name": "Root Request",
      "method": "GET",
      "type": "request",
      "url": "https://api.example.com/root",
      ...
    }
  ]
}
```

---

## Monitors

The Monitoring system allows automated, scheduled checking of API endpoints with configurable intervals and thresholds.

### POST /api/monitors
Create a new monitor.

**Authentication**: Required

**Request Body** (Option 1 - Using existing request):
```json
{
  "name": "User API Monitor",
  "description": "Monitor user endpoint every 5 minutes",
  "request_id": "request-uuid",
  "interval_min": 5,
  "threshold_ms": 500
}
```

**Request Body** (Option 2 - Creating new request):
```json
{
  "name": "User API Monitor",
  "description": "Monitor user endpoint",
  "request_id": null,
  "method": "GET",
  "url": "https://api.example.com/users",
  "headers": {},
  "body": null,
  "params": {},
  "interval_min": 5,
  "threshold_ms": 500
}
```

**Response** (201):
```json
{
  "success": true,
  "monitor": {
    "id": "monitor-uuid",
    "name": "User API Monitor",
    "description": "Monitor user endpoint every 5 minutes",
    "request_id": "request-uuid",
    "user_id": "user-uuid",
    "interval_min": 5,
    "threshold_ms": 500,
    "is_active": true,
    "last_run": null,
    "next_run": null,
    "created_at": "2025-01-26T10:30:00.000Z",
    "updated_at": "2025-01-26T10:30:00.000Z"
  }
}
```

**Notes**:
- If `request_id` is provided but doesn't exist, the system can create a new request using `method` and `url`
- If no `request_id` is provided, `method` and `url` are required
- Monitor automatically starts scheduling when created (`is_active: true`)
- Default `interval_min`: 5 minutes
- Default `threshold_ms`: 500 milliseconds

---

### GET /api/monitors
Get all monitors for the authenticated user.

**Authentication**: Required

**Response** (200):
```json
{
  "success": true,
  "monitors": [
    {
      "id": "monitor-uuid",
      "name": "User API Monitor",
      "description": "Monitor description",
      "request_id": "request-uuid",
      "request_name": "Get All Users",
      "method": "GET",
      "url": "https://api.example.com/users",
      "user_id": "user-uuid",
      "interval_min": 5,
      "threshold_ms": 500,
      "is_active": true,
      "last_run": "2025-01-26T11:00:00.000Z",
      "next_run": "2025-01-26T11:05:00.000Z",
      "created_at": "2025-01-26T10:30:00.000Z"
    }
  ]
}
```

---

### GET /api/monitors/stats
Get monitoring statistics for the authenticated user.

**Authentication**: Required

**Response** (200):
```json
{
  "success": true,
  "stats": {
    "total_monitors": 10,
    "active_monitors": 7,
    "inactive_monitors": 3
  }
}
```

---

### GET /api/monitors/:id
Get a specific monitor by ID.

**Authentication**: Required

**Response** (200):
```json
{
  "success": true,
  "monitor": {
    "id": "monitor-uuid",
    "name": "User API Monitor",
    "description": "Monitor description",
    "request_id": "request-uuid",
    "request_name": "Get All Users",
    "method": "GET",
    "url": "https://api.example.com/users",
    "interval_min": 5,
    "threshold_ms": 500,
    "is_active": true,
    "last_run": "2025-01-26T11:00:00.000Z",
    "next_run": "2025-01-26T11:05:00.000Z",
    ...
  }
}
```

**Error Responses**:
- `404` - Monitor not found

---

### PUT /api/monitors/:id/status
Start or stop a monitor.

**Authentication**: Required

**Request Body**:
```json
{
  "is_active": true
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Monitor started successfully",
  "monitor": {
    "id": "monitor-uuid",
    "is_active": true,
    ...
  }
}
```

**Notes**:
- Setting `is_active: true` starts/resumes monitoring and schedules cron jobs
- Setting `is_active: false` stops monitoring and removes cron jobs

**Error Responses**:
- `404` - Monitor not found

---

### DELETE /api/monitors/:id
Delete a monitor.

**Authentication**: Required

**Response** (200):
```json
{
  "success": true,
  "message": "Monitor deleted successfully"
}
```

**Notes**:
- Automatically stops the monitoring cron job before deletion

**Error Responses**:
- `404` - Monitor not found

---

### POST /api/monitors/:id/test
Manually run a monitor test immediately.

**Authentication**: Required

**Response** (200):
```json
{
  "success": true,
  "result": {
    "success": true,
    "status": 200,
    "statusText": "OK",
    "data": {...},
    "headers": {...},
    "responseTime": 245,
    "size": "2.5 KB"
  }
}
```

**Notes**:
- This triggers an immediate test run
- Updates `last_run` timestamp
- Records metrics automatically
- Does not affect scheduled monitoring intervals

**Error Responses**:
- `404` - Monitor not found

---

## Metrics

### GET /api/metrics/:id
Get metrics and statistics for a specific monitor.

**Authentication**: Required

**Path Parameters**:
- `id` - Monitor ID

**Response** (200):
```json
{
  "success": true,
  "metrics": [
    {
      "id": "metric-uuid",
      "monitor_id": "monitor-uuid",
      "status_code": 200,
      "response_time": 245,
      "success": true,
      "error_message": null,
      "created_at": "2025-01-26T11:00:00.000Z"
    },
    {
      "id": "metric-uuid-2",
      "monitor_id": "monitor-uuid",
      "status_code": 200,
      "response_time": 312,
      "success": true,
      "error_message": null,
      "created_at": "2025-01-26T11:05:00.000Z"
    }
  ],
  "stats": {
    "total_checks": 100,
    "successful_checks": 95,
    "failed_checks": 5,
    "uptime_percentage": 95.0,
    "average_response_time": 280,
    "min_response_time": 120,
    "max_response_time": 850
  }
}
```

**Notes**:
- Returns all metrics recorded for the monitor
- Includes uptime statistics
- Calculates average, min, max response times

---

## Alerts

The Alerts system automatically creates notifications when monitors detect issues.

### GET /api/alerts
Get all alerts for the authenticated user.

**Authentication**: Required

**Response** (200):
```json
{
  "success": true,
  "alerts": [
    {
      "id": "alert-uuid",
      "monitor_id": "monitor-uuid",
      "message": "High response time: 850ms (threshold: 500ms)",
      "severity": "warning",
      "is_read": false,
      "created_at": "2025-01-26T11:05:00.000Z",
      "monitor": {
        "name": "User API Monitor",
        "url": "https://api.example.com/users"
      }
    },
    {
      "id": "alert-uuid-2",
      "monitor_id": "monitor-uuid",
      "message": "Server error: HTTP 500",
      "severity": "error",
      "is_read": false,
      "created_at": "2025-01-26T11:10:00.000Z"
    }
  ]
}
```

**Alert Severities**:
- `warning` - Response time exceeded threshold
- `error` - HTTP error status or request failure

**Alert Types (Auto-created)**:
1. **High Response Time**: When response time exceeds `threshold_ms`
2. **Server Errors**: When HTTP status code >= 500
3. **Request Failures**: Network errors, timeouts, connection failures
4. **Monitor Failures**: When the monitoring job itself fails

---

### POST /api/alerts/configure
Configure alert thresholds for a monitor.

**Authentication**: Required

**Request Body**:
```json
{
  "monitor_id": "monitor-uuid",
  "threshold_ms": 1000
}
```

**Response** (200):
```json
{
  "success": true,
  "monitor": {
    "id": "monitor-uuid",
    "threshold_ms": 1000,
    ...
  }
}
```

---

## Monitoring System Architecture

### How Monitoring Works

1. **Monitor Creation**: When a monitor is created, it automatically schedules a cron job
2. **Scheduled Execution**: Cron jobs run at the specified interval (in minutes)
3. **Test Execution**: Each scheduled run executes the API test
4. **Metrics Recording**: Results are automatically recorded in the metrics table
5. **Alert Generation**: If thresholds are exceeded or errors occur, alerts are created
6. **Status Updates**: `last_run` and `next_run` timestamps are updated

### Cron Expression Format
- Uses `node-cron` library
- Expression: `*/{intervalMin} * * * *` (every N minutes)
- Example: `*/5 * * * *` runs every 5 minutes

### System Initialization
- On server startup, `initializeMonitoring()` is called
- All active monitors are automatically restarted
- Cron jobs are rescheduled for all `is_active: true` monitors

### Database Relationships
- **Monitors** → **Requests** (one-to-one)
- **Monitors** → **Metrics** (one-to-many)
- **Monitors** → **Alerts** (one-to-many)
- **Monitors** → **Users** (many-to-one)

---

## Rate Limiting

- **Window**: 15 minutes
- **Limit**: 100 requests per IP address
- **Applied to**: All `/api/*` routes
- **Error Response**:
  ```json
  {
    "success": false,
    "error": "Too many requests from this IP, please try again later."
  }
  ```

---

## CORS Configuration

Allowed origins:
- `http://localhost:5173` (default frontend)
- `http://localhost:5174`
- `http://localhost:3000`
- `http://localhost:3001`
- Custom origin via `FRONTEND_URL` environment variable

Credentials are enabled for CORS requests.

---

## Data Formats

### Headers Format
Headers are stored as JSON arrays of key-value objects:
```json
[
  {"key": "Content-Type", "value": "application/json"},
  {"key": "Authorization", "value": "Bearer token123"}
]
```

### Query Parameters Format
Query parameters are stored as JSON arrays of key-value objects:
```json
[
  {"key": "page", "value": "1"},
  {"key": "limit", "value": "10"}
]
```

### Body Format
- For GET requests: `null` or empty string
- For POST/PUT/PATCH: JSON string or object

---

## Environment Variables

Required environment variables:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/apitesting

# JWT
JWT_SECRET=your-secret-key-here

# Server
PORT=3000

# Frontend (optional)
FRONTEND_URL=http://localhost:5173
```

---

## Database Schema Overview

### Core Tables
- `users` - User accounts
- `collections` - Top-level request containers
- `folders` - Nested containers within collections
- `requests` - Individual API requests
- `tests` - Saved API test configurations
- `monitors` - Monitoring configurations
- `metrics` - Performance metrics from monitor runs
- `alerts` - Generated alerts

### Relationships
- Users have many Collections, Tests, Monitors
- Collections have many Folders and Requests
- Folders have many Requests (nested folders supported)
- Monitors belong to one Request and User
- Monitors have many Metrics and Alerts

---

## Error Messages

### Common Error Responses

**401 Unauthorized**:
```json
{
  "message": "No token provided"
}
```

**403 Forbidden**:
```json
{
  "message": "Invalid or expired token"
}
```

**404 Not Found**:
```json
{
  "success": false,
  "message": "Resource not found"
}
```

**400 Bad Request**:
```json
{
  "success": false,
  "message": "Validation error",
  "details": {
    "missing_fields": ["name", "url"]
  }
}
```

---

## Best Practices

1. **Authentication**: Always include the JWT token in the Authorization header for protected routes
2. **Error Handling**: Check the `success` field in responses before accessing data
3. **Request Headers**: Always send headers as arrays of key-value objects
4. **Monitor Intervals**: Recommended minimum interval is 1 minute; maximum is 1440 minutes (24 hours)
5. **Threshold Values**: Set realistic thresholds based on expected API response times
6. **Rate Limiting**: Be mindful of the 100 requests per 15 minutes limit per IP
7. **Monitoring**: Use manual test endpoints to verify monitor configurations before enabling scheduled runs

---

## Version Information

- **API Version**: 1.0.0
- **Node.js**: v18+
- **Express.js**: Latest
- **PostgreSQL**: Required
- **Last Updated**: January 2025

---

## Support & Documentation

For additional information, refer to:
- `MONITORING_GUIDE.md` - Detailed monitoring system guide
- `README.md` - Project setup and installation
- `COLLECTIONS_SETUP.md` - Collections system documentation

---

*This documentation covers all current backend API endpoints and functionality as of January 2025.*











