import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Chip,
    CircularProgress,
    Alert,
    Tabs,
    Tab,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Tooltip as MuiTooltip,
    LinearProgress,
    Button,
} from '@mui/material';
import {
    TrendingUp,
    TrendingDown,
    CheckCircle,
    Error,
    Warning,
    Refresh,
    Timeline,
    Speed,
    AccessTime,
    NetworkCheck,
} from '@mui/icons-material';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import { apiService } from '../services/apiService';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const COLORS = {
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3',
};

const UptimeDashboard = () => {
    const [selectedMonitor, setSelectedMonitor] = useState(null);
    const [monitors, setMonitors] = useState([]);
    const [metrics, setMetrics] = useState([]);
    const [stats, setStats] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(null);
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        loadMonitors();
        return () => {
            if (refreshInterval) clearInterval(refreshInterval);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (selectedMonitor) {
            loadMonitorDetails(selectedMonitor.id);
            // Auto-refresh every 10 seconds
            const interval = setInterval(() => {
                loadMonitorDetails(selectedMonitor.id);
            }, 10000);
            setRefreshInterval(interval);
            return () => clearInterval(interval);
        }
    }, [selectedMonitor]);

    const loadMonitors = async () => {
        try {
            const response = await apiService.get('/api/monitors?user_id=default-user-id');
            if (response.success && response.monitors) {
                setMonitors(response.monitors);
                if (response.monitors.length > 0 && !selectedMonitor) {
                    setSelectedMonitor(response.monitors[0]);
                }
            }
        } catch (error) {
            toast.error('Failed to load monitors');
            console.error('Error loading monitors:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMonitorDetails = async (monitorId) => {
        try {
            // Load metrics
            const metricsResponse = await apiService.get(`/api/metrics/${monitorId}`);
            if (metricsResponse.success) {
                setMetrics(metricsResponse.metrics || []);
            }

            // Load stats
            const statsResponse = await apiService.get(`/api/metrics/${monitorId}/stats`);
            if (statsResponse.success) {
                setStats(statsResponse.stats);
            }

            // Load alerts
            const alertsResponse = await apiService.get(`/api/alerts?monitor_id=${monitorId}&user_id=default-user-id`);
            if (alertsResponse.success) {
                setAlerts(alertsResponse.alerts || []);
            }
        } catch (error) {
            console.error('Error loading monitor details:', error);
        }
    };

    const handleRefresh = () => {
        if (selectedMonitor) {
            loadMonitorDetails(selectedMonitor.id);
        }
        loadMonitors();
        toast.success('Data refreshed');
    };

    const getUptimeColor = (uptime) => {
        if (uptime >= 99.9) return COLORS.success;
        if (uptime >= 99) return COLORS.warning;
        return COLORS.error;
    };

    const getStatusColor = (status) => {
        if (status >= 200 && status < 300) return COLORS.success;
        if (status >= 300 && status < 400) return COLORS.warning;
        return COLORS.error;
    };

    // Prepare chart data
    const prepareChartData = () => {
        const recentMetrics = metrics.slice(0, 20).reverse();
        return recentMetrics.map((metric, index) => ({
            time: index,
            responseTime: metric.response_time,
            status: metric.status_code,
            success: metric.success ? 1 : 0,
            timestamp: new Date(metric.created_at).toLocaleTimeString(),
        }));
    };

    const prepareStatusData = () => {
        const statusCounts = {};
        metrics.forEach((metric) => {
            const status = Math.floor(metric.status_code / 100) * 100;
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        return Object.entries(statusCounts).map(([status, count]) => ({
            name: `${status}xx`,
            value: count,
        }));
    };

    const chartData = prepareChartData();
    const statusData = prepareStatusData();

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
                <CircularProgress />
            </Box>
        );
    }

    if (monitors.length === 0) {
        return (
            <Box>
                <Alert severity="info">
                    No monitors found. Create a monitor first from the Monitoring page.
                </Alert>
            </Box>
        );
    }

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
                        Uptime & Performance Monitor
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Real-time monitoring dashboard for API endpoints
                    </Typography>
                </Box>
                <Box>
                    <MuiTooltip title="Refresh Data">
                        <IconButton onClick={handleRefresh} color="primary">
                            <Refresh />
                        </IconButton>
                    </MuiTooltip>
                </Box>
            </Box>

            <Grid container spacing={3}>
                {/* Monitor Selection */}
                <Grid size={{ xs: 12 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Select Monitor
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {monitors.map((monitor) => (
                                    <Chip
                                        key={monitor.id}
                                        label={`${monitor.name} (${monitor.method} ${monitor.url?.substring(0, 30)}...)`}
                                        onClick={() => setSelectedMonitor(monitor)}
                                        color={selectedMonitor?.id === monitor.id ? 'primary' : 'default'}
                                        variant={selectedMonitor?.id === monitor.id ? 'filled' : 'outlined'}
                                        sx={{ cursor: 'pointer' }}
                                    />
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {selectedMonitor && stats && (
                    <>
                        {/* Key Metrics Cards */}
                        <Grid size={{ xs: 12, md: 3 }}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <CheckCircle sx={{ color: getUptimeColor(Number(stats?.uptime_percentage) || 0), mr: 1 }} />
                                        <Typography variant="h6">Uptime</Typography>
                                    </Box>
                                    <Typography variant="h3" sx={{ color: getUptimeColor(Number(stats?.uptime_percentage) || 0) }}>
                                        {stats?.uptime_percentage != null ? Number(stats.uptime_percentage).toFixed(2) : '0.00'}%
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        {stats?.successful_requests || 0} successful / {stats?.total_requests || 0} total
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid size={{ xs: 12, md: 3 }}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Speed sx={{ color: COLORS.info, mr: 1 }} />
                                        <Typography variant="h6">Avg Response</Typography>
                                    </Box>
                                    <Typography variant="h3" color="primary">
                                        {stats?.avg_response_time != null ? Math.round(Number(stats.avg_response_time)) : 0}ms
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        Min: {stats?.min_response_time != null ? Math.round(Number(stats.min_response_time)) : 0}ms | Max: {stats?.max_response_time != null ? Math.round(Number(stats.max_response_time)) : 0}ms
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid size={{ xs: 12, md: 3 }}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <NetworkCheck sx={{ color: COLORS.success, mr: 1 }} />
                                        <Typography variant="h6">Requests</Typography>
                                    </Box>
                                    <Typography variant="h3" color="success.main">
                                        {stats?.total_requests || 0}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        {stats?.failed_requests || 0} failed
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid size={{ xs: 12, md: 3 }}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <AccessTime sx={{ color: COLORS.warning, mr: 1 }} />
                                        <Typography variant="h6">Interval</Typography>
                                    </Box>
                                    <Typography variant="h3" color="warning.main">
                                        {selectedMonitor.interval_min}m
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        {selectedMonitor.is_active ? 'Active' : 'Inactive'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Charts Section */}
                        <Grid size={{ xs: 12 }}>
                            <Card>
                                <CardContent>
                                    <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                                        <Tab label="Response Time" icon={<Timeline />} />
                                        <Tab label="Status Codes" icon={<BarChart />} />
                                        <Tab label="History" icon={<AccessTime />} />
                                    </Tabs>

                                    <Box sx={{ mt: 3 }}>
                                        {tabValue === 0 && (
                                            <ResponsiveContainer width="100%" height={300}>
                                                <AreaChart data={chartData}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="timestamp" />
                                                    <YAxis label={{ value: 'Response Time (ms)', angle: -90, position: 'insideLeft' }} />
                                                    <RechartsTooltip />
                                                    <Legend />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="responseTime"
                                                        stroke={COLORS.info}
                                                        fill={COLORS.info}
                                                        fillOpacity={0.6}
                                                        name="Response Time (ms)"
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        )}

                                        {tabValue === 1 && (
                                            <Grid container spacing={2}>
                                                <Grid size={{ xs: 12, md: 6 }}>
                                                    <ResponsiveContainer width="100%" height={300}>
                                                        <BarChart data={chartData}>
                                                            <CartesianGrid strokeDasharray="3 3" />
                                                            <XAxis dataKey="timestamp" />
                                                            <YAxis />
                                                            <RechartsTooltip />
                                                            <Legend />
                                                            <Bar dataKey="status" fill={COLORS.info} name="Status Code" />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </Grid>
                                                <Grid size={{ xs: 12, md: 6 }}>
                                                    <ResponsiveContainer width="100%" height={300}>
                                                        <PieChart>
                                                            <Pie
                                                                data={statusData}
                                                                cx="50%"
                                                                cy="50%"
                                                                labelLine={false}
                                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                                outerRadius={80}
                                                                fill="#8884d8"
                                                                dataKey="value"
                                                            >
                                                                {statusData.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % 4]} />
                                                                ))}
                                                            </Pie>
                                                            <RechartsTooltip />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </Grid>
                                            </Grid>
                                        )}

                                        {tabValue === 2 && (
                                            <TableContainer>
                                                <Table size="small">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>Time</TableCell>
                                                            <TableCell>Response Time</TableCell>
                                                            <TableCell>Status</TableCell>
                                                            <TableCell>Success</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {metrics.slice(0, 20).map((metric) => (
                                                            <TableRow key={metric.id}>
                                                                <TableCell>
                                                                    {formatDistanceToNow(new Date(metric.created_at), { addSuffix: true })}
                                                                </TableCell>
                                                                <TableCell>{metric.response_time}ms</TableCell>
                                                                <TableCell>
                                                                    <Chip
                                                                        label={metric.status_code}
                                                                        size="small"
                                                                        sx={{ bgcolor: getStatusColor(metric.status_code) }}
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    {metric.success ? (
                                                                        <CheckCircle color="success" fontSize="small" />
                                                                    ) : (
                                                                        <Error color="error" fontSize="small" />
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Alerts */}
                        {alerts.length > 0 && (
                            <Grid size={{ xs: 12 }}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Recent Alerts
                                        </Typography>
                                        {alerts.slice(0, 5).map((alert) => (
                                            <Alert
                                                key={alert.id}
                                                severity={alert.severity === 'error' ? 'error' : 'warning'}
                                                sx={{ mb: 1 }}
                                            >
                                                {alert.message}
                                                <Typography variant="caption" display="block">
                                                    {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                                                </Typography>
                                            </Alert>
                                        ))}
                                    </CardContent>
                                </Card>
                            </Grid>
                        )}
                    </>
                )}
            </Grid>
        </Box>
    );
};

export default UptimeDashboard;

