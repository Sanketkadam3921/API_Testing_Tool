# ApexAPI - Technical Implementation Guide

## Overview
This document provides a comprehensive explanation of how ApexAPI actually calculates, tests, and monitors API endpoints. This technical guide explains the implementation details for educational purposes.

---

## Table of Contents
1. [API Test Execution Process](#1-api-test-execution-process)
2. [Response Time Calculation](#2-response-time-calculation)
3. [Monitoring System Architecture](#3-monitoring-system-architecture)
4. [Uptime Calculation](#4-uptime-calculation)
5. [Statistics and Metrics Calculation](#5-statistics-and-metrics-calculation)
6. [Alert System](#6-alert-system)
7. [Database Schema](#7-database-schema)
8. [System Flow Diagrams](#8-system-flow-diagrams)

---

## 1. API Test Execution Process

### 1.1 Manual API Testing Flow

When a user manually tests an API request through the web interface, the following process occurs:

**Step-by-Step Process:**
1. **Request Reception**: User submits API request details (method, URL, headers, body) via frontend
2. **Backend Processing**: Request reaches `ApiTestService.testApi()` method
3. **Time Measurement Start**: System records start time using `Date.now()`
   ```javascript
   const startTime = Date.now();
   ```
4. **HTTP Request Execution**: Axios library sends actual HTTP request to target API
   - Supports GET, POST, PUT, PATCH, DELETE methods
   - Includes custom headers and request body
   - Timeout set to 30 seconds (30000ms)
   - `validateStatus: () => true` ensures all status codes are accepted (doesn't throw errors)
5. **Time Measurement End**: System records end time
   ```javascript
   const endTime = Date.now();
   ```
6. **Response Processing**: 
   - Extract status code, status text, response body, headers
   - Calculate response size (from Content-Length header or by serializing JSON)
7. **Error Handling**: If request fails, catch block executes:
   - Records failure time still
   - Identifies error type (ECONNREFUSED, ENOTFOUND, ETIMEDOUT, HTTP errors)
   - Returns appropriate error message

**Code Location**: `backend/src/services/apiTestService.js`

**Key Function:**
```javascript
async testApi(requestData) {
    const startTime = Date.now();
    // ... HTTP request execution ...
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    return { success, status, responseTime, data, ... };
}
```

---

## 2. Response Time Calculation

### 2.1 Precise Timing Mechanism

**How Response Time is Calculated:**

1. **Start Timer**: Before making HTTP request
   ```javascript
   const startTime = Date.now(); // JavaScript timestamp in milliseconds
   ```

2. **Execute Request**: HTTP request is sent via Axios

3. **End Timer**: After response is received (or error occurs)
   ```javascript
   const endTime = Date.now();
   const responseTime = endTime - startTime; // Difference in milliseconds
   ```

**Important Notes:**
- Uses `Date.now()` which provides millisecond precision
- Measures **total time** from request initiation to response receipt
- Includes network latency, server processing time, and data transfer time
- Timeout is set to 30 seconds (30000ms) - if exceeded, error is returned

### 2.2 Response Size Calculation

The system also calculates the response size:

```javascript
calculateResponseSize(data, headers) {
    // Method 1: Use Content-Length header if available
    const contentLength = headers['content-length'];
    if (contentLength) {
        size = parseInt(contentLength, 10);
    } else if (data) {
        // Method 2: Calculate from actual data
        if (typeof data === 'string') {
            size = Buffer.byteLength(data, 'utf8');
        } else if (typeof data === 'object') {
            size = Buffer.byteLength(JSON.stringify(data), 'utf8');
        }
    }
    // Format: Convert bytes to KB, MB, GB
}
```

**Code Location**: `backend/src/services/apiTestService.js` (lines 159-182)

---

## 3. Monitoring System Architecture

### 3.1 Cron-Based Scheduling

The monitoring system uses **node-cron** library to schedule periodic API tests:

**How Scheduling Works:**
1. When a monitor is created, a cron job is scheduled:
   ```javascript
   const cronExpression = `*/${intervalMin} * * * *`; // Every N minutes
   ```
   Example: If `intervalMin = 5`, expression becomes `*/5 * * * *` (every 5 minutes)

2. Cron job executes at specified intervals automatically
3. On execution, the system:
   - Runs the API test
   - Records metrics to database
   - Checks for failures and triggers alerts
   - Updates monitor status

**Code Location**: `backend/src/utils/monitorScheduler.js`

### 3.2 Monitor Execution Flow

```
┌─────────────────────┐
│ Cron Job Triggered  │
│ (Every N minutes)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Get Monitor Details  │
│ (URL, Method, etc.) │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Execute API Test    │
│ (Using ApiTestService)│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Record Metric       │
│ (Save to Database)  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Check for Alerts    │
│ (Failures, Thresholds)│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Send Notifications  │
│ (Email if needed)   │
└─────────────────────┘
```

**Code Location**: `backend/src/utils/monitorScheduler.js` (lines 22-139)

### 3.3 Monitor Test Execution

When a scheduled monitor runs, it follows this process:

1. **Retrieve Monitor Configuration**:
   ```javascript
   const monitor = await MonitorsService.getMonitorWithRequest(monitorId);
   // Gets: method, url, headers, body, params, interval, threshold
   ```

2. **Prepare Request Data**:
   ```javascript
   const requestData = {
       method: monitor.method,
       url: monitor.url,
       headers: monitor.headers || {},
       body: monitor.body || null,
       params: monitor.params || {}
   };
   ```

3. **Execute Test**: Uses same `ApiTestService.testApi()` as manual testing

4. **Record Result**: Saves to database with all metrics

**Code Location**: `backend/src/modules/monitors/monitors.service.js` (lines 106-133)

---

## 4. Uptime Calculation

### 4.1 Uptime Percentage Formula

Uptime is calculated using SQL aggregation functions:

```sql
SELECT 
    COUNT(*) FILTER (WHERE success = true) * 100.0 / NULLIF(COUNT(*), 0) 
    as uptime_percentage
FROM metrics
WHERE monitor_id = $1
```

**Formula Breakdown:**
- `COUNT(*) FILTER (WHERE success = true)`: Count of successful requests
- `COUNT(*)`: Total number of requests
- Division by 100.0 to get percentage
- `NULLIF(COUNT(*), 0)`: Prevents division by zero (returns NULL if no requests)

**Example Calculation:**
- Total requests: 1000
- Successful requests: 995
- Uptime = (995 / 1000) × 100 = **99.5%**

### 4.2 Success Criteria

A request is considered **successful** if:
1. `success = true` in the metrics table
2. AND HTTP status code is between 200-399 (2xx or 3xx)

**Code Logic:**
```javascript
const isSuccess = result.success && result.status >= 200 && result.status < 400;
```

**Code Location**: `backend/src/modules/metrics/metrics.queries.js` (lines 20-31)

### 4.3 Date Range Filtering

Uptime can be calculated for specific time periods:

```sql
SELECT 
    COUNT(*) FILTER (WHERE success = true) * 100.0 / NULLIF(COUNT(*), 0) 
    as uptime_percentage
FROM metrics
WHERE monitor_id = $1 
AND created_at >= $2    -- Start date
AND created_at <= $3    -- End date
```

This allows users to see uptime for:
- Last 24 hours
- Last week
- Last month
- Custom date range

---

## 5. Statistics and Metrics Calculation

### 5.1 Aggregated Statistics

The system calculates several statistics using SQL aggregations:

```sql
SELECT 
    -- Uptime percentage
    COUNT(*) FILTER (WHERE success = true) * 100.0 / NULLIF(COUNT(*), 0) 
        as uptime_percentage,
    
    -- Average response time
    AVG(response_time) as avg_response_time,
    
    -- Minimum response time
    MIN(response_time) as min_response_time,
    
    -- Maximum response time
    MAX(response_time) as max_response_time,
    
    -- Request counts
    COUNT(*) as total_requests,
    COUNT(*) FILTER (WHERE success = true) as successful_requests,
    COUNT(*) FILTER (WHERE success = false) as failed_requests
FROM metrics
WHERE monitor_id = $1
```

### 5.2 Individual Metrics Storage

Each API test execution creates a metric record:

```javascript
await MetricsService.recordMetric(
    monitorId,        // Which monitor this belongs to
    statusCode,       // HTTP status code (200, 404, 500, etc.)
    responseTime,     // Response time in milliseconds
    success,          // Boolean: true if successful, false if failed
    errorMessage      // Error message if failed (null if successful)
);
```

**Database Schema:**
```
metrics table:
- id: UUID (primary key)
- monitor_id: UUID (foreign key to monitors)
- status_code: Integer (HTTP status code)
- response_time: Integer (milliseconds)
- success: Boolean (true/false)
- error_message: String (nullable)
- created_at: Timestamp
```

**Code Location**: 
- Recording: `backend/src/modules/metrics/metrics.service.js`
- Queries: `backend/src/modules/metrics/metrics.queries.js`

### 5.3 Response Time Statistics

**Average Response Time:**
- SQL: `AVG(response_time)` - Calculates mean of all response times
- Example: If responses were [100ms, 150ms, 200ms], average = 150ms

**Minimum Response Time:**
- SQL: `MIN(response_time)` - Fastest response time recorded

**Maximum Response Time:**
- SQL: `MAX(response_time)` - Slowest response time recorded

**Real-time Calculation:**
- Statistics are calculated on-demand when dashboard is loaded
- Uses actual database records (no pre-aggregation)
- Always reflects current data

---

## 6. Alert System

### 6.1 Alert Triggers

The system creates alerts in the following scenarios:

#### 6.1.1 Request Failure
```javascript
if (!isSuccess) {
    await AlertsService.createAlert(
        monitorId,
        `Request failed: ${result.error || `HTTP ${result.status}`}`,
        "error"
    );
}
```

#### 6.1.2 High Response Time
```javascript
if (result.responseTime > thresholdMs) {
    await AlertsService.createAlert(
        monitorId,
        `High response time: ${result.responseTime}ms (threshold: ${thresholdMs}ms)`,
        "warning"
    );
}
```

#### 6.1.3 Server Errors (5xx)
```javascript
if (result.status >= 500) {
    await AlertsService.createAlert(
        monitorId,
        `Server error: HTTP ${result.status}`,
        "error"
    );
}
```

### 6.2 Consecutive Failure Tracking

The system tracks consecutive failures:

**How it Works:**
1. **On Failure**: Increment `consecutive_failures` counter in database
   ```javascript
   await MonitorsService.incrementConsecutiveFailures(monitorId);
   ```

2. **On Success**: Reset counter to 0
   ```javascript
   await MonitorsService.resetConsecutiveFailures(monitorId);
   ```

3. **Email Notification Threshold**: 
   - Default: 10 consecutive failures
   - Email sent only if `consecutive_failures >= FAILURE_THRESHOLD`
   - Cooldown period: 24 hours between emails

**Code Location**: `backend/src/utils/monitorScheduler.js` (lines 41-88)

### 6.3 Email Notifications

**Failure Notification:**
- Sent when monitor fails 10+ times consecutively
- Includes: monitor name, URL, consecutive failures, last error
- HTML email with styling

**Recovery Notification:**
- Sent when monitor recovers after failures
- Confirms API is back online

**Email Service**: `backend/src/services/emailService.js`

---

## 7. Database Schema

### 7.1 Key Tables

#### Monitors Table
```sql
CREATE TABLE monitors (
    id UUID PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT,
    request_id UUID REFERENCES requests(id),
    user_id UUID REFERENCES users(id),
    interval_min INTEGER DEFAULT 5,      -- Check interval in minutes
    threshold_ms INTEGER DEFAULT 500,   -- Response time threshold
    is_active BOOLEAN DEFAULT true,
    consecutive_failures INTEGER DEFAULT 0,
    last_run TIMESTAMP,
    next_run TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Metrics Table
```sql
CREATE TABLE metrics (
    id UUID PRIMARY KEY,
    monitor_id UUID REFERENCES monitors(id),
    status_code INTEGER,
    response_time INTEGER,              -- In milliseconds
    success BOOLEAN,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Alerts Table
```sql
CREATE TABLE alerts (
    id UUID PRIMARY KEY,
    monitor_id UUID REFERENCES monitors(id),
    message TEXT NOT NULL,
    severity VARCHAR DEFAULT 'warning',  -- 'warning', 'error'
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 7.2 Indexes for Performance

The database uses indexes for efficient queries:
- `monitor_id` on metrics table (for fast metric retrieval)
- `created_at` on metrics table (for date range queries)
- `is_active, next_run` on monitors table (for finding monitors to run)

---

## 8. System Flow Diagrams

### 8.1 Manual Test Flow

```
User → Frontend → Backend API → ApiTestService.testApi()
                                        │
                                        ├─→ Record Start Time
                                        ├─→ Execute HTTP Request (Axios)
                                        ├─→ Record End Time
                                        ├─→ Calculate Response Time
                                        └─→ Return Results
                                              │
                                              └─→ Display in UI
```

### 8.2 Automated Monitoring Flow

```
Cron Scheduler (node-cron)
    │
    ├─→ Every N minutes
    │
    └─→ For each active monitor:
            │
            ├─→ Get monitor configuration
            ├─→ Execute API test
            ├─→ Record metric to database
            │
            ├─→ Check success/failure
            │   ├─→ If failed: increment consecutive_failures
            │   └─→ If succeeded: reset consecutive_failures
            │
            ├─→ Check alert conditions
            │   ├─→ High response time?
            │   ├─→ Server error (5xx)?
            │   └─→ 10+ consecutive failures?
            │       └─→ Send email notification
            │
            └─→ Update monitor last_run timestamp
```

### 8.3 Statistics Calculation Flow

```
User Opens Dashboard
    │
    └─→ Frontend requests stats
            │
            └─→ Backend MetricsService.getStats()
                    │
                    └─→ Execute SQL aggregation query
                            │
                            ├─→ COUNT(*) for total requests
                            ├─→ COUNT(*) FILTER (success = true) for success rate
                            ├─→ AVG(response_time) for average
                            ├─→ MIN(response_time) for minimum
                            └─→ MAX(response_time) for maximum
                                    │
                                    └─→ Calculate uptime percentage
                                            │
                                            └─→ Return JSON to frontend
                                                    │
                                                    └─→ Display in charts/graphs
```

---

## 9. Technical Implementation Details

### 9.1 Time Measurement Precision

**JavaScript Date.now():**
- Returns milliseconds since Unix epoch (January 1, 1970)
- Precision: 1 millisecond
- Example: `1704067200000` = December 31, 2023, 12:00:00 AM UTC

**Response Time Calculation:**
```javascript
const start = Date.now();      // e.g., 1704067200000
// ... HTTP request happens ...
const end = Date.now();        // e.g., 1704067200150
const duration = end - start;  // = 150 milliseconds
```

### 9.2 Cron Expression Format

**Pattern:** `*/${intervalMin} * * * *`

- `*/5 * * * *` = Every 5 minutes
- `*/10 * * * *` = Every 10 minutes
- `*/1 * * * *` = Every 1 minute

**Format Breakdown:**
```
┌───────────── minute (0 - 59)
│ ┌─────────── hour (0 - 23)
│ │ ┌───────── day of month (1 - 31)
│ │ │ ┌─────── month (1 - 12)
│ │ │ │ ┌───── day of week (0 - 6) (Sunday=0)
│ │ │ │ │
* * * * *
```

### 9.3 Error Handling

**Connection Errors:**
- `ECONNREFUSED`: Server not running or port blocked
- `ENOTFOUND`: DNS resolution failed (invalid hostname)
- `ETIMEDOUT`: Request exceeded timeout (30 seconds)

**HTTP Errors:**
- Status codes 400-499: Client errors (recorded but marked as failure)
- Status codes 500-599: Server errors (triggers alerts)
- `validateStatus: () => true` ensures all status codes are captured

### 9.4 Response Size Calculation

**Methods Used:**
1. **Content-Length Header** (preferred): Direct byte count from server
2. **Buffer Calculation**: If header missing, calculate from response data
   - String: `Buffer.byteLength(data, 'utf8')`
   - Object: `Buffer.byteLength(JSON.stringify(data), 'utf8')`

**Format Conversion:**
- Bytes → KB: `size / 1024`
- KB → MB: `size / (1024 * 1024)`
- Example: 1048576 bytes = 1024 KB = 1 MB

---

## 10. Performance Considerations

### 10.1 Database Optimization

**Indexes:**
- Metrics table indexed on `monitor_id` and `created_at`
- Enables fast queries even with millions of records

**Query Optimization:**
- Uses `FILTER` clause for conditional counting (faster than WHERE)
- Limits results: `LIMIT 100` for recent metrics
- Date range queries use indexed `created_at` column

### 10.2 Memory Management

**Metric Retention:**
- Old metrics deleted after 30 days (configurable)
- Prevents database bloat
- Query: `DELETE FROM metrics WHERE created_at < NOW() - INTERVAL '30 days'`

**Cron Job Management:**
- Jobs stored in memory map (`activeJobs`)
- Proper cleanup on shutdown (SIGINT/SIGTERM)
- Prevents duplicate job scheduling

### 10.3 Concurrent Execution

**Parallel Monitoring:**
- Each monitor has independent cron job
- Multiple monitors can execute simultaneously
- No blocking between different monitors

**Request Handling:**
- Uses async/await for non-blocking operations
- Database queries are asynchronous
- Timeout prevents hanging requests

---

## 11. Real-World Example

### Example: Monitoring a REST API Endpoint

**Setup:**
- URL: `https://api.example.com/users`
- Method: GET
- Interval: 5 minutes
- Threshold: 500ms

**Execution Timeline:**

```
10:00:00 - Cron job triggers
10:00:00.000 - Start timer: Date.now() = 1704067200000
10:00:00.150 - HTTP response received
10:00:00.150 - End timer: Date.now() = 1704067200150
10:00:00.150 - Response time: 150ms
10:00:00.151 - Record metric: { success: true, responseTime: 150, status: 200 }
10:00:05.000 - Next run scheduled for 10:05:00

10:05:00 - Cron job triggers again
10:05:00.000 - Start timer
10:05:00.750 - Response received (slow response!)
10:05:00.750 - Response time: 750ms
10:05:00.751 - Record metric: { success: true, responseTime: 750, status: 200 }
10:05:00.752 - Check threshold: 750ms > 500ms → Create warning alert
```

**Statistics After 1 Hour (12 checks):**
- Total requests: 12
- Successful: 12
- Failed: 0
- Uptime: 100% = (12/12) × 100
- Avg response time: 450ms
- Min response time: 120ms
- Max response time: 750ms

---

## 12. Conclusion

### Summary of How Everything Works

1. **Testing**: Uses JavaScript `Date.now()` to measure time before and after HTTP requests
2. **Monitoring**: Cron jobs schedule periodic API tests automatically
3. **Metrics**: Every test execution creates a database record with timestamp
4. **Uptime**: Calculated as percentage of successful requests over total requests
5. **Statistics**: SQL aggregations (AVG, MIN, MAX, COUNT) compute metrics on-demand
6. **Alerts**: System checks conditions after each test and creates alerts/emails when thresholds are exceeded

**Key Technologies:**
- **Axios**: HTTP client library for making API requests
- **node-cron**: Cron job scheduler for periodic tasks
- **PostgreSQL**: Relational database for storing metrics
- **JavaScript Date.now()**: Millisecond-precision timing

**Accuracy:**
- Response time accuracy: ±1 millisecond (JavaScript timer precision)
- Uptime calculation: Based on actual success/failure counts (100% accurate)
- Statistics: Real-time calculations from database records (always current)

---

## Appendix: Code References

### Main Files
- API Testing Service: `backend/src/services/apiTestService.js`
- Monitor Scheduler: `backend/src/utils/monitorScheduler.js`
- Metrics Service: `backend/src/modules/metrics/metrics.service.js`
- Metrics Queries: `backend/src/modules/metrics/metrics.queries.js`
- Monitors Service: `backend/src/modules/monitors/monitors.service.js`
- Email Service: `backend/src/services/emailService.js`

### Key Functions
- `ApiTestService.testApi()`: Executes single API test
- `MonitorsService.runMonitorTest()`: Runs test for a monitor
- `MetricsService.recordMetric()`: Saves metric to database
- `MetricsService.getStats()`: Calculates statistics
- `scheduleMonitor()`: Sets up cron job for monitoring
- `handleEmailNotification()`: Sends failure/recovery emails

---

*This document provides a complete technical explanation of how ApexAPI implements testing, monitoring, and metric calculations. All measurements and calculations are based on actual database records and precise JavaScript timestamps.*

