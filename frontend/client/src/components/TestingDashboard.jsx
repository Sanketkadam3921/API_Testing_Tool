import React from 'react';
import {
    Box,
    Typography,
    Tabs,
    Tab,
    IconButton,
    Divider,
    Chip,
} from '@mui/material';
import {
    Close,
    Add,
    PlayArrow,
} from '@mui/icons-material';
import { useApiStore } from '../store/apiStore';
import RequestEditor from './RequestEditor';
import ResponseViewer from './ResponseViewer';
import CollectionsPanel from './CollectionsPanel';
import BatchRunner from './BatchRunner';

const TestingDashboard = () => {
    const { tabs, activeTabId, createNewTab, setActiveTab, closeTab } = useApiStore();
    const [tabValue, setTabValue] = React.useState(0);
    const [batchRunnerOpen, setBatchRunnerOpen] = React.useState(false);

    // Create default request on mount
    React.useEffect(() => {
        if (!activeTabId && tabs.length === 0) {
            createNewTab();
        }
    }, [activeTabId, tabs.length, createNewTab]);

    // Sync tab value with active tab
    React.useEffect(() => {
        if (activeTabId) {
            const index = tabs.findIndex(tab => tab.id === activeTabId);
            if (index !== -1) {
                setTabValue(index);
            }
        }
    }, [activeTabId, tabs]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        if (tabs[newValue]) {
            setActiveTab(tabs[newValue].id);
        }
    };

    const handleCloseTab = (event, tabIndex) => {
        event.stopPropagation();
        if (tabs[tabIndex]) {
            closeTab(tabs[tabIndex].id);
        }
    };

    const handleNewTab = () => {
        createNewTab();
    };

    return (
        <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'hidden', 
            backgroundColor: '#f5f5f5',
            position: 'relative',
        }}>
            {/* Top Bar with Tabs */}
            <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                borderBottom: '1px solid rgba(0,0,0,0.08)',
                backgroundColor: '#ffffff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                minHeight: 48,
                maxHeight: 48,
                px: 2,
                gap: 1,
                flexShrink: 0,
                zIndex: 10,
            }}>
                {/* New Tab Button */}
                <IconButton
                    size="small"
                    onClick={handleNewTab}
                    sx={{
                        borderRadius: 1.5,
                        border: '1px solid rgba(0,0,0,0.08)',
                        '&:hover': {
                            backgroundColor: 'rgba(34,197,94,0.1)',
                            borderColor: '#22c55e',
                        },
                    }}
                    title="New Request"
                >
                    <Add fontSize="small" />
                </IconButton>

                {/* Batch Runner Button */}
                <IconButton
                    size="small"
                    onClick={() => setBatchRunnerOpen(true)}
                    sx={{
                        borderRadius: 1.5,
                        border: '1px solid rgba(0,0,0,0.08)',
                        ml: 1,
                        '&:hover': {
                            backgroundColor: 'rgba(34,197,94,0.1)',
                            borderColor: '#22c55e',
                        },
                    }}
                    title="Run Batch Requests"
                >
                    <PlayArrow fontSize="small" />
                </IconButton>

                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

                {/* Tabs */}
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        minHeight: 48,
                        flex: 1,
                        '& .MuiTab-root': {
                            minHeight: 48,
                            textTransform: 'none',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            minWidth: 140,
                            px: 2,
                            borderRadius: '8px 8px 0 0',
                            '&:hover': {
                                backgroundColor: 'rgba(34,197,94,0.05)',
                            },
                        },
                        '& .Mui-selected': {
                            color: '#22c55e',
                            fontWeight: 600,
                            backgroundColor: 'rgba(34,197,94,0.05)',
                        },
                        '& .MuiTabs-indicator': {
                            backgroundColor: '#22c55e',
                            height: 3,
                            borderRadius: '2px 2px 0 0',
                        },
                    }}
                >
                    {tabs.map((tab, index) => (
                        <Tab
                            key={tab.id}
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                        {tab.name.length > 20 ? `${tab.name.substring(0, 20)}...` : tab.name}
                                    </Typography>
                                    {tabs.length > 1 && (
                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleCloseTab(e, index)}
                                            sx={{
                                                width: 18,
                                                height: 18,
                                                '&:hover': {
                                                    backgroundColor: 'rgba(0,0,0,0.1)',
                                                },
                                            }}
                                        >
                                            <Close sx={{ fontSize: 14 }} />
                                        </IconButton>
                                    )}
                                </Box>
                            }
                        />
                    ))}
                </Tabs>
            </Box>

            {/* Main Content */}
            <Box sx={{ 
                flexGrow: 1, 
                display: 'flex', 
                overflow: 'hidden',
                minHeight: 0,
                position: 'relative',
            }}>
                {/* Left Sidebar - Collections */}
                <Box
                    sx={{
                        width: 240,
                        minWidth: 240,
                        maxWidth: 240,
                        borderRight: '1px solid rgba(0,0,0,0.08)',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        backgroundColor: '#ffffff',
                        boxShadow: '2px 0 4px rgba(0,0,0,0.02)',
                        flexShrink: 0,
                        position: 'relative',
                        zIndex: 1,
                    }}
                >
                    <CollectionsPanel />
                </Box>

                {/* Center - Request & Response (Vertical Split) */}
                <Box sx={{ 
                    flexGrow: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    overflow: 'hidden', 
                    backgroundColor: '#fafafa',
                    minWidth: 0,
                    position: 'relative',
                }}>
                    {activeTabId ? (
                        <>
                            {/* Request Builder - Top Half */}
                            <Box sx={{ 
                                flex: '1 1 50%', 
                                minHeight: 250,
                                overflow: 'hidden', 
                                borderBottom: '2px solid rgba(0,0,0,0.08)',
                                backgroundColor: '#ffffff',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                            }}>
                                <RequestEditor tabId={activeTabId} />
                            </Box>

                            {/* Divider */}
                            <Box sx={{ 
                                height: 4,
                                flexShrink: 0,
                                backgroundColor: '#f5f5f5',
                                borderTop: '1px solid rgba(0,0,0,0.08)',
                                borderBottom: '1px solid rgba(0,0,0,0.08)',
                                cursor: 'row-resize',
                                '&:hover': {
                                    backgroundColor: '#22c55e',
                                },
                            }} />

                            {/* Response Viewer - Bottom Half */}
                            <Box sx={{ 
                                flex: '1 1 50%', 
                                minHeight: 250,
                                overflow: 'hidden',
                                backgroundColor: '#ffffff',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                            }}>
                                <ResponseViewer tabId={activeTabId} />
                            </Box>
                        </>
                    ) : (
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            height: '100%',
                            gap: 2,
                        }}>
                            <Box sx={{
                                width: 64,
                                height: 64,
                                borderRadius: '50%',
                                backgroundColor: 'rgba(34,197,94,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <Add sx={{ fontSize: 32, color: '#22c55e' }} />
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
                                Create a new request to get started
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Click the + button above or select a request from collections
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Batch Runner Dialog */}
            <BatchRunner
                open={batchRunnerOpen}
                onClose={() => setBatchRunnerOpen(false)}
            />
        </Box>
    );
};

export default TestingDashboard;

