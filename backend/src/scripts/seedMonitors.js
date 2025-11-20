import pool from '../config/db.js';
import { ensureDefaultUser } from '../utils/defaultUser.js';
import { MonitorsService } from '../modules/monitors/monitors.service.js';
import { ApiTestService } from '../services/apiTestService.js';
import { MetricsService } from '../modules/metrics/metrics.service.js';
import { v4 as uuidv4 } from 'uuid';

const sampleMonitors = [
    {
        name: 'Google Homepage',
        description: 'Monitor Google homepage availability',
        method: 'GET',
        url: 'https://google.com',
        interval_min: 5,
        threshold_ms: 1000,
    },
    {
        name: 'GitHub API',
        description: 'Monitor GitHub API status',
        method: 'GET',
        url: 'https://api.github.com',
        interval_min: 5,
        threshold_ms: 500,
    },
    {
        name: 'JSONPlaceholder API',
        description: 'Test API endpoint for monitoring',
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/posts/1',
        interval_min: 5,
        threshold_ms: 500,
    },
];

async function seedMonitors() {
    try {
        console.log('🌱 Starting monitor seeding...');

        // Ensure default user exists
        const userId = await ensureDefaultUser();
        console.log(`✅ Default user ensured: ${userId}`);

        // Get or create a collection for standalone monitors
        let collection;
        const collectionCheck = await pool.query(
            'SELECT id FROM collections WHERE name = $1 AND user_id = $2',
            ['Standalone Monitors', userId]
        );

        if (collectionCheck.rows.length > 0) {
            collection = collectionCheck.rows[0];
            console.log(`✅ Using existing collection: ${collection.id}`);
        } else {
            const collectionId = uuidv4();
            await pool.query(
                `INSERT INTO collections (id, name, description, user_id, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, NOW(), NOW())`,
                [collectionId, 'Standalone Monitors', 'Auto-created collection for standalone monitors', userId]
            );
            collection = { id: collectionId };
            console.log(`✅ Created collection: ${collection.id}`);
        }

        // Create monitors and requests OR use existing ones
        const createdMonitors = [];
        for (const monitorConfig of sampleMonitors) {
            try {
                // Check if monitor already exists
                const existingCheck = await pool.query(
                    `SELECT m.id, m.request_id FROM monitors m
                     JOIN requests r ON m.request_id = r.id
                     WHERE r.url = $1 AND m.user_id = $2`,
                    [monitorConfig.url, userId]
                );

                let monitor;
                if (existingCheck.rows.length > 0) {
                    // Use existing monitor
                    monitor = existingCheck.rows[0];
                    console.log(`✅ Using existing monitor for ${monitorConfig.url}`);
                    // Ensure it's active
                    await pool.query(
                        'UPDATE monitors SET is_active = true WHERE id = $1',
                        [monitor.id]
                    );
                } else {
                    // Create request
                    const requestId = uuidv4();
                    await pool.query(
                        `INSERT INTO requests (id, name, method, url, headers, body, params, description, collection_id, folder_id, "order", created_at, updated_at)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NULL, 0, NOW(), NOW())`,
                        [
                            requestId,
                            monitorConfig.name,
                            monitorConfig.method,
                            monitorConfig.url,
                            JSON.stringify([]),
                            '',
                            JSON.stringify([]),
                            monitorConfig.description || '',
                            collection.id,
                        ]
                    );

                    // Create monitor
                    const newMonitor = await MonitorsService.createMonitor(
                        monitorConfig.name,
                        monitorConfig.description,
                        requestId,
                        userId,
                        monitorConfig.interval_min,
                        monitorConfig.threshold_ms
                    );
                    monitor = newMonitor;
                    console.log(`✅ Created monitor: ${monitorConfig.name} (${monitorConfig.url})`);
                }

                createdMonitors.push({ ...monitor, url: monitorConfig.url, request_id: monitor.request_id });
            } catch (error) {
                console.error(`❌ Error creating monitor ${monitorConfig.name}:`, error.message);
            }
        }

        // Run initial tests to generate metrics
        console.log('\n🔄 Running initial tests to generate metrics...');
        for (const monitor of createdMonitors) {
            try {
                // Get the request details
                const requestResult = await pool.query(
                    'SELECT method, url, headers, body, params FROM requests WHERE id = $1',
                    [monitor.request_id]
                );

                if (requestResult.rows.length === 0) {
                    console.log(`⚠️  Request not found for monitor ${monitor.id}`);
                    continue;
                }

                const request = requestResult.rows[0];

                // Run test
                console.log(`   Testing ${monitor.name}...`);
                const startTime = Date.now();
                let testResult;
                
                try {
                    testResult = await ApiTestService.testApi({
                        method: request.method,
                        url: request.url,
                        headers: request.headers || {},
                        body: request.body || null,
                        params: request.params || {},
                    });
                } catch (apiError) {
                    // Handle API errors gracefully
                    testResult = {
                        success: false,
                        status: 0,
                        error: apiError.message,
                        responseTime: Date.now() - startTime,
                    };
                }

                // Record metric with UUID
                const metricId = uuidv4();
                await pool.query(
                    `INSERT INTO metrics (id, monitor_id, status_code, response_time, success, error_message, created_at)
                     VALUES ($1, $2, $3, $4, $5, $6, NOW())
                     RETURNING *`,
                    [
                        metricId,
                        monitor.id,
                        testResult.status || 0,
                        testResult.responseTime || 0,
                        testResult.success || false,
                        testResult.error || null
                    ]
                );

                console.log(`   ✅ Recorded metric: ${testResult.success ? 'SUCCESS' : 'FAILED'} - ${testResult.responseTime || 0}ms`);

                // Run a few more tests with slight delays
                for (let i = 0; i < 3; i++) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    const testStart = Date.now();
                    let result;
                    try {
                        result = await ApiTestService.testApi({
                            method: request.method,
                            url: request.url,
                            headers: request.headers || {},
                            body: request.body || null,
                            params: request.params || {},
                        });
                    } catch (apiError) {
                        result = {
                            success: false,
                            status: 0,
                            error: apiError.message,
                            responseTime: Date.now() - testStart,
                        };
                    }

                    const metricId2 = uuidv4();
                    await pool.query(
                        `INSERT INTO metrics (id, monitor_id, status_code, response_time, success, error_message, created_at)
                         VALUES ($1, $2, $3, $4, $5, $6, NOW())
                         RETURNING *`,
                        [
                            metricId2,
                            monitor.id,
                            result.status || 0,
                            result.responseTime || 0,
                            result.success || false,
                            result.error || null
                        ]
                    );
                    console.log(`   ✅ Recorded metric ${i + 2}: ${result.success ? 'SUCCESS' : 'FAILED'} - ${result.responseTime || 0}ms`);
                }
            } catch (error) {
                console.error(`   ❌ Error testing monitor ${monitor.id}:`, error.message);
            }
        }

        console.log('\n✨ Seeding completed successfully!');
        console.log(`\n📊 Created ${createdMonitors.length} monitors with initial metrics`);
        console.log('\n🌐 Monitors created:');
        createdMonitors.forEach((m, i) => {
            console.log(`   ${i + 1}. ${m.name} - ${m.url}`);
        });
        console.log('\n💡 Tip: Monitors will continue to run automatically based on their intervals');
        console.log('   Visit http://localhost:5173/monitoring-data to view the dashboard\n');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    seedMonitors();
}

export default seedMonitors;

