# 📧 Email Notifications Setup Guide

## Overview

The API Testing Tool now supports automatic email notifications when monitored APIs fail. When a monitor detects 10 or more consecutive failures, it will automatically send an email notification to the user.

## Features

- ✅ **Automatic Failure Detection**: Tracks consecutive failures for each monitor
- ✅ **Email Notifications**: Sends HTML emails when threshold (10 failures) is reached
- ✅ **Recovery Notifications**: Sends email when monitor recovers after failures
- ✅ **Cooldown Period**: Prevents spam (24-hour cooldown between notifications)
- ✅ **Configurable**: Can enable/disable per monitor

## Setup Instructions

### 1. Database Migration

Run the migration to add failure tracking columns:

```bash
cd backend
psql $DATABASE_URL -f database/migrations/005_add_monitor_failure_tracking.sql
```

### 2. Configure SMTP Settings

Add these environment variables to your `.env` file:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:5173
```

### 3. Gmail Setup (Recommended)

If using Gmail, you need to create an App Password:

1. Go to your Google Account settings
2. Navigate to **Security** → **2-Step Verification**
3. At the bottom, select **App passwords**
4. Generate a new app password for "Mail"
5. Use this password as `SMTP_PASSWORD`

**Important**: Use an App Password, not your regular Gmail password.

### 4. Other Email Providers

#### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
```

#### Yahoo
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
```

#### Custom SMTP
```env
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yourdomain.com
SMTP_PASSWORD=your-password
```

## How It Works

### Failure Tracking

1. **Consecutive Failures Counter**: Each monitor tracks consecutive failures
2. **Threshold**: Email is sent when failures reach 10 consecutive failures
3. **Auto-Reset**: Counter resets to 0 when monitor succeeds
4. **Cooldown**: After sending an email, another won't be sent for 24 hours

### Email Triggers

An email is sent when:
- Monitor has 10+ consecutive failures
- Last email was sent more than 24 hours ago (cooldown)
- User email is configured
- Email notifications are enabled for the monitor

### Recovery Email

When a monitor recovers (succeeds after failures), a recovery email is sent if:
- Previous failures were ≥ 10
- User email is configured

## Email Templates

### Failure Notification
- **Subject**: 🚨 Monitor Alert: [Monitor Name] - [N] Consecutive Failures
- **Content**: 
  - Monitor details (name, URL)
  - Failure count
  - Last error message
  - Link to dashboard

### Recovery Notification
- **Subject**: ✅ Monitor Recovered: [Monitor Name]
- **Content**:
  - Monitor details
  - Recovery confirmation
  - Link to dashboard

## Configuration Options

### Per-Monitor Settings

The database now includes:
- `consecutive_failures` - Current failure count
- `last_email_sent` - Timestamp of last email
- `email_notifications_enabled` - Toggle (default: true)

### Adjusting Threshold

To change the failure threshold, edit `backend/src/utils/monitorScheduler.js`:

```javascript
const FAILURE_THRESHOLD = 10; // Change this number
const EMAIL_COOLDOWN_HOURS = 24; // Change cooldown period
```

## Testing

### Test Email Configuration

Create a test script `backend/test-email.js`:

```javascript
import { EmailService } from './src/services/emailService.js';
import dotenv from 'dotenv';

dotenv.config();

async function testEmail() {
    const result = await EmailService.sendMonitorFailureNotification(
        'your-email@example.com',
        'Test Monitor',
        'https://api.example.com/test',
        10,
        'Test error message'
    );
    console.log(result);
}

testEmail();
```

Run it:
```bash
node backend/test-email.js
```

### Testing with a Monitor

1. Create a monitor for a non-existent URL
2. Wait for 10 consecutive failures
3. Check your email inbox

## Troubleshooting

### Email Not Sending

1. **Check SMTP Configuration**
   - Verify all environment variables are set
   - Test with the test script above

2. **Check Logs**
   ```bash
   tail -f backend/logs/combined.log | grep -i email
   ```

3. **Common Issues**:
   - **Gmail**: Must use App Password, not regular password
   - **Port**: Ensure port 587 (TLS) or 465 (SSL) is correct
   - **Firewall**: SMTP port might be blocked
   - **Email Address**: Ensure user email exists in database

### Logs

The system logs email activity:
- `Email sent successfully` - Success
- `Failed to send email` - Failure with error details
- `Email notification skipped` - Cooldown or disabled

## Security Notes

- Store SMTP credentials in `.env` file (never commit to git)
- Use App Passwords for Gmail (more secure)
- Consider using environment-specific credentials
- Monitor email sending for abuse/spam

## Disabling Email Notifications

### For Specific Monitor

Update the monitor in database:
```sql
UPDATE monitors 
SET email_notifications_enabled = false 
WHERE id = 'monitor-id';
```

### Globally

Remove or comment out SMTP configuration in `.env`:
```env
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
```

System will log warnings but continue monitoring without emails.

## API Endpoints

No new API endpoints are required. Email notifications work automatically through the monitoring scheduler.

## Summary

- ✅ Install nodemailer: `npm install nodemailer`
- ✅ Run migration: `005_add_monitor_failure_tracking.sql`
- ✅ Configure SMTP in `.env`
- ✅ Monitor will automatically send emails on 10+ failures
- ✅ Recovery emails sent when monitor recovers

That's it! Email notifications are now active for all monitors.





