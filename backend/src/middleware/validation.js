import { body, validationResult } from 'express-validator';
import { logger } from '../utils/logger.js';

// Validation middleware
export const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn('Validation failed', { errors: errors.array(), body: req.body });
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

// API test validation rules
export const validateApiTest = [
    body('method')
        .isIn(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'])
        .withMessage('Method must be a valid HTTP method'),

    body('url')
        .isURL({ protocols: ['http', 'https'], require_protocol: true })
        .withMessage('URL must be a valid HTTP/HTTPS URL'),

    body('headers')
        .optional()
        .isObject()
        .withMessage('Headers must be an object'),

    body('body')
        .optional()
        .custom((value) => {
            if (typeof value === 'string') {
                try {
                    JSON.parse(value);
                    return true;
                } catch (e) {
                    throw new Error('Body must be valid JSON when provided as string');
                }
            }
            return true;
        }),
];

// Auth validation rules
export const validateLogin = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),

    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
];

export const validateRegister = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),

    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),

    body('name')
        .trim()
        .isLength({ min: 2 })
        .withMessage('Name must be at least 2 characters long'),
];

// Test creation validation
export const validateTestCreation = [
    body('name')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Test name is required'),

    body('method')
        .isIn(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'])
        .withMessage('Method must be a valid HTTP method'),

    body('url')
        .isURL({ protocols: ['http', 'https'], require_protocol: true })
        .withMessage('URL must be a valid HTTP/HTTPS URL'),

    body('headers')
        .optional()
        .isArray()
        .withMessage('Headers must be an array'),

    body('body')
        .optional()
        .isString()
        .withMessage('Body must be a string'),
];
