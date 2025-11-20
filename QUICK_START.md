# 🚀 Quick Start Guide

## Backend Server

### Option 1: Using the start script
```bash
cd backend
./start.sh
```

### Option 2: Manual start
```bash
cd backend
PORT=3001 node src/server.js
```

### Option 3: Using npm (if you have start script)
```bash
cd backend
npm start
```

**Default Port:** `3001`  
**Health Check:** http://localhost:3001/health  
**Status Dashboard:** http://localhost:3001/status

---

## Frontend Server

```bash
cd frontend/apitesting
npm run dev
```

**Default Port:** `5173`  
**Access:** http://localhost:5173

---

## 📍 Dashboard URLs

1. **Backend Server Dashboard** (express-status-monitor)
   - http://localhost:3001/status
   - Shows CPU, Memory, Response Times, RPS

2. **Frontend Monitoring Dashboard**
   - http://localhost:5173/monitoring
   - Create and manage API monitors

3. **Uptime & Performance Dashboard** (NEW!)
   - http://localhost:5173/uptime
   - Professional charts and metrics visualization

---

## 🔧 Troubleshooting

### Backend Not Starting?

1. **Check if port 3001 is in use:**
   ```bash
   lsof -ti:3001
   ```

2. **Kill process on port 3001:**
   ```bash
   lsof -ti:3001 | xargs kill -9
   ```

3. **Check database connection:**
   - Make sure PostgreSQL is running
   - Verify DATABASE_URL in `.env` file

4. **View server logs:**
   ```bash
   tail -f /tmp/backend.log
   ```

### Frontend Connection Errors?

1. **Verify backend is running:**
   ```bash
   curl http://localhost:3001/health
   ```

2. **Check API_BASE_URL in frontend:**
   - Should be: `http://localhost:3001`
   - File: `frontend/apitesting/src/services/apiService.js`

3. **Restart both servers:**
   ```bash
   # Terminal 1 - Backend
   cd backend && PORT=3001 node src/server.js
   
   # Terminal 2 - Frontend  
   cd frontend/apitesting && npm run dev
   ```

---

## ✅ Quick Test

1. Start backend: `cd backend && PORT=3001 node src/server.js`
2. Start frontend: `cd frontend/apitesting && npm run dev`
3. Open: http://localhost:5173/monitoring
4. Create a monitor for: `https://google.com`
5. View dashboard: http://localhost:5173/uptime

Enjoy! 🎉









