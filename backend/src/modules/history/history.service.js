import pool from '../../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../utils/logger.js';

export const HistoryService = {
    // Save request history
    async saveHistory(userId, requestData, responseData) {
        try {
            const id = uuidv4();
            const result = await pool.query(
                `INSERT INTO request_history 
                (id, user_id, method, url, headers, body, params, status_code, status_text, response_data, response_headers, response_time, response_size, error_message, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
                RETURNING *`,
                [
                    id,
                    userId,
                    requestData.method,
                    requestData.url,
                    JSON.stringify(requestData.headers || {}),
                    requestData.body || null,
                    JSON.stringify(requestData.params || []),
                    responseData.status || null,
                    responseData.statusText || null,
                    responseData.data ? JSON.stringify(responseData.data) : null,
                    JSON.stringify(responseData.headers || {}),
                    responseData.responseTime || 0,
                    responseData.size || '0 B',
                    responseData.error || null,
                ]
            );
            return result.rows[0];
        } catch (error) {
            logger.error('Error saving request history', { error: error.message });
            throw error;
        }
    },

    // Get user's request history
    async getHistory(userId, options = {}) {
        try {
            const {
                limit = 50,
                offset = 0,
                method = null,
                statusCode = null,
                startDate = null,
                endDate = null,
                search = null,
            } = options;

            let query = `
                SELECT * FROM request_history 
                WHERE user_id = $1
            `;
            const params = [userId];
            let paramIndex = 2;

            // Apply filters
            if (method) {
                query += ` AND method = $${paramIndex}`;
                params.push(method);
                paramIndex++;
            }

            if (statusCode) {
                query += ` AND status_code = $${paramIndex}`;
                params.push(statusCode);
                paramIndex++;
            }

            if (startDate) {
                query += ` AND created_at >= $${paramIndex}`;
                params.push(startDate);
                paramIndex++;
            }

            if (endDate) {
                query += ` AND created_at <= $${paramIndex}`;
                params.push(endDate);
                paramIndex++;
            }

            if (search) {
                query += ` AND (url ILIKE $${paramIndex} OR error_message ILIKE $${paramIndex})`;
                params.push(`%${search}%`);
                paramIndex++;
            }

            query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
            params.push(limit, offset);

            const result = await pool.query(query, params);
            return result.rows.map(row => this.formatHistoryItem(row));
        } catch (error) {
            logger.error('Error fetching request history', { error: error.message });
            throw error;
        }
    },

    // Get history statistics
    async getHistoryStats(userId, options = {}) {
        try {
            const { startDate = null, endDate = null } = options;

            let query = `
                SELECT 
                    COUNT(*) as total_requests,
                    COUNT(CASE WHEN status_code >= 200 AND status_code < 300 THEN 1 END) as successful_requests,
                    COUNT(CASE WHEN status_code >= 400 THEN 1 END) as failed_requests,
                    AVG(response_time) as avg_response_time,
                    MIN(response_time) as min_response_time,
                    MAX(response_time) as max_response_time,
                    COUNT(DISTINCT method) as unique_methods,
                    COUNT(DISTINCT url) as unique_urls
                FROM request_history 
                WHERE user_id = $1
            `;
            const params = [userId];
            let paramIndex = 2;

            if (startDate) {
                query += ` AND created_at >= $${paramIndex}`;
                params.push(startDate);
                paramIndex++;
            }

            if (endDate) {
                query += ` AND created_at <= $${paramIndex}`;
                params.push(endDate);
                paramIndex++;
            }

            const result = await pool.query(query, params);
            return result.rows[0];
        } catch (error) {
            logger.error('Error fetching history stats', { error: error.message });
            throw error;
        }
    },

    // Get history by ID
    async getHistoryById(id, userId) {
        try {
            const result = await pool.query(
                `SELECT * FROM request_history 
                WHERE id = $1 AND user_id = $2`,
                [id, userId]
            );
            return result.rows.length > 0 ? this.formatHistoryItem(result.rows[0]) : null;
        } catch (error) {
            logger.error('Error fetching history by ID', { error: error.message });
            throw error;
        }
    },

    // Delete history item
    async deleteHistory(id, userId) {
        try {
            const result = await pool.query(
                `DELETE FROM request_history 
                WHERE id = $1 AND user_id = $2 
                RETURNING *`,
                [id, userId]
            );
            return result.rows[0];
        } catch (error) {
            logger.error('Error deleting history', { error: error.message });
            throw error;
        }
    },

    // Clear all history for user
    async clearHistory(userId) {
        try {
            const result = await pool.query(
                `DELETE FROM request_history 
                WHERE user_id = $1 
                RETURNING COUNT(*) as deleted_count`,
                [userId]
            );
            return result.rows[0];
        } catch (error) {
            logger.error('Error clearing history', { error: error.message });
            throw error;
        }
    },

    // Format history item
    formatHistoryItem(row) {
        return {
            id: row.id,
            method: row.method,
            url: row.url,
            headers: typeof row.headers === 'string' ? JSON.parse(row.headers) : row.headers,
            body: row.body,
            params: typeof row.params === 'string' ? JSON.parse(row.params) : row.params,
            statusCode: row.status_code,
            statusText: row.status_text,
            responseData: row.response_data ? JSON.parse(row.response_data) : null,
            responseHeaders: typeof row.response_headers === 'string' ? JSON.parse(row.response_headers) : row.response_headers,
            responseTime: row.response_time,
            responseSize: row.response_size,
            errorMessage: row.error_message,
            createdAt: row.created_at,
        };
    },
};

