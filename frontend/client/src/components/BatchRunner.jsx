import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    IconButton,
    Alert,
    Chip,
    LinearProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Tooltip,
} from '@mui/material';
import {
    Close,
    PlayArrow,
    Add,
    Delete,
    CheckCircle,
    Error,
} from '@mui/icons-material';
import { apiService } from '../services/apiService';
import { validateUrl } from '../utils/validators';
import toast from 'react-hot-toast';

const BatchRunner = ({ open, onClose, requests = [] }) => {
    const [batchRequests, setBatchRequests] = useState(
        requests.length > 0 ? requests : [{ method: 'GET', url: '', headers: {}, body: null }]
    );
    const [options, setOptions] = useState({
        mode: 'parallel',
        stopOnError: false,
        delayBetweenRequests: 0,
    });
    const [executing, setExecuting] = useState(false);
    const [results, setResults] = useState(null);

    const handleAddRequest = () => {
        setBatchRequests([...batchRequests, { method: 'GET', url: '', headers: {}, body: null }]);
    };

    const handleRemoveRequest = (index) => {
        setBatchRequests(batchRequests.filter((_, i) => i !== index));
    };

    const handleRequestChange = (index, field, value) => {
        const updated = [...batchRequests];
        updated[index] = { ...updated[index], [field]: value };
        setBatchRequests(updated);
    };

    const handleExecute = async () => {
        // Validate requests
        for (let i = 0; i < batchRequests.length; i++) {
            const req = batchRequests[i];
            if (!req.url.trim()) {
                toast.error(`Request ${i + 1} is missing URL`);
                return;
            }
            
            // Validate URL format
            const urlValidation = validateUrl(req.url);
            if (!urlValidation.valid) {
                toast.error(`Request ${i + 1}: ${urlValidation.error || 'Invalid URL'}`);
                return;
            }
        }

        setExecuting(true);
        setResults(null);

        try {
            const response = await apiService.executeBatch(batchRequests, options);
            setResults(response);
            toast.success(`Batch executed: ${response.stats.successful}/${response.stats.total} successful`);
        } catch (error) {
            toast.error('Batch execution failed');
            console.error(error);
        } finally {
            setExecuting(false);
        }
    };

    const getStatusIcon = (success) => {
        return success ? (
            <CheckCircle sx={{ color: '#22c55e', fontSize: 20 }} />
        ) : (
            <Error sx={{ color: '#ef4444', fontSize: 20 }} />
        );
    };

    const getStatusColor = (status) => {
        if (!status) return 'default';
        if (status >= 200 && status < 300) return 'success';
        if (status >= 400) return 'error';
        return 'warning';
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Batch Request Runner</Typography>
                <IconButton size="small" onClick={onClose}>
                    <Close />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                        Execution Options
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Mode</InputLabel>
                            <Select
                                value={options.mode}
                                label="Mode"
                                onChange={(e) => setOptions({ ...options, mode: e.target.value })}
                            >
                                <MenuItem value="parallel">Parallel</MenuItem>
                                <MenuItem value="sequential">Sequential</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <TextField
                                type="number"
                                label="Delay (ms)"
                                size="small"
                                value={options.delayBetweenRequests}
                                onChange={(e) => setOptions({ ...options, delayBetweenRequests: parseInt(e.target.value) || 0 })}
                            />
                        </FormControl>
                    </Box>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Requests ({batchRequests.length})
                        </Typography>
                        <Button
                            size="small"
                            startIcon={<Add />}
                            onClick={handleAddRequest}
                            sx={{
                                textTransform: 'none',
                                color: '#22c55e',
                                '&:hover': { backgroundColor: 'rgba(34,197,94,0.1)' },
                            }}
                        >
                            Add Request
                        </Button>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 300, overflowY: 'auto' }}>
                        {batchRequests.map((req, index) => (
                            <Box
                                key={index}
                                sx={{
                                    p: 2,
                                    border: '1px solid rgba(0,0,0,0.08)',
                                    borderRadius: 2,
                                    backgroundColor: '#fafafa',
                                }}
                            >
                                <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                                    <FormControl size="small" sx={{ minWidth: 100 }}>
                                        <Select
                                            value={req.method}
                                            onChange={(e) => handleRequestChange(index, 'method', e.target.value)}
                                        >
                                            <MenuItem value="GET">GET</MenuItem>
                                            <MenuItem value="POST">POST</MenuItem>
                                            <MenuItem value="PUT">PUT</MenuItem>
                                            <MenuItem value="DELETE">DELETE</MenuItem>
                                            <MenuItem value="PATCH">PATCH</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="https://api.example.com/endpoint"
                                        value={req.url}
                                        onChange={(e) => handleRequestChange(index, 'url', e.target.value)}
                                        onBlur={(e) => {
                                            // Validate on blur
                                            if (e.target.value.trim()) {
                                                const validation = validateUrl(e.target.value);
                                                if (!validation.valid) {
                                                    toast.error(`Request ${index + 1}: ${validation.error || 'Invalid URL'}`, { duration: 3000 });
                                                }
                                            }
                                        }}
                                        helperText="Enter a valid URL with http:// or https://"
                                    />
                                    <IconButton
                                        size="small"
                                        onClick={() => handleRemoveRequest(index)}
                                        sx={{ color: '#ef4444' }}
                                    >
                                        <Delete fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>

                {executing && (
                    <Box sx={{ mb: 2 }}>
                        <LinearProgress />
                        <Typography variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                            Executing batch requests...
                        </Typography>
                    </Box>
                )}

                {results && (
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                            Results
                        </Typography>
                        <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Chip label={`Total: ${results.stats.total}`} />
                            <Chip label={`Success: ${results.stats.successful}`} color="success" />
                            <Chip label={`Failed: ${results.stats.failed}`} color="error" />
                            <Chip label={`Success Rate: ${results.stats.successRate.toFixed(1)}%`} />
                            <Chip label={`Avg Time: ${results.stats.avgResponseTime}ms`} />
                            <Chip label={`Total Time: ${results.stats.totalTime}ms`} />
                        </Box>

                        <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>#</TableCell>
                                        <TableCell>Method</TableCell>
                                        <TableCell>URL</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Time</TableCell>
                                        <TableCell>Result</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {results.results.map((result, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{result.request.method}</TableCell>
                                            <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {result.request.url}
                                            </TableCell>
                                            <TableCell>
                                                {result.status ? (
                                                    <Chip
                                                        label={result.status}
                                                        size="small"
                                                        color={getStatusColor(result.status)}
                                                    />
                                                ) : (
                                                    <Chip label="Error" size="small" color="error" />
                                                )}
                                            </TableCell>
                                            <TableCell>{result.responseTime || 0}ms</TableCell>
                                            <TableCell>{getStatusIcon(result.success)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
                <Button
                    variant="contained"
                    onClick={handleExecute}
                    disabled={executing || batchRequests.length === 0}
                    startIcon={executing ? <LinearProgress /> : <PlayArrow />}
                    sx={{
                        backgroundColor: '#22c55e',
                        '&:hover': { backgroundColor: '#16a34a' },
                    }}
                >
                    {executing ? 'Executing...' : 'Execute Batch'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default BatchRunner;

