import React, { useState, useEffect } from 'react';
import { Box, AppBar, Toolbar, IconButton, Badge, Avatar, Typography, Menu, MenuItem } from '@mui/material';
import {
    Search,
    LightMode,
    DarkMode,
    Notifications,
    Logout,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';

const DashboardHeader = () => {
    const { isDarkMode, toggleTheme } = useTheme();
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [unreadAlertsCount, setUnreadAlertsCount] = useState(0);
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    // Fetch unread alerts count
    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const response = await apiService.get('/api/alerts');
                if (response.success && response.alerts) {
                    // Count unread alerts that indicate API crashes or failures
                    const crashAlerts = response.alerts.filter(alert => 
                        !alert.is_read && (
                            alert.severity === 'error' || 
                            alert.message.toLowerCase().includes('failed') ||
                            alert.message.toLowerCase().includes('error') ||
                            alert.message.toLowerCase().includes('crash') ||
                            alert.message.toLowerCase().includes('timeout') ||
                            alert.message.toLowerCase().includes('down')
                        )
                    );
                    setUnreadAlertsCount(crashAlerts.length);
                }
            } catch (error) {
                console.error('Error fetching alerts:', error);
            }
        };

        fetchAlerts();
        // Refresh alerts every 30 seconds
        const interval = setInterval(fetchAlerts, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleAvatarClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        handleMenuClose();
        navigate('/');
    };

    return (
        <AppBar
            position="fixed"
            sx={{
                zIndex: (theme) => theme.zIndex.drawer + 1,
                backgroundColor: '#ffffff',
                color: '#1f2937',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                borderBottom: '1px solid rgba(0,0,0,0.05)',
            }}
        >
            <Toolbar sx={{ justifyContent: 'space-between', px: 3 }}>
                {/* Logo */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography
                        variant="h6"
                        component="div"
                        onClick={() => navigate('/dashboard')}
                        sx={{
                            fontWeight: 700,
                            fontSize: '1.5rem',
                            color: '#22c55e',
                            letterSpacing: '-0.02em',
                            cursor: 'pointer',
                            '&:hover': {
                                opacity: 0.8,
                            },
                            transition: 'opacity 0.2s',
                        }}
                    >
                        ApexAPI
                    </Typography>
                </Box>

                {/* Right Icons */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <IconButton
                        size="small"
                        sx={{
                            color: '#1f2937',
                            '&:hover': {
                                backgroundColor: 'rgba(0,0,0,0.05)',
                            },
                        }}
                    >
                        <Search fontSize="small" />
                    </IconButton>
                    <IconButton
                        size="small"
                        sx={{
                            color: '#1f2937',
                            backgroundColor: '#f3f4f6',
                            width: 32,
                            height: 32,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            ml: 0.5,
                            '&:hover': {
                                backgroundColor: '#e5e7eb',
                            },
                        }}
                    >
                        KK
                    </IconButton>
                    <IconButton
                        size="small"
                        onClick={() => navigate('/monitoring')}
                        sx={{
                            color: '#1f2937',
                            position: 'relative',
                            p: 0.5,
                            '&:hover': {
                                backgroundColor: 'rgba(0,0,0,0.05)',
                            },
                        }}
                    >
                        <Badge
                            badgeContent={unreadAlertsCount}
                            color="error"
                            sx={{
                                '& .MuiBadge-badge': {
                                    backgroundColor: '#ef4444',
                                    fontSize: '0.625rem',
                                    minWidth: 16,
                                    height: 16,
                                    top: 4,
                                    right: 4,
                                },
                            }}
                        >
                            <Notifications fontSize="small" />
                        </Badge>
                    </IconButton>
                    <IconButton
                        size="small"
                        onClick={toggleTheme}
                        sx={{
                            color: '#1f2937',
                            '&:hover': {
                                backgroundColor: 'rgba(0,0,0,0.05)',
                            },
                        }}
                    >
                        {isDarkMode ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
                    </IconButton>
                    <Avatar
                        onClick={handleAvatarClick}
                        sx={{
                            width: 32,
                            height: 32,
                            backgroundColor: '#22c55e',
                            color: '#ffffff',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            ml: 0.5,
                            '&:hover': {
                                boxShadow: '0 2px 8px rgba(34,197,94,0.3)',
                            },
                        }}
                    >
                        U
                    </Avatar>
                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleMenuClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        PaperProps={{
                            sx: {
                                mt: 1,
                                minWidth: 180,
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                borderRadius: '8px',
                            },
                        }}
                    >
                        <MenuItem
                            onClick={handleLogout}
                            sx={{
                                color: '#ef4444',
                                '&:hover': {
                                    backgroundColor: 'rgba(239,68,68,0.1)',
                                },
                            }}
                        >
                            <Logout sx={{ mr: 1.5, fontSize: '1.2rem' }} />
                            Logout
                        </MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default DashboardHeader;

