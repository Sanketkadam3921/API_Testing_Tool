import { BatchService } from './batch.service.js';
import { logger } from '../../utils/logger.js';

export const BatchController = {
    // Execute batch of requests
    executeBatch: async (req, res, next) => {
        try {
            const { requests, options } = req.body;

            if (!requests || !Array.isArray(requests) || requests.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Requests array is required and must not be empty',
                });
            }

            // Validate each request
            for (let i = 0; i < requests.length; i++) {
                const request = requests[i];
                if (!request.method || !request.url) {
                    return res.status(400).json({
                        success: false,
                        error: `Request at index ${i} is missing required fields (method, url)`,
                    });
                }
            }

            logger.info('Batch request received', { 
                count: requests.length,
                mode: options?.mode || 'parallel',
            });

            const result = await BatchService.executeBatch(requests, options || {});

            res.status(200).json(result);
        } catch (error) {
            logger.error('Batch execution error', { error: error.message });
            next(error);
        }
    },
};

