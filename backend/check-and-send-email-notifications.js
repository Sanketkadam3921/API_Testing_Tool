import dotenv from 'dotenv';
import pool from './src/config/db.js';
import { EmailService } from './src/services/emailService.js';
import { MonitorsService } from './src/modules/monitors/monitors.service.js';
import { logger } from './src/utils/logger.js';

dotenv.config();

const FAILURE_THRESHOLD = 5;
const EMAIL_COOLDOWN_HOURS = 24;

async function checkAndSendEmailNotifications() {
    try {
        logger.info("Checking monitors for email notifications...");

        // Get all monitors with 10+ consecutive failures
        const result = await pool.query(`
            SELECT m.id, m.name, m.consecutive_failures, m.last_email_sent, 
                   m.email_notifications_enabled, m.user_id,
                   r.name as request_name, r.method, r.url,
                   u.email as user_email, u.name as user_name
            FROM monitors m
            JOIN requests r ON m.request_id = r.id
            JOIN users u ON m.user_id = u.id
            WHERE m.consecutive_failures >= $1
            AND m.is_active = true
            AND m.email_notifications_enabled = true
            ORDER BY m.consecutive_failures DESC
        `, [FAILURE_THRESHOLD]);

        const monitors = result.rows;
        logger.info(`Found ${monitors.length} monitors with ${FAILURE_THRESHOLD}+ consecutive failures`);

        let emailsSent = 0;
        let emailsSkipped = 0;

        for (const monitor of monitors) {
            logger.info(`Processing monitor: ${monitor.name} (${monitor.id})`);
            logger.info(`  Failures: ${monitor.consecutive_failures}`);
            logger.info(`  User email: ${monitor.user_email}`);

            // Check if user has email
            if (!monitor.user_email) {
                logger.warn(`  Skipping: No user email for monitor ${monitor.id}`);
                emailsSkipped++;
                continue;
            }

            // Check cooldown period
            if (monitor.last_email_sent) {
                const lastEmailSent = new Date(monitor.last_email_sent);
                const now = new Date();
                const hoursSinceLastEmail = (now - lastEmailSent) / (1000 * 60 * 60);
                
                if (hoursSinceLastEmail < EMAIL_COOLDOWN_HOURS) {
                    logger.info(`  Skipping: Cooldown period active (${hoursSinceLastEmail.toFixed(1)} hours since last email)`);
                    emailsSkipped++;
                    continue;
                }
            }

            // Send email
            try {
                logger.info(`  Sending email to ${monitor.user_email}...`);
                const emailResult = await EmailService.sendMonitorFailureNotification(
                    monitor.user_email,
                    monitor.name || monitor.request_name,
                    monitor.url,
                    monitor.consecutive_failures,
                    `Monitor has failed ${monitor.consecutive_failures} consecutive times`
                );

                if (emailResult.success) {
                    // Update last email sent timestamp
                    await MonitorsService.updateLastEmailSent(monitor.id);
                    logger.info(`  ✅ Email sent successfully! Message ID: ${emailResult.messageId}`);
                    emailsSent++;
                } else {
                    logger.error(`  ❌ Failed to send email: ${emailResult.error}`);
                    emailsSkipped++;
                }
            } catch (error) {
                logger.error(`  ❌ Error sending email: ${error.message}`);
                emailsSkipped++;
            }
        }

        logger.info("\n===========================================");
        logger.info(`Summary:`);
        logger.info(`  Emails sent: ${emailsSent}`);
        logger.info(`  Emails skipped: ${emailsSkipped}`);
        logger.info(`  Total monitors checked: ${monitors.length}`);
        logger.info("===========================================\n");

        process.exit(0);
    } catch (error) {
        logger.error("Error checking email notifications:", error);
        process.exit(1);
    }
}

checkAndSendEmailNotifications();




