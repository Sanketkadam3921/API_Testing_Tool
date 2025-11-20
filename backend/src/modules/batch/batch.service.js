import { ApiTestService } from '../../services/apiTestService.js';
import { logger } from '../../utils/logger.js';

export const BatchService = {
    // Execute multiple requests in parallel or sequence
    async executeBatch(requests, options = {}) {
        const {
            mode = 'parallel', // 'parallel' or 'sequential'
            stopOnError = false,
            delayBetweenRequests = 0, // milliseconds
        } = options;

        const results = [];
        const startTime = Date.now();

        try {
            if (mode === 'parallel') {
                // Execute all requests in parallel
                const promises = requests.map((request, index) =>
                    this.executeRequest(request, index)
                        .catch(error => ({
                            success: false,
                            error: error.message,
                            index,
                            request,
                        }))
                );

                const batchResults = await Promise.all(promises);
                results.push(...batchResults);
            } else {
                // Execute requests sequentially
                for (let i = 0; i < requests.length; i++) {
                    const request = requests[i];
                    
                    try {
                        const result = await this.executeRequest(request, i);
                        results.push(result);
                        
                        if (stopOnError && !result.success) {
                            logger.info('Batch execution stopped due to error', { index: i });
                            break;
                        }
                        
                        // Delay between requests if specified
                        if (delayBetweenRequests > 0 && i < requests.length - 1) {
                            await new Promise(resolve => setTimeout(resolve, delayBetweenRequests));
                        }
                    } catch (error) {
                        const errorResult = {
                            success: false,
                            error: error.message,
                            index: i,
                            request,
                        };
                        results.push(errorResult);
                        
                        if (stopOnError) {
                            logger.info('Batch execution stopped due to error', { index: i });
                            break;
                        }
                    }
                }
            }

            const endTime = Date.now();
            const totalTime = endTime - startTime;

            // Calculate statistics
            const stats = this.calculateBatchStats(results);

            return {
                success: true,
                results,
                stats: {
                    ...stats,
                    totalTime,
                    mode,
                    totalRequests: requests.length,
                },
            };
        } catch (error) {
            logger.error('Batch execution failed', { error: error.message });
            throw error;
        }
    },

    // Execute a single request
    async executeRequest(request, index) {
        try {
            const result = await ApiTestService.testApi({
                method: request.method,
                url: request.url,
                headers: request.headers || {},
                body: request.body,
            });

            return {
                ...result,
                index,
                request: {
                    method: request.method,
                    url: request.url,
                },
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                index,
                request: {
                    method: request.method,
                    url: request.url,
                },
            };
        }
    },

    // Calculate batch execution statistics
    calculateBatchStats(results) {
        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);
        
        const responseTimes = results
            .filter(r => r.responseTime)
            .map(r => r.responseTime);
        
        const avgResponseTime = responseTimes.length > 0
            ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
            : 0;

        const statusCodes = {};
        results.forEach(r => {
            if (r.status) {
                const code = Math.floor(r.status / 100) * 100; // Group by 100s
                statusCodes[code] = (statusCodes[code] || 0) + 1;
            }
        });

        return {
            total: results.length,
            successful: successful.length,
            failed: failed.length,
            successRate: results.length > 0 ? (successful.length / results.length) * 100 : 0,
            avgResponseTime: Math.round(avgResponseTime),
            minResponseTime: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
            maxResponseTime: responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
            statusCodes,
        };
    },
};

