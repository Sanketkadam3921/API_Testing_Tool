import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import WebSocketTester from '../components/WebSocketTester';

const WebSocketTesting = () => {
    return (
        <DashboardLayout>
            <WebSocketTester />
        </DashboardLayout>
    );
};

export default WebSocketTesting;

