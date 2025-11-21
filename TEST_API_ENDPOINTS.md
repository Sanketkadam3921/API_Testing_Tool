# 🧪 Test API Endpoints for Monitoring

This document describes the test API endpoints available for testing the monitoring and alerting system.

## Overview

These endpoints are designed to simulate various API behaviors for testing:
- **Unstable API**: Randomly succeeds or fails (configurable success rate)
- **Stable API**: Always succeeds
- **Failing API**: Always fails
- **Configurable API**: Fully configurable via POST request

## Base URL

```
http://localhost:3000/api/test
```

---

## Endpoints

### 1. `/api/test/unstable` (GET)

Randomly succeeds or fails based on a configurable success rate. Perfect for testing monitoring systems.

**Query Parameters:**
- `successRate` (optional): Percentage of success (0-100), default: `50`
- `delay` (optional): Response delay in milliseconds, default: random 100-500ms
- `errorType` (optional): Type of error to return, default: `random`
  - Options: `500`, `404`, `503`, `timeout`, `random`

**Examples:**

```bash
# 30% success rate (70% failures) - Good for testing failure alerts
curl http://localhost:3000/api/test/unstable?successRate=30

# 20% success rate (80% failures) - Will trigger email after 5 failures
curl http://localhost:3000/api/test/unstable?successRate=20

# 10% success rate (90% failures) - Very high failure rate
curl http://localhost:3000/api/test/unstable?successRate=10

# With custom delay
curl http://localhost:3000/api/test/unstable?successRate=30&delay=500

# Specific error type
curl http://localhost:3000/api/test/unstable?successRate=30&errorType=500
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Request succeeded",
  "timestamp": "2025-11-21T10:00:00.000Z",
  "data": {
    "status": "ok",
    "responseTime": 250,
    "randomValue": 123
  }
}
```

**Failure Response (500/404/503/504):**
```json
{
  "success": false,
  "error": "Simulated 500 error",
  "timestamp": "2025-11-21T10:00:00.000Z",
  "statusCode": 500,
  "successRate": 30
}
```

---

### 2. `/api/test/stable` (GET)

Always returns a successful response. Useful for testing successful monitoring.

**Query Parameters:**
- `delay` (optional): Response delay in milliseconds, default: `100`

**Example:**
```bash
curl http://localhost:3000/api/test/stable
curl http://localhost:3000/api/test/stable?delay=200
```

**Response (200):**
```json
{
  "success": true,
  "message": "Request succeeded (stable endpoint)",
  "timestamp": "2025-11-21T10:00:00.000Z",
  "data": {
    "status": "ok",
    "responseTime": 100
  }
}
```

---

### 3. `/api/test/failing` (GET)

Always returns a failure response. Useful for testing error handling.

**Query Parameters:**
- `statusCode` (optional): HTTP status code to return, default: `500`
- `delay` (optional): Response delay in milliseconds, default: `100`

**Examples:**
```bash
curl http://localhost:3000/api/test/failing
curl http://localhost:3000/api/test/failing?statusCode=503
curl http://localhost:3000/api/test/failing?statusCode=404&delay=200
```

**Response (500/503/404/etc):**
```json
{
  "success": false,
  "error": "Simulated 500 error",
  "timestamp": "2025-11-21T10:00:00.000Z",
  "statusCode": 500
}
```

---

### 4. `/api/test/configurable` (POST)

Fully configurable test endpoint that accepts configuration in the request body.

**Request Body:**
```json
{
  "successRate": 50,        // Percentage of success (0-100)
  "delay": 200,            // Response delay in ms (optional, random if not provided)
  "errorType": "random",    // Error type: "500", "404", "503", "timeout", "random"
  "statusCode": 500        // HTTP status code for errors (default: 500)
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/test/configurable \
  -H "Content-Type: application/json" \
  -d '{
    "successRate": 30,
    "delay": 300,
    "errorType": "500"
  }'
```

---

### 5. `/api/test/info` (GET)

Returns information about all available test endpoints.

**Example:**
```bash
curl http://localhost:3000/api/test/info
```

**Response:**
```json
{
  "success": true,
  "endpoints": {
    "/test/unstable": { ... },
    "/test/stable": { ... },
    "/test/failing": { ... },
    "/test/configurable": { ... }
  },
  "usage": { ... }
}
```

---

## Usage for Monitoring Testing

### Testing Email Notifications (5 Consecutive Failures)

1. **Create a monitor** pointing to:
   ```
   http://localhost:3000/api/test/unstable?successRate=20
   ```
   This gives a 20% success rate, so it will fail 80% of the time.

2. **Set monitoring interval** to 1 minute (or shorter for faster testing)

3. **Wait for 5 consecutive failures** - you should receive an email notification

### Testing Recovery Notifications

1. **Create a monitor** pointing to:
   ```
   http://localhost:3000/api/test/unstable?successRate=20
   ```

2. **Wait for 5+ failures** to receive failure email

3. **Change the endpoint** to:
   ```
   http://localhost:3000/api/test/stable
   ```

4. **Wait for next successful check** - you should receive a recovery email

### Testing Different Error Types

Test different HTTP status codes:
```bash
# 500 errors
http://localhost:3000/api/test/unstable?successRate=30&errorType=500

# 404 errors
http://localhost:3000/api/test/unstable?successRate=30&errorType=404

# 503 errors (Service Unavailable)
http://localhost:3000/api/test/unstable?successRate=30&errorType=503

# Random error types
http://localhost:3000/api/test/unstable?successRate=30&errorType=random
```

### Testing Response Time Thresholds

Test monitors with different response times:
```bash
# Fast response (100ms)
http://localhost:3000/api/test/unstable?successRate=50&delay=100

# Slow response (1000ms)
http://localhost:3000/api/test/unstable?successRate=50&delay=1000

# Very slow response (2000ms)
http://localhost:3000/api/test/unstable?successRate=50&delay=2000
```

---

## Recommended Test Scenarios

### Scenario 1: Intermittent Failures (30% success rate)
```
URL: http://localhost:3000/api/test/unstable?successRate=30
Interval: 1 minute
Expected: Will fail ~70% of the time, trigger email after 5 failures
```

### Scenario 2: High Failure Rate (10% success rate)
```
URL: http://localhost:3000/api/test/unstable?successRate=10
Interval: 1 minute
Expected: Will fail ~90% of the time, trigger email quickly
```

### Scenario 3: Stable API (100% success rate)
```
URL: http://localhost:3000/api/test/stable
Interval: 1 minute
Expected: Always succeeds, good for baseline testing
```

### Scenario 4: Always Failing
```
URL: http://localhost:3000/api/test/failing?statusCode=503
Interval: 1 minute
Expected: Always fails, will trigger email after 5 failures
```

---

## Testing Script

Run the test script to verify all endpoints work:

```bash
cd backend
node test-test-api.js
```

This will:
- Test all endpoints
- Show success/failure rates
- Verify endpoints are working correctly

---

## Notes

- All endpoints are **public** (no authentication required) for easy testing
- Response delays are simulated to test timeout scenarios
- Success rates are approximate (based on random number generation)
- For production-like testing, use `successRate=30-50` for realistic intermittent failures

---

## Example Monitor Configuration

**For Email Notification Testing:**
- **Name**: Test Unstable API
- **URL**: `http://localhost:3000/api/test/unstable?successRate=20`
- **Method**: GET
- **Interval**: 1 minute
- **Threshold**: 500ms
- **Email Notifications**: Enabled

This configuration will:
- Check every 1 minute
- Fail ~80% of the time
- Send email after 5 consecutive failures
- Send recovery email when it succeeds again

---

**Happy Testing! 🚀**

