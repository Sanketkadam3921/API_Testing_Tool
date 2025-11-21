import dotenv from 'dotenv';
import { EmailService } from './src/services/emailService.js';
import pool from './src/config/db.js';
import { logger } from './src/utils/logger.js';

dotenv.config();

async function testEmailNotifications() {
    try {
        console.log('\n===========================================');
        console.log('Testing Email Notification System');
        console.log('===========================================\n');

        // 1. Check email configuration
        console.log('1. Checking Email Configuration...');
        const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
        const smtpPort = process.env.SMTP_PORT || 587;
        const smtpUser = process.env.SMTP_USER;
        const smtpPassword = process.env.SMTP_PASSWORD;
        const smtpFrom = process.env.SMTP_FROM || smtpUser;

        console.log(`   SMTP Host: ${smtpHost}`);
        console.log(`   SMTP Port: ${smtpPort}`);
        console.log(`   SMTP User: ${smtpUser ? '✅ Set' : '❌ Missing'}`);
        console.log(`   SMTP Password: ${smtpPassword ? '✅ Set' : '❌ Missing'}`);
        console.log(`   SMTP From: ${smtpFrom || 'Not set'}`);

        if (!smtpUser || !smtpPassword) {
            console.log('\n❌ Email service is not configured. Please set SMTP_USER and SMTP_PASSWORD in .env file');
            process.exit(1);
        }

        // 2. Test sending a simple email
        console.log('\n2. Testing Email Sending...');
        const testEmail = process.env.TEST_EMAIL || smtpUser;
        console.log(`   Sending test email to: ${testEmail}`);

        const testResult = await EmailService.sendNotification(
            testEmail,
            'Test Email from ApexAPI',
            '<h1>Test Email</h1><p>This is a test email to verify email configuration.</p>',
            'Test Email - This is a test email to verify email configuration.'
        );

        if (testResult.success) {
            console.log(`   ✅ Test email sent successfully! Message ID: ${testResult.messageId}`);
        } else {
            console.log(`   ❌ Failed to send test email: ${testResult.error}`);
            process.exit(1);
        }

        // 3. Check monitors with 5+ consecutive failures
        console.log('\n3. Checking Monitors with 5+ Consecutive Failures...');
        const monitorsResult = await pool.query(`
            SELECT 
                m.id,
                m.name,
                m.consecutive_failures,
                m.email_notifications_enabled,
                m.last_email_sent,
                r.url,
                u.email as user_email,
                u.name as user_name
            FROM monitors m
            JOIN requests r ON m.request_id = r.id
            JOIN users u ON m.user_id = u.id
            WHERE m.consecutive_failures >= 5
            AND m.is_active = true
            ORDER BY m.consecutive_failures DESC
        `);

        const monitors = monitorsResult.rows;
        console.log(`   Found ${monitors.length} monitor(s) with 5+ consecutive failures\n`);

        if (monitors.length === 0) {
            console.log('   ℹ️  No monitors currently have 5+ consecutive failures');
        } else {
            monitors.forEach((monitor, index) => {
                console.log(`   Monitor ${index + 1}:`);
                console.log(`     ID: ${monitor.id}`);
                console.log(`     Name: ${monitor.name || 'N/A'}`);
                console.log(`     URL: ${monitor.url}`);
                console.log(`     Consecutive Failures: ${monitor.consecutive_failures}`);
                console.log(`     Email Notifications: ${monitor.email_notifications_enabled ? '✅ Enabled' : '❌ Disabled'}`);
                console.log(`     User Email: ${monitor.user_email || '❌ Missing'}`);
                console.log(`     Last Email Sent: ${monitor.last_email_sent || 'Never'}`);
                console.log('');
            });
        }

        // 4. Test sending failure notification email
        if (monitors.length > 0) {
            console.log('4. Testing Failure Notification Email...');
            const testMonitor = monitors[0];
            
            if (!testMonitor.user_email) {
                console.log('   ❌ Monitor has no user email associated');
            } else if (!testMonitor.email_notifications_enabled) {
                console.log('   ❌ Email notifications are disabled for this monitor');
            } else {
                console.log(`   Sending test failure notification to: ${testMonitor.user_email}`);
                
                const failureResult = await EmailService.sendMonitorFailureNotification(
                    testMonitor.user_email,
                    testMonitor.name || 'Test Monitor',
                    testMonitor.url,
                    testMonitor.consecutive_failures,
                    'Test error message'
                );

                if (failureResult.success) {
                    console.log(`   ✅ Failure notification email sent successfully! Message ID: ${failureResult.messageId}`);
                } else {
                    console.log(`   ❌ Failed to send failure notification: ${failureResult.error}`);
                }
            }
        }

        // 5. Check email cooldown logic
        console.log('\n5. Email Cooldown Information...');
        console.log('   Email cooldown period: 24 hours');
        console.log('   After sending an email, another email will not be sent for 24 hours');
        console.log('   This prevents email spam if a monitor continues to fail');

        console.log('\n===========================================');
        console.log('✅ Email Notification Test Complete');
        console.log('===========================================\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error testing email notifications:', error);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
}

testEmailNotifications();

