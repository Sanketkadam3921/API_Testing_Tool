import pool from "../config/db.js";
import bcrypt from 'bcrypt';
import { logger } from './logger.js';

const DEFAULT_USER_ID = 'default-user-id';
const DEFAULT_USER_EMAIL = 'default@apitesting.local';
const DEFAULT_USER_NAME = 'Default User';
const DEFAULT_USER_PASSWORD = 'default-password-not-for-production';

/**
 * Ensures the default user exists in the database
 * Creates it if it doesn't exist
 */
export const ensureDefaultUser = async () => {
    try {
        // Check if user already exists
        const checkResult = await pool.query(
            'SELECT id FROM users WHERE id = $1 OR email = $2',
            [DEFAULT_USER_ID, DEFAULT_USER_EMAIL]
        );

        if (checkResult.rows.length > 0) {
            logger.info('Default user already exists');
            return DEFAULT_USER_ID;
        }

        // Create default user
        const hashedPassword = await bcrypt.hash(DEFAULT_USER_PASSWORD, 10);
        const result = await pool.query(
            `INSERT INTO users (id, name, email, password, created_at, updated_at)
             VALUES ($1, $2, $3, $4, NOW(), NOW())
             ON CONFLICT (id) DO NOTHING
             RETURNING id`,
            [DEFAULT_USER_ID, DEFAULT_USER_NAME, DEFAULT_USER_EMAIL, hashedPassword]
        );

        if (result.rows.length > 0) {
            logger.info('Default user created successfully');
            return DEFAULT_USER_ID;
        }

        // If no row returned but no error, user might have been created by another process
        return DEFAULT_USER_ID;
    } catch (error) {
        // If error is about unique constraint, user already exists
        if (error.code === '23505' || error.message.includes('duplicate key')) {
            logger.info('Default user already exists (caught in error handler)');
            return DEFAULT_USER_ID;
        }
        logger.error('Error ensuring default user:', error);
        throw error;
    }
};

/**
 * Gets or creates the default user ID
 */
export const getDefaultUserId = async () => {
    try {
        await ensureDefaultUser();
        return DEFAULT_USER_ID;
    } catch (error) {
        logger.error('Failed to get default user ID:', error);
        return DEFAULT_USER_ID; // Return ID even if creation failed, will handle error at use site
    }
};









