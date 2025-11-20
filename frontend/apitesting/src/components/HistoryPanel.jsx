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
    Divider,
    Button,
    Alert,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CircularProgress,
    Tooltip,
} from '@mui/material';
import {
    Delete,
    PlayArrow,
    Schedule,
    Search,
    FilterList,
    Refresh,
} from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';
import { useApiStore } from '../store/apiStore';
import { apiService } from '../services/apiService';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const HistoryPanel = () => {
    const { isDarkMode: _isDarkMode } = useTheme();
    const { createNewTab, updateRequest } = useApiStore();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [methodFilter, setMethodFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        loadHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, methodFilter, statusFilter]);

    const loadHistory = async () => {
        try {
            setLoading(true);
            const options = {
                limit: 100,
                offset: 0,
                search: searchTerm || null,
                method: methodFilter || null,
                statusCode: statusFilter ? parseInt(statusFilter) : null,
            };
            
            const response = await apiService.getHistory(options);
            if (response.success) {
                setHistory(response.history || []);
            }
        } catch (error) {
            console.error('Error loading history:', error);
            toast.error('Failed to load history');
        } finally {
            setLoading(false);
        }
    };

    const handleReplayRequest = (requestData) => {
        const tabId = createNewTab();
        updateRequest(tabId, {
            method: requestData.method,
            url: requestData.url,
            headers: Array.isArray(requestData.headers) 
                ? requestData.headers 
                : Object.entries(requestData.headers || {}).map(([k, v]) => ({ key: k, value: v })),
            body: requestData.body || '',
            params: Array.isArray(requestData.params)
                ? requestData.params
                : Object.entries(requestData.params || {}).map(([k, v]) => ({ key: k, value: v })),
        });
    };

    const handleClearHistory = async () => {
        if (window.confirm('Are you sure you want to clear all history?')) {
            try {
                const response = await apiService.clearHistory();
                if (response.success) {
                    toast.success(`Cleared ${response.deletedCount || 0} history items`);
                    setHistory([]);
                }
            } catch (_error) {
                toast.error('Failed to clear history');
            }
        }
    };

    const handleDeleteItem = async (id) => {
        try {
            const response = await apiService.deleteHistoryItem(id);
            if (response.success) {
                toast.success('History item deleted');
                loadHistory();
            }
        } catch (_error) {
            toast.error('Failed to delete history item');
        }
    };

    const getMethodColor = (method) => {
        switch (method) {
            case 'GET': return 'success';
            case 'POST': return 'primary';
            case 'PUT': return 'warning';
            case 'DELETE': return 'error';
            default: return 'default';
        }
    };

    const getStatusColor = (status) => {
        if (!status) return 'default';
        if (status >= 200 && status < 300) return 'success';
        if (status >= 300 && status < 400) return 'info';
        if (status >= 400 && status < 500) return 'warning';
        return 'error';
    };

    if (loading && history.length === 0) {
        return (
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>History</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Refresh">
                        <IconButton size="small" onClick={loadHistory}>
                            <Refresh fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Filters">
                        <IconButton 
                            size="small" 
                            onClick={() => setShowFilters(!showFilters)}
                            color={showFilters ? 'primary' : 'default'}
                        >
                            <FilterList fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Button
                        size="small"
                        color="error"
                        onClick={handleClearHistory}
                        startIcon={<Delete />}
                        sx={{ textTransform: 'none' }}
                    >
                        Clear
                    </Button>
                </Box>
            </Box>

            {/* Search and Filters */}
            <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <TextField
                    size="small"
                    placeholder="Search by URL or error..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: <Search sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />,
                    }}
                    sx={{ backgroundColor: '#ffffff' }}
                />
                
                {showFilters && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <FormControl size="small" sx={{ minWidth: 100 }}>
                            <InputLabel>Method</InputLabel>
                            <Select
                                value={methodFilter}
                                label="Method"
                                onChange={(e) => setMethodFilter(e.target.value)}
                            >
                                <MenuItem value="">All</MenuItem>
                                <MenuItem value="GET">GET</MenuItem>
                                <MenuItem value="POST">POST</MenuItem>
                                <MenuItem value="PUT">PUT</MenuItem>
                                <MenuItem value="DELETE">DELETE</MenuItem>
                                <MenuItem value="PATCH">PATCH</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={statusFilter}
                                label="Status"
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <MenuItem value="">All</MenuItem>
                                <MenuItem value="200">2xx Success</MenuItem>
                                <MenuItem value="400">4xx Client Error</MenuItem>
                                <MenuItem value="500">5xx Server Error</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                )}
            </Box>

            {history.length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                    {loading ? 'Loading history...' : 'No request history found. Send some requests to see them here.'}
                </Alert>
            ) : (
                <List dense>
                    {history.map((item) => (
                        <React.Fragment key={item.id}>
                            <ListItem
                                sx={{
                                    borderRadius: 1,
                                    mb: 1,
                                    backgroundColor: 'rgba(0,0,0,0.02)',
                                    border: '1px solid rgba(0,0,0,0.05)',
                                    '&:hover': {
                                        backgroundColor: 'rgba(34,197,94,0.05)',
                                        borderColor: 'rgba(34,197,94,0.2)',
                                    },
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <ListItemText
                                    primary={
                                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Chip
                                                label={item.method}
                                                size="small"
                                                color={getMethodColor(item.method)}
                                                sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600 }}
                                            />
                                            <Typography 
                                                component="span" 
                                                variant="body2" 
                                                noWrap 
                                                sx={{ 
                                                    flexGrow: 1,
                                                    fontWeight: 500,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                            >
                                                {item.url}
                                            </Typography>
                                        </Box>
                                    }
                                    secondary={
                                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                                            <Schedule sx={{ fontSize: 12, color: 'text.secondary' }} />
                                            <Typography component="span" variant="caption" color="text.secondary">
                                                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                                            </Typography>
                                            {item.statusCode && (
                                                <Chip
                                                    label={item.statusCode}
                                                    size="small"
                                                    variant="outlined"
                                                    color={getStatusColor(item.statusCode)}
                                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                                />
                                            )}
                                            {item.responseTime > 0 && (
                                                <Typography variant="caption" color="text.secondary">
                                                    {item.responseTime}ms
                                                </Typography>
                                            )}
                                            {item.errorMessage && (
                                                <Typography 
                                                    variant="caption" 
                                                    sx={{ 
                                                        color: 'error.main',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        maxWidth: 200,
                                                    }}
                                                >
                                                    {item.errorMessage}
                                                </Typography>
                                            )}
                                        </Box>
                                    }
                                />
                                <ListItemSecondaryAction>
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                        <Tooltip title="Replay request">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleReplayRequest(item)}
                                                sx={{
                                                    color: '#22c55e',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(34,197,94,0.1)',
                                                    },
                                                }}
                                            >
                                                <PlayArrow fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDeleteItem(item.id)}
                                                sx={{
                                                    color: '#ef4444',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(239,68,68,0.1)',
                                                    },
                                                }}
                                            >
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </ListItemSecondaryAction>
                            </ListItem>
                        </React.Fragment>
                    ))}
                </List>
            )}
        </Box>
    );
};

export default HistoryPanel;
