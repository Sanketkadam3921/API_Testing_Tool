import pool from '../config/db.js';
import { MonitorsService } from '../modules/monitors/monitors.service.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Run tests for all active monitors immediately
 * Use this to populate metrics data
 */
async function runAllMonitorTests() {
    try {
        console.log('🔄 Running tests for all active monitors...');

        // Get all active monitors
        const activeMonitors = await pool.query(
            `SELECT m.*, r.method, r.url, r.headers, r.body, r.params
             FROM monitors m
             JOIN requests r ON m.request_id = r.id
             WHERE m.is_active = true AND m.user_id = $1`,
            ['default-user-id']
        );

        console.log(`Found ${activeMonitors.rows.length} active monitors\n`);

        for (const monitor of activeMonitors.rows) {
            try {
                console.log(`Testing: ${monitor.name || 'Unnamed'} (${monitor.url})`);
                
                // Run the test using the service
                const result = await MonitorsService.runMonitorTest(monitor.id);
                
                console.log(`  ✅ ${result.success ? 'SUCCESS' : 'FAILED'} - ${result.status || 'N/A'} - ${result.responseTime || 0}ms`);
            } catch (error) {
                console.error(`  ❌ Error: ${error.message}`);
            }
        }

        console.log('\n✨ All tests completed!');
        console.log('💡 Visit http://localhost:5173/monitoring-data to view the dashboard\n');
    } catch (error) {
        console.error('❌ Error running tests:', error);
        process.exit(1);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

runAllMonitorTests();









