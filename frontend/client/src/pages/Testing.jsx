import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import TestingDashboard from '../components/TestingDashboard';
import { Box } from '@mui/material';

const TestingPage = () => {
    return (
        <DashboardLayout>
            <Box sx={{ 
                height: 'calc(100vh - 128px)', // Full height minus header and padding
                m: -4, // Cancel out the DashboardLayout padding
                position: 'relative',
            }}>
                <TestingDashboard />
            </Box>
        </DashboardLayout>
    );
};

export default TestingPage;



