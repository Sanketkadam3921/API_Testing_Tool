# Dashboard Visualization Guide

## 🎯 Two Ways to Visualize Your Dashboards

### 1. **Backend Server Monitoring Dashboard** (express-status-monitor)

This provides real-time server performance metrics.

#### How to Access:
1. **Direct Browser Access:**
   - Open your browser
   - Navigate to: **http://localhost:3001/status**
   - You'll see a real-time monitoring dashboard

#### What You'll See:
- 📊 **CPU Usage** - Real-time CPU consumption charts
- 💾 **Memory Usage** - RAM usage graphs
- ⚡ **System Load** - Server load metrics
- 🗄️ **Heap Memory** - Node.js heap usage
- 🔄 **Event Loop Delay** - Event loop performance
- ⏱️ **Response Time** - Average API response times
- 📈 **Requests/Sec** - Request rate (RPS) counter
- 🔢 **Status Codes** - HTTP status code distribution (200, 404, 500, etc.)

#### Features:
- Real-time updates (auto-refreshes every second)
- Historical data (1 min, 5 min, 15 min intervals)
- Health check status for `/health` endpoint
- Beautiful charts and graphs

---

### 2. **Frontend Monitoring Dashboard** (React Component)

This is your API monitoring management interface in the frontend.

#### How to Access:
1. **Via Frontend Application:**
   - Start your frontend: `cd frontend/apitesting && npm run dev`
   - Navigate to: **http://localhost:5173/monitoring**
   - Or click on "Monitoring" in the navigation menu

#### What You'll See:
- 📋 **Monitors List** - All your active API monitors
- ➕ **Create Monitor** - Button to add new monitors
- 📊 **Statistics** - Total monitors, active/inactive counts
- ⚡ **Monitor Actions** - Start/Stop/Delete monitors
- 🔍 **Monitor Details** - Response times, status, last run time
- 📝 **Request Selection** - Choose existing requests or enter manually

#### Features:
- Create, start, stop, and delete monitors
- View monitor statistics
- Run tests manually
- View response times and status
- Select requests from collections or enter URLs manually

---

## 🚀 Quick Start

### Option 1: Backend Dashboard (Server Metrics)
```bash
# Make sure backend is running
cd backend
npm start

# Then open in browser:
# http://localhost:3001/status
```

### Option 2: Frontend Dashboard (API Monitoring)
```bash
# Start frontend
cd frontend/apitesting
npm run dev

# Then open in browser:
# http://localhost:5173/monitoring
```

---

## 📊 Dashboard Comparison

| Feature | Backend Dashboard (`/status`) | Frontend Dashboard (`/monitoring`) |
|---------|------------------------------|-----------------------------------|
| **Purpose** | Server performance metrics | API endpoint monitoring |
| **Location** | Backend only | Frontend application |
| **Metrics** | CPU, Memory, Load, RPS | Monitor status, Response times |
| **Update** | Real-time (1 sec) | On-demand refresh |
| **Use Case** | Debugging server performance | Managing API monitors |

---

## 💡 Pro Tips

1. **Use Both Dashboards Together:**
   - Backend dashboard for server health
   - Frontend dashboard for API monitoring

2. **Monitor API Performance:**
   - Create monitors in frontend dashboard
   - Watch response times in real-time
   - Check server metrics in backend dashboard

3. **Debugging:**
   - If API is slow, check backend dashboard for CPU/Memory
   - If monitor fails, check frontend dashboard for error details

---

## 🎨 Visual Guide

### Backend Dashboard (`/status`)
```
┌─────────────────────────────────────┐
│   API Testing Tool Monitor          │
├─────────────────────────────────────┤
│  CPU Usage:    [████░░░░] 50%       │
│  Memory:       [██████░░] 75%       │
│  Response Time: [Graph Chart]        │
│  Requests/sec:  25 RPS              │
│  Status Codes:  200: 95% | 404: 5%  │
└─────────────────────────────────────┘
```

### Frontend Dashboard (`/monitoring`)
```
┌─────────────────────────────────────┐
│   Monitoring Dashboard              │
├─────────────────────────────────────┤
│  Total: 5 | Active: 3 | Inactive: 2 │
│  ┌──────────────────────────────┐   │
│  │ Monitor 1  [●] Running       │   │
│  │ GET /api/users               │   │
│  │ Response: 200ms ✅           │   │
│  └──────────────────────────────┘   │
│  [+ Create Monitor]                 │
└─────────────────────────────────────┘
```

---

## 🔗 Direct Links

- **Backend Dashboard:** http://localhost:3001/status
- **Frontend Dashboard:** http://localhost:5173/monitoring
- **Health Check:** http://localhost:3001/health

Enjoy monitoring! 🎉









