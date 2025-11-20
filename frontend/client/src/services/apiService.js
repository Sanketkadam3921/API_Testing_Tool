import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 seconds timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add JWT token to requests
apiClient.interceptors.request.use(
    (config) => {
        // Add JWT token from localStorage if available
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Only log in development
        if (import.meta.env.DEV) {
        console.log(`Making ${config.method?.toUpperCase()} request to:`, config.url);
        }
        return config;
    },
    (error) => {
        if (import.meta.env.DEV) {
        console.error('Request error:', error);
        }
        return Promise.reject(error);
    }
);

// Response interceptor - Handle token expiration and errors
apiClient.interceptors.response.use(
    (response) => {
        if (import.meta.env.DEV) {
            console.log(`Response received:`, response.status, response.statusText);
        }
        return response;
    },
    (error) => {
        // Handle 401/403 errors (unauthorized/forbidden) - token expired or invalid
        if (error.response?.status === 401 || error.response?.status === 403) {
            // Don't redirect if this is an auth endpoint (login/signup) - those can return 401 legitimately
            const isAuthEndpoint = error.config?.url?.includes('/api/auth/login') || 
                                  error.config?.url?.includes('/api/auth/register');
            
            if (!isAuthEndpoint) {
                // Clear auth data
                localStorage.removeItem('authToken');
                localStorage.removeItem('authUser');
                
                // Only redirect if we're not already on login/signup pages
                // Use window.location.origin to ensure we stay on the frontend domain
                const currentPath = window.location.pathname;
                if (currentPath !== '/login' && currentPath !== '/signup' && currentPath !== '/') {
                    // Use window.location.origin to redirect to frontend, not API
                    window.location.href = `${window.location.origin}/login`;
                }
            }
        }
        
        // Always log errors, but format them nicely
        const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
        if (import.meta.env.DEV) {
            console.error('Response error:', error.response?.status, errorMessage);
        }
        return Promise.reject(error);
    }
);

export const apiService = {
    // Test API endpoint
    async testApi(requestData) {
        const response = await apiClient.post('/api/test', requestData);
        return response.data;
    },

    // Auth endpoints
    async login(credentials) {
        const response = await apiClient.post('/api/auth/login', credentials);
        return response.data;
    },

    async register(userData) {
        const response = await apiClient.post('/api/auth/register', userData);
        return response.data;
    },

    async getProfile() {
        const response = await apiClient.get('/api/auth/profile');
        return response.data;
    },

    // Auth helpers
    isAuthenticated() {
        return !!localStorage.getItem('authToken');
    },

    getCurrentUser() {
        const userStr = localStorage.getItem('authUser');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch {
                return null;
            }
        }
        return null;
    },

    getAuthToken() {
        return localStorage.getItem('authToken');
    },

    // Test management endpoints
    async createTest(testData) {
        const response = await apiClient.post('/api/tests/create', testData);
        return response.data;
    },

    async getAllTests() {
        const response = await apiClient.get('/api/tests');
        return response.data;
    },

    async getTestById(id) {
        const response = await apiClient.get(`/api/tests/${id}`);
        return response.data;
    },

    async updateTest(id, testData) {
        const response = await apiClient.put(`/api/tests/${id}`, testData);
        return response.data;
    },

    async deleteTest(id) {
        const response = await apiClient.delete(`/api/tests/${id}`);
        return response.data;
    },

    async runTest(id) {
        const response = await apiClient.post(`/api/tests/${id}/run`);
        return response.data;
    },

    // Collections endpoints
    async get(url) {
        const response = await apiClient.get(url);
        return response.data;
    },

    async post(url, data) {
        const response = await apiClient.post(url, data);
        return response.data;
    },

    async put(url, data) {
        const response = await apiClient.put(url, data);
        return response.data;
    },

    async delete(url) {
        const response = await apiClient.delete(url);
        return response.data;
    },

    // Collections CRUD
    async createCollection(collectionData) {
        const response = await apiClient.post('/api/collections', collectionData);
        return response.data;
    },

    async getCollections() {
        const response = await apiClient.get('/api/collections');
        return response.data;
    },

    async getCollection(id) {
        const response = await apiClient.get(`/api/collections/${id}`);
        return response.data;
    },

    async updateCollection(id, collectionData) {
        const response = await apiClient.put(`/api/collections/${id}`, collectionData);
        return response.data;
    },

    async deleteCollection(id) {
        const response = await apiClient.delete(`/api/collections/${id}`);
        return response.data;
    },

    // Folders CRUD
    async createFolder(collectionId, folderData) {
        const response = await apiClient.post(`/api/collections/${collectionId}/folders`, folderData);
        return response.data;
    },

    async getFolders(collectionId) {
        const response = await apiClient.get(`/api/collections/${collectionId}/folders`);
        return response.data;
    },

    async updateFolder(folderId, folderData) {
        const response = await apiClient.put(`/api/collections/folders/${folderId}`, folderData);
        return response.data;
    },

    async deleteFolder(folderId) {
        const response = await apiClient.delete(`/api/collections/folders/${folderId}`);
        return response.data;
    },

    // Requests CRUD
    async createRequest(collectionId, requestData) {
        const response = await apiClient.post(`/api/collections/${collectionId}/requests`, requestData);
        return response.data;
    },

    async getRequests(collectionId, folderId = null) {
        const url = folderId
            ? `/api/collections/${collectionId}/requests?folderId=${folderId}`
            : `/api/collections/${collectionId}/requests`;
        const response = await apiClient.get(url);
        return response.data;
    },

    async getRequest(requestId) {
        const response = await apiClient.get(`/api/collections/requests/${requestId}`);
        return response.data;
    },

    async updateRequest(requestId, requestData) {
        const response = await apiClient.put(`/api/collections/requests/${requestId}`, requestData);
        return response.data;
    },

    async deleteRequest(requestId) {
        const response = await apiClient.delete(`/api/collections/requests/${requestId}`);
        return response.data;
    },

    async moveRequest(requestId, folderId, collectionId) {
        const response = await apiClient.post(`/api/collections/requests/${requestId}/move`, {
            folderId,
            collectionId
        });
        return response.data;
    },

    // Collection structure
    async getCollectionStructure(collectionId) {
        const response = await apiClient.get(`/api/collections/${collectionId}/structure`);
        return response.data;
    },

    // Monitoring endpoints
    async createMonitor(monitorData) {
        const response = await apiClient.post('/api/monitors', monitorData);
        return response.data;
    },

    async getMonitors() {
        const response = await apiClient.get('/api/monitors');
        return response.data;
    },

    async getMonitor(id) {
        const response = await apiClient.get(`/api/monitors/${id}`);
        return response.data;
    },

    async updateMonitorStatus(id, isActive) {
        const response = await apiClient.put(`/api/monitors/${id}/status`, { is_active: isActive });
        return response.data;
    },

    async deleteMonitor(id) {
        const response = await apiClient.delete(`/api/monitors/${id}`);
        return response.data;
    },

    async runMonitorTest(id) {
        const response = await apiClient.post(`/api/monitors/${id}/test`);
        return response.data;
    },

    async getMonitorStats() {
        const response = await apiClient.get('/api/monitors/stats');
        return response.data;
    },

    // Alerts endpoints
    async getAlerts() {
        const response = await apiClient.get('/api/alerts');
        return response.data;
    },

    async markAlertAsRead(alertId) {
        const response = await apiClient.put(`/api/alerts/${alertId}/read`);
        return response.data;
    },

    async markAllAlertsAsRead() {
        const response = await apiClient.put('/api/alerts/read-all');
        return response.data;
    },

    // Metrics endpoints
    async getMetrics(monitorId) {
        const response = await apiClient.get(`/api/metrics/${monitorId}`);
        return response.data;
    },

    async getMetricsStats(monitorId) {
        const response = await apiClient.get(`/api/metrics/${monitorId}/stats`);
        return response.data;
    },

    // History endpoints
    async getHistory(options = {}) {
        const params = new URLSearchParams();
        if (options.limit) params.append('limit', options.limit);
        if (options.offset) params.append('offset', options.offset);
        if (options.method) params.append('method', options.method);
        if (options.statusCode) params.append('status_code', options.statusCode);
        if (options.startDate) params.append('start_date', options.startDate);
        if (options.endDate) params.append('end_date', options.endDate);
        if (options.search) params.append('search', options.search);
        
        const response = await apiClient.get(`/api/history?${params.toString()}`);
        return response.data;
    },

    async getHistoryStats(options = {}) {
        const params = new URLSearchParams();
        if (options.startDate) params.append('start_date', options.startDate);
        if (options.endDate) params.append('end_date', options.endDate);
        
        const response = await apiClient.get(`/api/history/stats?${params.toString()}`);
        return response.data;
    },

    async getHistoryItem(id) {
        const response = await apiClient.get(`/api/history/${id}`);
        return response.data;
    },

    async deleteHistoryItem(id) {
        const response = await apiClient.delete(`/api/history/${id}`);
        return response.data;
    },

    async clearHistory() {
        const response = await apiClient.delete('/api/history');
        return response.data;
    },

    // Environment endpoints
    async createEnvironment(environmentData) {
        const response = await apiClient.post('/api/environments', environmentData);
        return response.data;
    },

    async getEnvironments() {
        const response = await apiClient.get('/api/environments');
        return response.data;
    },

    async getEnvironment(id) {
        const response = await apiClient.get(`/api/environments/${id}`);
        return response.data;
    },

    async updateEnvironment(id, environmentData) {
        const response = await apiClient.put(`/api/environments/${id}`, environmentData);
        return response.data;
    },

    async deleteEnvironment(id) {
        const response = await apiClient.delete(`/api/environments/${id}`);
        return response.data;
    },

    // Batch endpoints
    async executeBatch(requests, options = {}) {
        const response = await apiClient.post('/api/batch/execute', {
            requests,
            options,
        });
        return response.data;
    },

    // Analytics endpoints
    async getAnalyticsPercentiles(monitorId, startDate = null, endDate = null) {
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        const url = `/api/analytics/monitors/${monitorId}/percentiles${params.toString() ? '?' + params.toString() : ''}`;
        const response = await apiClient.get(url);
        return response.data;
    },

    async getErrorRateTrend(monitorId, startDate = null, endDate = null, interval = 'hour') {
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        params.append('interval', interval);
        const url = `/api/analytics/monitors/${monitorId}/error-rate-trend?${params.toString()}`;
        const response = await apiClient.get(url);
        return response.data;
    },

    async getSuccessRateTrend(monitorId, startDate = null, endDate = null, interval = 'hour') {
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        params.append('interval', interval);
        const url = `/api/analytics/monitors/${monitorId}/success-rate-trend?${params.toString()}`;
        const response = await apiClient.get(url);
        return response.data;
    },

    async getComprehensiveAnalytics(monitorId, startDate = null, endDate = null) {
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        const url = `/api/analytics/monitors/${monitorId}/comprehensive${params.toString() ? '?' + params.toString() : ''}`;
        const response = await apiClient.get(url);
        return response.data;
    },

    async getAnalyticsUptime(monitorId, startDate = null, endDate = null) {
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        const url = `/api/analytics/monitors/${monitorId}/uptime${params.toString() ? '?' + params.toString() : ''}`;
        const response = await apiClient.get(url);
        return response.data;
    },

    async getRealTimeData(monitorId, minutes = 60) {
        const response = await apiClient.get(`/api/analytics/monitors/${monitorId}/realtime?minutes=${minutes}`);
        return response.data;
    },
};

export default apiService;