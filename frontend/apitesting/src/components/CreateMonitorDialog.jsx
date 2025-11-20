import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Typography,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import { MonitorHeart, ExpandMore, Http } from '@mui/icons-material';
import { apiService } from '../services/apiService';
import { validateUrl } from '../utils/validators';
import toast from 'react-hot-toast';

const CreateMonitorDialog = ({ open, onClose, requestData }) => {
    const [monitorData, setMonitorData] = useState({
        name: '',
        description: '',
        request_id: requestData?.id || '',
        interval_min: 5,
        threshold_ms: 500,
        // Request data fields
        method: requestData?.method || 'GET',
        url: requestData?.url || '',
        headers: requestData?.headers || [],
        body: requestData?.body || '',
        params: requestData?.params || [],
    });
    const [loading, setLoading] = useState(false);
    const [showRequestDetails, setShowRequestDetails] = useState(false);
    const [errorDetails, setErrorDetails] = useState(null);

    const handleCreate = async () => {
        if (!monitorData.name.trim()) {
            toast.error('Monitor name is required');
            return;
        }

        // Validate URL if provided
        if (monitorData.url && monitorData.url.trim()) {
            const urlValidation = validateUrl(monitorData.url);
            if (!urlValidation.valid) {
                toast.error(urlValidation.error || 'Invalid URL');
                return;
            }
        }

        setLoading(true);
        setErrorDetails(null);

        try {
            const response = await apiService.createMonitor(monitorData);
            if (response.success) {
                toast.success('Monitor created successfully');
                onClose();
                // Reset form
                setMonitorData({
                    name: '',
                    description: '',
                    request_id: requestData?.id || '',
                    interval_min: 5,
                    threshold_ms: 500,
                    method: requestData?.method || 'GET',
                    url: requestData?.url || '',
                    headers: requestData?.headers || [],
                    body: requestData?.body || '',
                    params: requestData?.params || [],
                });
            }
        } catch (error) {
            console.error('Error creating monitor:', error);

            // Handle the new detailed error response
            if (error.response?.data?.details?.missing_fields) {
                setErrorDetails(error.response.data);
                toast.error(error.response.data.message);
                setShowRequestDetails(true);
            } else {
                toast.error('Failed to create monitor');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MonitorHeart color="primary" />
                    Create Monitor
                </Box>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    {requestData && (
                        <Alert severity="info">
                            <Typography variant="body2">
                                Creating monitor for: <strong>{requestData.method} {requestData.url}</strong>
                            </Typography>
                        </Alert>
                    )}

                    {errorDetails && (
                        <Alert severity="error">
                            <Typography variant="body2">
                                {errorDetails.message}
                            </Typography>
                            {errorDetails.details?.missing_fields?.length > 0 && (
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    Missing fields: {errorDetails.details.missing_fields.join(', ')}
                                </Typography>
                            )}
                        </Alert>
                    )}

                    <TextField
                        label="Monitor Name"
                        value={monitorData.name}
                        onChange={(e) => setMonitorData({ ...monitorData, name: e.target.value })}
                        fullWidth
                        placeholder="e.g., API Health Check"
                        required
                    />

                    <TextField
                        label="Description"
                        value={monitorData.description}
                        onChange={(e) => setMonitorData({ ...monitorData, description: e.target.value })}
                        fullWidth
                        multiline
                        rows={2}
                        placeholder="Optional description for this monitor"
                    />

                    <TextField
                        label="Check Interval (minutes)"
                        type="number"
                        value={monitorData.interval_min}
                        onChange={(e) => setMonitorData({ ...monitorData, interval_min: parseInt(e.target.value) || 5 })}
                        inputProps={{ min: 1, max: 1440 }}
                        helperText="How often to check this API (1-1440 minutes)"
                    />

                    <TextField
                        label="Response Time Threshold (ms)"
                        type="number"
                        value={monitorData.threshold_ms}
                        onChange={(e) => setMonitorData({ ...monitorData, threshold_ms: parseInt(e.target.value) || 500 })}
                        inputProps={{ min: 100 }}
                        helperText="Alert if response time exceeds this threshold"
                    />

                    <Accordion expanded={showRequestDetails || !requestData} onChange={() => setShowRequestDetails(!showRequestDetails)}>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Http color="primary" />
                                <Typography>Request Details</Typography>
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <FormControl fullWidth>
                                    <InputLabel>HTTP Method</InputLabel>
                                    <Select
                                        value={monitorData.method}
                                        label="HTTP Method"
                                        onChange={(e) => setMonitorData({ ...monitorData, method: e.target.value })}
                                    >
                                        <MenuItem value="GET">GET</MenuItem>
                                        <MenuItem value="POST">POST</MenuItem>
                                        <MenuItem value="PUT">PUT</MenuItem>
                                        <MenuItem value="PATCH">PATCH</MenuItem>
                                        <MenuItem value="DELETE">DELETE</MenuItem>
                                    </Select>
                                </FormControl>

                                <TextField
                                    label="URL"
                                    value={monitorData.url}
                                    onChange={(e) => setMonitorData({ ...monitorData, url: e.target.value })}
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

                                <TextField
                                    label="Request Body"
                                    value={monitorData.body}
                                    onChange={(e) => setMonitorData({ ...monitorData, body: e.target.value })}
                                    fullWidth
                                    multiline
                                    rows={3}
                                    placeholder="JSON request body (for POST/PUT/PATCH requests)"
                                />
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={handleCreate}
                    variant="contained"
                    disabled={loading}
                    startIcon={<MonitorHeart />}
                >
                    {loading ? 'Creating...' : 'Create Monitor'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateMonitorDialog;
