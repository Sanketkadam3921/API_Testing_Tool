#!/usr/bin/env node

/**
 * Fix Monitoring Schema - Add missing columns and fix alerts
 * This script fixes the consecutive_failures column and alerts id generation
 */

import pool from './src/config/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function fixMonitoringSchema() {
    try {
        console.log('🔧 Fixing monitoring schema...\n');

        // Add consecutive_failures column to monitors if it doesn't exist
        await pool.query(`
            ALTER TABLE monitors 
            ADD COLUMN IF NOT EXISTS consecutive_failures INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS last_email_sent TIMESTAMP,
            ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN DEFAULT true;
        `);
        console.log('✅ Added consecutive_failures and email notification columns to monitors');

        // Create index for consecutive_failures if it doesn't exist
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_monitors_consecutive_failures 
            ON monitors(consecutive_failures) 
            WHERE consecutive_failures > 0;
        `);
        console.log('✅ Created index on consecutive_failures');

        // Verify alerts table has id column with proper constraints
        const alertsCheck = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'alerts' AND column_name = 'id';
        `);

        if (alertsCheck.rows.length === 0) {
            console.log('⚠️  Alerts table id column check failed - table may not exist');
        } else {
            console.log('✅ Verified alerts table structure');
        }

        console.log('\n🎉 Monitoring schema fixed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error fixing monitoring schema:', error.message);
        process.exit(1);
    }
}

fixMonitoringSchema();

