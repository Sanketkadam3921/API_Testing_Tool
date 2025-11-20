import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Paper,
    Chip,
    IconButton,
    Tooltip,
    Grid,
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    FormControlLabel,
    Alert,
    CircularProgress,
} from '@mui/material';
import {
    PlayArrow,
    Stop,
    Send,
    Clear,
    Download,
    Refresh,
    CheckCircle,
    Error as ErrorIcon,
    Warning,
    Link as LinkIcon,
    LinkOff,
} from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const WebSocketTester = () => {
    const { isDarkMode } = useTheme();
    const [url, setUrl] = useState('wss://echo.websocket.org');
    const [protocols, setProtocols] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, connecting, connected, error
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [messageType, setMessageType] = useState('text'); // text, json, binary
    const [autoReconnect, setAutoReconnect] = useState(false);
    const [reconnectInterval, setReconnectInterval] = useState(3000);
    const [reconnectAttempts, setReconnectAttempts] = useState(0);
    const [maxReconnectAttempts, setMaxReconnectAttempts] = useState(5);
    const [messageHistory, setMessageHistory] = useState([]);
    const [binaryFormat, setBinaryFormat] = useState('base64'); // base64, hex, array

    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const messageIdCounter = useRef(0);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, []);

    const addMessage = useCallback((message, type = 'received', direction = 'incoming') => {
        const id = ++messageIdCounter.current;
        const timestamp = new Date().toISOString();
        const newMessage = {
            id,
            message,
            type,
            direction,
            timestamp,
            formattedTime: new Date(timestamp).toLocaleTimeString(),
        };
        setMessages((prev) => [newMessage, ...prev].slice(0, 100)); // Keep last 100 messages
        setMessageHistory((prev) => [newMessage, ...prev].slice(0, 500)); // Keep last 500 in history
    }, []);

    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            toast.error('Already connected');
            return;
        }

        if (!url.trim()) {
            toast.error('Please enter a WebSocket URL');
            return;
        }

        // Validate URL format
        const trimmedUrl = url.trim();
        if (!trimmedUrl.startsWith('ws://') && !trimmedUrl.startsWith('wss://')) {
            toast.error('WebSocket URL must start with ws:// or wss://');
            return;
        }

        try {
            setConnectionStatus('connecting');
            setReconnectAttempts(0);

            const protocolsArray = protocols.trim() ? protocols.split(',').map(p => p.trim()) : undefined;
            const ws = new WebSocket(trimmedUrl, protocolsArray);
            wsRef.current = ws;

            // Set a timeout for connection
            const connectionTimeout = setTimeout(() => {
                if (ws.readyState !== WebSocket.OPEN) {
                    ws.close();
                    setConnectionStatus('error');
                    addMessage('Connection timeout - server did not respond', 'error', 'system');
                    toast.error('Connection timeout');
                }
            }, 10000); // 10 second timeout

            ws.onopen = () => {
                clearTimeout(connectionTimeout);
                setIsConnected(true);
                setConnectionStatus('connected');
                setReconnectAttempts(0);
                addMessage('Connected successfully', 'system', 'system');
                toast.success('WebSocket connected');
            };

            ws.onmessage = (event) => {
                let messageData;
                let messageType = 'text';

                if (event.data instanceof Blob) {
                    // Binary message
                    messageType = 'binary';
                    const reader = new FileReader();
                    reader.onload = () => {
                        const result = reader.result;
                        let formatted;
                        if (binaryFormat === 'base64') {
                            formatted = btoa(String.fromCharCode(...new Uint8Array(result)));
                        } else if (binaryFormat === 'hex') {
                            formatted = Array.from(new Uint8Array(result))
                                .map(b => b.toString(16).padStart(2, '0'))
                                .join(' ');
                        } else {
                            formatted = Array.from(new Uint8Array(result)).join(', ');
                        }
                        addMessage(`[Binary] ${formatted}`, 'received', 'incoming');
                    };
                    reader.readAsArrayBuffer(event.data);
                } else if (event.data instanceof ArrayBuffer) {
                    // ArrayBuffer
                    messageType = 'binary';
                    let formatted;
                    if (binaryFormat === 'base64') {
                        formatted = btoa(String.fromCharCode(...new Uint8Array(event.data)));
                    } else if (binaryFormat === 'hex') {
                        formatted = Array.from(new Uint8Array(event.data))
                            .map(b => b.toString(16).padStart(2, '0'))
                            .join(' ');
                    } else {
                        formatted = Array.from(new Uint8Array(event.data)).join(', ');
                    }
                    addMessage(`[Binary] ${formatted}`, 'received', 'incoming');
                } else {
                    // Text message
                    try {
                        const parsed = JSON.parse(event.data);
                        messageData = JSON.stringify(parsed, null, 2);
                        messageType = 'json';
                    } catch {
                        messageData = event.data;
                    }
                    addMessage(messageData, messageType === 'json' ? 'json' : 'text', 'incoming');
                }
            };

            ws.onerror = (error) => {
                clearTimeout(connectionTimeout);
                setConnectionStatus('error');
                
                // Try to get more information about the error
                let errorMessage = 'Connection error occurred';
                const readyState = ws.readyState;
                
                if (readyState === WebSocket.CLOSED || readyState === WebSocket.CLOSING) {
                    errorMessage = 'Failed to establish connection. The server may be unreachable or the URL may be incorrect.';
                } else if (readyState === WebSocket.CONNECTING) {
                    errorMessage = 'Connection failed during handshake. Check if the server supports WebSocket connections.';
                }
                
                // Check for common issues
                if (trimmedUrl.includes('echo.websocket.events')) {
                    errorMessage += ' Note: echo.websocket.events may require specific protocols or may be temporarily unavailable.';
                }
                
                addMessage(errorMessage, 'error', 'system');
                toast.error(errorMessage);
                console.error('WebSocket error:', {
                    error,
                    readyState,
                    url: trimmedUrl,
                    readyStateText: ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'][readyState]
                });
            };

            ws.onclose = (event) => {
                clearTimeout(connectionTimeout);
                setIsConnected(false);
                setConnectionStatus('disconnected');
                
                // Provide more detailed close information
                let closeMessage = `Connection closed. Code: ${event.code}`;
                if (event.reason) {
                    closeMessage += `, Reason: ${event.reason}`;
                }
                
                // Common close codes
                const closeCodeMessages = {
                    1000: 'Normal closure',
                    1001: 'Going away',
                    1002: 'Protocol error',
                    1003: 'Unsupported data',
                    1006: 'Abnormal closure (no close frame)',
                    1007: 'Invalid data',
                    1008: 'Policy violation',
                    1009: 'Message too big',
                    1010: 'Extension error',
                    1011: 'Internal server error',
                };
                
                if (closeCodeMessages[event.code]) {
                    closeMessage += ` (${closeCodeMessages[event.code]})`;
                }
                
                if (event.code === 1006) {
                    closeMessage += ' - This usually means the connection was refused or the server is unreachable.';
                }
                
                addMessage(closeMessage, 'system', 'system');
                
                // Only show toast if it wasn't a manual disconnect
                if (event.code !== 1000) {
                    toast.error('WebSocket disconnected');
                }

                // Auto-reconnect logic
                if (autoReconnect && reconnectAttempts < maxReconnectAttempts) {
                    const attempts = reconnectAttempts + 1;
                    setReconnectAttempts(attempts);
                    addMessage(
                        `Attempting to reconnect... (${attempts}/${maxReconnectAttempts})`,
                        'system',
                        'system'
                    );
                    reconnectTimeoutRef.current = setTimeout(() => {
                        connect();
                    }, reconnectInterval);
                } else if (autoReconnect && reconnectAttempts >= maxReconnectAttempts) {
                    addMessage('Max reconnection attempts reached', 'error', 'system');
                    toast.error('Max reconnection attempts reached');
                }
            };
        } catch (error) {
            setConnectionStatus('error');
            const errorMsg = error.message || 'Unknown error occurred';
            addMessage(`Connection failed: ${errorMsg}`, 'error', 'system');
            toast.error(`Connection failed: ${errorMsg}`);
            console.error('WebSocket connection error:', {
                error,
                message: error.message,
                stack: error.stack,
                url: trimmedUrl
            });
        }
    }, [url, protocols, autoReconnect, reconnectInterval, reconnectAttempts, maxReconnectAttempts, binaryFormat, addMessage]);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        setIsConnected(false);
        setConnectionStatus('disconnected');
        setReconnectAttempts(0);
        addMessage('Disconnected manually', 'system', 'system');
    }, [addMessage]);

    const sendMessage = useCallback(() => {
        if (!isConnected || wsRef.current?.readyState !== WebSocket.OPEN) {
            toast.error('Not connected to WebSocket');
            return;
        }

        if (!messageInput.trim() && messageType !== 'binary') {
            toast.error('Please enter a message');
            return;
        }

        try {
            let dataToSend;

            if (messageType === 'json') {
                try {
                    const parsed = JSON.parse(messageInput);
                    dataToSend = JSON.stringify(parsed);
                } catch {
                    toast.error('Invalid JSON format');
                    return;
                }
            } else if (messageType === 'binary') {
                // For binary, we'll send as text that can be converted
                // In a real scenario, you'd want a file picker or hex/base64 input
                try {
                    if (binaryFormat === 'base64') {
                        if (!messageInput.trim()) {
                            toast.error('Please enter base64 data');
                            return;
                        }
                        const binaryString = atob(messageInput.trim());
                        const bytes = new Uint8Array(binaryString.length);
                        for (let i = 0; i < binaryString.length; i++) {
                            bytes[i] = binaryString.charCodeAt(i);
                        }
                        dataToSend = bytes.buffer;
                    } else if (binaryFormat === 'hex') {
                        if (!messageInput.trim()) {
                            toast.error('Please enter hex data');
                            return;
                        }
                        const hex = messageInput.replace(/\s+/g, '').trim();
                        if (hex.length % 2 !== 0) {
                            toast.error('Hex string must have even number of characters');
                            return;
                        }
                        const bytes = new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
                        dataToSend = bytes.buffer;
                    } else {
                        if (!messageInput.trim()) {
                            toast.error('Please enter comma-separated byte values');
                            return;
                        }
                        const numbers = messageInput.split(',').map(n => {
                            const num = parseInt(n.trim());
                            if (isNaN(num) || num < 0 || num > 255) {
                                throw new Error(`Invalid byte value: ${n.trim()}`);
                            }
                            return num;
                        });
                        const bytes = new Uint8Array(numbers);
                        dataToSend = bytes.buffer;
                    }
                } catch (error) {
                    toast.error(`Invalid binary format: ${error.message}`);
                    return;
                }
            } else {
                dataToSend = messageInput;
            }

            wsRef.current.send(dataToSend);
            addMessage(messageInput, messageType === 'json' ? 'json' : messageType === 'binary' ? 'binary' : 'text', 'outgoing');
            setMessageInput('');
            toast.success('Message sent');
        } catch (error) {
            toast.error(`Failed to send message: ${error.message}`);
            addMessage(`Send error: ${error.message}`, 'error', 'system');
        }
    }, [isConnected, messageInput, messageType, binaryFormat, addMessage]);

    const clearMessages = () => {
        setMessages([]);
        toast.success('Messages cleared');
    };

    const exportMessages = () => {
        const dataStr = JSON.stringify(messageHistory, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `websocket-messages-${new Date().toISOString()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('Messages exported');
    };

    const getStatusColor = () => {
        switch (connectionStatus) {
            case 'connected':
                return '#22c55e';
            case 'connecting':
                return '#ff9800';
            case 'error':
                return '#ef4444';
            default:
                return '#6b7280';
        }
    };

    const getStatusIcon = () => {
        switch (connectionStatus) {
            case 'connected':
                return <CheckCircle sx={{ color: '#22c55e' }} />;
            case 'connecting':
                return <CircularProgress size={16} />;
            case 'error':
                return <ErrorIcon sx={{ color: '#ef4444' }} />;
            default:
                return <LinkOff sx={{ color: '#6b7280' }} />;
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
                    WebSocket Testing
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                        <strong>Test Servers:</strong> Try connecting to{' '}
                        <code>wss://echo.websocket.org</code> or{' '}
                        <code>wss://echo.websocket.events</code> for testing.
                        <br />
                        <strong>Local Server:</strong> Use <code>ws://localhost:8080</code> if running the test server.
                        <br />
                        <strong>Troubleshooting:</strong> If connection fails, check browser console for detailed error messages.
                    </Typography>
                </Alert>
            </Box>

            <Grid container spacing={3}>
                {/* Connection Panel */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Connection
                                </Typography>
                                <Chip
                                    icon={getStatusIcon()}
                                    label={connectionStatus.toUpperCase()}
                                    sx={{
                                        backgroundColor: getStatusColor(),
                                        color: 'white',
                                        fontWeight: 600,
                                    }}
                                />
                            </Box>

                            <TextField
                                fullWidth
                                label="WebSocket URL"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="wss://echo.websocket.org or ws://localhost:8080"
                                disabled={isConnected}
                                sx={{ mb: 2 }}
                                helperText="Try: wss://echo.websocket.org, wss://echo.websocket.events, or ws://localhost:8080"
                            />

                            <TextField
                                fullWidth
                                label="Protocols (comma-separated)"
                                value={protocols}
                                onChange={(e) => setProtocols(e.target.value)}
                                placeholder="protocol1, protocol2"
                                disabled={isConnected}
                                sx={{ mb: 2 }}
                                helperText="Optional: Subprotocols"
                            />

                            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                <Button
                                    variant="contained"
                                    startIcon={isConnected ? <Stop /> : <PlayArrow />}
                                    onClick={isConnected ? disconnect : connect}
                                    disabled={connectionStatus === 'connecting'}
                                    fullWidth
                                    sx={{
                                        backgroundColor: isConnected ? '#ef4444' : '#22c55e',
                                        '&:hover': {
                                            backgroundColor: isConnected ? '#dc2626' : '#16a34a',
                                        },
                                    }}
                                >
                                    {isConnected ? 'Disconnect' : 'Connect'}
                                </Button>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                Auto-Reconnect Settings
                            </Typography>

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={autoReconnect}
                                        onChange={(e) => setAutoReconnect(e.target.checked)}
                                        disabled={isConnected}
                                    />
                                }
                                label="Enable Auto-Reconnect"
                                sx={{ mb: 1 }}
                            />

                            {autoReconnect && (
                                <>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Reconnect Interval (ms)"
                                        value={reconnectInterval}
                                        onChange={(e) => setReconnectInterval(parseInt(e.target.value) || 3000)}
                                        disabled={isConnected}
                                        sx={{ mb: 1 }}
                                        size="small"
                                    />
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Max Reconnect Attempts"
                                        value={maxReconnectAttempts}
                                        onChange={(e) => setMaxReconnectAttempts(parseInt(e.target.value) || 5)}
                                        disabled={isConnected}
                                        size="small"
                                    />
                                </>
                            )}

                            {reconnectAttempts > 0 && (
                                <Alert severity="info" sx={{ mt: 2 }}>
                                    Reconnection attempts: {reconnectAttempts}/{maxReconnectAttempts}
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    {/* Send Message Panel */}
                    <Card sx={{ mt: 2 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                Send Message
                            </Typography>

                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Message Type</InputLabel>
                                <Select
                                    value={messageType}
                                    label="Message Type"
                                    onChange={(e) => setMessageType(e.target.value)}
                                    disabled={!isConnected}
                                >
                                    <MenuItem value="text">Text</MenuItem>
                                    <MenuItem value="json">JSON</MenuItem>
                                    <MenuItem value="binary">Binary</MenuItem>
                                </Select>
                            </FormControl>

                            {messageType === 'binary' && (
                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Binary Format</InputLabel>
                                    <Select
                                        value={binaryFormat}
                                        label="Binary Format"
                                        onChange={(e) => setBinaryFormat(e.target.value)}
                                    >
                                        <MenuItem value="base64">Base64</MenuItem>
                                        <MenuItem value="hex">Hex</MenuItem>
                                        <MenuItem value="array">Array (comma-separated)</MenuItem>
                                    </Select>
                                </FormControl>
                            )}

                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label={messageType === 'json' ? 'JSON Message' : messageType === 'binary' ? 'Binary Data' : 'Message'}
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                disabled={!isConnected}
                                placeholder={
                                    messageType === 'json'
                                        ? '{"key": "value"}'
                                        : messageType === 'binary'
                                        ? binaryFormat === 'base64'
                                            ? 'Enter base64 string'
                                            : binaryFormat === 'hex'
                                            ? 'Enter hex string (e.g., FF 00 AA)'
                                            : 'Enter comma-separated bytes (e.g., 255, 0, 170)'
                                        : 'Enter your message...'
                                }
                                sx={{ mb: 2 }}
                            />

                            <Button
                                variant="contained"
                                startIcon={<Send />}
                                onClick={sendMessage}
                                disabled={!isConnected}
                                fullWidth
                                sx={{
                                    backgroundColor: '#3b82f6',
                                    '&:hover': {
                                        backgroundColor: '#2563eb',
                                    },
                                }}
                            >
                                Send Message
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Messages Panel */}
                <Grid item xs={12} md={8}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Messages ({messages.length})
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Tooltip title="Clear Messages">
                                        <IconButton onClick={clearMessages} size="small">
                                            <Clear />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Export Messages">
                                        <IconButton onClick={exportMessages} size="small" disabled={messageHistory.length === 0}>
                                            <Download />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Box>

                            <Paper
                                sx={{
                                    flex: 1,
                                    overflow: 'auto',
                                    p: 2,
                                    backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb',
                                    maxHeight: 'calc(100vh - 400px)',
                                    minHeight: 400,
                                }}
                            >
                                {messages.length === 0 ? (
                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            No messages yet. Connect to a WebSocket server to start receiving messages.
                                        </Typography>
                                    </Box>
                                ) : (
                                    messages.map((msg) => (
                                        <Box
                                            key={msg.id}
                                            sx={{
                                                mb: 2,
                                                p: 1.5,
                                                borderRadius: 1,
                                                backgroundColor:
                                                    msg.direction === 'outgoing'
                                                        ? isDarkMode
                                                            ? 'rgba(59, 130, 246, 0.2)'
                                                            : 'rgba(59, 130, 246, 0.1)'
                                                        : msg.type === 'error'
                                                        ? isDarkMode
                                                            ? 'rgba(239, 68, 68, 0.2)'
                                                            : 'rgba(239, 68, 68, 0.1)'
                                                        : msg.type === 'system'
                                                        ? isDarkMode
                                                            ? 'rgba(107, 114, 128, 0.2)'
                                                            : 'rgba(107, 114, 128, 0.1)'
                                                        : isDarkMode
                                                        ? 'rgba(34, 197, 94, 0.2)'
                                                        : 'rgba(34, 197, 94, 0.1)',
                                                borderLeft: `3px solid ${
                                                    msg.direction === 'outgoing'
                                                        ? '#3b82f6'
                                                        : msg.type === 'error'
                                                        ? '#ef4444'
                                                        : msg.type === 'system'
                                                        ? '#6b7280'
                                                        : '#22c55e'
                                                }`,
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Chip
                                                    label={msg.direction === 'outgoing' ? 'OUT' : msg.type === 'system' ? 'SYSTEM' : 'IN'}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor:
                                                            msg.direction === 'outgoing'
                                                                ? '#3b82f6'
                                                                : msg.type === 'error'
                                                                ? '#ef4444'
                                                                : msg.type === 'system'
                                                                ? '#6b7280'
                                                                : '#22c55e',
                                                        color: 'white',
                                                        fontWeight: 600,
                                                        fontSize: '0.7rem',
                                                    }}
                                                />
                                                <Typography variant="caption" color="text.secondary">
                                                    {msg.formattedTime}
                                                </Typography>
                                            </Box>
                                            <Typography
                                                variant="body2"
                                                component="pre"
                                                sx={{
                                                    fontFamily: 'monospace',
                                                    fontSize: '0.875rem',
                                                    whiteSpace: 'pre-wrap',
                                                    wordBreak: 'break-word',
                                                    m: 0,
                                                }}
                                            >
                                                {msg.message}
                                            </Typography>
                                        </Box>
                                    ))
                                )}
                            </Paper>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default WebSocketTester;

