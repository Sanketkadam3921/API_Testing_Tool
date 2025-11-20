import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    TextField,
    Paper,
    Chip,
    CircularProgress,
    Alert,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import {
    Download,
    Refresh,
    TrendingUp,
    TrendingDown,
    Speed,
    Error as ErrorIcon,
    CheckCircle,
    Fullscreen,
    Close,
} from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';
import { apiService } from '../services/apiService';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const AdvancedAnalyticsDashboard = ({ monitorId }) => {
    const { isDarkMode } = useTheme();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [timeRange, setTimeRange] = useState('24h');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [interval, setInterval] = useState('hour');
    
    // Analytics data
    const [percentiles, setPercentiles] = useState(null);
    const [errorRateTrend, setErrorRateTrend] = useState([]);
    const [successRateTrend, setSuccessRateTrend] = useState([]);
    const [uptimeStats, setUptimeStats] = useState(null);
    const [realTimeData, setRealTimeData] = useState([]);
    
    // Modal state for graph preview
    const [openModal, setOpenModal] = useState(false);
    const [selectedGraph, setSelectedGraph] = useState(null);

    const getDateRange = useCallback(() => {
        const now = new Date();
        let startDate, endDate;

        switch (timeRange) {
            case '1h':
                startDate = new Date(now.getTime() - 60 * 60 * 1000);
                endDate = now;
                break;
            case '24h':
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                endDate = now;
                break;
            case '7d':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                endDate = now;
                break;
            case '30d':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                endDate = now;
                break;
            case 'custom':
                if (customStartDate && customEndDate) {
                    startDate = new Date(customStartDate);
                    endDate = new Date(customEndDate);
                } else {
                    // If custom is selected but dates not set, use default 24h
                    startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                    endDate = now;
                }
                break;
            default:
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                endDate = now;
        }

        // Ensure dates are valid
        if (!startDate || isNaN(startDate.getTime())) {
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        }
        if (!endDate || isNaN(endDate.getTime())) {
            endDate = now;
        }

        return {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
        };
    }, [timeRange, customStartDate, customEndDate]);

    const loadAnalytics = useCallback(async (silent = false) => {
        if (!monitorId) {
            console.warn('AdvancedAnalyticsDashboard: No monitorId provided');
            return;
        }

        if (!silent) {
            setLoading(true);
        } else {
            setRefreshing(true);
        }

        try {
            const { startDate, endDate } = getDateRange();
            
            // Debug logging (remove in production)
            if (import.meta.env.DEV) {
                console.log('Loading analytics with date range:', { 
                    monitorId,
                    timeRange, 
                    startDate, 
                    endDate, 
                    interval 
                });
            }

            // Load all analytics in parallel
            const [percentilesRes, errorTrendRes, successTrendRes, uptimeRes, realTimeRes] = await Promise.allSettled([
                apiService.getAnalyticsPercentiles(monitorId, startDate, endDate),
                apiService.getErrorRateTrend(monitorId, startDate, endDate, interval),
                apiService.getSuccessRateTrend(monitorId, startDate, endDate, interval),
                apiService.getAnalyticsUptime(monitorId, startDate, endDate),
                apiService.getRealTimeData(monitorId, 60)
            ]).then(results => results.map(result => {
                if (result.status === 'fulfilled') {
                    return result.value;
                } else {
                    console.error('API call failed:', result.reason);
                    return { 
                        success: false, 
                        error: result.reason,
                        response: result.reason?.response
                    };
                }
            }));

            // Debug logging
            if (import.meta.env.DEV) {
                console.log('Analytics API responses:', {
                    percentilesRes,
                    errorTrendRes,
                    successTrendRes,
                    uptimeRes,
                    realTimeRes
                });
            }

            // Handle responses with better error checking
            if (percentilesRes?.success) {
                setPercentiles(percentilesRes.percentiles);
                if (import.meta.env.DEV) {
                    console.log('Percentiles loaded:', percentilesRes.percentiles);
                }
            } else {
                const errorMsg = percentilesRes?.response?.data?.message || 
                                percentilesRes?.message || 
                                percentilesRes?.error?.message ||
                                'Unknown error';
                console.error('Percentiles API error:', errorMsg, percentilesRes);
                // Set default values if no data
                setPercentiles({
                    p50: 0,
                    p95: 0,
                    p99: 0,
                    avg: 0,
                    min: 0,
                    max: 0,
                    total: 0
                });
                if (!silent && percentilesRes?.response?.status !== 404) {
                    toast.error(`Failed to load percentiles: ${errorMsg}`);
                }
            }

            if (errorTrendRes?.success) {
                setErrorRateTrend(errorTrendRes.trend || []);
                if (import.meta.env.DEV) {
                    console.log('Error rate trend loaded:', errorTrendRes.trend?.length || 0, 'points');
                }
            } else {
                const errorMsg = errorTrendRes?.response?.data?.message || 
                                errorTrendRes?.message || 
                                errorTrendRes?.error?.message ||
                                'Unknown error';
                console.error('Error rate trend API error:', errorMsg, errorTrendRes);
                setErrorRateTrend([]);
                if (!silent && errorTrendRes?.response?.status !== 404) {
                    toast.error(`Failed to load error rate trend: ${errorMsg}`);
                }
            }

            if (successTrendRes?.success) {
                setSuccessRateTrend(successTrendRes.trend || []);
                if (import.meta.env.DEV) {
                    console.log('Success rate trend loaded:', successTrendRes.trend?.length || 0, 'points');
                }
            } else {
                const errorMsg = successTrendRes?.response?.data?.message || 
                                successTrendRes?.message || 
                                successTrendRes?.error?.message ||
                                'Unknown error';
                console.error('Success rate trend API error:', errorMsg, successTrendRes);
                setSuccessRateTrend([]);
                if (!silent && successTrendRes?.response?.status !== 404) {
                    toast.error(`Failed to load success rate trend: ${errorMsg}`);
                }
            }

            if (uptimeRes?.success) {
                setUptimeStats(uptimeRes.stats);
                if (import.meta.env.DEV) {
                    console.log('Uptime stats loaded:', uptimeRes.stats);
                }
            } else {
                const errorMsg = uptimeRes?.response?.data?.message || 
                                uptimeRes?.message || 
                                uptimeRes?.error?.message ||
                                'Unknown error';
                console.error('Uptime API error:', errorMsg, uptimeRes);
                // Set default values if no data
                setUptimeStats({
                    uptimePercentage: 0,
                    totalRequests: 0,
                    successfulRequests: 0,
                    failedRequests: 0,
                    avgResponseTime: 0
                });
                if (!silent && uptimeRes?.response?.status !== 404) {
                    toast.error(`Failed to load uptime stats: ${errorMsg}`);
                }
            }

            if (realTimeRes?.success) {
                setRealTimeData(realTimeRes.data || []);
            } else {
                console.warn('Real-time data API error:', realTimeRes?.message || realTimeRes?.error || 'Unknown error');
                if (!realTimeRes || realTimeRes.error) {
                    setRealTimeData([]);
                }
            }

        } catch (error) {
            console.error('Error loading analytics:', error);
            if (!silent) {
                const errorMessage = error.response?.data?.message || error.message || 'Failed to load analytics data';
                toast.error(errorMessage);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [monitorId, timeRange, interval, customStartDate, customEndDate, getDateRange]);

    useEffect(() => {
        if (monitorId) {
            loadAnalytics();
            // Auto-refresh every 30 seconds
            const intervalId = setInterval(() => {
                loadAnalytics(true);
            }, 30000);
            return () => clearInterval(intervalId);
        }
    }, [monitorId, loadAnalytics]);

    const handleExport = async (format = 'json') => {
        try {
            const { startDate, endDate } = getDateRange();
            const params = new URLSearchParams();
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);
            params.append('format', format);

            const token = localStorage.getItem('authToken');
            const headers = {
                'Content-Type': 'application/json',
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(
                `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/analytics/monitors/${monitorId}/export?${params.toString()}`,
                { headers }
            );

            if (format === 'csv') {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `monitor_${monitorId}_export_${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                toast.success('Data exported successfully');
            } else {
                const data = await response.json();
                const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `monitor_${monitorId}_export_${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                toast.success('Data exported successfully');
            }
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export data');
        }
    };

    const formatChartData = (trend) => {
        return trend.map(item => ({
            time: new Date(item.time).toLocaleString(),
            timestamp: item.time,
            errorRate: item.errorRate,
            successRate: item.successRate,
            totalRequests: item.totalRequests,
            failedRequests: item.failedRequests,
            successfulRequests: item.successfulRequests,
            avgResponseTime: item.avgResponseTime
        }));
    };

    const handleOpenGraphModal = (graphType) => {
        setSelectedGraph(graphType);
        setOpenModal(true);
    };

    const handleCloseGraphModal = () => {
        setOpenModal(false);
        setSelectedGraph(null);
    };

    const renderGraph = (type, data, height = 500) => {
        const chartData = formatChartData(data);
        
        switch (type) {
            case 'errorRate':
                return (
                    <ResponsiveContainer width="100%" height={height}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                                dataKey="time" 
                                angle={height > 400 ? -45 : 0}
                                textAnchor={height > 400 ? "end" : "middle"}
                                height={height > 400 ? 100 : 60}
                                tick={{ fontSize: height > 400 ? 12 : 10 }}
                            />
                            <YAxis />
                            <RechartsTooltip />
                            <Legend />
                            <Line 
                                type="monotone" 
                                dataKey="errorRate" 
                                stroke="#ef4444" 
                                strokeWidth={2}
                                name="Error Rate %"
                            />
                            <Line 
                                type="monotone" 
                                dataKey="successRate" 
                                stroke="#22c55e" 
                                strokeWidth={2}
                                name="Success Rate %"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                );
            case 'successRate':
                return (
                    <ResponsiveContainer width="100%" height={height}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                                dataKey="time" 
                                angle={height > 400 ? -45 : 0}
                                textAnchor={height > 400 ? "end" : "middle"}
                                height={height > 400 ? 100 : 60}
                                tick={{ fontSize: height > 400 ? 12 : 10 }}
                            />
                            <YAxis />
                            <RechartsTooltip />
                            <Legend />
                            <Line 
                                type="monotone" 
                                dataKey="successRate" 
                                stroke="#22c55e" 
                                strokeWidth={2}
                                name="Success Rate %"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                );
            case 'requestVolume':
                return (
                    <ResponsiveContainer width="100%" height={height}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                                dataKey="time" 
                                angle={height > 400 ? -45 : 0}
                                textAnchor={height > 400 ? "end" : "middle"}
                                height={height > 400 ? 100 : 60}
                                tick={{ fontSize: height > 400 ? 12 : 10 }}
                            />
                            <YAxis />
                            <RechartsTooltip />
                            <Legend />
                            <Bar dataKey="successfulRequests" fill="#22c55e" name="Successful" />
                            <Bar dataKey="failedRequests" fill="#ef4444" name="Failed" />
                        </BarChart>
                    </ResponsiveContainer>
                );
            case 'responseTime':
                return (
                    <ResponsiveContainer width="100%" height={height}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                                dataKey="time" 
                                angle={height > 400 ? -45 : 0}
                                textAnchor={height > 400 ? "end" : "middle"}
                                height={height > 400 ? 100 : 60}
                                tick={{ fontSize: height > 400 ? 12 : 10 }}
                            />
                            <YAxis />
                            <RechartsTooltip />
                            <Legend />
                            <Line 
                                type="monotone" 
                                dataKey="avgResponseTime" 
                                stroke="#3b82f6" 
                                strokeWidth={2}
                                name="Avg Response Time (ms)"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress />
            </Box>
        );
    }

    // Check if we have any data at all
    const hasData = percentiles?.total > 0 || errorRateTrend.length > 0 || uptimeStats?.totalRequests > 0;

    return (
        <Box sx={{ p: 3 }}>
            {/* Header with Controls */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Advanced Analytics
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Time Range</InputLabel>
                        <Select
                            value={timeRange}
                            label="Time Range"
                            onChange={(e) => setTimeRange(e.target.value)}
                        >
                            <MenuItem value="1h">Last Hour</MenuItem>
                            <MenuItem value="24h">Last 24 Hours</MenuItem>
                            <MenuItem value="7d">Last 7 Days</MenuItem>
                            <MenuItem value="30d">Last 30 Days</MenuItem>
                            <MenuItem value="custom">Custom Range</MenuItem>
                        </Select>
                    </FormControl>

                    {timeRange === 'custom' && (
                        <>
                            <TextField
                                type="datetime-local"
                                label="Start Date"
                                size="small"
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                sx={{ width: 200 }}
                            />
                            <TextField
                                type="datetime-local"
                                label="End Date"
                                size="small"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                sx={{ width: 200 }}
                            />
                        </>
                    )}

                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Interval</InputLabel>
                        <Select
                            value={interval || 'hour'}
                            label="Interval"
                            onChange={(e) => setInterval(e.target.value)}
                        >
                            <MenuItem value="minute">Minute</MenuItem>
                            <MenuItem value="hour">Hour</MenuItem>
                            <MenuItem value="day">Day</MenuItem>
                            <MenuItem value="week">Week</MenuItem>
                        </Select>
                    </FormControl>

                    <Tooltip title="Refresh">
                        <IconButton
                            onClick={() => loadAnalytics()}
                            disabled={refreshing}
                            sx={{ color: '#22c55e' }}
                        >
                            <Refresh sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                        </IconButton>
                    </Tooltip>

                    <Button
                        variant="outlined"
                        startIcon={<Download />}
                        onClick={() => handleExport('json')}
                        size="small"
                    >
                        Export JSON
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<Download />}
                        onClick={() => handleExport('csv')}
                        size="small"
                    >
                        Export CSV
                    </Button>
                </Box>
            </Box>

            {/* No Data Message */}
            {!hasData && !loading && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                        No Analytics Data Available
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        The monitor needs to run a few checks before analytics data appears here. 
                        Make sure the monitor is active and has executed at least one check.
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                        <strong>Monitor ID:</strong> {monitorId}
                        <br />
                        <strong>Time Range:</strong> {timeRange}
                        <br />
                        <strong>Date Range:</strong> {new Date(getDateRange().startDate).toLocaleString()} to {new Date(getDateRange().endDate).toLocaleString()}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                                console.log('Analytics Debug Info:', {
                                    monitorId,
                                    timeRange,
                                    dateRange: getDateRange(),
                                    percentiles,
                                    errorRateTrend: errorRateTrend.length,
                                    successRateTrend: successRateTrend.length,
                                    uptimeStats,
                                    realTimeData: realTimeData.length
                                });
                                toast.success('Debug info logged to console');
                            }}
                        >
                            Show Debug Info (Console)
                        </Button>
                    </Box>
                </Alert>
            )}

            {/* Uptime Stats */}
            {uptimeStats && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Uptime Percentage
                                </Typography>
                                <Typography variant="h4" sx={{ fontWeight: 600, color: uptimeStats.uptimePercentage >= 99.9 ? '#22c55e' : uptimeStats.uptimePercentage >= 99 ? '#ff9800' : '#ef4444' }}>
                                    {uptimeStats.uptimePercentage.toFixed(2)}%
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Total Requests
                                </Typography>
                                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                                    {uptimeStats.totalRequests.toLocaleString()}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Successful Requests
                                </Typography>
                                <Typography variant="h4" sx={{ fontWeight: 600, color: '#22c55e' }}>
                                    {uptimeStats.successfulRequests.toLocaleString()}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Failed Requests
                                </Typography>
                                <Typography variant="h4" sx={{ fontWeight: 600, color: '#ef4444' }}>
                                    {uptimeStats.failedRequests.toLocaleString()}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Response Time Percentiles */}
            {percentiles && hasData && (
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                            Response Time Percentiles
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6} sm={4} md={2.4}>
                                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f3f4f6', borderRadius: 2 }}>
                                    <Typography variant="caption" color="text.secondary">P50 (Median)</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#3b82f6' }}>
                                        {percentiles.p50}ms
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={4} md={2.4}>
                                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f3f4f6', borderRadius: 2 }}>
                                    <Typography variant="caption" color="text.secondary">P95</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#ff9800' }}>
                                        {percentiles.p95}ms
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={4} md={2.4}>
                                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f3f4f6', borderRadius: 2 }}>
                                    <Typography variant="caption" color="text.secondary">P99</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#ef4444' }}>
                                        {percentiles.p99}ms
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={4} md={2.4}>
                                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f3f4f6', borderRadius: 2 }}>
                                    <Typography variant="caption" color="text.secondary">Average</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        {percentiles.avg}ms
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} sm={4} md={2.4}>
                                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f3f4f6', borderRadius: 2 }}>
                                    <Typography variant="caption" color="text.secondary">Min / Max</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        {percentiles.min}ms / {percentiles.max}ms
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            )}

            {/* Charts */}
            <Grid container spacing={3}>
                {/* Error Rate Trend */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ position: 'relative', '&:hover': { boxShadow: 4 } }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Error Rate Trend
                                </Typography>
                                <Tooltip title="View Full Screen">
                                    <IconButton 
                                        size="small" 
                                        onClick={() => handleOpenGraphModal('errorRate')}
                                        sx={{ 
                                            color: 'primary.main',
                                            '&:hover': { backgroundColor: 'action.hover' }
                                        }}
                                    >
                                        <Fullscreen fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                            {errorRateTrend.length > 0 ? (
                                <Box sx={{ cursor: 'pointer' }} onClick={() => handleOpenGraphModal('errorRate')}>
                                    {renderGraph('errorRate', errorRateTrend, 450)}
                                </Box>
                            ) : (
                                <Alert severity="info">No data available for the selected time range</Alert>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Success Rate Trend */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ position: 'relative', '&:hover': { boxShadow: 4 } }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Success Rate Trend
                                </Typography>
                                <Tooltip title="View Full Screen">
                                    <IconButton 
                                        size="small" 
                                        onClick={() => handleOpenGraphModal('successRate')}
                                        sx={{ 
                                            color: 'primary.main',
                                            '&:hover': { backgroundColor: 'action.hover' }
                                        }}
                                    >
                                        <Fullscreen fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                            {successRateTrend.length > 0 ? (
                                <Box sx={{ cursor: 'pointer' }} onClick={() => handleOpenGraphModal('successRate')}>
                                    {renderGraph('successRate', successRateTrend, 450)}
                                </Box>
                            ) : (
                                <Alert severity="info">No data available for the selected time range</Alert>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Request Volume */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ position: 'relative', '&:hover': { boxShadow: 4 } }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Request Volume
                                </Typography>
                                <Tooltip title="View Full Screen">
                                    <IconButton 
                                        size="small" 
                                        onClick={() => handleOpenGraphModal('requestVolume')}
                                        sx={{ 
                                            color: 'primary.main',
                                            '&:hover': { backgroundColor: 'action.hover' }
                                        }}
                                    >
                                        <Fullscreen fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                            {errorRateTrend.length > 0 ? (
                                <Box sx={{ cursor: 'pointer' }} onClick={() => handleOpenGraphModal('requestVolume')}>
                                    {renderGraph('requestVolume', errorRateTrend, 450)}
                                </Box>
                            ) : (
                                <Alert severity="info">No data available for the selected time range</Alert>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Response Time Trend */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ position: 'relative', '&:hover': { boxShadow: 4 } }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Average Response Time Trend
                                </Typography>
                                <Tooltip title="View Full Screen">
                                    <IconButton 
                                        size="small" 
                                        onClick={() => handleOpenGraphModal('responseTime')}
                                        sx={{ 
                                            color: 'primary.main',
                                            '&:hover': { backgroundColor: 'action.hover' }
                                        }}
                                    >
                                        <Fullscreen fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                            {errorRateTrend.length > 0 ? (
                                <Box sx={{ cursor: 'pointer' }} onClick={() => handleOpenGraphModal('responseTime')}>
                                    {renderGraph('responseTime', errorRateTrend, 450)}
                                </Box>
                            ) : (
                                <Alert severity="info">No data available for the selected time range</Alert>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Graph Preview Modal */}
            <Dialog
                open={openModal}
                onClose={handleCloseGraphModal}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        maxHeight: '90vh',
                        height: '90vh',
                    }
                }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {selectedGraph === 'errorRate' && 'Error Rate Trend'}
                        {selectedGraph === 'successRate' && 'Success Rate Trend'}
                        {selectedGraph === 'requestVolume' && 'Request Volume'}
                        {selectedGraph === 'responseTime' && 'Average Response Time Trend'}
                    </Typography>
                    <IconButton onClick={handleCloseGraphModal} size="small">
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 600 }}>
                    <Box sx={{ width: '100%', height: '70vh', minHeight: 600 }}>
                        {selectedGraph === 'errorRate' && errorRateTrend.length > 0 && renderGraph('errorRate', errorRateTrend, 600)}
                        {selectedGraph === 'successRate' && successRateTrend.length > 0 && renderGraph('successRate', successRateTrend, 600)}
                        {selectedGraph === 'requestVolume' && errorRateTrend.length > 0 && renderGraph('requestVolume', errorRateTrend, 600)}
                        {selectedGraph === 'responseTime' && errorRateTrend.length > 0 && renderGraph('responseTime', errorRateTrend, 600)}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseGraphModal}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdvancedAnalyticsDashboard;

