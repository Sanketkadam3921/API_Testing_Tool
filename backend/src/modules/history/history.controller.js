import { HistoryService } from './history.service.js';

export const HistoryController = {
    // Get user's request history
    getHistory: async (req, res, next) => {
        try {
            const { getDefaultUserId } = await import('../../utils/defaultUser.js');
            const userId = req.query.user_id || await getDefaultUserId();
            
            const options = {
                limit: parseInt(req.query.limit) || 50,
                offset: parseInt(req.query.offset) || 0,
                method: req.query.method || null,
                statusCode: req.query.status_code ? parseInt(req.query.status_code) : null,
                startDate: req.query.start_date || null,
                endDate: req.query.end_date || null,
                search: req.query.search || null,
            };

            const history = await HistoryService.getHistory(userId, options);
            
            res.status(200).json({
                success: true,
                history,
                pagination: {
                    limit: options.limit,
                    offset: options.offset,
                },
            });
        } catch (err) {
            next(err);
        }
    },

    // Get history statistics
    getHistoryStats: async (req, res, next) => {
        try {
            const { getDefaultUserId } = await import('../../utils/defaultUser.js');
            const userId = req.query.user_id || await getDefaultUserId();
            
            const options = {
                startDate: req.query.start_date || null,
                endDate: req.query.end_date || null,
            };

            const stats = await HistoryService.getHistoryStats(userId, options);
            
            res.status(200).json({
                success: true,
                stats: {
                    totalRequests: parseInt(stats.total_requests) || 0,
                    successfulRequests: parseInt(stats.successful_requests) || 0,
                    failedRequests: parseInt(stats.failed_requests) || 0,
                    avgResponseTime: parseFloat(stats.avg_response_time) || 0,
                    minResponseTime: parseInt(stats.min_response_time) || 0,
                    maxResponseTime: parseInt(stats.max_response_time) || 0,
                    uniqueMethods: parseInt(stats.unique_methods) || 0,
                    uniqueUrls: parseInt(stats.unique_urls) || 0,
                },
            });
        } catch (err) {
            next(err);
        }
    },

    // Get history item by ID
    getHistoryById: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { getDefaultUserId } = await import('../../utils/defaultUser.js');
            const userId = req.query.user_id || await getDefaultUserId();

            const historyItem = await HistoryService.getHistoryById(id, userId);
            
            if (!historyItem) {
                return res.status(404).json({
                    success: false,
                    message: 'History item not found',
                });
            }

            res.status(200).json({
                success: true,
                history: historyItem,
            });
        } catch (err) {
            next(err);
        }
    },

    // Delete history item
    deleteHistory: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { getDefaultUserId } = await import('../../utils/defaultUser.js');
            const userId = req.query.user_id || await getDefaultUserId();

            const deleted = await HistoryService.deleteHistory(id, userId);
            
            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'History item not found',
                });
            }

            res.status(200).json({
                success: true,
                message: 'History item deleted successfully',
            });
        } catch (err) {
            next(err);
        }
    },

    // Clear all history
    clearHistory: async (req, res, next) => {
        try {
            const { getDefaultUserId } = await import('../../utils/defaultUser.js');
            const userId = req.query.user_id || await getDefaultUserId();

            const result = await HistoryService.clearHistory(userId);
            
            res.status(200).json({
                success: true,
                message: 'History cleared successfully',
                deletedCount: parseInt(result.deleted_count) || 0,
            });
        } catch (err) {
            next(err);
        }
    },
};

