export const CollectionQueries = {
    // Collections
    createCollection: `
        INSERT INTO collections (id, name, description, user_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING *
    `,
    getCollectionsByUser: `
        SELECT c.*, 
               COUNT(DISTINCT f.id) as folder_count,
               COUNT(DISTINCT r.id) as request_count
        FROM collections c
        LEFT JOIN folders f ON c.id = f.collection_id
        LEFT JOIN requests r ON c.id = r.collection_id
        WHERE c.user_id = $1
        GROUP BY c.id
        ORDER BY c.created_at DESC
    `,
    getCollectionById: `
        SELECT * FROM collections WHERE id = $1 AND user_id = $2
    `,
    updateCollection: `
        UPDATE collections
        SET name = $1, description = $2, updated_at = NOW()
        WHERE id = $3 AND user_id = $4
        RETURNING *
    `,
    deleteCollection: `
        DELETE FROM collections WHERE id = $1 AND user_id = $2 RETURNING *
    `,

    // Folders
    createFolder: `
        INSERT INTO folders (id, name, description, collection_id, parent_id, "order", created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING *
    `,
    getFoldersByCollection: `
        WITH RECURSIVE folder_tree AS (
            SELECT f.*, 0 as level, ARRAY[f.id] as path
            FROM folders f
            WHERE f.collection_id = $1 AND f.parent_id IS NULL
            
            UNION ALL
            
            SELECT f.*, ft.level + 1, ft.path || f.id
            FROM folders f
            JOIN folder_tree ft ON f.parent_id = ft.id
        )
        SELECT * FROM folder_tree ORDER BY path, "order"
    `,
    getFolderById: `
        SELECT * FROM folders WHERE id = $1
    `,
    updateFolder: `
        UPDATE folders
        SET name = $1, description = $2, parent_id = $3, "order" = $4, updated_at = NOW()
        WHERE id = $5
        RETURNING *
    `,
    deleteFolder: `
        DELETE FROM folders WHERE id = $1 RETURNING *
    `,
    getFolderChildren: `
        SELECT * FROM folders WHERE parent_id = $1 ORDER BY "order"
    `,

    // Requests
    createRequest: `
        INSERT INTO requests (id, name, method, url, headers, body, params, description, collection_id, folder_id, "order", created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
        RETURNING *
    `,
    getRequestsByCollection: `
        SELECT * FROM requests 
        WHERE collection_id = $1 AND folder_id IS NULL
        ORDER BY "order", created_at
    `,
    getRequestsByFolder: `
        SELECT * FROM requests 
        WHERE folder_id = $1
        ORDER BY "order", created_at
    `,
    getRequestById: `
        SELECT * FROM requests WHERE id = $1
    `,
    updateRequest: `
        UPDATE requests
        SET name = $1, method = $2, url = $3, headers = $4, body = $5, params = $6, description = $7, folder_id = $8, "order" = $9, updated_at = NOW()
        WHERE id = $10
        RETURNING *
    `,
    deleteRequest: `
        DELETE FROM requests WHERE id = $1 RETURNING *
    `,
    moveRequest: `
        UPDATE requests
        SET folder_id = $1, collection_id = $2, updated_at = NOW()
        WHERE id = $3
        RETURNING *
    `,

    // Get full collection structure
    getCollectionStructure: `
        WITH RECURSIVE folder_tree AS (
            SELECT f.*, 0 as level, ARRAY[f.id::text] as path
            FROM folders f
            WHERE f.collection_id = $1 AND f.parent_id IS NULL
            
            UNION ALL
            
            SELECT f.*, ft.level + 1, ft.path || f.id::text
            FROM folders f
            JOIN folder_tree ft ON f.parent_id = ft.id
        )
        SELECT 
            'folder' as type,
            f.id,
            f.name,
            f.description,
            f.parent_id,
            f."order",
            f.level,
            f.path,
            NULL as method,
            NULL as url,
            NULL as headers,
            NULL as body,
            NULL as params
        FROM folder_tree f
        
        UNION ALL
        
        SELECT 
            'request' as type,
            r.id,
            r.name,
            r.description,
            r.folder_id as parent_id,
            r."order",
            CASE 
                WHEN r.folder_id IS NULL THEN 0
                ELSE COALESCE(f.level + 1, 0)
            END as level,
            CASE 
                WHEN r.folder_id IS NULL THEN ARRAY[r.id::text]
                ELSE f.path || r.id::text
            END as path,
            r.method,
            r.url,
            r.headers,
            r.body,
            r.params
        FROM requests r
        LEFT JOIN folder_tree f ON r.folder_id = f.id
        WHERE r.collection_id = $1
        
        ORDER BY path, "order"
    `
};
