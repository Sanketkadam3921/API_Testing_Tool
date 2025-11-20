/**
 * Input validation utilities
 */

/**
 * Validate URL format according to URL standards (RFC 3986)
 * @param {string} url - URL to validate
 * @returns {{ valid: boolean, error?: string }} Validation result with error message
 */
export const validateUrl = (url) => {
    if (!url || typeof url !== 'string') {
        return { valid: false, error: 'URL is required' };
    }

    const trimmedUrl = url.trim();
    
    if (trimmedUrl === '') {
        return { valid: false, error: 'URL cannot be empty' };
    }

    // Try to parse as absolute URL
    try {
        const urlObj = new URL(trimmedUrl);
        
        // Check for valid protocol (http, https)
        const validProtocols = ['http:', 'https:'];
        if (!validProtocols.includes(urlObj.protocol.toLowerCase())) {
            return { 
                valid: false, 
                error: 'URL must use http:// or https:// protocol' 
            };
        }

        // Check for valid hostname
        if (!urlObj.hostname || urlObj.hostname.length === 0) {
            return { valid: false, error: 'URL must include a valid hostname' };
        }

        // Check for localhost or valid domain
        const hostname = urlObj.hostname.toLowerCase();
        const localhostPattern = /^localhost(:\d+)?$/;
        const ipPattern = /^(\d{1,3}\.){3}\d{1,3}(:\d+)?$/;
        const domainPattern = /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
        
        if (!localhostPattern.test(hostname) && 
            !ipPattern.test(hostname) && 
            !domainPattern.test(hostname)) {
            return { valid: false, error: 'URL must have a valid hostname or domain' };
        }

        // Check for invalid characters in path
        if (urlObj.pathname && /[<>"{}|\\^`[\]]/.test(urlObj.pathname)) {
            return { valid: false, error: 'URL contains invalid characters' };
        }

        return { valid: true };
    } catch {
        // If URL parsing fails, check if it's a relative path (for internal use)
        // But for API testing, we generally want absolute URLs
        if (trimmedUrl.startsWith('/') || trimmedUrl.startsWith('./')) {
            return { 
                valid: false, 
                error: 'Please enter a complete URL with protocol (http:// or https://)' 
            };
        }

        // Check for common mistakes
        if (!trimmedUrl.includes('://')) {
            return { 
                valid: false, 
                error: 'URL must include protocol (http:// or https://)' 
            };
        }

        return { valid: false, error: 'Invalid URL format' };
    }
};

/**
 * Validate URL format (simple boolean version for backward compatibility)
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
export const isValidUrl = (url) => {
    return validateUrl(url).valid;
};

/**
 * Validate JSON string
 * @param {string} jsonString - JSON string to validate
 * @returns {{ valid: boolean, error?: string }} Validation result
 */
export const isValidJson = (jsonString) => {
    if (!jsonString || typeof jsonString !== 'string') {
        return { valid: false, error: 'JSON string is required' };
    }

    try {
        JSON.parse(jsonString);
        return { valid: true };
    } catch (error) {
        return { valid: false, error: error.message };
    }
};

/**
 * Sanitize input to prevent XSS
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input
        .replace(/[<>]/g, '') // Remove angle brackets
        .trim();
};


