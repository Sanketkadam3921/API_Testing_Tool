import React from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Divider } from '@mui/material';
import {
    Dashboard as DashboardIcon,
    MonitorHeart,
    Science,
    BarChart,
    Cloud,
    Settings,
    Hub,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const DashboardSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isDarkMode: _isDarkMode } = useTheme();

    const sidebarWidth = 280;

    const overviewItems = [
        {
            key: 'app',
            label: 'App',
            icon: <DashboardIcon />,
            path: '/dashboard',
        },
        {
            key: 'monitoring',
            label: 'Monitoring',
            icon: <MonitorHeart />,
            path: '/monitoring',
        },
        {
            key: 'testing',
            label: 'Testing',
            icon: <Science />,
            path: '/testing',
        },
        {
            key: 'websocket',
            label: 'WebSocket',
            icon: <Hub />,
            path: '/websocket',
        },
    ];

    const managementItems = [
        {
            key: 'data',
            label: 'Data & Charts',
            icon: <BarChart />,
            path: '/monitoring-data',
        },
        {
            key: 'uptime',
            label: 'Uptime',
            icon: <Cloud />,
            path: '/uptime',
        },
        {
            key: 'settings',
            label: 'Settings',
            icon: <Settings />,
            path: '/settings',
        },
    ];

    const isActive = (path) => {
        if (path === '/dashboard') {
            return location.pathname === '/dashboard' || location.pathname === '/';
        }
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    return (
        <Box
            sx={{
                width: sidebarWidth,
                height: '100vh',
                backgroundColor: '#1f2937',
                color: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                left: 0,
                top: 0,
                zIndex: 1000,
            }}
        >
            {/* Logo */}
            <Box
                sx={{
                    px: 3,
                    py: 3.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 700,
                        fontSize: '1.5rem',
                        color: '#22c55e',
                        letterSpacing: '-0.02em',
                    }}
                >
                    ApexAPI
                </Typography>
            </Box>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

            {/* Navigation Sections */}
            <Box sx={{ flex: 1, overflow: 'auto', py: 2 }}>
                {/* OVERVIEW Section */}
                <Box sx={{ px: 2, mb: 2 }}>
                    <Typography
                        variant="caption"
                        sx={{
                            color: 'rgba(255,255,255,0.5)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            px: 2,
                            display: 'block',
                        }}
                    >
                        OVERVIEW
                    </Typography>
                    <List sx={{ mt: 1 }}>
                        {overviewItems.map((item) => {
                            const active = isActive(item.path);
                            return (
                                <ListItem key={item.key} disablePadding sx={{ mb: 0.5 }}>
                                    <ListItemButton
                                        onClick={() => navigate(item.path)}
                                        sx={{
                                            borderRadius: 2,
                                            mx: 1,
                                            py: 1.5,
                                            backgroundColor: active
                                                ? 'rgba(34,197,94,0.15)'
                                                : 'transparent',
                                            '&:hover': {
                                                backgroundColor: active
                                                    ? 'rgba(34,197,94,0.2)'
                                                    : 'rgba(255,255,255,0.05)',
                                            },
                                            '& .MuiListItemIcon-root': {
                                                color: active ? '#22c55e' : 'rgba(255,255,255,0.7)',
                                                minWidth: 40,
                                            },
                                            '& .MuiListItemText-primary': {
                                                color: active ? '#ffffff' : 'rgba(255,255,255,0.7)',
                                                fontWeight: active ? 600 : 400,
                                                fontSize: '0.875rem',
                                            },
                                        }}
                                    >
                                        <ListItemIcon>{item.icon}</ListItemIcon>
                                        <ListItemText primary={item.label} />
                                    </ListItemButton>
                                </ListItem>
                            );
                        })}
                    </List>
                </Box>

                {/* MANAGEMENT Section */}
                <Box sx={{ px: 2, mt: 3 }}>
                    <Typography
                        variant="caption"
                        sx={{
                            color: 'rgba(255,255,255,0.5)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            px: 2,
                            display: 'block',
                        }}
                    >
                        MANAGEMENT
                    </Typography>
                    <List sx={{ mt: 1 }}>
                        {managementItems.map((item) => {
                            const active = isActive(item.path);
                            return (
                                <ListItem key={item.key} disablePadding sx={{ mb: 0.5 }}>
                                    <ListItemButton
                                        onClick={() => navigate(item.path)}
                                        sx={{
                                            borderRadius: 2,
                                            mx: 1,
                                            py: 1.5,
                                            backgroundColor: active
                                                ? 'rgba(34,197,94,0.15)'
                                                : 'transparent',
                                            '&:hover': {
                                                backgroundColor: active
                                                    ? 'rgba(34,197,94,0.2)'
                                                    : 'rgba(255,255,255,0.05)',
                                            },
                                            '& .MuiListItemIcon-root': {
                                                color: active ? '#22c55e' : 'rgba(255,255,255,0.7)',
                                                minWidth: 40,
                                            },
                                            '& .MuiListItemText-primary': {
                                                color: active ? '#ffffff' : 'rgba(255,255,255,0.7)',
                                                fontWeight: active ? 600 : 400,
                                                fontSize: '0.875rem',
                                            },
                                        }}
                                    >
                                        <ListItemIcon>{item.icon}</ListItemIcon>
                                        <ListItemText primary={item.label} />
                                    </ListItemButton>
                                </ListItem>
                            );
                        })}
                    </List>
                </Box>
            </Box>
        </Box>
    );
};

export default DashboardSidebar;

