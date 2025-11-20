import { Router } from 'express';
import { ApiTestService } from '../services/apiTestService.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Test API endpoint - no auth required for basic testing
router.post('/test', async (req, res) => {
    try {
        const { method, url, headers, body } = req.body;

        // Validate method
        if (!method || !url) {
            return res.status(400).json({
                success: false,
                error: 'Method and URL are required',
            });
        }

        const methodUpper = method.toUpperCase();
        
        // For POST, PUT, PATCH - validate body is required and JSON
        if (['POST', 'PUT', 'PATCH'].includes(methodUpper)) {
            if (!body) {
                return res.status(400).json({
                    success: false,
                    error: 'Body is required for POST, PUT, and PATCH requests and must be valid JSON',
                });
            }

            // Validate body is JSON-serializable
            try {
                if (typeof body === 'string') {
                    JSON.parse(body);
                } else if (typeof body !== 'object' || body === null) {
                    return res.status(400).json({
                        success: false,
                        error: 'Body must be valid JSON format (object or valid JSON string)',
                    });
                }
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    error: `Invalid JSON format: ${error.message}. Body must be valid JSON.`,
                });
            }
        }

        logger.info('API test request received', { method: methodUpper, url });

        const result = await ApiTestService.testApi({
            method: methodUpper,
            url,
            headers,
            body,
        });

        // Save to history (async, don't wait)
        try {
            const { getDefaultUserId } = await import('../utils/defaultUser.js');
            const userId = req.body.user_id || await getDefaultUserId();
            const { HistoryService } = await import('../modules/history/history.service.js');
            
            HistoryService.saveHistory(
                userId,
                {
                    method: methodUpper,
                    url,
                    headers,
                    body,
                    params: req.body.params || [],
                },
                result
            ).catch(err => {
                logger.error('Failed to save request history', { error: err.message });
            });
        } catch (historyError) {
            // Don't fail the request if history save fails
            logger.warn('History save skipped', { error: historyError.message });
        }

        res.status(200).json(result);
    } catch (error) {
        logger.error('API test controller error', { error: error.message, stack: error.stack });
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message,
        });
    }
});

export default router;
