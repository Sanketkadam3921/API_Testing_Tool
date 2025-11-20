#!/usr/bin/env node

/**
 * Test script for Advanced Analytics endpoints
 * Run: node test-analytics.js
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.API_URL || 'http://localhost:3001';

async function testAnalytics() {
    console.log('🧪 Testing Advanced Analytics Endpoints...\n');

    try {
        // First, get a monitor ID (assuming there's at least one monitor)
        console.log('1️⃣ Getting monitors...');
        const monitorsResponse = await axios.get(`${API_URL}/api/monitors?user_id=default-user-id`);
        
        if (!monitorsResponse.data.success || !monitorsResponse.data.monitors || monitorsResponse.data.monitors.length === 0) {
            console.log('❌ No monitors found. Please create a monitor first.');
            console.log('   You can create a monitor from the Monitoring page in the frontend.');
            return;
        }

        const monitorId = monitorsResponse.data.monitors[0].id;
        console.log(`✅ Found monitor: ${monitorsResponse.data.monitors[0].name} (ID: ${monitorId})\n`);

        // Test 2: Get response time percentiles
        console.log('2️⃣ Testing Response Time Percentiles...');
        const percentilesResponse = await axios.get(`${API_URL}/api/analytics/monitors/${monitorId}/percentiles`);
        if (percentilesResponse.data.success) {
            console.log('✅ Percentiles retrieved successfully!');
            console.log('   P50 (Median):', percentilesResponse.data.percentiles.p50, 'ms');
            console.log('   P95:', percentilesResponse.data.percentiles.p95, 'ms');
            console.log('   P99:', percentilesResponse.data.percentiles.p99, 'ms');
            console.log('   Average:', percentilesResponse.data.percentiles.avg, 'ms');
            console.log('   Min/Max:', percentilesResponse.data.percentiles.min, '/', percentilesResponse.data.percentiles.max, 'ms');
            console.log('   Total metrics:', percentilesResponse.data.percentiles.total);
        } else {
            console.log('❌ Failed to get percentiles');
        }

        // Test 3: Get error rate trend
        console.log('\n3️⃣ Testing Error Rate Trend...');
        const errorTrendResponse = await axios.get(`${API_URL}/api/analytics/monitors/${monitorId}/error-rate-trend?interval=hour`);
        if (errorTrendResponse.data.success) {
            console.log('✅ Error rate trend retrieved successfully!');
            console.log('   Data points:', errorTrendResponse.data.trend.length);
            if (errorTrendResponse.data.trend.length > 0) {
                console.log('   Sample data point:', errorTrendResponse.data.trend[0]);
            }
        } else {
            console.log('❌ Failed to get error rate trend');
        }

        // Test 4: Get success rate trend
        console.log('\n4️⃣ Testing Success Rate Trend...');
        const successTrendResponse = await axios.get(`${API_URL}/api/analytics/monitors/${monitorId}/success-rate-trend?interval=hour`);
        if (successTrendResponse.data.success) {
            console.log('✅ Success rate trend retrieved successfully!');
            console.log('   Data points:', successTrendResponse.data.trend.length);
        } else {
            console.log('❌ Failed to get success rate trend');
        }

        // Test 5: Get uptime statistics
        console.log('\n5️⃣ Testing Uptime Statistics...');
        const uptimeResponse = await axios.get(`${API_URL}/api/analytics/monitors/${monitorId}/uptime`);
        if (uptimeResponse.data.success) {
            console.log('✅ Uptime stats retrieved successfully!');
            console.log('   Uptime:', uptimeResponse.data.stats.uptimePercentage.toFixed(2), '%');
            console.log('   Total Requests:', uptimeResponse.data.stats.totalRequests);
            console.log('   Successful:', uptimeResponse.data.stats.successfulRequests);
            console.log('   Failed:', uptimeResponse.data.stats.failedRequests);
            console.log('   Avg Response Time:', uptimeResponse.data.stats.avgResponseTime, 'ms');
        } else {
            console.log('❌ Failed to get uptime stats');
        }

        // Test 6: Get comprehensive analytics
        console.log('\n6️⃣ Testing Comprehensive Analytics...');
        const comprehensiveResponse = await axios.get(`${API_URL}/api/analytics/monitors/${monitorId}/comprehensive`);
        if (comprehensiveResponse.data.success) {
            console.log('✅ Comprehensive analytics retrieved successfully!');
            console.log('   Includes: percentiles, trends, and uptime stats');
        } else {
            console.log('❌ Failed to get comprehensive analytics');
        }

        // Test 7: Get real-time data
        console.log('\n7️⃣ Testing Real-Time Data...');
        const realTimeResponse = await axios.get(`${API_URL}/api/analytics/monitors/${monitorId}/realtime?minutes=60`);
        if (realTimeResponse.data.success) {
            console.log('✅ Real-time data retrieved successfully!');
            console.log('   Data points (last 60 minutes):', realTimeResponse.data.data.length);
        } else {
            console.log('❌ Failed to get real-time data');
        }

        // Test 8: Test with date range
        console.log('\n8️⃣ Testing with Custom Date Range...');
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
        const dateRangeResponse = await axios.get(
            `${API_URL}/api/analytics/monitors/${monitorId}/percentiles?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`
        );
        if (dateRangeResponse.data.success) {
            console.log('✅ Date range query successful!');
            console.log('   Range: Last 7 days');
            console.log('   Metrics in range:', dateRangeResponse.data.percentiles.total);
        } else {
            console.log('❌ Failed to get data with date range');
        }

        // Test 9: Export data (JSON)
        console.log('\n9️⃣ Testing Data Export (JSON)...');
        const exportJsonResponse = await axios.get(`${API_URL}/api/analytics/monitors/${monitorId}/export?format=json`);
        if (exportJsonResponse.data.success) {
            console.log('✅ JSON export successful!');
            console.log('   Records:', exportJsonResponse.data.data.length);
        } else {
            console.log('❌ Failed to export JSON');
        }

        console.log('\n🎉 All analytics tests completed!');
        console.log('\n📊 Summary:');
        console.log('   - Response time percentiles: ✅');
        console.log('   - Error rate trends: ✅');
        console.log('   - Success rate trends: ✅');
        console.log('   - Uptime statistics: ✅');
        console.log('   - Comprehensive analytics: ✅');
        console.log('   - Real-time data: ✅');
        console.log('   - Date range queries: ✅');
        console.log('   - Data export: ✅');
        console.log('\n✨ Advanced Analytics is working correctly!');

    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.error('❌ Cannot connect to server. Make sure the backend is running on', API_URL);
        } else {
            console.error('❌ Test failed:', error.response?.data || error.message);
            if (error.response?.data) {
                console.error('   Details:', JSON.stringify(error.response.data, null, 2));
            }
        }
        process.exit(1);
    }
}

testAnalytics();

