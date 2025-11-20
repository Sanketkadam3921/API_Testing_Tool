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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Tooltip,
    Button,
} from '@mui/material';
import {
    Refresh,
    TrendingUp,
    TrendingDown,
    CheckCircle,
    Error,
    Warning,
    Timeline,
    Speed,
    AccessTime,
    NetworkCheck,
    Assessment,
    BarChart,
} from '@mui/icons-material';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart as RechartsBarChart,
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
import { useTheme } from '../context/ThemeContext';
import { apiService } from '../services/apiService';
import toast from 'react-hot-toast';
import { formatDistanceToNow, format } from 'date-fns';
import AdvancedAnalyticsDashboard from './AdvancedAnalyticsDashboard';

const COLORS = {
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3',
};

const MonitoringDataDashboard = () => {
    const { isDarkMode } = useTheme();
    const [monitors, setMonitors] = useState([]);
    const [selectedMonitor, setSelectedMonitor] = useState(null);
    const [metrics, setMetrics] = useState([]);
    const [stats, setStats] = useState(null);
    const [overallStats, setOverallStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);
    const [autoRefresh, setAutoRefresh] = useState(true);

    useEffect(() => {
        loadMonitors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (selectedMonitor) {
            loadMonitorData();
            if (autoRefresh) {
                const interval = setInterval(() => {
                    loadMonitorData();
                }, 10000); // Refresh every 10 seconds
                return () => clearInterval(interval);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedMonitor, autoRefresh]);

    const loadMonitors = async () => {
        try {
            const response = await apiService.get('/api/monitors?user_id=default-user-id');
            if (response.success && response.monitors) {
                setMonitors(response.monitors);
                if (response.monitors.length > 0 && !selectedMonitor) {
                    setSelectedMonitor(response.monitors[0]);
                }
            }
            
            // Load overall stats
            const statsResponse = await apiService.get('/api/monitors/stats?user_id=default-user-id');
            if (statsResponse.success) {
                setOverallStats(statsResponse.stats);
            }
        } catch (error) {
            toast.error('Failed to load monitors');
            console.error('Error loading monitors:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMonitorData = async () => {
        if (!selectedMonitor) return;

        try {
            // Load metrics
            const metricsResponse = await apiService.get(`/api/metrics/${selectedMonitor.id}`);
            if (metricsResponse.success) {
                setMetrics(metricsResponse.metrics || []);
            }

            // Load stats for this monitor
            const statsResponse = await apiService.get(`/api/metrics/${selectedMonitor.id}/stats`);
            if (statsResponse.success) {
                setStats(normalizeStats(statsResponse.stats));
            }
        } catch (error) {
            console.error('Error loading monitor data:', error);
        }
    };

    const handleRefresh = () => {
        loadMonitors();
        if (selectedMonitor) {
            loadMonitorData();
        }
        toast.success('Data refreshed');
    };

    const getUptimeColor = (uptime) => {
        if (!uptime) return COLORS.warning;
        const uptimeNum = typeof uptime === 'string' ? parseFloat(uptime) : uptime;
        if (uptimeNum >= 99.9) return COLORS.success;
        if (uptimeNum >= 99) return COLORS.warning;
        return COLORS.error;
    };

    // Helper to convert stats values from strings to numbers
    const normalizeStats = (stats) => {
        if (!stats) return null;
        return {
            ...stats,
            uptime_percentage: stats.uptime_percentage ? parseFloat(stats.uptime_percentage) : 0,
            avg_response_time: stats.avg_response_time ? parseFloat(stats.avg_response_time) : 0,
            min_response_time: stats.min_response_time ? parseFloat(stats.min_response_time) : 0,
            max_response_time: stats.max_response_time ? parseFloat(stats.max_response_time) : 0,
            total_requests: stats.total_requests ? parseInt(stats.total_requests, 10) : 0,
            successful_requests: stats.successful_requests ? parseInt(stats.successful_requests, 10) : 0,
            failed_requests: stats.failed_requests ? parseInt(stats.failed_requests, 10) : 0,
        };
    };

    const getStatusColor = (status) => {
        if (status >= 200 && status < 300) return COLORS.success;
        if (status >= 300 && status < 400) return COLORS.warning;
        return COLORS.error;
    };

    // Prepare chart data
    const prepareResponseTimeData = () => {
        const recentMetrics = [...metrics].reverse().slice(0, 30);
        return recentMetrics.map((metric, index) => ({
            time: index,
            responseTime: metric.response_time,
            timestamp: format(new Date(metric.created_at), 'HH:mm:ss'),
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

    const prepareSuccessRateData = () => {
        const recentMetrics = [...metrics].reverse().slice(0, 30);
        return recentMetrics.map((metric, index) => ({
            time: index,
            success: metric.success ? 1 : 0,
            timestamp: format(new Date(metric.created_at), 'HH:mm:ss'),
        }));
    };

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

    const responseTimeData = prepareResponseTimeData();
    const statusData = prepareStatusData();
    const successRateData = prepareSuccessRateData();

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
                        Monitoring Data & Statistics
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Real-time metrics, charts, and performance analytics
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title={autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}>
                        <Button
                            variant={autoRefresh ? "contained" : "outlined"}
                            size="small"
                            onClick={() => setAutoRefresh(!autoRefresh)}
                        >
                            Auto Refresh {autoRefresh ? 'ON' : 'OFF'}
                        </Button>
                    </Tooltip>
                    <Tooltip title="Refresh Data">
                        <IconButton onClick={handleRefresh} color="primary">
                            <Refresh />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            <Grid container spacing={3}>
                {/* Overall Statistics */}
                <Grid size={{ xs: 12 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Assessment /> Overall Statistics
                            </Typography>
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h4" color="primary">
                                            {overallStats?.total_monitors || 0}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            Total Monitors
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h4" sx={{ color: COLORS.success }}>
                                            {overallStats?.active_monitors || 0}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            Active Monitors
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h4" sx={{ color: COLORS.warning }}>
                                            {overallStats?.inactive_monitors || 0}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            Inactive Monitors
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Monitor Selection */}
                <Grid size={{ xs: 12 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Select Monitor to View Data
                            </Typography>
                            <FormControl fullWidth>
                                <InputLabel>Monitor</InputLabel>
                                <Select
                                    value={selectedMonitor?.id || ''}
                                    onChange={(e) => {
                                        const monitor = monitors.find(m => m.id === e.target.value);
                                        setSelectedMonitor(monitor);
                                    }}
                                >
                                    {monitors.map((monitor) => (
                                        <MenuItem key={monitor.id} value={monitor.id}>
                                            {monitor.name} ({monitor.method} {monitor.url?.substring(0, 50)}...)
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </CardContent>
                    </Card>
                </Grid>

                {selectedMonitor && (
                    <>
                        {/* Key Metrics Cards */}
                        <Grid size={{ xs: 12, md: 3 }}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <CheckCircle sx={{ color: getUptimeColor(stats?.uptime_percentage), mr: 1 }} />
                                        <Typography variant="h6">Uptime</Typography>
                                    </Box>
                                    <Typography variant="h3" sx={{ color: getUptimeColor(stats?.uptime_percentage) }}>
                                        {stats?.uptime_percentage ? Number(stats.uptime_percentage).toFixed(2) : '0.00'}%
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        {stats?.successful_requests || 0} / {stats?.total_requests || 0} successful
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
                                        {stats?.avg_response_time ? Math.round(Number(stats.avg_response_time)) : 0}ms
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        Min: {stats?.min_response_time ? Number(stats.min_response_time) : 0}ms | Max: {stats?.max_response_time ? Number(stats.max_response_time) : 0}ms
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid size={{ xs: 12, md: 3 }}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <NetworkCheck sx={{ color: COLORS.success, mr: 1 }} />
                                        <Typography variant="h6">Total Checks</Typography>
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
                                        <Typography variant="h6">Monitor Status</Typography>
                                    </Box>
                                    <Typography variant="h3" color="warning.main">
                                        {selectedMonitor.is_active ? 'Active' : 'Inactive'}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        Interval: {selectedMonitor.interval_min} min
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
                                        <Tab label="Success Rate" icon={<TrendingUp />} />
                                        <Tab label="Metrics History" icon={<AccessTime />} />
                                        <Tab label="Advanced Analytics" icon={<Assessment />} />
                                    </Tabs>

                                    <Box sx={{ mt: 3 }}>
                                        {tabValue === 0 && (
                                            <Box>
                                                <Typography variant="h6" gutterBottom>
                                                    Response Time Over Time
                                                </Typography>
                                                {responseTimeData.length > 0 ? (
                                                    <ResponsiveContainer width="100%" height={400}>
                                                        <AreaChart data={responseTimeData}>
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
                                                ) : (
                                                    <Alert severity="info">No metrics data available yet. Monitor will collect data over time.</Alert>
                                                )}
                                            </Box>
                                        )}

                                        {tabValue === 1 && (
                                            <Box>
                                                <Typography variant="h6" gutterBottom>
                                                    Status Code Distribution
                                                </Typography>
                                                {statusData.length > 0 ? (
                                                    <Grid container spacing={2}>
                                                        <Grid size={{ xs: 12, md: 6 }}>
                                                            <ResponsiveContainer width="100%" height={300}>
                                                                <PieChart>
                                                                    <Pie
                                                                        data={statusData}
                                                                        cx="50%"
                                                                        cy="50%"
                                                                        labelLine={false}
                                                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                                        outerRadius={100}
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
                                                        <Grid size={{ xs: 12, md: 6 }}>
                                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 4 }}>
                                                                {statusData.map((entry, index) => (
                                                                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                        <Box
                                                                            sx={{
                                                                                width: 20,
                                                                                height: 20,
                                                                                bgcolor: Object.values(COLORS)[index % 4],
                                                                                borderRadius: 1,
                                                                            }}
                                                                        />
                                                                        <Typography variant="body1">
                                                                            {entry.name}: {entry.value} requests
                                                                        </Typography>
                                                                    </Box>
                                                                ))}
                                                            </Box>
                                                        </Grid>
                                                    </Grid>
                                                ) : (
                                                    <Alert severity="info">No status code data available yet.</Alert>
                                                )}
                                            </Box>
                                        )}

                                        {tabValue === 2 && (
                                            <Box>
                                                <Typography variant="h6" gutterBottom>
                                                    Success Rate Over Time
                                                </Typography>
                                                {successRateData.length > 0 ? (
                                                    <ResponsiveContainer width="100%" height={400}>
                                                        <LineChart data={successRateData}>
                                                            <CartesianGrid strokeDasharray="3 3" />
                                                            <XAxis dataKey="timestamp" />
                                                            <YAxis domain={[0, 1]} label={{ value: 'Success (1=Yes, 0=No)', angle: -90, position: 'insideLeft' }} />
                                                            <RechartsTooltip />
                                                            <Legend />
                                                            <Line
                                                                type="monotone"
                                                                dataKey="success"
                                                                stroke={COLORS.success}
                                                                strokeWidth={2}
                                                                name="Success (1=Yes, 0=No)"
                                                            />
                                                        </LineChart>
                                                    </ResponsiveContainer>
                                                ) : (
                                                    <Alert severity="info">No success rate data available yet.</Alert>
                                                )}
                                            </Box>
                                        )}

                                        {tabValue === 3 && (
                                            <Box>
                                                <Typography variant="h6" gutterBottom>
                                                    Recent Metrics History
                                                </Typography>
                                                {metrics.length > 0 ? (
                                                    <TableContainer component={Paper}>
                                                        <Table size="small">
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell>Time</TableCell>
                                                                    <TableCell>Response Time</TableCell>
                                                                    <TableCell>Status Code</TableCell>
                                                                    <TableCell>Success</TableCell>
                                                                    <TableCell>Error</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {metrics.slice(0, 50).map((metric) => (
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
                                                                        <TableCell>
                                                                            <Typography variant="caption" color="error">
                                                                                {metric.error_message || '-'}
                                                                            </Typography>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer>
                                                ) : (
                                                    <Alert severity="info">
                                                        No metrics data available yet. The monitor needs to run a few checks before data appears here.
                                                    </Alert>
                                                )}
                                            </Box>
                                        )}

                                        {tabValue === 4 && selectedMonitor && (
                                            <Box>
                                                <AdvancedAnalyticsDashboard monitorId={selectedMonitor.id} />
                                            </Box>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Monitor Details */}
                        <Grid size={{ xs: 12 }}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Monitor Details
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <Typography variant="body2" color="textSecondary">
                                                Name
                                            </Typography>
                                            <Typography variant="body1">{selectedMonitor.name}</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <Typography variant="body2" color="textSecondary">
                                                URL
                                            </Typography>
                                            <Typography variant="body1">{selectedMonitor.url}</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <Typography variant="body2" color="textSecondary">
                                                Method
                                            </Typography>
                                            <Typography variant="body1">{selectedMonitor.method}</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <Typography variant="body2" color="textSecondary">
                                                Interval
                                            </Typography>
                                            <Typography variant="body1">Every {selectedMonitor.interval_min} minutes</Typography>
                                        </Grid>
                                        {selectedMonitor.last_run && (
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <Typography variant="body2" color="textSecondary">
                                                    Last Run
                                                </Typography>
                                                <Typography variant="body1">
                                                    {formatDistanceToNow(new Date(selectedMonitor.last_run), { addSuffix: true })}
                                                </Typography>
                                            </Grid>
                                        )}
                                        {selectedMonitor.next_run && (
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <Typography variant="body2" color="textSecondary">
                                                    Next Run
                                                </Typography>
                                                <Typography variant="body1">
                                                    {formatDistanceToNow(new Date(selectedMonitor.next_run), { addSuffix: true })}
                                                </Typography>
                                            </Grid>
                                        )}
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                    </>
                )}
            </Grid>
        </Box>
    );
};

export default MonitoringDataDashboard;

