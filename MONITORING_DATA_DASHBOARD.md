# 📊 Monitoring Data Dashboard Guide

## 🎯 New Professional Dashboard Created!

A comprehensive monitoring data dashboard is now available at:
**http://localhost:5173/monitoring-data**

## ✨ Features

### 1. **Overall Statistics**
- Total Monitors count
- Active Monitors count  
- Inactive Monitors count

### 2. **Monitor Selection**
- Dropdown to select any monitor
- Shows monitor name, method, and URL

### 3. **Key Metrics Cards** (Per Monitor)
- 📈 **Uptime Percentage** - Color coded (Green >99.9%, Yellow >99%, Red <99%)
- ⚡ **Average Response Time** - Shows min/max values
- 📊 **Total Checks** - Successful vs Failed requests
- 🔄 **Monitor Status** - Active/Inactive with interval info

### 4. **Interactive Charts** (4 Tabs)

#### Tab 1: Response Time
- Area chart showing response time trends
- Real-time updates every 10 seconds
- Historical data visualization

#### Tab 2: Status Codes
- Pie chart showing status code distribution
- Visual legend with counts
- Color coded by status type

#### Tab 3: Success Rate
- Line chart showing success/failure over time
- Binary visualization (1 = Success, 0 = Failure)

#### Tab 4: Metrics History
- Detailed table with last 50 checks
- Shows: Time, Response Time, Status Code, Success/Failure, Error Messages
- Real-time timestamps

### 5. **Monitor Details Section**
- Monitor name, URL, method
- Interval configuration
- Last run time
- Next run time

## 🚀 How to Access

1. **Direct URL:**
   ```
   http://localhost:5173/monitoring-data
   ```

2. **From Monitoring Dashboard:**
   - Go to http://localhost:5173/monitoring
   - Click "View Data & Charts" button in the header
   - Or click the "Go to Charts" card

## 📍 All Dashboard URLs

1. **Main Monitoring Dashboard** (Create/Manage Monitors)
   - http://localhost:5173/monitoring
   - Create, start, stop, delete monitors

2. **Monitoring Data Dashboard** (NEW! - Charts & Analytics)
   - http://localhost:5173/monitoring-data
   - View metrics, charts, statistics

3. **Uptime Dashboard** (Alternative view)
   - http://localhost:5173/uptime
   - Similar features with different layout

4. **Backend Server Dashboard**
   - http://localhost:3001/status
   - Server performance metrics

## 🔄 Auto-Refresh

The dashboard has **auto-refresh enabled by default**:
- Updates every 10 seconds automatically
- Can be toggled ON/OFF with the button
- Manual refresh button also available

## 📊 Data Requirements

For data to appear in the dashboard:
1. **Monitor must be Active** - Start your monitors
2. **Wait for checks to run** - Based on interval (default 5 minutes)
3. **At least one successful/failed check** - Data accumulates over time

If you see "No metrics data available yet":
- Make sure the monitor is **Active** (not paused)
- Wait for the next scheduled check (based on interval)
- Or manually run a test from the monitoring dashboard

## 🎨 Visualizations

All charts are interactive:
- Hover to see exact values
- Zoom and pan support
- Responsive design (works on mobile/tablet)
- Dark mode support

## 🔗 Integration

The dashboard is fully integrated:
- ✅ Backend API endpoints working
- ✅ Routes configured
- ✅ Error handling in place
- ✅ Loading states
- ✅ Empty states with helpful messages

Enjoy monitoring your APIs! 🎉









