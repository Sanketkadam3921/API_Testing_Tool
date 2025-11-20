import { MonitorsService } from "./monitors.service.js";

export const MonitorsController = {
    create: async (req, res, next) => {
        try {
            const { name, description, request_id, interval_min, threshold_ms, method, url, headers, body, params } = req.body;

            let finalRequestId = null;

            // If request_id is provided, verify it exists
            if (request_id) {
                const { CollectionsService } = await import('../collections/collections.service.js');
                const existingRequest = await CollectionsService.getRequestById(request_id);
                if (existingRequest) {
                    finalRequestId = request_id;
                }
            }

            // If no valid request_id found, create a new request
            if (!finalRequestId) {
                if (!method || !url) {
                    return res.status(400).json({
                        success: false,
                        message: "Request ID does not exist in the database. Please provide method and url fields to create a new request, or use a valid request_id.",
                        details: {
                            provided_request_id: request_id,
                            missing_fields: [].concat(!method ? ['method'] : [], !url ? ['url'] : [])
                        }
                    });
                }

                const { CollectionsService } = await import('../collections/collections.service.js');

                // Use authenticated user ID
                const userId = req.user?.id;
                if (!userId) {
                    return res.status(401).json({ success: false, message: "Unauthorized" });
                }
                let tempCollection;
                
                try {
                    // First try to find existing "Standalone Monitors" collection
                    const collections = await CollectionsService.getCollectionsByUser(userId);
                    tempCollection = collections.find(c => c.name === 'Standalone Monitors');
                    
                    if (!tempCollection) {
                        // Ensure user exists before creating collection
                        await getDefaultUserId();
                        // Try to create collection
                        try {
                            tempCollection = await CollectionsService.createCollection(
                                userId,
                                'Standalone Monitors',
                                'Auto-created collection for standalone monitors'
                            );
                        } catch (collectionError) {
                            // If collection creation still fails, create request without collection
                            console.warn('Could not create collection, attempting direct request creation:', collectionError.message);
                            tempCollection = null;
                        }
                    }
                } catch (error) {
                    console.warn('Error finding/creating collection:', error.message);
                    tempCollection = null;
                }

                const requestData = {
                    name: name || 'Monitor Request',
                    method: method || 'GET',
                    url,
                    headers: headers || [],
                    body: body || '',
                    params: params || [],
                    description: description || '',
                    order: 0
                };

                let newRequest;
                if (tempCollection) {
                    newRequest = await CollectionsService.createRequest(
                        tempCollection.id,
                        null, // no folder
                        requestData
                    );
                } else {
                    // Create request directly in database without collection
                    const pool = (await import('../../config/db.js')).default;
                    const { v4: uuidv4 } = await import('uuid');
                    const requestId = uuidv4();
                    const result = await pool.query(
                        `INSERT INTO requests (id, name, method, url, headers, body, params, description, collection_id, folder_id, "order", created_at, updated_at)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NULL, NULL, $9, NOW(), NOW())
                         RETURNING *`,
                        [
                            requestId,
                            requestData.name,
                            requestData.method,
                            requestData.url,
                            JSON.stringify(requestData.headers || []),
                            requestData.body || '',
                            JSON.stringify(requestData.params || []),
                            requestData.description || '',
                            0
                        ]
                    );
                    newRequest = result.rows[0];
                }

                finalRequestId = newRequest.id;
            }

            // Use authenticated user ID
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const monitor = await MonitorsService.createMonitor(
                name || 'Untitled Monitor',
                description,
                finalRequestId,
                userId,
                interval_min || 5,
                threshold_ms || 500
            );

            res.status(201).json({ success: true, monitor });
        } catch (err) {
            next(err);
        }
    },

    getAll: async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const monitors = await MonitorsService.getAllMonitors(userId);
            res.status(200).json({ success: true, monitors });
        } catch (err) {
            next(err);
        }
    },

    getById: async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const monitor = await MonitorsService.getMonitorById(
                req.params.id,
                userId
            );
            if (!monitor) {
                return res.status(404).json({
                    success: false,
                    message: "Monitor not found"
                });
            }
            res.status(200).json({ success: true, monitor });
        } catch (err) {
            next(err);
        }
    },

    updateStatus: async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            // Verify monitor belongs to user before updating
            const existingMonitor = await MonitorsService.getMonitorById(req.params.id, userId);
            if (!existingMonitor) {
                return res.status(404).json({
                    success: false,
                    message: "Monitor not found"
                });
            }
            const { is_active } = req.body;
            const monitor = await MonitorsService.updateMonitorStatus(
                req.params.id,
                is_active
            );
            res.status(200).json({
                success: true,
                message: `Monitor ${is_active ? 'started' : 'stopped'} successfully`,
                monitor
            });
        } catch (err) {
            next(err);
        }
    },

    delete: async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            // Verify monitor belongs to user before deleting
            const monitor = await MonitorsService.getMonitorById(req.params.id, userId);
            if (!monitor) {
                return res.status(404).json({
                    success: false,
                    message: "Monitor not found"
                });
            }
            await MonitorsService.deleteMonitor(req.params.id);
            res.status(200).json({
                success: true,
                message: "Monitor deleted successfully"
            });
        } catch (err) {
            next(err);
        }
    },

    getStats: async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const stats = await MonitorsService.getMonitorStats(userId);
            res.status(200).json({ success: true, stats });
        } catch (err) {
            next(err);
        }
    },

    runTest: async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            // Verify monitor belongs to user before running test
            const monitor = await MonitorsService.getMonitorById(req.params.id, userId);
            if (!monitor) {
                return res.status(404).json({
                    success: false,
                    message: "Monitor not found"
                });
            }
            const result = await MonitorsService.runMonitorTest(req.params.id);
            res.status(200).json({ success: true, result });
        } catch (err) {
            next(err);
        }
    }
};
