import React from 'react';
import { Box } from '@mui/material';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';

const sidebarWidth = 280;

const DashboardLayout = ({ children }) => {
    return (
        <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#f5f5f5', overflow: 'hidden' }}>
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
                    overflow: 'auto',
                    minHeight: '100vh',
                }}
            >
                {/* Dashboard Header */}
                <DashboardHeader />

                {/* Page Content */}
                <Box
                    sx={{
                        mt: 8,
                        flexGrow: 1,
                        p: 4,
                        maxWidth: '100%',
                        minHeight: 'calc(100vh - 64px)',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                    }}
                >
                    {children}
                </Box>
            </Box>
        </Box>
    );
};

export default DashboardLayout;

