/**
 * Safely parse JSON strings with fallback to empty array/object
 * Handles both JSON strings and already-parsed objects (from PostgreSQL JSONB)
 * @param {string|object|array} jsonString - The JSON string or object to parse
 * @param {any} fallback - Fallback value if parsing fails (default: [])
 * @returns {any} Parsed JSON or fallback
 */
export const safeParseJson = (jsonString, fallback = []) => {
    // If it's already an object or array, return it as-is
    if (typeof jsonString === 'object' && jsonString !== null) {
        return jsonString;
    }

    // If it's null, undefined, or empty string, return fallback
    if (!jsonString || jsonString === 'null' || jsonString === '' || jsonString === '[]') {
        return fallback;
    }

    // If it's not a string, return fallback
    if (typeof jsonString !== 'string') {
        return fallback;
    }

    try {
        return JSON.parse(jsonString);
    } catch (error) {
        // Use logger instead of console.warn in production
        if (process.env.NODE_ENV !== 'production') {
            console.warn('Failed to parse JSON:', jsonString, error.message);
        }
        return fallback;
    }
};


