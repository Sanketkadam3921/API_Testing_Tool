import pool from "../../config/db.js";
import { CollectionQueries } from "./collections.queries.js";
import { v4 as uuidv4 } from 'uuid';
import { safeParseJson } from "../../utils/parseJson.js";

export const CollectionsService = {
    // Collections
    createCollection: async (userId, name, description = '') => {
        const id = uuidv4();
        const result = await pool.query(CollectionQueries.createCollection, [
            id, name, description, userId
        ]);
        return result.rows[0];
    },

    getCollectionsByUser: async (userId) => {
        const result = await pool.query(CollectionQueries.getCollectionsByUser, [userId]);
        return result.rows;
    },

    getCollectionById: async (id, userId) => {
        const result = await pool.query(CollectionQueries.getCollectionById, [id, userId]);
        return result.rows[0];
    },

    updateCollection: async (id, userId, updates) => {
        const { name, description } = updates;
        const result = await pool.query(CollectionQueries.updateCollection, [
            name || '', description || '', id, userId
        ]);
        return result.rows[0];
    },

    deleteCollection: async (id, userId) => {
        try {
            // First, verify the collection exists and belongs to the user
            const collection = await CollectionsService.getCollectionById(id, userId);
            if (!collection) {
                console.warn(`Collection ${id} not found for user ${userId}`);
                return null;
            }

            // Check if there are any monitors using requests from this collection
            // This is just for logging - CASCADE should handle it, but we want to know
            const monitorsCheck = await pool.query(`
                SELECT COUNT(*) as monitor_count
                FROM monitors m
                INNER JOIN requests r ON m.request_id = r.id
                WHERE r.collection_id = $1
            `, [id]);
            
            const monitorCount = parseInt(monitorsCheck.rows[0]?.monitor_count || 0);
            if (monitorCount > 0) {
                console.log(`Collection ${id} has ${monitorCount} monitor(s) that will be deleted via CASCADE`);
            }

            // Delete the collection (CASCADE will handle folders, requests, and monitors)
            const result = await pool.query(CollectionQueries.deleteCollection, [id, userId]);
            
            if (result.rowCount === 0) {
                console.warn(`Failed to delete collection ${id}: No rows affected. User ID: ${userId}`);
                return null;
            }

            console.log(`Successfully deleted collection ${id}`);
            return result.rows[0];
        } catch (error) {
            console.error(`Error deleting collection ${id}:`, error.message);
            // Check if it's a foreign key constraint violation
            if (error.code === '23503') {
                throw new Error('Cannot delete collection: It is referenced by other records (monitors, etc.)');
            }
            throw error;
        }
    },

    // Folders
    createFolder: async (collectionId, name, description = '', parentId = null, order = 0) => {
        const id = uuidv4();
        const result = await pool.query(CollectionQueries.createFolder, [
            id, name, description, collectionId, parentId, order
        ]);
        return result.rows[0];
    },

    getFoldersByCollection: async (collectionId) => {
        const result = await pool.query(CollectionQueries.getFoldersByCollection, [collectionId]);
        return result.rows;
    },

    getFolderById: async (id) => {
        const result = await pool.query(CollectionQueries.getFolderById, [id]);
        return result.rows[0];
    },

    updateFolder: async (id, updates) => {
        const { name, description, parentId, order } = updates;
        const result = await pool.query(CollectionQueries.updateFolder, [
            name || '', description || '', parentId, order || 0, id
        ]);
        return result.rows[0];
    },

    deleteFolder: async (id) => {
        const result = await pool.query(CollectionQueries.deleteFolder, [id]);
        return result.rows[0];
    },

    getFolderChildren: async (parentId) => {
        const result = await pool.query(CollectionQueries.getFolderChildren, [parentId]);
        return result.rows;
    },

    // Requests
    createRequest: async (collectionId, folderId, requestData) => {
        const id = uuidv4();
        const { name, method, url, headers, body, params, description, order = 0 } = requestData;

        const result = await pool.query(CollectionQueries.createRequest, [
            id, name, method, url, JSON.stringify(headers || []), body || '', JSON.stringify(params || []),
            description || '', collectionId, folderId, order
        ]);
        return result.rows[0];
    },

    getRequestsByCollection: async (collectionId) => {
        const result = await pool.query(CollectionQueries.getRequestsByCollection, [collectionId]);
        return result.rows.map(row => ({
                ...row,
            headers: safeParseJson(row.headers, []),
            params: safeParseJson(row.params, [])
        }));
    },

    getRequestsByFolder: async (folderId) => {
        const result = await pool.query(CollectionQueries.getRequestsByFolder, [folderId]);
        return result.rows.map(row => ({
                ...row,
            headers: safeParseJson(row.headers, []),
            params: safeParseJson(row.params, [])
        }));
    },

    getRequestById: async (id) => {
        const result = await pool.query(CollectionQueries.getRequestById, [id]);
        if (result.rows[0]) {
            return {
                ...result.rows[0],
                headers: safeParseJson(result.rows[0].headers, []),
                params: safeParseJson(result.rows[0].params, [])
            };
        }
        return null;
    },

    updateRequest: async (id, updates) => {
        const { name, method, url, headers, body, params, description, folderId, order } = updates;
        const result = await pool.query(CollectionQueries.updateRequest, [
            name || '', method || 'GET', url || '', JSON.stringify(headers || []), body || '', JSON.stringify(params || []),
            description || '', folderId, order || 0, id
        ]);

        return {
            ...result.rows[0],
            headers: safeParseJson(result.rows[0].headers, []),
            params: safeParseJson(result.rows[0].params, [])
        };
    },

    deleteRequest: async (id) => {
        const result = await pool.query(CollectionQueries.deleteRequest, [id]);
        return result.rows[0];
    },

    moveRequest: async (requestId, folderId, collectionId) => {
        const result = await pool.query(CollectionQueries.moveRequest, [folderId, collectionId, requestId]);
        return result.rows[0];
    },

    // Get full collection structure
    getCollectionStructure: async (collectionId) => {
        const result = await pool.query(CollectionQueries.getCollectionStructure, [collectionId]);
        return result.rows.map(row => ({
                ...row,
            headers: safeParseJson(row.headers, []),
            params: safeParseJson(row.params, [])
        }));
    }
};
