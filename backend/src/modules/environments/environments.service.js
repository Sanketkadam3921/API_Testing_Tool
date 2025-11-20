import pool from '../../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../utils/logger.js';

export const EnvironmentsService = {
    // Create environment
    async createEnvironment(userId, name, variables) {
        try {
            const id = uuidv4();
            const result = await pool.query(
                `INSERT INTO environments (id, user_id, name, variables, created_at, updated_at)
                VALUES ($1, $2, $3, $4, NOW(), NOW())
                RETURNING *`,
                [id, userId, name, JSON.stringify(variables || {})]
            );
            return {
                ...result.rows[0],
                variables: typeof result.rows[0].variables === 'string' 
                    ? JSON.parse(result.rows[0].variables) 
                    : result.rows[0].variables,
            };
        } catch (error) {
            logger.error('Error creating environment', { error: error.message });
            throw error;
        }
    },

    // Get user's environments
    async getEnvironments(userId) {
        try {
            const result = await pool.query(
                `SELECT * FROM environments 
                WHERE user_id = $1 
                ORDER BY created_at DESC`,
                [userId]
            );
            return result.rows.map(row => ({
                ...row,
                variables: typeof row.variables === 'string' 
                    ? JSON.parse(row.variables) 
                    : row.variables,
            }));
        } catch (error) {
            logger.error('Error fetching environments', { error: error.message });
            throw error;
        }
    },

    // Get environment by ID
    async getEnvironmentById(id, userId) {
        try {
            const result = await pool.query(
                `SELECT * FROM environments 
                WHERE id = $1 AND user_id = $2`,
                [id, userId]
            );
            if (result.rows.length === 0) return null;
            
            return {
                ...result.rows[0],
                variables: typeof result.rows[0].variables === 'string' 
                    ? JSON.parse(result.rows[0].variables) 
                    : result.rows[0].variables,
            };
        } catch (error) {
            logger.error('Error fetching environment', { error: error.message });
            throw error;
        }
    },

    // Update environment
    async updateEnvironment(id, userId, updates) {
        try {
            const { name, variables } = updates;
            const result = await pool.query(
                `UPDATE environments 
                SET name = COALESCE($1, name),
                    variables = COALESCE($2::jsonb, variables),
                    updated_at = NOW()
                WHERE id = $3 AND user_id = $4
                RETURNING *`,
                [
                    name || null,
                    variables ? JSON.stringify(variables) : null,
                    id,
                    userId,
                ]
            );
            
            if (result.rows.length === 0) return null;
            
            return {
                ...result.rows[0],
                variables: typeof result.rows[0].variables === 'string' 
                    ? JSON.parse(result.rows[0].variables) 
                    : result.rows[0].variables,
            };
        } catch (error) {
            logger.error('Error updating environment', { error: error.message });
            throw error;
        }
    },

    // Delete environment
    async deleteEnvironment(id, userId) {
        try {
            const result = await pool.query(
                `DELETE FROM environments 
                WHERE id = $1 AND user_id = $2 
                RETURNING *`,
                [id, userId]
            );
            return result.rows[0];
        } catch (error) {
            logger.error('Error deleting environment', { error: error.message });
            throw error;
        }
    },

    // Resolve variables in string (replace {{variable}} with values)
    resolveVariables(text, variables) {
        if (!text || !variables) return text;
        
        let resolved = text;
        for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            resolved = resolved.replace(regex, value);
        }
        return resolved;
    },

    // Resolve variables in request object
    resolveRequestVariables(request, variables) {
        if (!variables) return request;
        
        const resolved = { ...request };
        
        // Resolve URL
        if (resolved.url) {
            resolved.url = this.resolveVariables(resolved.url, variables);
        }
        
        // Resolve headers
        if (resolved.headers) {
            const headers = Array.isArray(resolved.headers) 
                ? resolved.headers 
                : Object.entries(resolved.headers).map(([k, v]) => ({ key: k, value: v }));
            
            resolved.headers = headers.map(h => ({
                ...h,
                key: this.resolveVariables(h.key || '', variables),
                value: this.resolveVariables(h.value || '', variables),
            }));
        }
        
        // Resolve body
        if (resolved.body && typeof resolved.body === 'string') {
            resolved.body = this.resolveVariables(resolved.body, variables);
        }
        
        // Resolve params
        if (resolved.params) {
            const params = Array.isArray(resolved.params) 
                ? resolved.params 
                : Object.entries(resolved.params).map(([k, v]) => ({ key: k, value: v }));
            
            resolved.params = params.map(p => ({
                ...p,
                key: this.resolveVariables(p.key || '', variables),
                value: this.resolveVariables(p.value || '', variables),
            }));
        }
        
        return resolved;
    },
};

