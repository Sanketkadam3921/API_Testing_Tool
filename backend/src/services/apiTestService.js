import axios from 'axios';
import { logger } from '../utils/logger.js';

export const ApiTestService = {
    async testApi(requestData) {
        const { method, url, headers = {}, body } = requestData;
        const startTime = Date.now();

        try {
            logger.info('Testing API', { method, url, headers: Object.keys(headers) });

            // Prepare axios config
            const config = {
                method: method.toLowerCase(),
                url,
                headers: {
                    'User-Agent': 'API-Testing-Tool/1.0',
                    ...headers,
                },
                timeout: 30000, // 30 seconds timeout
                validateStatus: () => true, // Don't throw on HTTP error status codes
            };

            // Add body for methods that support it
            if (['post', 'put', 'patch'].includes(method.toLowerCase())) {
                // POST, PUT, PATCH require JSON body
                if (!body) {
                    return {
                        success: false,
                        error: 'Body is required for POST, PUT, and PATCH requests and must be valid JSON',
                        status: null,
                        responseTime: Date.now() - startTime,
                    };
                }

                // Ensure Content-Type is set to application/json
                config.headers['Content-Type'] = 'application/json';

                // Validate and parse JSON body
                let parsedBody;
                try {
                    if (typeof body === 'string') {
                        parsedBody = JSON.parse(body);
                    } else if (typeof body === 'object' && body !== null) {
                        // Already an object, validate it's JSON-serializable
                        parsedBody = body;
                    } else {
                        return {
                            success: false,
                            error: 'Body must be valid JSON format (object or valid JSON string)',
                            status: null,
                            responseTime: Date.now() - startTime,
                        };
                    }
                } catch (error) {
                    logger.warn('Invalid JSON body', { body, error: error.message });
                    return {
                        success: false,
                        error: `Invalid JSON format: ${error.message}. Body must be valid JSON.`,
                        status: null,
                        responseTime: Date.now() - startTime,
                    };
                }

                config.data = parsedBody;
            }

            // Make the request
            const response = await axios(config);
            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // Calculate response size
            const responseSize = this.calculateResponseSize(response.data, response.headers);

            logger.info('API test completed', {
                method,
                url,
                status: response.status,
                responseTime,
                responseSize,
            });

            return {
                success: true,
                status: response.status,
                statusText: response.statusText,
                data: response.data,
                headers: response.headers,
                responseTime,
                size: responseSize,
            };

        } catch (error) {
            const endTime = Date.now();
            const responseTime = endTime - startTime;

            logger.error('API test failed', {
                method,
                url,
                error: error.message,
                responseTime,
            });

            // Handle different types of errors
            if (error.code === 'ECONNREFUSED') {
                return {
                    success: false,
                    error: 'Connection refused - the server is not responding',
                    status: null,
                    responseTime,
                };
            }

            if (error.code === 'ENOTFOUND') {
                return {
                    success: false,
                    error: 'Host not found - check the URL',
                    status: null,
                    responseTime,
                };
            }

            if (error.code === 'ETIMEDOUT') {
                return {
                    success: false,
                    error: 'Request timeout - the server took too long to respond',
                    status: null,
                    responseTime,
                };
            }

            if (error.response) {
                // Server responded with error status
                const responseSize = this.calculateResponseSize(error.response.data, error.response.headers);

                return {
                    success: false,
                    status: error.response.status,
                    statusText: error.response.statusText,
                    data: error.response.data,
                    headers: error.response.headers,
                    responseTime,
                    size: responseSize,
                    error: `HTTP ${error.response.status}: ${error.response.statusText}`,
                };
            }

            // Other errors
            return {
                success: false,
                error: error.message || 'Unknown error occurred',
                status: null,
                responseTime,
            };
        }
    },

    calculateResponseSize(data, headers) {
        let size = 0;

        // Calculate from content-length header if available
        const contentLength = headers['content-length'];
        if (contentLength) {
            size = parseInt(contentLength, 10);
        } else if (data) {
            // Estimate size from data (Node.js compatible)
            if (typeof data === 'string') {
                size = Buffer.byteLength(data, 'utf8');
            } else if (typeof data === 'object') {
                size = Buffer.byteLength(JSON.stringify(data), 'utf8');
            }
        }

        // Format size
        if (size === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(size) / Math.log(k));
        return parseFloat((size / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    },
};
