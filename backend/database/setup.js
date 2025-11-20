#!/usr/bin/env node

/**
 * Database Setup Script for Collections System
 * 
 * This script creates the necessary database tables for the Collections system.
 * Run this script after setting up your PostgreSQL database.
 * 
 * Usage:
 * 1. Set DATABASE_URL in your .env file
 * 2. Run: node database/setup.js
 */

import pkg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const { Pool } = pkg;

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function setupDatabase() {
    try {
        console.log('🚀 Setting up Collections System Database...');

        // Read the migration file
        const migrationPath = path.join(__dirname, 'migrations', '001_create_collections_system.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        // Execute the migration
        await pool.query(migrationSQL);

        console.log('✅ Database setup completed successfully!');
        console.log('📊 Created tables:');
        console.log('   - collections');
        console.log('   - folders');
        console.log('   - requests');
        console.log('   - users (if not exists)');
        console.log('   - tests (if not exists)');
        console.log('   - monitors (if not exists)');
        console.log('   - alerts (if not exists)');
        console.log('   - metrics (if not exists)');
        console.log('');
        console.log('🎉 Your API Testing Tool is ready to use!');

    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run the setup
setupDatabase();
