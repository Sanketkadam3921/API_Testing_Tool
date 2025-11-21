import { Router } from 'express';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * Test API endpoint that randomly succeeds or fails
 * Useful for testing monitoring and alert systems
 * 
 * Query Parameters:
 * - successRate: Percentage of success (0-100), default: 50
 * - delay: Response delay in milliseconds, default: random 100-500ms
 * - errorType: Type of error to return ('500', '404', 'timeout', 'random'), default: 'random'
 */
router.get('/test/unstable', async (req, res) => {
    try {
        const successRate = parseInt(req.query.successRate) || 50;
        const delay = parseInt(req.query.delay) || Math.floor(Math.random() * 400) + 100;
        const errorType = req.query.errorType || 'random';

        // Add delay to simulate network latency
        await new Promise(resolve => setTimeout(resolve, delay));

        // Determine if request should succeed based on success rate
        const random = Math.random() * 100;
        const shouldSucceed = random < successRate;

        if (shouldSucceed) {
            // Success response
            return res.status(200).json({
                success: true,
                message: 'Request succeeded',
                timestamp: new Date().toISOString(),
                data: {
                    status: 'ok',
                    responseTime: delay,
                    randomValue: Math.floor(Math.random() * 1000),
                },
            });
        } else {
            // Failure response
            let statusCode = 500;
            let errorMessage = 'Internal Server Error';

            switch (errorType) {
                case '500':
                    statusCode = 500;
                    errorMessage = 'Internal Server Error - Simulated server failure';
                    break;
                case '404':
                    statusCode = 404;
                    errorMessage = 'Not Found - Simulated resource not found';
                    break;
                case '503':
                    statusCode = 503;
                    errorMessage = 'Service Unavailable - Simulated service outage';
                    break;
                case 'timeout':
                    // Simulate timeout by not responding (but we already responded, so use 504)
                    statusCode = 504;
                    errorMessage = 'Gateway Timeout - Simulated timeout';
                    break;
                case 'random':
                default:
                    // Random error type
                    const errorTypes = [500, 502, 503, 504];
                    statusCode = errorTypes[Math.floor(Math.random() * errorTypes.length)];
                    errorMessage = `Simulated ${statusCode} error`;
                    break;
            }

            logger.warn('Test API returning failure', { statusCode, errorMessage, successRate });

            return res.status(statusCode).json({
                success: false,
                error: errorMessage,
                timestamp: new Date().toISOString(),
                statusCode,
                successRate,
            });
        }
    } catch (error) {
        logger.error('Error in test unstable endpoint', { error: error.message });
        return res.status(500).json({
            success: false,
            error: 'Unexpected error in test endpoint',
            message: error.message,
        });
    }
});

/**
 * Test API endpoint that always succeeds
 */
router.get('/test/stable', async (req, res) => {
    const delay = parseInt(req.query.delay) || 100;
    await new Promise(resolve => setTimeout(resolve, delay));

    return res.status(200).json({
        success: true,
        message: 'Request succeeded (stable endpoint)',
        timestamp: new Date().toISOString(),
        data: {
            status: 'ok',
            responseTime: delay,
        },
    });
});

/**
 * Test API endpoint that always fails
 */
router.get('/test/failing', async (req, res) => {
    const statusCode = parseInt(req.query.statusCode) || 500;
    const delay = parseInt(req.query.delay) || 100;
    
    await new Promise(resolve => setTimeout(resolve, delay));

    return res.status(statusCode).json({
        success: false,
        error: `Simulated ${statusCode} error`,
        timestamp: new Date().toISOString(),
        statusCode,
    });
});

/**
 * Test API endpoint with configurable behavior
 * POST body can specify success rate, delay, error type
 */
router.post('/test/configurable', async (req, res) => {
    try {
        const {
            successRate = 50,
            delay = null,
            errorType = 'random',
            statusCode = 500,
        } = req.body;

        const actualDelay = delay || Math.floor(Math.random() * 400) + 100;
        await new Promise(resolve => setTimeout(resolve, actualDelay));

        const random = Math.random() * 100;
        const shouldSucceed = random < successRate;

        if (shouldSucceed) {
            return res.status(200).json({
                success: true,
                message: 'Request succeeded',
                timestamp: new Date().toISOString(),
                config: {
                    successRate,
                    delay: actualDelay,
                },
            });
        } else {
            let errorStatus = statusCode;
            let errorMessage = `Simulated ${statusCode} error`;

            if (errorType === 'random') {
                const errorTypes = [500, 502, 503, 504];
                errorStatus = errorTypes[Math.floor(Math.random() * errorTypes.length)];
                errorMessage = `Simulated ${errorStatus} error`;
            }

            return res.status(errorStatus).json({
                success: false,
                error: errorMessage,
                timestamp: new Date().toISOString(),
                statusCode: errorStatus,
                config: {
                    successRate,
                    delay: actualDelay,
                },
            });
        }
    } catch (error) {
        logger.error('Error in configurable test endpoint', { error: error.message });
        return res.status(500).json({
            success: false,
            error: 'Unexpected error',
            message: error.message,
        });
    }
});

/**
 * Get endpoint info and statistics
 */
router.get('/test/info', (req, res) => {
    res.json({
        success: true,
        endpoints: {
            '/test/unstable': {
                method: 'GET',
                description: 'Randomly succeeds or fails based on success rate',
                queryParams: {
                    successRate: 'Percentage of success (0-100), default: 50',
                    delay: 'Response delay in ms, default: random 100-500ms',
                    errorType: "Type of error ('500', '404', '503', 'timeout', 'random'), default: 'random'",
                },
                example: '/api/test/unstable?successRate=30&delay=200&errorType=500',
            },
            '/test/stable': {
                method: 'GET',
                description: 'Always succeeds',
                queryParams: {
                    delay: 'Response delay in ms, default: 100ms',
                },
                example: '/api/test/stable?delay=150',
            },
            '/test/failing': {
                method: 'GET',
                description: 'Always fails',
                queryParams: {
                    statusCode: 'HTTP status code to return, default: 500',
                    delay: 'Response delay in ms, default: 100ms',
                },
                example: '/api/test/failing?statusCode=503&delay=200',
            },
            '/test/configurable': {
                method: 'POST',
                description: 'Configurable test endpoint with POST body',
                body: {
                    successRate: 'Percentage of success (0-100), default: 50',
                    delay: 'Response delay in ms, default: random 100-500ms',
                    errorType: "Type of error ('500', '404', '503', 'timeout', 'random'), default: 'random'",
                    statusCode: 'HTTP status code for errors, default: 500',
                },
                example: {
                    successRate: 30,
                    delay: 200,
                    errorType: '500',
                },
            },
        },
        usage: {
            monitoring: 'Use /test/unstable with successRate=30 to simulate intermittent failures',
            testing: 'Use /test/stable for always-successful requests',
            debugging: 'Use /test/failing to test error handling',
        },
    });
});

export default router;

