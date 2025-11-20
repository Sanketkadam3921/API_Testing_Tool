import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Switch,
    FormControlLabel,
    Alert,
    CircularProgress,
    Tooltip,
} from '@mui/material';
import {
    PlayArrow,
    Stop,
    Delete,
    Refresh,
    Add,
    MonitorHeart,
    TrendingUp,
    Warning,
    CheckCircle,
    Error,
} from '@mui/icons-material';
import { apiService } from '../services/apiService';
import { validateUrl } from '../utils/validators';
import toast from 'react-hot-toast';
import MetricCard from './MetricCard';

const MonitoringDashboard = () => {
    const [monitors, setMonitors] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [requests, setRequests] = useState([]);
    const [newMonitor, setNewMonitor] = useState({
        name: '',
        description: '',
        request_id: '',
        interval_min: 5,
        threshold_ms: 500,
        method: 'GET',
        url: '',
        headers: {},
        body: null,
        params: {},
    });

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    loadMonitors(),
                    loadStats(),
                    loadRequests(),
                ]);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const loadMonitors = async () => {
        try {
            const response = await apiService.get('/api/monitors');
            if (response.success) {
                setMonitors(response.monitors || []);
            }
        } catch (error) {
            toast.error('Failed to load monitors');
            console.error('Error loading monitors:', error);
        }
    };

    const loadStats = async () => {
        try {
            const response = await apiService.get('/api/monitors/stats');
            if (response.success) {
                setStats(response.stats || {});
            } else {
                console.warn('Stats response not successful:', response);
                setStats({});
            }
        } catch (error) {
            console.error('Error loading stats:', error);
            setStats({});
        }
    };

    const loadRequests = async () => {
        try {
            // Fetch all collections first, then aggregate their requests
            const collectionsResp = await apiService.get('/api/collections');
            if (!collectionsResp.success || !Array.isArray(collectionsResp.collections)) {
                console.log('No collections found or invalid response');
                setRequests([]);
                return;
            }

            if (collectionsResp.collections.length === 0) {
                console.log('No collections available');
                setRequests([]);
                return;
            }

            const allRequests = [];
            for (const col of collectionsResp.collections) {
                try {
                    const reqsResp = await apiService.get(`/api/collections/${col.id}/requests`);
                    if (reqsResp.success && Array.isArray(reqsResp.requests)) {
                        allRequests.push(...reqsResp.requests);
                    }
                } catch (innerErr) {
                    console.error('Error loading requests for collection:', col.id, innerErr);
                }
            }
            console.log('Loaded requests:', allRequests.length);
            setRequests(allRequests);
        } catch (error) {
            console.error('Error loading requests:', error);
            toast.error('Failed to load requests. You can still create a monitor by entering URL manually.');
            setRequests([]);
        }
    };

    const createMonitor = async () => {
        if (!newMonitor.name.trim()) {
            toast.error('Monitor name is required');
            return;
        }

        // If no request_id selected, ensure method and url are provided
        if (!newMonitor.request_id && (!newMonitor.method || !newMonitor.url.trim())) {
            toast.error('Please select a request OR provide method and URL');
            return;
        }

        // Validate URL if provided
        if (newMonitor.url.trim()) {
            const urlValidation = validateUrl(newMonitor.url);
            if (!urlValidation.valid) {
                toast.error(urlValidation.error || 'Invalid URL');
                return;
            }
        }

        try {
            const monitorData = {
                ...newMonitor,
                user_id: 'default-user-id',
            };
            const response = await apiService.post('/api/monitors', monitorData);
            if (response.success) {
                toast.success('Monitor created successfully');
                setCreateDialogOpen(false);
                setNewMonitor({
                    name: '',
                    description: '',
                    request_id: '',
                    interval_min: 5,
                    threshold_ms: 500,
                    method: 'GET',
                    url: '',
                    headers: {},
                    body: null,
                    params: {},
                });
                loadMonitors();
                loadStats();
            }
        } catch (error) {
            console.error('Error creating monitor:', error);

            // Handle the new detailed error response
            if (error.response?.data?.details?.missing_fields) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Failed to create monitor: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    const toggleMonitor = async (monitorId, isActive) => {
        try {
            const response = await apiService.put(`/api/monitors/${monitorId}/status`, {
                is_active: !isActive
            });
            if (response.success) {
                toast.success(response.message || `Monitor ${!isActive ? 'started' : 'stopped'} successfully`);
                loadMonitors();
                loadStats();
            }
        } catch (error) {
            toast.error('Failed to update monitor status: ' + (error.response?.data?.message || error.message));
            console.error('Error updating monitor:', error);
        }
    };

    const deleteMonitor = async (monitorId) => {
        if (window.confirm('Are you sure you want to delete this monitor?')) {
            try {
                const response = await apiService.delete(`/api/monitors/${monitorId}`);
                if (response.success) {
                    toast.success('Monitor deleted successfully');
                    loadMonitors();
                    loadStats();
                }
            } catch (error) {
                toast.error('Failed to delete monitor');
                console.error('Error deleting monitor:', error);
            }
        }
    };

    const runTest = async (monitorId) => {
        try {
            const response = await apiService.post(`/api/monitors/${monitorId}/test`);
            if (response.success) {
                toast.success('Test completed successfully');
                loadMonitors();
                loadStats();
            }
        } catch (error) {
            toast.error('Test failed: ' + (error.response?.data?.message || error.message));
            console.error('Error running test:', error);
        }
    };

    const getStatusIcon = (isActive) => {
        return isActive ? (
            <CheckCircle color="success" />
        ) : (
            <Error color="error" />
        );
    };

    const getStatusColor = (isActive) => {
        return isActive ? 'success' : 'error';
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography 
                    variant="h4" 
                    component="h1" 
                    sx={{ 
                        fontWeight: 700, 
                        color: '#1f2937',
                        fontSize: '1.75rem',
                        letterSpacing: '-0.02em',
                    }}
                >
                    API Monitoring Dashboard
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<TrendingUp />}
                        href="/monitoring-data"
                        component="a"
                        sx={{
                            borderColor: 'rgba(0,0,0,0.1)',
                            color: '#1f2937',
                            textTransform: 'none',
                            borderRadius: 2,
                            px: 2.5,
                            py: 1,
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            '&:hover': {
                                borderColor: 'rgba(0,0,0,0.2)',
                                backgroundColor: 'rgba(0,0,0,0.02)',
                            },
                        }}
                    >
                        View Data & Charts
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setCreateDialogOpen(true)}
                        sx={{
                            backgroundColor: '#22c55e',
                            color: '#ffffff',
                            textTransform: 'none',
                            borderRadius: 2,
                            px: 2.5,
                            py: 1,
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            boxShadow: '0 2px 8px rgba(34,197,94,0.3)',
                            '&:hover': {
                                backgroundColor: '#16a34a',
                                boxShadow: '0 4px 12px rgba(34,197,94,0.4)',
                            },
                        }}
                    >
                        Create Monitor
                    </Button>
                </Box>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <MetricCard
                        title="Total Monitors"
                        value={stats.total_monitors || 0}
                        change="+2.6%"
                        changeLabel="last 7 days"
                        positiveChange={true}
                        chartColor="#22c55e"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <MetricCard
                        title="Active Monitors"
                        value={stats.active_monitors || 0}
                        change="+5.2%"
                        changeLabel="last 7 days"
                        positiveChange={true}
                        chartColor="#3b82f6"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <MetricCard
                        title="Inactive Monitors"
                        value={stats.inactive_monitors || 0}
                        change="-1.3%"
                        changeLabel="last 7 days"
                        positiveChange={false}
                        chartColor="#ef4444"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <MetricCard
                        title="Uptime Rate"
                        value={`${stats.uptime_percentage != null ? Number(stats.uptime_percentage).toFixed(1) : '0.0'}%`}
                        change="+0.5%"
                        changeLabel="last 7 days"
                        positiveChange={true}
                        chartColor="#22c55e"
                    />
                </Grid>
            </Grid>

            {/* Monitors Table */}
            <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography 
                        variant="h6" 
                        gutterBottom
                        sx={{
                            fontWeight: 600,
                            fontSize: '1.25rem',
                            color: '#1f2937',
                            mb: 3,
                        }}
                    >
                        Active Monitors
                    </Typography>
                    <TableContainer 
                        component={Paper}
                        sx={{
                            boxShadow: 'none',
                            borderRadius: 2,
                            border: '1px solid rgba(0,0,0,0.08)',
                        }}
                    >
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600, color: '#1f2937', fontSize: '0.875rem' }}>Name</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#1f2937', fontSize: '0.875rem' }}>Request</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#1f2937', fontSize: '0.875rem' }}>Method</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#1f2937', fontSize: '0.875rem' }}>URL</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#1f2937', fontSize: '0.875rem' }}>Interval</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#1f2937', fontSize: '0.875rem' }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#1f2937', fontSize: '0.875rem' }}>Last Run</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#1f2937', fontSize: '0.875rem' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {monitors.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                            <Typography variant="body1" color="textSecondary">
                                                No monitors found. Create your first monitor to get started.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    monitors.map((monitor) => (
                                        <TableRow 
                                            key={monitor.id}
                                            sx={{
                                                '&:hover': {
                                                    backgroundColor: 'rgba(0,0,0,0.02)',
                                                },
                                            }}
                                        >
                                            <TableCell>
                                                <Typography 
                                                    variant="subtitle2"
                                                    sx={{ 
                                                        fontWeight: 500,
                                                        color: '#1f2937',
                                                        fontSize: '0.875rem',
                                                    }}
                                                >
                                                    {monitor.name}
                                                </Typography>
                                                {monitor.description && (
                                                    <Typography 
                                                        variant="body2" 
                                                        sx={{
                                                            color: '#6b7280',
                                                            fontSize: '0.75rem',
                                                            mt: 0.5,
                                                        }}
                                                    >
                                                        {monitor.description}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>{monitor.request_name}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={monitor.method}
                                                    size="small"
                                                    color={monitor.method === 'GET' ? 'success' : 'primary'}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography 
                                                    variant="body2" 
                                                    sx={{ 
                                                        maxWidth: 200, 
                                                        overflow: 'hidden', 
                                                        textOverflow: 'ellipsis',
                                                        color: '#374151',
                                                        fontSize: '0.875rem',
                                                    }}
                                                >
                                                    {monitor.url}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography sx={{ color: '#374151', fontSize: '0.875rem' }}>
                                                    {monitor.interval_min} min
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    icon={getStatusIcon(monitor.is_active)}
                                                    label={monitor.is_active ? 'Active' : 'Inactive'}
                                                    color={getStatusColor(monitor.is_active)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {monitor.last_run ? new Date(monitor.last_run).toLocaleString() : 'Never'}
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Tooltip title={monitor.is_active ? 'Stop' : 'Start'}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => toggleMonitor(monitor.id, monitor.is_active)}
                                                        >
                                                            {monitor.is_active ? <Stop /> : <PlayArrow />}
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Run Test">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => runTest(monitor.id)}
                                                        >
                                                            <Refresh />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => deleteMonitor(monitor.id)}
                                                            color="error"
                                                        >
                                                            <Delete />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Create Monitor Dialog */}
            <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Create New Monitor</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="Monitor Name"
                            value={newMonitor.name}
                            onChange={(e) => setNewMonitor({ ...newMonitor, name: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Description"
                            value={newMonitor.description}
                            onChange={(e) => setNewMonitor({ ...newMonitor, description: e.target.value })}
                            fullWidth
                            multiline
                            rows={2}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Select Request (Optional)</InputLabel>
                            <Select
                                value={newMonitor.request_id}
                                onChange={(e) => {
                                    const selectedRequest = requests.find(r => r.id === e.target.value);
                                    setNewMonitor({
                                        ...newMonitor,
                                        request_id: e.target.value,
                                        method: selectedRequest?.method || newMonitor.method,
                                        url: selectedRequest?.url || newMonitor.url,
                                    });
                                }}
                            >
                                <MenuItem value="">
                                    <em>None - Enter URL manually below</em>
                                </MenuItem>
                                {requests.length === 0 ? (
                                    <MenuItem disabled>No requests available. Create a request in Collections first.</MenuItem>
                                ) : (
                                    requests.map((request) => (
                                        <MenuItem key={request.id} value={request.id}>
                                            {request.name || 'Unnamed'} ({request.method} {request.url})
                                        </MenuItem>
                                    ))
                                )}
                            </Select>
                            {requests.length === 0 && (
                                <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                                    No requests found. You can enter URL manually below.
                                </Typography>
                            )}
                        </FormControl>

                        {/* Manual URL entry when no request selected */}
                        {!newMonitor.request_id && (
                            <>
                                <FormControl fullWidth>
                                    <InputLabel>HTTP Method</InputLabel>
                                    <Select
                                        value={newMonitor.method}
                                        onChange={(e) => setNewMonitor({ ...newMonitor, method: e.target.value })}
                                    >
                                        <MenuItem value="GET">GET</MenuItem>
                                        <MenuItem value="POST">POST</MenuItem>
                                        <MenuItem value="PUT">PUT</MenuItem>
                                        <MenuItem value="PATCH">PATCH</MenuItem>
                                        <MenuItem value="DELETE">DELETE</MenuItem>
                                    </Select>
                                </FormControl>
                                <TextField
                                    label="URL *"
                                    value={newMonitor.url}
                                    onChange={(e) => {
                                        const newUrl = e.target.value;
                                        setNewMonitor({ ...newMonitor, url: newUrl });
                                    }}
                                    onBlur={(e) => {
                                        // Validate on blur
                                        if (e.target.value.trim()) {
                                            const validation = validateUrl(e.target.value);
                                            if (!validation.valid) {
                                                toast.error(validation.error || 'Invalid URL', { duration: 3000 });
                                            }
                                        }
                                    }}
                                    fullWidth
                                    placeholder="https://api.example.com/endpoint"
                                    required
                                    helperText="Enter a valid URL with http:// or https://"
                                />
                            </>
                        )}
                        <TextField
                            label="Interval (minutes)"
                            type="number"
                            value={newMonitor.interval_min}
                            onChange={(e) => setNewMonitor({ ...newMonitor, interval_min: parseInt(e.target.value) })}
                            inputProps={{ min: 1, max: 1440 }}
                        />
                        <TextField
                            label="Threshold (ms)"
                            type="number"
                            value={newMonitor.threshold_ms}
                            onChange={(e) => setNewMonitor({ ...newMonitor, threshold_ms: parseInt(e.target.value) })}
                            inputProps={{ min: 100 }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                    <Button onClick={createMonitor} variant="contained">
                        Create Monitor
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MonitoringDashboard;
