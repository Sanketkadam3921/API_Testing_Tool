# Collections System - Setup Guide

This guide will help you set up the complete Collections system for your API Testing Tool, similar to Postman's hierarchical structure.

## 🎯 Features Implemented

### ✅ Backend (Complete)
- **Collections Management**: Create, read, update, delete collections
- **Hierarchical Folders**: Support for nested folder structure
- **Request Management**: Full CRUD operations for API requests
- **Database Schema**: PostgreSQL with proper relationships and indexes
- **REST API**: Complete RESTful API endpoints for all operations

### ✅ Frontend (Complete)
- **Hierarchical Tree View**: Ant Design Tree component with expand/collapse
- **Context Menus**: Right-click menus for all operations
- **Search & Filter**: Real-time search across collections and requests
- **Modal Forms**: Create/edit collections, folders, and requests
- **Request Integration**: Click to open requests in editor tabs
- **Visual Indicators**: Method colors, badges, and icons

## 🚀 Quick Setup

### 1. Database Setup

First, set up your PostgreSQL database:

```bash
# Create a PostgreSQL database
createdb apitesting_db

# Set your DATABASE_URL in .env file
echo "DATABASE_URL=postgresql://username:password@localhost:5432/apitesting_db" >> .env
```

### 2. Run Database Migration

```bash
cd backend
node database/setup.js
```

This will create all necessary tables and insert sample data.

### 3. Start Backend Server

```bash
cd backend
npm run dev
```

### 4. Start Frontend

```bash
cd frontend/apitesting
npm run dev
```

## 📊 Database Schema

### Collections
- `id` (Primary Key)
- `name` (Collection name)
- `description` (Optional description)
- `user_id` (Foreign key to users)
- `created_at`, `updated_at`

### Folders
- `id` (Primary Key)
- `name` (Folder name)
- `description` (Optional description)
- `collection_id` (Foreign key to collections)
- `parent_id` (Self-referencing for nested folders)
- `order` (Sort order)
- `created_at`, `updated_at`

### Requests
- `id` (Primary Key)
- `name` (Request name)
- `method` (HTTP method: GET, POST, PUT, DELETE, PATCH)
- `url` (Request URL)
- `headers` (JSON array of headers)
- `body` (Request body)
- `params` (JSON array of parameters)
- `description` (Optional description)
- `collection_id` (Foreign key to collections)
- `folder_id` (Foreign key to folders, nullable)
- `order` (Sort order)
- `created_at`, `updated_at`

## 🔌 API Endpoints

### Collections
- `POST /api/collections` - Create collection
- `GET /api/collections` - Get all collections
- `GET /api/collections/:id` - Get collection by ID
- `PUT /api/collections/:id` - Update collection
- `DELETE /api/collections/:id` - Delete collection

### Folders
- `POST /api/collections/:collectionId/folders` - Create folder
- `GET /api/collections/:collectionId/folders` - Get folders
- `PUT /api/collections/folders/:id` - Update folder
- `DELETE /api/collections/folders/:id` - Delete folder

### Requests
- `POST /api/collections/:collectionId/requests` - Create request
- `GET /api/collections/:collectionId/requests` - Get requests
- `GET /api/collections/requests/:id` - Get request by ID
- `PUT /api/collections/requests/:id` - Update request
- `DELETE /api/collections/requests/:id` - Delete request
- `POST /api/collections/requests/:id/move` - Move request

### Structure
- `GET /api/collections/:collectionId/structure` - Get full collection structure

## 🎨 Frontend Components

### HierarchicalCollectionsPanel
- **Tree View**: Hierarchical display of collections → folders → requests
- **Search**: Real-time filtering of collections and requests
- **Context Menus**: Right-click operations for all items
- **Modal Forms**: Create/edit dialogs for all entity types
- **Integration**: Click requests to open in editor tabs

### Key Features
- **Expandable Tree**: Click to expand/collapse collections and folders
- **Visual Indicators**: 
  - 📁 Collections (blue folder icon)
  - 📂 Folders (green folder icon)
  - 🌐 Requests (colored by HTTP method)
- **Method Colors**:
  - GET: Green (#52c41a)
  - POST: Blue (#1890ff)
  - PUT: Orange (#faad14)
  - DELETE: Red (#ff4d4f)
  - PATCH: Purple (#722ed1)

## 🔧 Usage Examples

### Creating a Collection
1. Click "New Collection" button
2. Enter name and description
3. Click "Create"

### Adding Folders
1. Right-click on a collection
2. Select "Add Folder"
3. Enter folder name and description
4. Optionally select parent folder for nesting

### Adding Requests
1. Right-click on collection or folder
2. Select "Add Request"
3. Fill in method, URL, headers, body
4. Click "Create"

### Using Requests
1. Click on any request in the tree
2. Request opens in a new editor tab
3. Modify and test the request
4. Save changes back to collection

## 🎯 Next Steps

The Collections system is now fully functional! You can:

1. **Create Collections** for different projects/APIs
2. **Organize with Folders** for logical grouping
3. **Add Requests** with full HTTP method support
4. **Search and Filter** to find requests quickly
5. **Integrate with Editor** to test and modify requests

The system supports the same workflow as Postman:
- Collections → Folders → Requests hierarchy
- Context menus for all operations
- Visual indicators and method colors
- Search and filtering capabilities
- Integration with request editor

Enjoy your new hierarchical Collections system! 🎉
