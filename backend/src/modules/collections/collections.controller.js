import { CollectionsService } from "./collections.service.js";

export const CollectionsController = {
    // Collections
    createCollection: async (req, res, next) => {
        try {
            const { name, description } = req.body;
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            if (!name || name.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Collection name is required'
                });
            }

            const collection = await CollectionsService.createCollection(
                userId,
                name?.trim() || '',
                description?.trim() || ''
            );

            res.status(201).json({
                success: true,
                collection
            });
        } catch (err) {
            next(err);
        }
    },

    getCollections: async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const collections = await CollectionsService.getCollectionsByUser(userId);

            res.status(200).json({
                success: true,
                collections
            });
        } catch (err) {
            next(err);
        }
    },

    getCollection: async (req, res, next) => {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const collection = await CollectionsService.getCollectionById(id, userId);
            if (!collection) {
                return res.status(404).json({
                    success: false,
                    message: 'Collection not found'
                });
            }

            res.status(200).json({
                success: true,
                collection
            });
        } catch (err) {
            next(err);
        }
    },

    updateCollection: async (req, res, next) => {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const updates = req.body;

            const collection = await CollectionsService.updateCollection(id, userId, updates);
            if (!collection) {
                return res.status(404).json({
                    success: false,
                    message: 'Collection not found'
                });
            }

            res.status(200).json({
                success: true,
                collection
            });
        } catch (err) {
            next(err);
        }
    },

    deleteCollection: async (req, res, next) => {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            // Verify collection exists before attempting deletion
            const existingCollection = await CollectionsService.getCollectionById(id, userId);
            if (!existingCollection) {
                return res.status(404).json({
                    success: false,
                    message: 'Collection not found or you do not have permission to delete it'
                });
            }

            const collection = await CollectionsService.deleteCollection(id, userId);
            if (!collection) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to delete collection. It may have dependencies that prevent deletion.'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Collection deleted successfully'
            });
        } catch (err) {
            console.error('Error in deleteCollection controller:', err);
            res.status(500).json({
                success: false,
                message: err.message || 'Failed to delete collection'
            });
        }
    },

    // Folders
    createFolder: async (req, res, next) => {
        try {
            const { collectionId } = req.params;
            const { name, description, parentId, order } = req.body;

            if (!name || name.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Folder name is required'
                });
            }

            const folder = await CollectionsService.createFolder(
                collectionId,
                name?.trim() || '',
                description?.trim() || '',
                parentId || null,
                order || 0
            );

            res.status(201).json({
                success: true,
                folder
            });
        } catch (err) {
            next(err);
        }
    },

    getFolders: async (req, res, next) => {
        try {
            const { collectionId } = req.params;
            const folders = await CollectionsService.getFoldersByCollection(collectionId);

            res.status(200).json({
                success: true,
                folders
            });
        } catch (err) {
            next(err);
        }
    },

    updateFolder: async (req, res, next) => {
        try {
            const { id } = req.params;
            const updates = req.body;

            const folder = await CollectionsService.updateFolder(id, updates);
            if (!folder) {
                return res.status(404).json({
                    success: false,
                    message: 'Folder not found'
                });
            }

            res.status(200).json({
                success: true,
                folder
            });
        } catch (err) {
            next(err);
        }
    },

    deleteFolder: async (req, res, next) => {
        try {
            const { id } = req.params;

            const folder = await CollectionsService.deleteFolder(id);
            if (!folder) {
                return res.status(404).json({
                    success: false,
                    message: 'Folder not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Folder deleted successfully'
            });
        } catch (err) {
            next(err);
        }
    },

    // Requests
    createRequest: async (req, res, next) => {
        try {
            const { collectionId } = req.params;
            const { folderId, ...requestData } = req.body;

            if (!requestData.name || requestData.name.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Request name is required'
                });
            }

            if (!requestData.url || requestData.url.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Request URL is required'
                });
            }

            const request = await CollectionsService.createRequest(
                collectionId,
                folderId || null,
                requestData
            );

            res.status(201).json({
                success: true,
                request
            });
        } catch (err) {
            next(err);
        }
    },

    getRequests: async (req, res, next) => {
        try {
            const { collectionId } = req.params;
            const { folderId } = req.query;

            let requests;
            if (folderId) {
                requests = await CollectionsService.getRequestsByFolder(folderId);
            } else {
                requests = await CollectionsService.getRequestsByCollection(collectionId);
            }

            res.status(200).json({
                success: true,
                requests
            });
        } catch (err) {
            next(err);
        }
    },

    getRequest: async (req, res, next) => {
        try {
            const { id } = req.params;

            const request = await CollectionsService.getRequestById(id);
            if (!request) {
                return res.status(404).json({
                    success: false,
                    message: 'Request not found'
                });
            }

            res.status(200).json({
                success: true,
                request
            });
        } catch (err) {
            next(err);
        }
    },

    updateRequest: async (req, res, next) => {
        try {
            const { id } = req.params;
            const updates = req.body;

            const request = await CollectionsService.updateRequest(id, updates);
            if (!request) {
                return res.status(404).json({
                    success: false,
                    message: 'Request not found'
                });
            }

            res.status(200).json({
                success: true,
                request
            });
        } catch (err) {
            next(err);
        }
    },

    deleteRequest: async (req, res, next) => {
        try {
            const { id } = req.params;

            const request = await CollectionsService.deleteRequest(id);
            if (!request) {
                return res.status(404).json({
                    success: false,
                    message: 'Request not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Request deleted successfully'
            });
        } catch (err) {
            next(err);
        }
    },

    moveRequest: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { folderId, collectionId } = req.body;

            const request = await CollectionsService.moveRequest(id, folderId, collectionId);
            if (!request) {
                return res.status(404).json({
                    success: false,
                    message: 'Request not found'
                });
            }

            res.status(200).json({
                success: true,
                request
            });
        } catch (err) {
            next(err);
        }
    },

    // Get full collection structure
    getCollectionStructure: async (req, res, next) => {
        try {
            const { collectionId } = req.params;
            const structure = await CollectionsService.getCollectionStructure(collectionId);

            res.status(200).json({
                success: true,
                structure
            });
        } catch (err) {
            next(err);
        }
    }
};
