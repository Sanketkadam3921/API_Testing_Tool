import axios from "axios";

export const runApiTest = async (test) => {
    try {
        const start = Date.now();
        const response = await axios({
            method: test.method,
            url: test.url,
            headers: test.headers || {},
            data: test.body || {},
            timeout: test.threshold_ms || 5000,
        });
        const duration = Date.now() - start;

        return {
            status: response.status,
            responseTime: duration,
            data: response.data,
        };
    } catch (err) {
        const duration = Date.now() - (err.config?.metadata?.start || Date.now());
        return {
            status: err.response?.status || 500,
            responseTime: duration,
            error: err.message,
        };
    }
};
