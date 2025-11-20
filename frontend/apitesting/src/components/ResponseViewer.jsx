import React, { useState } from 'react';
import {
    Box,
    Typography,
    Chip,
    Tabs,
    Tab,
    IconButton,
    Alert,
    CircularProgress,
    Tooltip,
} from '@mui/material';
import {
    ContentCopy,
    CheckCircle,
    Error,
    Warning,
    Info,
} from '@mui/icons-material';
// Simple JSON formatting function
const formatJson = (data) => {
    try {
        return JSON.stringify(data, null, 2);
    } catch {
        return String(data);
    }
};
import { useTheme } from '../context/ThemeContext';
import { useApiStore } from '../store/apiStore';
import toast from 'react-hot-toast';

const ResponseViewer = ({ tabId }) => {
    const { isDarkMode } = useTheme();
    const { getResponseById, isLoading } = useApiStore();
    const [activeTab, setActiveTab] = useState(0);
    const [, setCopied] = useState(false);

    const response = getResponseById(tabId);

    const getStatusColor = (status) => {
        if (!status) return 'default';
        if (status >= 200 && status < 300) return 'success';
        if (status >= 300 && status < 400) return 'info';
        if (status >= 400 && status < 500) return 'warning';
        if (status >= 500) return 'error';
        return 'default';
    };

    const getStatusIcon = (status) => {
        if (!status) return <Info />;
        if (status >= 200 && status < 300) return <CheckCircle />;
        if (status >= 300 && status < 400) return <Info />;
        if (status >= 400 && status < 500) return <Warning />;
        if (status >= 500) return <Error />;
        return <Info />;
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            toast.success('Copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Failed to copy to clipboard');
        }
    };

    const formatHeaders = (headers) => {
        return Object.entries(headers).map(([key, value]) => `${key}: ${value}`).join('\n');
    };


    if (isLoading) {
        return (
            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' }}>
                <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress size={60} />
                    <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
                        Sending request...
                    </Typography>
                </Box>
            </Box>
        );
    }

    if (!response || !response.timestamp) {
        return (
            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' }}>
                <Box sx={{ textAlign: 'center', p: 4 }}>
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                        No response yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Click Send to get a response
                    </Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'hidden', 
            backgroundColor: '#ffffff',
            position: 'relative',
        }}>
                {/* Response Header */}
            <Box sx={{ 
                p: 2, 
                borderBottom: '1px solid rgba(0,0,0,0.08)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                backgroundColor: '#fafafa',
            }}>
                <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, color: '#1f2937' }}>Response</Typography>
                    {response.status && (
                        <Chip
                            icon={getStatusIcon(response.status)}
                        label={`${response.status} ${response.statusText || ''}`}
                            color={getStatusColor(response.status)}
                            variant="outlined"
                        size="small"
                        />
                    )}
                    {response.responseTime > 0 && (
                        <Chip
                            label={`${response.responseTime}ms`}
                            variant="outlined"
                            size="small"
                        />
                    )}
                    {response.size && (
                        <Chip
                            label={response.size}
                            variant="outlined"
                            size="small"
                        />
                    )}
                </Box>

                {/* Error Alert */}
                {response.error && (
                <Box sx={{ px: 2, pt: 2 }}>
                    <Alert severity="error" sx={{ fontSize: '0.875rem' }}>
                        {response.error}
                    </Alert>
                </Box>
                )}

                {/* Response Tabs */}
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, backgroundColor: '#ffffff' }}>
                    <Tabs
                        value={activeTab}
                        onChange={(e, newValue) => setActiveTab(newValue)}
                        sx={{
                            minHeight: 48,
                            '& .MuiTab-root': {
                                minHeight: 48,
                                textTransform: 'none',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                minWidth: 100,
                                px: 2,
                                '&:hover': {
                                    backgroundColor: 'rgba(34,197,94,0.05)',
                                },
                            },
                            '& .Mui-selected': {
                                color: '#22c55e',
                                fontWeight: 600,
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: '#22c55e',
                                height: 3,
                            },
                        }}
                    >
                        <Tab label="Body" />
                        <Tab label="Headers" />
                        <Tab label="Raw" />
                    </Tabs>
                </Box>

                <Box sx={{ 
                    flexGrow: 1, 
                    overflow: 'auto', 
                    position: 'relative', 
                    p: 2,
                    minHeight: 0,
                }}>
                        {/* Body Tab */}
                        {activeTab === 0 && (
                            <Box sx={{ height: '100%', position: 'relative' }}>
                                <Tooltip title="Copy response">
                                    <IconButton
                                        sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
                                        onClick={() => copyToClipboard(formatJson(response.data))}
                                    size="small"
                                    >
                                    <ContentCopy fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Box
                                    component="pre"
                                    sx={{
                                        margin: 0,
                                        height: '100%',
                                    fontSize: '13px',
                                        padding: 2,
                                        backgroundColor: isDarkMode ? '#1e1e1e' : '#f5f5f5',
                                        color: isDarkMode ? '#ffffff' : '#212121',
                                        overflow: 'auto',
                                        fontFamily: 'monospace',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                    borderRadius: 1,
                                    }}
                                >
                                    {formatJson(response.data)}
                                </Box>
                            </Box>
                        )}

                        {/* Headers Tab */}
                        {activeTab === 1 && (
                            <Box sx={{ height: '100%', position: 'relative' }}>
                                <Tooltip title="Copy headers">
                                    <IconButton
                                        sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
                                        onClick={() => copyToClipboard(formatHeaders(response.headers))}
                                    size="small"
                                    >
                                    <ContentCopy fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Box
                                    component="pre"
                                    sx={{
                                        margin: 0,
                                        height: '100%',
                                    fontSize: '13px',
                                        padding: 2,
                                        backgroundColor: isDarkMode ? '#1e1e1e' : '#f5f5f5',
                                        color: isDarkMode ? '#ffffff' : '#212121',
                                        overflow: 'auto',
                                        fontFamily: 'monospace',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                    borderRadius: 1,
                                    }}
                                >
                                    {formatHeaders(response.headers)}
                                </Box>
                            </Box>
                        )}

                        {/* Raw Tab */}
                        {activeTab === 2 && (
                            <Box sx={{ height: '100%', position: 'relative' }}>
                                <Tooltip title="Copy raw response">
                                    <IconButton
                                        sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
                                        onClick={() => copyToClipboard(JSON.stringify(response, null, 2))}
                                    size="small"
                                    >
                                    <ContentCopy fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Box
                                    component="pre"
                                    sx={{
                                        margin: 0,
                                        height: '100%',
                                    fontSize: '13px',
                                        padding: 2,
                                        backgroundColor: isDarkMode ? '#1e1e1e' : '#f5f5f5',
                                        color: isDarkMode ? '#ffffff' : '#212121',
                                        overflow: 'auto',
                                        fontFamily: 'monospace',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                    borderRadius: 1,
                                    }}
                                >
                                    {JSON.stringify(response, null, 2)}
                                </Box>
                            </Box>
                        )}
                    </Box>
                </Box>
        </Box>
    );
};

export default ResponseViewer;
