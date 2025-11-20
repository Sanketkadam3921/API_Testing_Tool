/**
 * Cache middleware for API responses
 * Sets appropriate cache headers based on endpoint
 */
export const cacheMiddleware = (duration = 60) => {
    return (req, res, next) => {
        // Only cache GET requests
        if (req.method === 'GET') {
            // Don't cache authenticated routes or dynamic data
            const noCachePaths = [
                '/api/monitors',
                '/api/metrics',
                '/api/alerts',
                '/api/tests',
            ];

            const shouldCache = !noCachePaths.some(path => req.path.startsWith(path));

            if (shouldCache) {
                res.set('Cache-Control', `public, max-age=${duration}`);
            } else {
                res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
                res.set('Pragma', 'no-cache');
                res.set('Expires', '0');
            }
        }

        next();
    };
};


