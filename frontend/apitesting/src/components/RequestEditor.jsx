import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    Typography,
    Tabs,
    Tab,
    IconButton,
    Chip,
    Alert,
    CircularProgress,
    Badge,
    Divider,
} from '@mui/material';
import {
    Add,
    Delete,
    Send,
    Code,
    MonitorHeart,
    VpnKey,
    Http,
} from '@mui/icons-material';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/theme-github';
import { useTheme } from '../context/ThemeContext';
import { useApiStore } from '../store/apiStore';
import { apiService } from '../services/apiService';
import CreateMonitorDialog from './CreateMonitorDialog';
import { validateUrl } from '../utils/validators';
import toast from 'react-hot-toast';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

const RequestEditor = ({ tabId }) => {
    const { isDarkMode } = useTheme();
    const {
        getRequestById,
        updateRequest,
        addHeader,
        updateHeader,
        removeHeader,
        addParam,
        updateParam,
        removeParam,
        setResponse,
        addToHistory,
        setLoading,
        isLoading,
    } = useApiStore();

    const request = getRequestById(tabId);
    
    // Helper function to normalize headers/params to arrays
    const normalizeToArray = (value, defaultValue = []) => {
        if (Array.isArray(value)) {
            return value;
        }
        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value);
                return Array.isArray(parsed) ? parsed : defaultValue;
            } catch {
                return defaultValue;
            }
        }
        if (typeof value === 'object' && value !== null) {
            return Object.entries(value).map(([key, val]) => ({ 
                key: String(key), 
                value: String(val) 
            }));
        }
        return defaultValue;
    };
    
    const [url, setUrl] = useState(request?.url || '');
    const [method, setMethod] = useState(request?.method || 'GET');
    const [body, setBody] = useState(request?.body || '');
    const [activeTab, setActiveTab] = useState(0);
    const [monitorDialogOpen, setMonitorDialogOpen] = useState(false);
    const [bearerToken, setBearerToken] = useState('');
    const [urlError, setUrlError] = useState('');

    useEffect(() => {
        if (request) {
            // Normalize headers and params if they're not arrays
            const normalizedHeaders = normalizeToArray(request.headers, []);
            const normalizedParams = normalizeToArray(request.params, []);
            
            // Update store if normalization was needed
            if (!Array.isArray(request.headers) || !Array.isArray(request.params)) {
                updateRequest(tabId, {
                    headers: normalizedHeaders,
                    params: normalizedParams,
                });
            }
            
            setUrl(request.url || '');
            setMethod(request.method || 'GET');
            setBody(request.body || '');
            
            // Extract bearer token from headers
            const authHeader = normalizedHeaders.find(h => 
                h && h.key && h.value &&
                h.key.toLowerCase() === 'authorization' && 
                h.value.toLowerCase().startsWith('bearer ')
            );
            setBearerToken(authHeader ? authHeader.value.replace(/^Bearer\s+/i, '') : '');
            
            // Reset to Params tab if switching from POST/PUT/PATCH to GET
            if ((request.method === 'GET' || request.method === 'DELETE' || request.method === 'HEAD') && activeTab === 2) {
                setActiveTab(0);
            }
        }
    }, [request, activeTab, tabId, updateRequest]);

    const handleUrlChange = (event) => {
        const newUrl = event.target.value;
        setUrl(newUrl);
        
        // Validate URL in real-time (only show error if user has typed something)
        if (newUrl.trim()) {
            const validation = validateUrl(newUrl);
            if (!validation.valid) {
                setUrlError(validation.error || 'Invalid URL');
            } else {
                setUrlError('');
            }
        } else {
            setUrlError('');
        }
        
        updateRequest(tabId, { url: newUrl });
    };

    const handleMethodChange = (event) => {
        const newMethod = event.target.value;
        setMethod(newMethod);
        updateRequest(tabId, { method: newMethod });
    };

    const handleBodyChange = (value) => {
        setBody(value);
        updateRequest(tabId, { body: value });
    };

    const handleSendRequest = async () => {
        if (!url.trim()) {
            toast.error('Please enter a URL');
            return;
        }

        // Validate URL before sending request
        const urlValidation = validateUrl(url);
        if (!urlValidation.valid) {
            toast.error(urlValidation.error || 'Invalid URL');
            setUrlError(urlValidation.error || 'Invalid URL');
            return;
        }

        // Validate JSON body for POST, PUT, PATCH methods
        if ((method === 'POST' || method === 'PUT' || method === 'PATCH') && body.trim()) {
            try {
                JSON.parse(body);
            } catch {
                toast.error('Body must be valid JSON format for POST/PUT/PATCH requests');
                return;
            }
        }

        // For POST, PUT, PATCH, body must be provided (cannot be empty)
        if ((method === 'POST' || method === 'PUT' || method === 'PATCH') && !body.trim()) {
            toast.error('Body is required for POST, PUT, and PATCH requests and must be valid JSON');
            return;
        }

        setLoading(true);

        try {
            // Normalize headers and params
            const normalizedHeaders = normalizeToArray(request.headers, []);
            const normalizedParams = normalizeToArray(request.params, []);
            
            // Prepare headers
            const headers = {};
            normalizedHeaders.forEach(({ key, value }) => {
                if (key && value && key.trim() && value.trim()) {
                    headers[key.trim()] = value.trim();
                }
            });

            // Ensure Content-Type is set to application/json for POST/PUT/PATCH
            if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
                headers['Content-Type'] = 'application/json';
            }

            // Prepare query parameters
            const queryParams = new URLSearchParams();
            normalizedParams.forEach(({ key, value }) => {
                if (key && value && key.trim() && value.trim()) {
                    queryParams.append(key.trim(), value.trim());
                }
            });

            const queryString = queryParams.toString();
            const fullUrl = queryString ? `${url}${url.includes('?') ? '&' : '?'}${queryString}` : url;

            // Prepare request data - parse JSON body
            let parsedBody = undefined;
            if (body.trim()) {
                try {
                    parsedBody = JSON.parse(body);
                } catch {
                    toast.error('Invalid JSON format in body');
                    setLoading(false);
                    return;
                }
            }

            const requestData = {
                method,
                url: fullUrl,
                headers,
                body: parsedBody,
            };

            const startTime = performance.now();
            const response = await apiService.testApi(requestData);
            const endTime = performance.now();
            const responseTime = Math.round(endTime - startTime);

            // Format response
            const formattedResponse = {
                status: response.status,
                statusText: response.statusText,
                data: response.data,
                headers: response.headers,
                responseTime,
                size: formatResponseSize(JSON.stringify(response.data).length),
                error: null,
            };

            setResponse(tabId, formattedResponse);
            addToHistory(requestData, formattedResponse);

            toast.success(`Request completed in ${responseTime}ms`);
        } catch (error) {
            const errorResponse = {
                status: error.response?.status || null,
                statusText: error.response?.statusText || 'Error',
                data: error.response?.data || { error: error.message },
                headers: error.response?.headers || {},
                responseTime: 0,
                size: '0 B',
                error: error.message,
            };

            setResponse(tabId, errorResponse);
            addToHistory(request, errorResponse);

            toast.error(`Request failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const formatResponseSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const addNewHeader = () => {
        addHeader(tabId);
    };

    const addNewParam = () => {
        addParam(tabId);
    };

    if (!request) return null;

    const headers = normalizeToArray(request.headers, []);
    const params = normalizeToArray(request.params, []);
    
    const headersCount = headers.filter(h => h && (h.key?.trim() || h.value?.trim())).length;
    const paramsCount = params.filter(p => p && (p.key?.trim() || p.value?.trim())).length;

    return (
        <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'hidden', 
            backgroundColor: '#ffffff',
            position: 'relative',
        }}>
            {/* Method and URL Bar */}
            <Box sx={{ 
                p: 2, 
                borderBottom: '1px solid rgba(0,0,0,0.08)', 
                display: 'flex', 
                gap: 1.5, 
                alignItems: 'center',
                backgroundColor: '#fafafa',
            }}>
                <FormControl sx={{ minWidth: 110 }}>
                    <Select
                        value={method}
                        onChange={handleMethodChange}
                        sx={{
                            height: 40,
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(0,0,0,0.2)',
                            },
                        }}
                    >
                        {HTTP_METHODS.map((httpMethod) => (
                            <MenuItem key={httpMethod} value={httpMethod}>
                                <Chip
                                    label={httpMethod}
                                    size="small"
                                    color={httpMethod === 'GET' ? 'success' :
                                        httpMethod === 'POST' ? 'primary' :
                                            httpMethod === 'PUT' ? 'warning' :
                                                httpMethod === 'DELETE' ? 'error' : 'default'}
                                />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField
                    fullWidth
                    value={url}
                    onChange={handleUrlChange}
                    placeholder="https://api.example.com/endpoint"
                    variant="outlined"
                    error={!!urlError}
                    helperText={urlError || 'Enter a valid URL with http:// or https://'}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            height: 40,
                            fontSize: '0.875rem',
                        },
                    }}
                />

                {/* Send Button */}
                <Button
                    variant="contained"
                    onClick={handleSendRequest}
                    disabled={isLoading || !url.trim() || !!urlError}
                    sx={{
                        minWidth: 110,
                        height: 40,
                        backgroundColor: '#22c55e',
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(34,197,94,0.3)',
                        '&:hover': {
                            backgroundColor: '#16a34a',
                            boxShadow: '0 4px 12px rgba(34,197,94,0.4)',
                        },
                        '&:disabled': {
                            backgroundColor: 'rgba(0,0,0,0.12)',
                            boxShadow: 'none',
                        },
                    }}
                    startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <Send />}
                >
                    {isLoading ? 'Sending...' : 'Send'}
                </Button>
            </Box>

            {/* Tabs for Request Configuration */}
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
                            minWidth: 120,
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
                    <Tab label="Params" icon={paramsCount > 0 ? <Badge badgeContent={paramsCount} color="primary"><Http /></Badge> : <Http />} iconPosition="start" />
                    <Tab label="Headers" icon={headersCount > 0 ? <Badge badgeContent={headersCount} color="primary"><VpnKey /></Badge> : <VpnKey />} iconPosition="start" />
                    {(method === 'POST' || method === 'PUT' || method === 'PATCH') && (
                        <Tab label="Body" icon={<Code />} iconPosition="start" />
                    )}
                </Tabs>
            </Box>

            {/* Tab Content */}
            <Box sx={{ 
                flexGrow: 1, 
                overflow: 'auto', 
                p: 2,
                minHeight: 0,
            }}>
                {/* Params Tab */}
                {activeTab === 0 && (
                    <Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {params.map((param, index) => (
                                <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                                    <TextField
                                        placeholder="Key"
                                        value={param.key}
                                        onChange={(e) => updateParam(tabId, index, e.target.value, param.value)}
                                        size="small"
                                        sx={{ flex: 1 }}
                                    />
                                    <TextField
                                        placeholder="Value"
                                        value={param.value}
                                        onChange={(e) => updateParam(tabId, index, param.key, e.target.value)}
                                        size="small"
                                        sx={{ flex: 2 }}
                                    />
                                    <IconButton
                                        size="small"
                                        onClick={() => removeParam(tabId, index)}
                                        color="error"
                                    >
                                        <Delete />
                                    </IconButton>
                                </Box>
                            ))}
                            <Button
                                startIcon={<Add />}
                                onClick={addNewParam}
                                variant="outlined"
                                size="small"
                                sx={{ 
                                    alignSelf: 'flex-start', 
                                    mt: 1,
                                    textTransform: 'none',
                                    borderColor: '#22c55e',
                                    color: '#22c55e',
                                    '&:hover': {
                                        borderColor: '#16a34a',
                                        color: '#16a34a',
                                        backgroundColor: 'rgba(34,197,94,0.05)',
                                    },
                                }}
                            >
                                Add Parameter
                            </Button>
                        </Box>
                    </Box>
                )}

                {/* Headers Tab */}
                {activeTab === 1 && (
                    <Box>
                        {/* Bearer Token Quick Input */}
                        <Box sx={{ mb: 3, p: 2, backgroundColor: '#f9fafb', borderRadius: 2, border: '1px solid rgba(34,197,94,0.2)' }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#1f2937' }}>
                                Bearer Token (Quick Add)
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <TextField
                                    fullWidth
                                    placeholder="Enter bearer token (token will be prefixed with 'Bearer ')"
                                    size="small"
                                    type="password"
                                    value={bearerToken}
                                    onChange={(e) => {
                                        const token = e.target.value.trim();
                                        setBearerToken(token);
                                        
                                        const authIndex = headers.findIndex(h => 
                                            h && h.key && h.key.toLowerCase() === 'authorization'
                                        );
                                        
                                        if (token) {
                                            const bearerValue = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
                                            if (authIndex >= 0) {
                                                // Update existing Authorization header
                                                updateHeader(tabId, authIndex, 'Authorization', bearerValue);
                                            } else {
                                                // Add new Authorization header
                                                addHeader(tabId);
                                                setTimeout(() => {
                                                    const updatedRequest = useApiStore.getState().getRequestById(tabId);
                                                    const newAuthIndex = updatedRequest.headers.length - 1;
                                                    updateHeader(tabId, newAuthIndex, 'Authorization', bearerValue);
                                                }, 10);
                                            }
                                        } else if (authIndex >= 0) {
                                            // Remove Authorization header if token is cleared
                                            removeHeader(tabId, authIndex);
                                        }
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            backgroundColor: '#ffffff',
                                        },
                                    }}
                                />
                                <IconButton
                                    size="small"
                                    onClick={() => {
                                        setBearerToken('');
                                        const authIndex = headers.findIndex(h => 
                                            h && h.key && h.key.toLowerCase() === 'authorization'
                                        );
                                        if (authIndex >= 0) {
                                            removeHeader(tabId, authIndex);
                                        }
                                    }}
                                    sx={{ 
                                        color: '#ef4444',
                                        '&:hover': {
                                            backgroundColor: 'rgba(239,68,68,0.1)',
                                        },
                                    }}
                                    title="Clear Bearer Token"
                                >
                                    <Delete fontSize="small" />
                                </IconButton>
                            </Box>
                            <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#6b7280' }}>
                                Enter your token here for quick setup. It will be automatically formatted as "Bearer &lt;token&gt;"
                            </Typography>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#1f2937' }}>
                            Custom Headers
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {headers
                                .filter(h => h && h.key && h.value && (h.key.toLowerCase() !== 'authorization' || !h.value.toLowerCase().startsWith('bearer ')))
                                .map((header, index) => {
                                    // Map original index
                                    const originalIndex = headers.findIndex(h => 
                                        h && h.key === header.key && h.value === header.value
                                    );
                                    return (
                                        <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                                            <TextField
                                                placeholder="Header name (e.g., X-API-Key)"
                                                value={header.key}
                                                onChange={(e) => updateHeader(tabId, originalIndex, e.target.value, header.value)}
                                                size="small"
                                                sx={{ flex: 1 }}
                                            />
                                            <TextField
                                                placeholder="Header value"
                                                value={header.value}
                                                onChange={(e) => updateHeader(tabId, originalIndex, header.key, e.target.value)}
                                                size="small"
                                                sx={{ flex: 2 }}
                                            />
                                            <IconButton
                                                size="small"
                                                onClick={() => removeHeader(tabId, originalIndex)}
                                                color="error"
                                            >
                                                <Delete />
                                            </IconButton>
                                        </Box>
                                    );
                                })}
                            <Button
                                startIcon={<Add />}
                                onClick={addNewHeader}
                                variant="outlined"
                                size="small"
                                sx={{ 
                                    alignSelf: 'flex-start', 
                                    mt: 1,
                                    textTransform: 'none',
                                    borderColor: '#22c55e',
                                    color: '#22c55e',
                                    '&:hover': {
                                        borderColor: '#16a34a',
                                        color: '#16a34a',
                                        backgroundColor: 'rgba(34,197,94,0.05)',
                                    },
                                }}
                            >
                                Add Header
                            </Button>
                        </Box>
                    </Box>
                )}

                {/* Body Tab */}
                {activeTab === 2 && (method === 'POST' || method === 'PUT' || method === 'PATCH') && (
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Alert severity="info" sx={{ mb: 2, fontSize: '0.875rem' }}>
                            Body must be valid JSON format for {method} requests. Content-Type will be automatically set to application/json.
                        </Alert>
                        <Box sx={{ flexGrow: 1, minHeight: 300 }}>
                            <AceEditor
                                mode="json"
                                theme={isDarkMode ? 'monokai' : 'github'}
                                value={body}
                                onChange={handleBodyChange}
                                name="request-body"
                                editorProps={{ $blockScrolling: true }}
                                width="100%"
                                height="100%"
                                fontSize={14}
                                showPrintMargin={false}
                                wrapEnabled={true}
                            />
                        </Box>
                    </Box>
                )}
            </Box>

            {/* Create Monitor Button (Bottom) */}
            {url.trim() && (
                <Box sx={{ 
                    p: 2, 
                    borderTop: '1px solid rgba(0,0,0,0.08)', 
                    display: 'flex', 
                    justifyContent: 'center',
                    backgroundColor: '#fafafa',
                }}>
                    <Button
                        variant="outlined"
                        startIcon={<MonitorHeart />}
                        onClick={() => setMonitorDialogOpen(true)}
                        sx={{
                            textTransform: 'none',
                            borderColor: '#22c55e',
                            color: '#22c55e',
                            fontWeight: 500,
                            px: 3,
                            '&:hover': {
                                borderColor: '#16a34a',
                                color: '#16a34a',
                                backgroundColor: 'rgba(34,197,94,0.05)',
                            },
                        }}
                    >
                        Create Monitor
                    </Button>
                </Box>
            )}

            {/* Create Monitor Dialog */}
            <CreateMonitorDialog
                open={monitorDialogOpen}
                onClose={() => setMonitorDialogOpen(false)}
                requestData={{
                    id: request?.id,
                    name: request?.name || `${method} ${url}`,
                    method,
                    url,
                    headers: headers,
                    body,
                    params: params
                }}
            />
        </Box>
    );
};

export default RequestEditor;
