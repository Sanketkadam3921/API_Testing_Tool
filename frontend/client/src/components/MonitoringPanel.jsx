import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Tooltip,
    Divider,
} from '@mui/material';
import {
    PlayArrow,
    Stop,
    Delete,
    Add,
    MonitorHeart,
    CheckCircle,
    Error,
} from '@mui/icons-material';
import { apiService } from '../services/apiService';
import { validateUrl } from '../utils/validators';
import toast from 'react-hot-toast';

const MonitoringPanel = () => {
    const [monitors, setMonitors] = useState([]);
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
        loadMonitors();
        loadRequests();
    }, []);

    const loadMonitors = async () => {
        try {
            const response = await apiService.get('/api/monitors');
            if (response.success) {
                setMonitors(response.monitors || []);
            }
        } catch (error) {
            console.error('Error loading monitors:', error);
        }
    };

    const loadRequests = async () => {
        try {
            const collectionsResp = await apiService.get('/api/collections');
            if (!collectionsResp.success || !Array.isArray(collectionsResp.collections)) {
                setRequests([]);
                return;
            }

            const aggregated = [];
            for (const col of collectionsResp.collections) {
                try {
                    const reqsResp = await apiService.get(`/api/collections/${col.id}/requests`);
                    if (reqsResp.success && Array.isArray(reqsResp.requests)) {
                        aggregated.push(...reqsResp.requests);
                    }
                } catch (innerErr) {
                    console.error('Error loading requests for collection:', col.id, innerErr);
                }
            }
            setRequests(aggregated);
        } catch (error) {
            console.error('Error loading requests:', error);
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
                toast.success(response.message);
                loadMonitors();
            }
        } catch (error) {
            toast.error('Failed to update monitor status');
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
                }
            } catch (error) {
                toast.error('Failed to delete monitor');
                console.error('Error deleting monitor:', error);
            }
        }
    };

    const getStatusIcon = (isActive) => {
        return isActive ? (
            <CheckCircle color="success" fontSize="small" />
        ) : (
            <Error color="error" fontSize="small" />
        );
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Monitors
                </Typography>
                <Tooltip title="Create Monitor">
                    <IconButton
                        size="small"
                        onClick={() => setCreateDialogOpen(true)}
                        color="primary"
                    >
                        <Add />
                    </IconButton>
                </Tooltip>
            </Box>

            <Divider />

            {/* Monitors List */}
            <List sx={{ p: 0 }}>
                {monitors.length === 0 ? (
                    <ListItem>
                        <ListItemText
                            primary="No monitors created"
                            secondary="Click + to create your first monitor"
                        />
                    </ListItem>
                ) : (
                    monitors.map((monitor) => (
                        <ListItem key={monitor.id} sx={{ px: 2, py: 1 }}>
                            <ListItemText
                                primary={
                                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography component="span" variant="subtitle2" sx={{ fontWeight: 600 }}>
                                            {monitor.name}
                                        </Typography>
                                        <Chip
                                            icon={getStatusIcon(monitor.is_active)}
                                            label={monitor.is_active ? 'Active' : 'Inactive'}
                                            color={monitor.is_active ? 'success' : 'error'}
                                            size="small"
                                        />
                                    </Box>
                                }
                                secondary={
                                    <>
                                        <Typography component="span" variant="body2" color="textSecondary" display="block">
                                            {monitor.method} {monitor.url}
                                        </Typography>
                                        <Typography component="span" variant="caption" color="textSecondary" display="block">
                                            Every {monitor.interval_min} min
                                        </Typography>
                                    </>
                                }
                            />
                            <ListItemSecondaryAction>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    <Tooltip title={monitor.is_active ? 'Stop' : 'Start'}>
                                        <IconButton
                                            size="small"
                                            onClick={() => toggleMonitor(monitor.id, monitor.is_active)}
                                        >
                                            {monitor.is_active ? <Stop /> : <PlayArrow />}
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
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))
                )}
            </List>

            {/* Create Monitor Dialog */}
            <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create New Monitor</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="Monitor Name"
                            value={newMonitor.name}
                            onChange={(e) => setNewMonitor({ ...newMonitor, name: e.target.value })}
                            fullWidth
                            size="small"
                        />
                        <TextField
                            label="Description"
                            value={newMonitor.description}
                            onChange={(e) => setNewMonitor({ ...newMonitor, description: e.target.value })}
                            fullWidth
                            multiline
                            rows={2}
                            size="small"
                        />
                        <FormControl fullWidth size="small">
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
                                    <em>None - Enter URL manually</em>
                                </MenuItem>
                                {requests.length === 0 ? (
                                    <MenuItem disabled>No requests available</MenuItem>
                                ) : (
                                    requests.map((request) => (
                                        <MenuItem key={request.id} value={request.id}>
                                            {request.name || 'Unnamed'} ({request.method} {request.url})
                                        </MenuItem>
                                    ))
                                )}
                            </Select>
                        </FormControl>
                        
                        {/* Manual URL entry when no request selected */}
                        {!newMonitor.request_id && (
                            <>
                                <FormControl fullWidth size="small">
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
                                    onChange={(e) => setNewMonitor({ ...newMonitor, url: e.target.value })}
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
                                    size="small"
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
                            size="small"
                        />
                        <TextField
                            label="Threshold (ms)"
                            type="number"
                            value={newMonitor.threshold_ms}
                            onChange={(e) => setNewMonitor({ ...newMonitor, threshold_ms: parseInt(e.target.value) })}
                            inputProps={{ min: 100 }}
                            size="small"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateDialogOpen(false)} size="small">Cancel</Button>
                    <Button onClick={createMonitor} variant="contained" size="small">
                        Create Monitor
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MonitoringPanel;
