import pool from "../config/db.js";
import { MonitorsService } from "../modules/monitors/monitors.service.js";
import { ApiTestService } from "../services/apiTestService.js";
import { MetricsService } from "../modules/metrics/metrics.service.js";
import { v4 as uuidv4 } from "uuid";
import { scheduleMonitor } from "../utils/monitorScheduler.js";

async function activateAndTestMonitors() {
  try {
    console.log("🔄 Activating monitors and running tests...");

    // Get all inactive monitors
    const inactiveMonitors = await pool.query(
      `SELECT m.*, r.method, r.url, r.headers, r.body, r.params
             FROM monitors m
             JOIN requests r ON m.request_id = r.id
             WHERE m.user_id = $1 AND m.is_active = false`,
      ["default-user-id"]
    );

    console.log(`Found ${inactiveMonitors.rows.length} inactive monitors`);

    // Activate and test each monitor
    for (const monitor of inactiveMonitors.rows) {
      try {
        // Activate monitor
        await MonitorsService.updateMonitorStatus(monitor.id, true);
        console.log(`✅ Activated monitor: ${monitor.id}`);

        // Run a test immediately
        const requestData = {
          method: monitor.method,
          url: monitor.url,
          headers: monitor.headers || {},
          body: monitor.body || null,
          params: monitor.params || {},
        };

        console.log(`   Testing ${monitor.url}...`);
        const result = await ApiTestService.testApi(requestData);

        // Record metric
        const metricId = uuidv4();
        await pool.query(
          `INSERT INTO metrics (id, monitor_id, status_code, response_time, success, error_message, created_at)
                     VALUES ($1, $2, $3, $4, $5, $6, NOW())
                     RETURNING *`,
          [
            metricId,
            monitor.id,
            result.status || 0,
            result.responseTime || 0,
            result.success || false,
            result.error || null,
          ]
        );

        console.log(
          `   ✅ Recorded metric: ${result.success ? "SUCCESS" : "FAILED"} - ${
            result.responseTime || 0
          }ms`
        );
      } catch (error) {
        console.error(
          `   ❌ Error processing monitor ${monitor.id}:`,
          error.message
        );
      }
    }

    console.log("\n✨ Activation complete!");
  } catch (error) {
    console.error("❌ Activation failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

activateAndTestMonitors();
