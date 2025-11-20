import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';
import config from '../config/env.js';

// Create reusable transporter
const createTransporter = () => {
    // Use environment variables or defaults
    const smtpConfig = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER || '',
            pass: process.env.SMTP_PASSWORD || '',
        },
    };

    return nodemailer.createTransport(smtpConfig);
};

export const EmailService = {
    // Send email notification
    async sendNotification(email, subject, html, text) {
        try {
            // Check if email is configured
            if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
                logger.warn('Email service not configured. SMTP credentials missing.');
                return { success: false, error: 'Email service not configured' };
            }

            if (!email) {
                logger.warn('No email address provided for notification');
                return { success: false, error: 'No email address provided' };
            }

            const transporter = createTransporter();

            const mailOptions = {
                from: `"ApexAPI" <${process.env.SMTP_USER}>`,
                to: email,
                subject: subject,
                text: text || html,
                html: html || text,
            };

            const info = await transporter.sendMail(mailOptions);
            logger.info('Email sent successfully', { to: email, messageId: info.messageId });
            
            return { success: true, messageId: info.messageId };
        } catch (error) {
            logger.error('Failed to send email', { error: error.message, to: email });
            return { success: false, error: error.message };
        }
    },

    // Send monitor failure notification
    async sendMonitorFailureNotification(userEmail, monitorName, url, consecutiveFailures, lastError) {
        const subject = `🚨 Monitor Alert: ${monitorName} - ${consecutiveFailures} Consecutive Failures`;
        
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #ef4444; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                    .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
                    .alert-box { background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 15px 0; }
                    .info-box { background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 15px 0; }
                    .button { display: inline-block; background-color: #22c55e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
                    .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>🚨 Monitor Failure Alert</h2>
                    </div>
                    <div class="content">
                        <p>Your API monitor has detected multiple consecutive failures.</p>
                        
                        <div class="alert-box">
                            <strong>Monitor:</strong> ${monitorName}<br>
                            <strong>URL:</strong> ${url}<br>
                            <strong>Consecutive Failures:</strong> ${consecutiveFailures}<br>
                            ${lastError ? `<strong>Last Error:</strong> ${lastError}<br>` : ''}
                        </div>

                        <div class="info-box">
                            <strong>What this means:</strong>
                            <ul>
                                <li>The API endpoint is not responding correctly</li>
                                <li>This could indicate a service outage or critical issue</li>
                                <li>Please investigate the API endpoint immediately</li>
                            </ul>
                        </div>

                        <p>Please check your monitor dashboard for more details.</p>
                        
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/monitoring" class="button">
                            View Monitor Dashboard
                        </a>
                    </div>
                    <div class="footer">
                        <p>This is an automated notification from ApexAPI</p>
                        <p>You are receiving this because you have a monitor configured</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const text = `
Monitor Failure Alert

Your API monitor "${monitorName}" has failed ${consecutiveFailures} times consecutively.

Details:
- Monitor: ${monitorName}
- URL: ${url}
- Consecutive Failures: ${consecutiveFailures}
${lastError ? `- Last Error: ${lastError}` : ''}

This could indicate a service outage or critical issue. Please investigate immediately.

Visit your dashboard: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/monitoring
        `;

        return await this.sendNotification(userEmail, subject, html, text);
    },

    // Send monitor recovery notification
    async sendMonitorRecoveryNotification(userEmail, monitorName, url) {
        const subject = `✅ Monitor Recovered: ${monitorName}`;
        
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #22c55e; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                    .content { background-color: #f0fdf4; padding: 20px; border-radius: 0 0 8px 8px; }
                    .success-box { background-color: #d1fae5; border-left: 4px solid #22c55e; padding: 15px; margin: 15px 0; }
                    .button { display: inline-block; background-color: #22c55e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
                    .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>✅ Monitor Recovered</h2>
                    </div>
                    <div class="content">
                        <p>Great news! Your API monitor has recovered and is now responding correctly.</p>
                        
                        <div class="success-box">
                            <strong>Monitor:</strong> ${monitorName}<br>
                            <strong>URL:</strong> ${url}<br>
                            <strong>Status:</strong> ✅ Online and Responding
                        </div>

                        <p>The monitor will continue to track this endpoint.</p>
                        
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/monitoring" class="button">
                            View Monitor Dashboard
                        </a>
                    </div>
                    <div class="footer">
                        <p>This is an automated notification from ApexAPI</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const text = `
Monitor Recovery Notification

Your API monitor "${monitorName}" has recovered and is now responding correctly.

Details:
- Monitor: ${monitorName}
- URL: ${url}
- Status: Online and Responding

Visit your dashboard: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/monitoring
        `;

        return await this.sendNotification(userEmail, subject, html, text);
    },
};


