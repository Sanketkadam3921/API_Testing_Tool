# 📋 Email Setup Checklist - What You Need

## Quick Checklist

Before setting up email notifications, you need the following:

- [ ] **Email Account** (Gmail, Outlook, Yahoo, or custom SMTP)
- [ ] **SMTP Credentials** (host, port, username, password/app password)
- [ ] **Frontend URL** (for email links)
- [ ] **Database Migration** (run once)

---

## What You Need to Provide

### 1. Email Account Details

You need an email account to send notifications from. Choose one:

**Option A: Gmail** (Easiest - Recommended)
- Your Gmail address
- Gmail App Password (not your regular password)

**Option B: Outlook/Hotmail**
- Your Outlook email address
- Your Outlook password (or App Password)

**Option C: Yahoo**
- Your Yahoo email address
- Yahoo App Password

**Option D: Custom SMTP Server**
- SMTP server address
- Port number
- Username and password
- Security type (TLS/SSL)

---

## Step-by-Step: Gmail Setup (Recommended)

### Step 1: Enable 2-Step Verification

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click **Security** on the left
3. Under **Signing in to Google**, find **2-Step Verification**
4. Follow the steps to enable it (if not already enabled)

### Step 2: Create App Password

1. Still in **Security** settings
2. Scroll down to **App passwords** (appears after 2-step is enabled)
3. Click **App passwords**
4. Select **Mail** as the app
5. Select **Other (Custom name)** as device
6. Enter name: "API Testing Tool"
7. Click **Generate**
8. **Copy the 16-character password** (you'll need this)

### Step 3: Get Your Information

You now have:
- ✅ Email: `your-email@gmail.com`
- ✅ App Password: `xxxx xxxx xxxx xxxx` (the 16 characters, remove spaces)

---

## Step-by-Step: Outlook/Hotmail Setup

### Step 1: Get Your Credentials

1. Your Outlook email address
2. Your Outlook password (or App Password if 2FA is enabled)

### Step 2: SMTP Details for Outlook

- **SMTP Host**: `smtp-mail.outlook.com`
- **SMTP Port**: `587`
- **Security**: TLS (SMTP_SECURE=false)

---

## Step-by-Step: Custom SMTP Setup

If you have your own email server or business email:

### Information You Need:

1. **SMTP Server/Host**
   - Example: `mail.yourdomain.com` or `smtp.yourdomain.com`
   - Ask your email provider if unsure

2. **Port Number**
   - Usually `587` (TLS) or `465` (SSL)
   - Check with your provider

3. **Security Type**
   - `TLS` = port 587, `SMTP_SECURE=false`
   - `SSL` = port 465, `SMTP_SECURE=true`

4. **Username**
   - Usually your full email address
   - Example: `user@yourdomain.com`

5. **Password**
   - Your email account password
   - Or App Password if 2FA enabled

---

## Configuration Summary

Once you have your credentials, add them to your `.env` file:

```env
# Gmail Example
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password

# Outlook Example
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password

# Custom SMTP Example
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=notifications@yourdomain.com
SMTP_PASSWORD=your-password

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173
# OR for production:
# FRONTEND_URL=https://yourdomain.com
```

---

## Quick Reference: Common Providers

| Provider | SMTP Host | Port | Security |
|----------|-----------|------|----------|
| Gmail | smtp.gmail.com | 587 | TLS |
| Outlook | smtp-mail.outlook.com | 587 | TLS |
| Yahoo | smtp.mail.yahoo.com | 587 | TLS |
| Zoho | smtp.zoho.com | 587 | TLS |
| SendGrid | smtp.sendgrid.net | 587 | TLS |
| Mailgun | smtp.mailgun.org | 587 | TLS |

---

## Testing Your Setup

After configuration, you can test it:

1. **Check Environment Variables**
   ```bash
   cd backend
   cat .env | grep SMTP
   ```

2. **Test Email Service**
   Create `backend/test-email.js`:
   ```javascript
   import { EmailService } from './src/services/emailService.js';
   import dotenv from 'dotenv';
   dotenv.config();

   EmailService.sendMonitorFailureNotification(
       'your-test-email@example.com',  // Your email to receive test
       'Test Monitor',
       'https://api.example.com/test',
       10,
       'Test error message'
   ).then(result => {
       console.log('Result:', result);
       if (result.success) {
           console.log('✅ Email sent successfully!');
       } else {
           console.log('❌ Failed:', result.error);
       }
   });
   ```

   Run: `node backend/test-email.js`

---

## Common Issues & Solutions

### "Invalid login credentials"
- ✅ **Gmail**: Make sure you're using App Password, not regular password
- ✅ **Outlook**: May need to enable "Less secure app access" or use App Password
- ✅ **Custom**: Verify username/password are correct

### "Connection timeout"
- ✅ Check if SMTP port (587 or 465) is open
- ✅ Check firewall settings
- ✅ Verify SMTP host is correct

### "Email not received"
- ✅ Check spam/junk folder
- ✅ Verify recipient email address is correct
- ✅ Check email service logs: `tail -f backend/logs/combined.log`

---

## Minimum Requirements

At minimum, you need:

1. ✅ **An email account** (any provider works)
2. ✅ **SMTP credentials** (host, port, username, password)
3. ✅ **One test email address** (to verify it works)

That's it! Once you have these, the setup takes 2 minutes.

---

## Need Help?

If you're unsure about your email provider's SMTP settings:
1. Google: "[your email provider] SMTP settings"
2. Check your email provider's documentation
3. Contact your email provider support

Most modern email providers support SMTP and have documentation available.





