import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // Log error details
    logger.error('Error occurred', {
        message,
        status,
        stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
        path: req.path,
        method: req.method,
        ip: req.ip,
    });

    // Don't expose stack trace in production
    res.status(status).json({
        success: false,
        message: process.env.NODE_ENV === 'production' && status === 500
            ? 'Internal Server Error'
            : message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
};
