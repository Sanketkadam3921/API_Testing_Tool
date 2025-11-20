# API Testing Tool - Monitoring System

## 🎯 Overview

The API Testing Tool now includes a comprehensive monitoring system that allows users to:
- Select specific API requests to monitor
- Define custom intervals (in minutes)
- Start, stop, and delete individual monitors
- View all active monitors in a dashboard
- Automatically log results (status, latency, success)
- Persist monitoring settings in PostgreSQL via Prisma

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL database
- Backend and frontend servers running

### Installation
1. **Backend Setup:**
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Frontend Setup:**
   ```bash
   cd frontend/apitesting
   npm install
   npm run dev
   ```

3. **Database Setup:**
   ```bash
   cd backend
   npx prisma migrate dev
   ```

## 📊 Monitoring Features

### Creating Monitors

#### Method 1: From Request Editor
1. Open any API request in the request editor
2. Click the **"Create Monitor"** button
3. Fill in the monitor details:
   - **Name**: Descriptive name for the monitor
   - **Description**: Optional description
   - **Interval**: How often to check (1-1440 minutes)
   - **Threshold**: Response time threshold in milliseconds
4. Click **"Create Monitor"**

#### Method 2: From Monitoring Dashboard
1. Navigate to `/monitoring` or click "Monitoring" in the header
2. Click **"Create Monitor"** button
3. Select a request from your collections
4. Configure monitoring settings
5. Click **"Create Monitor"**

### Managing Monitors

#### Monitoring Dashboard
- **Location**: Navigate to `/monitoring` or click "Monitoring" button
- **Features**:
  - View all monitors with status indicators
  - See real-time statistics (total, active, inactive monitors)
  - Monitor uptime percentage
  - Start/stop individual monitors
  - Delete monitors
  - Run manual tests

#### Sidebar Panel
- **Location**: Click "Monitoring" in the left sidebar
- **Features**:
  - Quick overview of all monitors
  - Compact status display
  - Quick actions (start/stop/delete)

### Monitor Status Indicators

- 🟢 **Active**: Monitor is running and checking the API
- 🔴 **Inactive**: Monitor is stopped
- ⏱️ **Last Run**: Shows when the monitor last executed
- 📊 **Next Run**: Shows when the next check is scheduled

### Alert System

The monitoring system automatically creates alerts for:
- **High Response Time**: When response time exceeds the threshold
- **Server Errors**: HTTP status codes 500+
- **Request Failures**: Network errors, timeouts, etc.
- **Monitor Failures**: When the monitoring job itself fails

## 🔧 API Endpoints

### Monitor Management
- `POST /api/monitors` - Create new monitor
- `GET /api/monitors` - Get all user monitors
- `GET /api/monitors/:id` - Get specific monitor
- `PUT /api/monitors/:id/status` - Start/stop monitor
- `DELETE /api/monitors/:id` - Delete monitor
- `POST /api/monitors/:id/test` - Run manual test
- `GET /api/monitors/stats` - Get monitoring statistics

### Alerts
- `GET /api/alerts` - Get all alerts
- `PUT /api/alerts/:id/read` - Mark alert as read
- `PUT /api/alerts/read-all` - Mark all alerts as read

### Metrics
- `GET /api/metrics/:monitorId` - Get monitor metrics
- `GET /api/metrics/:monitorId/stats` - Get monitor statistics

## 📈 Monitoring Data

### Metrics Collected
- **Response Time**: Time taken for API to respond
- **Status Code**: HTTP response status
- **Success Rate**: Percentage of successful requests
- **Error Messages**: Details of any failures
- **Timestamp**: When each check was performed

### Statistics Available
- **Uptime Percentage**: Overall success rate
- **Average Response Time**: Mean response time
- **Min/Max Response Time**: Response time range
- **Total Requests**: Number of checks performed
- **Success/Failure Counts**: Breakdown of results

## 🛠️ Configuration

### Monitor Settings
- **Interval**: 1-1440 minutes (1 minute to 24 hours)
- **Threshold**: 100+ milliseconds
- **Auto-start**: Monitors start automatically when created

### Database Schema
The monitoring system uses the following main tables:
- `monitors`: Monitor configurations and status
- `metrics`: Performance data from each check
- `alerts`: Notifications for issues
- `requests`: API requests being monitored

## 🔍 Troubleshooting

### Common Issues

1. **Monitor Not Starting**
   - Check if the request URL is valid
   - Verify database connection
   - Check server logs for errors

2. **No Metrics Being Recorded**
   - Ensure monitor is active
   - Check if the API endpoint is accessible
   - Verify monitoring scheduler is running

3. **Alerts Not Appearing**
   - Check alert thresholds
   - Verify monitor is running
   - Check database for alert records

### Server Logs
Monitor the backend server logs for monitoring-related messages:
```bash
cd backend
npm run dev
```

## 🎉 Success!

Your API Testing Tool now has a fully functional monitoring system! You can:
- Create monitors for any API request
- Set custom intervals and thresholds
- Get real-time monitoring with automatic alerts
- View comprehensive statistics and metrics
- Manage monitors through an intuitive interface

The system automatically starts monitoring when you create a monitor and provides detailed insights into your API performance.














