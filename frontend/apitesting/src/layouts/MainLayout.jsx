import React, { useState, useEffect } from 'react';
import { Box, Toolbar } from '@mui/material';
import { Tabs } from 'antd';
import { useApiStore } from '../store/apiStore';
import RequestEditor from '../components/RequestEditor';
import ResponseViewer from '../components/ResponseViewer';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';

const sidebarWidth = 280;

const MainLayout = () => {
    const {
        tabs,
        activeTabId,
        createNewTab,
        closeTab,
        setActiveTab,
    } = useApiStore();

    useEffect(() => {
        // Create initial tab if none exist
        if (tabs.length === 0) {
            createNewTab();
        }
    }, [tabs.length, createNewTab]);

    const handleTabChange = (key) => {
        setActiveTab(key);
    };

    const handleTabEdit = (targetKey, action) => {
        if (action === 'remove') {
            closeTab(targetKey);
        }
    };

    return (
        <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#f5f5f5' }}>
            {/* Dashboard Sidebar */}
            <DashboardSidebar />

            {/* Main Content Area */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    marginLeft: `${sidebarWidth}px`,
                    backgroundColor: '#f5f5f5',
                }}
            >
                {/* Dashboard Header */}
                <DashboardHeader />

                {/* Content */}
                <Box sx={{ mt: 8, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Tabs */}
                    {tabs.length > 0 && (
                        <Box
                            sx={{
                                borderBottom: 1,
                                borderColor: 'divider',
                                backgroundColor: '#ffffff',
                                px: 2,
                            }}
                        >
                            <Tabs
                                activeKey={activeTabId}
                                onChange={handleTabChange}
                                onEdit={handleTabEdit}
                                type="editable-card"
                                hideAdd
                                size="small"
                                items={tabs.map((tab) => ({
                                    key: tab.id,
                                    label: tab.name,
                                    closable: tabs.length > 1,
                                }))}
                            />
                        </Box>
                    )}

                    {/* Request/Response Area */}
                    {activeTabId && (
                        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
                            <Box sx={{ display: 'flex', gap: 3, height: '100%' }}>
                                {/* Request Editor */}
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <RequestEditor tabId={activeTabId} />
                                </Box>

                                {/* Response Viewer */}
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <ResponseViewer tabId={activeTabId} />
                                </Box>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default MainLayout;