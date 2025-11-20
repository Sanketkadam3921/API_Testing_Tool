import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';

// Lazy load pages for code splitting
const Login = lazy(() => import('../pages/Login'));
const Signup = lazy(() => import('../pages/Signup'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Testing = lazy(() => import('../pages/Testing'));
const Monitoring = lazy(() => import('../pages/Monitoring'));
const MonitoringData = lazy(() => import('../pages/MonitoringData'));
const Uptime = lazy(() => import('../pages/Uptime'));
const Settings = lazy(() => import('../pages/Settings'));
const Home = lazy(() => import('../pages/Home'));
const WebSocketTesting = lazy(() => import('../pages/WebSocketTesting'));

// Loading fallback component
const LoadingFallback = () => (
    <Box
        sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
        }}
    >
        <CircularProgress />
    </Box>
);

const AppRoutes = () => {
    return (
        <Suspense fallback={<LoadingFallback />}>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/testing" element={<Testing />} />
            <Route path="/monitoring" element={<Monitoring />} />
            <Route path="/monitoring-data" element={<MonitoringData />} />
            <Route path="/uptime" element={<Uptime />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/websocket" element={<WebSocketTesting />} />
            <Route path="*" element={<Navigate to="/testing" />} />
        </Routes>
        </Suspense>
    );
};

export default AppRoutes;
