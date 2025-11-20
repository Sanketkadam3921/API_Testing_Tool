import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ConfigProvider, theme } from 'antd';

const ThemeContext = createContext();

/* eslint-disable react-refresh/only-export-components */
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved ? JSON.parse(saved) : true; // Default to dark mode
    });

    useEffect(() => {
        localStorage.setItem('theme', JSON.stringify(isDarkMode));
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode(prev => !prev);
    };

    const muiTheme = createTheme({
        palette: {
            mode: 'light', // Force light mode for main content
            primary: {
                main: '#22c55e', // Vibrant green accent
                light: '#4ade80',
                dark: '#16a34a',
            },
            secondary: {
                main: '#3b82f6', // Blue accent
                light: '#60a5fa',
                dark: '#2563eb',
            },
            success: {
                main: '#22c55e',
                light: '#4ade80',
                dark: '#16a34a',
            },
            error: {
                main: '#ef4444',
                light: '#f87171',
                dark: '#dc2626',
            },
            warning: {
                main: '#f97316',
                light: '#fb923c',
                dark: '#ea580c',
            },
            background: {
                default: '#f5f5f5', // Light grey/off-white
                paper: '#ffffff', // White cards
            },
            text: {
                primary: '#1f2937', // Dark grey
                secondary: '#6b7280', // Lighter grey
            },
            divider: 'rgba(0,0,0,0.08)',
            // Custom colors for dashboard theme
            grey: {
                50: '#f9fafb',
                100: '#f3f4f6',
                200: '#e5e7eb',
                300: '#d1d5db',
                400: '#9ca3af',
                500: '#6b7280',
                600: '#4b5563',
                700: '#374151',
                800: '#1f2937',
                900: '#111827',
            },
            sidebar: {
                background: '#1f2937', // Dark grey/black sidebar
                text: '#ffffff',
                textSecondary: 'rgba(255,255,255,0.7)',
                activeBackground: 'rgba(34,197,94,0.15)', // Light green for active
                hoverBackground: 'rgba(255,255,255,0.05)',
                border: 'rgba(255,255,255,0.1)',
            },
        },
        typography: {
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
            h1: {
                fontSize: '2.5rem',
                fontWeight: 700,
                letterSpacing: '-0.025em',
                color: '#1f2937',
            },
            h2: {
                fontSize: '2rem',
                fontWeight: 700,
                letterSpacing: '-0.025em',
                color: '#1f2937',
            },
            h3: {
                fontSize: '1.75rem',
                fontWeight: 600,
                letterSpacing: '-0.025em',
                color: '#1f2937',
            },
            h4: {
                fontSize: '1.5rem',
                fontWeight: 600,
                letterSpacing: '-0.025em',
                color: '#1f2937',
            },
            h5: {
                fontSize: '1.25rem',
                fontWeight: 600,
                letterSpacing: '-0.025em',
                color: '#1f2937',
            },
            h6: {
                fontSize: '1rem',
                fontWeight: 600,
                letterSpacing: '-0.025em',
                color: '#1f2937',
            },
            body1: {
                fontSize: '0.875rem',
                lineHeight: 1.5,
                color: '#374151',
            },
            body2: {
                fontSize: '0.75rem',
                lineHeight: 1.4,
                color: '#6b7280',
            },
            button: {
                fontSize: '0.875rem',
                fontWeight: 500,
                letterSpacing: '0.025em',
                textTransform: 'none',
            },
        },
        shape: {
            borderRadius: 12,
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 8,
                        textTransform: 'none',
                        fontWeight: 500,
                        boxShadow: 'none',
                        padding: '10px 20px',
                        fontSize: '0.875rem',
                        '&:hover': {
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        },
                    },
                    contained: {
                        backgroundColor: '#22c55e',
                        color: '#ffffff',
                        '&:hover': {
                            backgroundColor: '#16a34a',
                            boxShadow: '0 4px 12px rgba(34,197,94,0.3)',
                        },
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
                        border: 'none',
                        backgroundColor: '#ffffff',
                        '&:hover': {
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)',
                        },
                    },
                },
            },
            MuiTextField: {
                styleOverrides: {
                    root: {
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 8,
                            fontSize: '0.875rem',
                            backgroundColor: '#ffffff',
                            '& fieldset': {
                                borderColor: 'rgba(0,0,0,0.1)',
                            },
                            '&:hover fieldset': {
                                borderColor: 'rgba(0,0,0,0.2)',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: '#22c55e',
                                borderWidth: 2,
                            },
                        },
                    },
                },
            },
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundColor: '#ffffff',
                        borderBottom: '1px solid rgba(0,0,0,0.05)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        color: '#1f2937',
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundColor: '#ffffff',
                        border: 'none',
                        borderRadius: 12,
                    },
                },
            },
            MuiChip: {
                styleOverrides: {
                    root: {
                        borderRadius: 6,
                        fontSize: '0.75rem',
                        fontWeight: 500,
                    },
                },
            },
        },
    });

    const antdTheme = {
        algorithm: theme.defaultAlgorithm,
        token: {
            colorPrimary: '#22c55e', // Vibrant green
            colorSuccess: '#22c55e',
            colorInfo: '#3b82f6', // Blue
            colorWarning: '#f97316', // Orange
            colorError: '#ef4444', // Red
            colorBgBase: '#f5f5f5',
            colorBgContainer: '#ffffff',
            colorBgElevated: '#ffffff',
            colorBorder: 'rgba(0,0,0,0.08)',
            colorText: '#1f2937',
            colorTextSecondary: '#6b7280',
            borderRadius: 8,
            fontSize: 14,
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        },
    };

    const value = {
        isDarkMode,
        toggleTheme,
    };

    return (
        <ThemeContext.Provider value={value}>
            <MuiThemeProvider theme={muiTheme}>
                <ConfigProvider theme={antdTheme}>
                    {children}
                </ConfigProvider>
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};
