import cron from "node-cron";
import { MonitorsService } from "../modules/monitors/monitors.service.js";
import { MetricsService } from "../modules/metrics/metrics.service.js";
import { AlertsService } from "../modules/alerts/alerts.service.js";
import { EmailService } from "../services/emailService.js";
import { logger } from "./logger.js";

const FAILURE_THRESHOLD = 5; // Number of consecutive failures before email notification
const EMAIL_COOLDOWN_HOURS = 24; // Don't send another email for 24 hours after last one

const activeJobs = new Map();

// Start monitoring a request at intervals
export const scheduleMonitor = (monitorId, requestId, intervalMin, thresholdMs) => {
    try {
        // Stop existing job if it exists
        stopMonitor(monitorId);

        // Create cron expression for minutes
        const cronExpression = `*/${intervalMin} * * * *`;

        const task = cron.schedule(cronExpression, async () => {
            try {
                logger.info(`Running scheduled monitor: ${monitorId}`);

                // Run the monitor test
                const result = await MonitorsService.runMonitorTest(monitorId);

                // Record metrics
                await MetricsService.recordMetric(
                    monitorId,
                    result.status || 0,
                    result.responseTime || 0,
                    result.success || false,
                    result.error || null
                );

                // Check if request was successful
                const isSuccess = result.success && result.status >= 200 && result.status < 400;

                if (!isSuccess) {
                    try {
                        // Increment consecutive failures (with error handling)
                        let monitor;
                        let consecutiveFailures = 0;
                        try {
                            monitor = await MonitorsService.incrementConsecutiveFailures(monitorId);
                            consecutiveFailures = monitor?.consecutive_failures || 0;
                        } catch (error) {
                            // If consecutive_failures column doesn't exist, try to add it
                            logger.warn(`Failed to increment consecutive failures for monitor ${monitorId}: ${error.message}`);
                            // Continue without consecutive failures tracking
                        }

                        // Create alert (with error handling)
                        try {
                            await AlertsService.createAlert(
                                monitorId,
                                `Request failed: ${result.error || `HTTP ${result.status}`}`,
                                "error"
                            );
                        } catch (error) {
                            logger.error(`Failed to create alert for monitor ${monitorId}: ${error.message}`);
                        }

                        // Check if we need to send email notification
                        if (monitor && consecutiveFailures >= FAILURE_THRESHOLD) {
                            try {
                                await handleEmailNotification(monitorId, monitor, result);
                            } catch (error) {
                                logger.error(`Failed to send email notification for monitor ${monitorId}: ${error.message}`);
                            }
                        }
                    } catch (error) {
                        logger.error(`Error handling monitor failure for ${monitorId}: ${error.message}`);
                    }
                } else {
                    // Reset consecutive failures on success
                    const monitor = await MonitorsService.getMonitorWithUser(monitorId);
                    const previousFailures = monitor?.consecutive_failures || 0;
                    
                    if (previousFailures > 0) {
                        await MonitorsService.resetConsecutiveFailures(monitorId);
                        
                        // Send recovery email if previously failed
                        if (previousFailures >= FAILURE_THRESHOLD && monitor?.user_email) {
                            try {
                                await EmailService.sendMonitorRecoveryNotification(
                                    monitor.user_email,
                                    monitor.name || monitor.request_name,
                                    monitor.url
                                );
                                logger.info(`Recovery email sent for monitor ${monitorId}`);
                            } catch (emailError) {
                                logger.error(`Failed to send recovery email for monitor ${monitorId}:`, emailError.message);
                            }
                        }
                    }
                }

                // Check for alerts
                if (result.responseTime > thresholdMs) {
                    await AlertsService.createAlert(
                        monitorId,
                        `High response time: ${result.responseTime}ms (threshold: ${thresholdMs}ms)`,
                        "warning"
                    );
                }

                if (result.status >= 500) {
                    await AlertsService.createAlert(
                        monitorId,
                        `Server error: HTTP ${result.status}`,
                        "error"
                    );
                }

                logger.info(`Monitor ${monitorId} completed successfully`);
            } catch (error) {
                logger.error(`Monitor job failed for ${monitorId}:`, error.message);

                // Record failed metric
                await MetricsService.recordMetric(
                    monitorId,
                    0,
                    0,
                    false,
                    error.message
                );

                try {
                    // Increment consecutive failures (with error handling)
                    let monitor;
                    let consecutiveFailures = 0;
                    try {
                        monitor = await MonitorsService.incrementConsecutiveFailures(monitorId);
                        consecutiveFailures = monitor?.consecutive_failures || 0;
                    } catch (error) {
                        // If consecutive_failures column doesn't exist, log and continue
                        logger.warn(`Failed to increment consecutive failures for monitor ${monitorId}: ${error.message}`);
                        // Continue without consecutive failures tracking
                    }

                    // Create alert for monitor failure (with error handling)
                    try {
                        await AlertsService.createAlert(
                            monitorId,
                            `Monitor execution failed: ${error.message}`,
                            "error"
                        );
                    } catch (alertError) {
                        logger.error(`Failed to create alert for monitor ${monitorId}: ${alertError.message}`);
                    }

                    // Check if we need to send email notification
                    if (monitor && consecutiveFailures >= FAILURE_THRESHOLD) {
                        try {
                            await handleEmailNotification(monitorId, monitor, { success: false, error: error.message });
                        } catch (emailError) {
                            logger.error(`Failed to send email notification for monitor ${monitorId}: ${emailError.message}`);
                        }
                    }
                } catch (handlerError) {
                    logger.error(`Error handling monitor execution failure for ${monitorId}: ${handlerError.message}`);
                }
            }
        }, {
            scheduled: false,
            timezone: "UTC"
        });

        activeJobs.set(monitorId, task);
        task.start();

        logger.info(`Started monitoring for monitor ${monitorId} with ${intervalMin} minute interval`);
    } catch (error) {
        logger.error(`Failed to schedule monitor ${monitorId}:`, error.message);
        throw error;
    }
};

// Stop monitoring
export const stopMonitor = (monitorId) => {
    const task = activeJobs.get(monitorId);
    if (task) {
        try {
            task.stop();
            // Clean up cron task completely to prevent duplicates
            if (typeof task.destroy === 'function') {
                task.destroy();
            }
        } catch (error) {
            logger.warn(`Error stopping monitor ${monitorId}:`, error.message);
        }
        activeJobs.delete(monitorId);
        logger.info(`Stopped monitoring for monitor ${monitorId}`);
    }
};

// Get all active monitor jobs
export const getActiveJobs = () => {
    return Array.from(activeJobs.keys());
};

// Stop all monitoring jobs
export const stopAllMonitors = () => {
    activeJobs.forEach((task, monitorId) => {
        task.stop();
        logger.info(`Stopped monitoring for monitor ${monitorId}`);
    });
    activeJobs.clear();
};

// Initialize monitoring system on startup
export const initializeMonitoring = async () => {
    try {
        logger.info("Initializing monitoring system...");

        // Stop all existing jobs first to prevent duplicates
        stopAllMonitors();
        
        // Small delay to ensure all jobs are fully stopped
        await new Promise(resolve => setTimeout(resolve, 200));

        // Get all active monitors and restart their jobs
        const activeMonitors = await MonitorsService.getActiveMonitors();

        for (const monitor of activeMonitors) {
            // scheduleMonitor already calls stopMonitor internally, but we cleared everything above
            scheduleMonitor(
                monitor.id,
                monitor.request_id,
                monitor.interval_min,
                monitor.threshold_ms
            );
        }

        logger.info(`Initialized ${activeMonitors.length} active monitors`);

        // Check for any monitors that should have received email notifications but didn't
        await checkPendingEmailNotifications();
    } catch (error) {
        logger.error("Failed to initialize monitoring system:", error.message);
    }
};

// Check for monitors that should have received email notifications
async function checkPendingEmailNotifications() {
    try {
        const { default: pool } = await import("../config/db.js");
        const result = await pool.query(`
            SELECT m.id, m.consecutive_failures, m.last_email_sent, 
                   m.email_notifications_enabled
            FROM monitors m
            WHERE m.consecutive_failures >= $1
            AND m.is_active = true
            AND m.email_notifications_enabled = true
        `, [FAILURE_THRESHOLD]);

        for (const monitor of result.rows) {
            // Check if email was never sent, or if cooldown has expired
            let shouldSend = false;
            
            if (!monitor.last_email_sent) {
                // Never sent an email, should send one
                shouldSend = true;
                logger.info(`Monitor ${monitor.id} has ${monitor.consecutive_failures} failures but no email sent yet`);
            } else {
                const lastEmailSent = new Date(monitor.last_email_sent);
                const now = new Date();
                const hoursSinceLastEmail = (now - lastEmailSent) / (1000 * 60 * 60);
                
                if (hoursSinceLastEmail >= EMAIL_COOLDOWN_HOURS) {
                    // Cooldown expired, can send another email
                    shouldSend = true;
                    logger.info(`Monitor ${monitor.id} cooldown expired, can send email`);
                }
            }

            if (shouldSend) {
                const fullMonitor = await MonitorsService.getMonitorWithUser(monitor.id);
                if (fullMonitor && fullMonitor.user_email) {
                    try {
                        await handleEmailNotification(
                            monitor.id,
                            { consecutive_failures: monitor.consecutive_failures },
                            { success: false, error: `Monitor has ${monitor.consecutive_failures} consecutive failures` }
                        );
                    } catch (error) {
                        logger.error(`Failed to send pending email notification for monitor ${monitor.id}:`, error.message);
                    }
                }
            }
        }
    } catch (error) {
        logger.error("Error checking pending email notifications:", error.message);
    }
}

// Handle email notification for monitor failures
async function handleEmailNotification(monitorId, monitor, result) {
    try {
        // Get full monitor details with user email
        const fullMonitor = await MonitorsService.getMonitorWithUser(monitorId);
        
        if (!fullMonitor || !fullMonitor.user_email) {
            logger.warn(`Cannot send email notification for monitor ${monitorId}: no user email`);
            return;
        }

        // Check email notifications are enabled
        if (fullMonitor.email_notifications_enabled === false) {
            logger.info(`Email notifications disabled for monitor ${monitorId}`);
            return;
        }

        // Check cooldown period (don't send if email was sent recently)
        if (fullMonitor.last_email_sent) {
            const lastEmailSent = new Date(fullMonitor.last_email_sent);
            const now = new Date();
            const hoursSinceLastEmail = (now - lastEmailSent) / (1000 * 60 * 60);
            
            if (hoursSinceLastEmail < EMAIL_COOLDOWN_HOURS) {
                logger.info(`Email notification skipped for monitor ${monitorId}: cooldown period active`);
                return;
            }
        }

        // Send email notification
        const emailResult = await EmailService.sendMonitorFailureNotification(
            fullMonitor.user_email,
            fullMonitor.name || fullMonitor.request_name,
            fullMonitor.url,
            monitor.consecutive_failures || FAILURE_THRESHOLD,
            result.error || `HTTP ${result.status}` || 'Unknown error'
        );

        if (emailResult.success) {
            // Update last email sent timestamp
            await MonitorsService.updateLastEmailSent(monitorId);
            logger.info(`Failure notification email sent for monitor ${monitorId} to ${fullMonitor.user_email}`);
        } else {
            logger.error(`Failed to send email notification for monitor ${monitorId}:`, emailResult.error);
        }
    } catch (error) {
        logger.error(`Error handling email notification for monitor ${monitorId}:`, error.message);
    }
}

// Graceful shutdown
process.on('SIGINT', () => {
    logger.info("Shutting down monitoring system...");
    stopAllMonitors();
    process.exit(0);
});

process.on('SIGTERM', () => {
    logger.info("Shutting down monitoring system...");
    stopAllMonitors();
    process.exit(0);
});
