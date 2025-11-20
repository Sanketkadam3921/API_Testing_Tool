import dotenv from 'dotenv';
import { EmailService } from './src/services/emailService.js';

dotenv.config();

async function testEmailConnection() {
    console.log('🧪 Testing Email Configuration...\n');
    
    // Check configuration
    console.log('Configuration:');
    console.log(`  SMTP_HOST: ${process.env.SMTP_HOST || 'NOT SET'}`);
    console.log(`  SMTP_PORT: ${process.env.SMTP_PORT || 'NOT SET'}`);
    console.log(`  SMTP_USER: ${process.env.SMTP_USER || 'NOT SET'}`);
    console.log(`  SMTP_PASSWORD: ${process.env.SMTP_PASSWORD ? '***SET***' : 'NOT SET'}`);
    console.log(`  FRONTEND_URL: ${process.env.FRONTEND_URL || 'NOT SET'}\n`);

    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
        console.error('❌ SMTP credentials not configured in .env file');
        process.exit(1);
    }

    // Test sending a failure notification email
    console.log('📧 Sending test failure notification email...');
    const testEmail = process.env.SMTP_USER; // Send to yourself
    
    try {
        const result = await EmailService.sendMonitorFailureNotification(
            testEmail,
            'Test Monitor - Email Setup Verification',
            'https://api.example.com/test',
            10,
            'This is a test email to verify your email notification setup is working correctly!'
        );

        if (result.success) {
            console.log('\n✅ SUCCESS! Email sent successfully!');
            console.log(`   Message ID: ${result.messageId}`);
            console.log(`   Check your inbox: ${testEmail}`);
            console.log('\n🎉 Email notifications are configured correctly!');
            return true;
        } else {
            console.error('\n❌ FAILED to send email');
            console.error(`   Error: ${result.error}`);
            return false;
        }
    } catch (error) {
        console.error('\n❌ ERROR sending email:');
        console.error(`   ${error.message}`);
        if (error.code === 'EAUTH') {
            console.error('\n💡 Tip: Make sure you\'re using a Gmail App Password, not your regular password.');
            console.error('   Get one at: https://myaccount.google.com/apppasswords');
        }
        return false;
    }
}

// Test recovery email too
async function testRecoveryEmail() {
    console.log('\n📧 Testing recovery email...');
    const testEmail = process.env.SMTP_USER;
    
    try {
        const result = await EmailService.sendMonitorRecoveryNotification(
            testEmail,
            'Test Monitor - Recovery Email Test',
            'https://api.example.com/test'
        );

        if (result.success) {
            console.log('✅ Recovery email sent successfully!');
            return true;
        } else {
            console.error('❌ Failed to send recovery email:', result.error);
            return false;
        }
    } catch (error) {
        console.error('❌ Error sending recovery email:', error.message);
        return false;
    }
}

// Run tests
(async () => {
    const failureTest = await testEmailConnection();
    if (failureTest) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        await testRecoveryEmail();
    }
    
    console.log('\n' + '='.repeat(50));
    if (failureTest) {
        console.log('✅ All email tests passed! Your email notifications are ready.');
    } else {
        console.log('❌ Email tests failed. Please check your configuration.');
        process.exit(1);
    }
})();





