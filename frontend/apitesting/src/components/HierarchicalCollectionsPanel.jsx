import React, { useState, useEffect, useMemo } from 'react';
import {
    Tree,
    Input,
    Button,
    Modal,
    Form,
    Input as AntInput,
    Select,
    message,
    Dropdown,
    Menu,
    Space,
    Typography,
    Card,
    Tooltip,
    Badge
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    FolderOutlined,
    FolderOpenOutlined,
    FileTextOutlined,
    DeleteOutlined,
    EditOutlined,
    MoreOutlined,
    ApiOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import { useTheme } from '../context/ThemeContext';
import { useApiStore } from '../store/apiStore';
import apiService from '../services/apiService';

const { Search } = Input;
const { TextArea } = AntInput;
const { Text } = Typography;

const HierarchicalCollectionsPanel = () => {
    const { isDarkMode } = useTheme();
    const { createNewTab, updateRequest } = useApiStore();

    // State
    const [, setCollections] = useState([]);
    const [treeData, setTreeData] = useState([]);
    const [expandedKeys, setExpandedKeys] = useState([]);
    const [selectedKeys, setSelectedKeys] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const [loading, setLoading] = useState(false);

    // Modal states
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalType, setModalType] = useState(''); // 'collection', 'folder', 'request'
    const [modalTitle, setModalTitle] = useState('');
    const [editingItem, setEditingItem] = useState(null);
    const [parentCollectionId, setParentCollectionId] = useState(null);
    const [parentFolderId, setParentFolderId] = useState(null);

    // Form
    const [form] = Form.useForm();

    // Load collections data
    const loadCollections = async () => {
        try {
            setLoading(true);
            const response = await apiService.get('/api/collections');
            if (response.success) {
                setCollections(response.collections);
                await buildTreeData(response.collections);
            }
        } catch (error) {
            message.error('Failed to load collections');
            console.error('Error loading collections:', error);
        } finally {
            setLoading(false);
        }
    };

    // Build tree data structure
    const buildTreeData = async (collectionsData) => {
        const tree = await Promise.all(collectionsData.map(async (collection) => {
            // Load structure for each collection
            const structure = await loadCollectionStructure(collection.id);

            return {
                key: `collection-${collection.id}`,
                title: (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Space>
                            <FolderOutlined style={{ color: '#1890ff' }} />
                            <Text strong>{collection.name}</Text>
                            <Badge count={collection.request_count || 0} size="small" />
                        </Space>
                        <Dropdown
                            menu={{
                                items: [
                                    {
                                        key: 'add-folder',
                                        label: 'Add Folder',
                                        icon: <FolderOutlined />,
                                        onClick: () => openModal('folder', collection.id)
                                    },
                                    {
                                        key: 'add-request',
                                        label: 'Add Request',
                                        icon: <ApiOutlined />,
                                        onClick: () => openModal('request', collection.id, null, null)
                                    },
                                    {
                                        key: 'edit',
                                        label: 'Edit Collection',
                                        icon: <EditOutlined />,
                                        onClick: () => openModal('collection', null, collection)
                                    },
                                    {
                                        key: 'delete',
                                        label: 'Delete Collection',
                                        icon: <DeleteOutlined />,
                                        danger: true,
                                        onClick: () => deleteCollection(collection.id)
                                    }
                                ]
                            }}
                            trigger={['click']}
                        >
                            <Button type="text" size="small" icon={<MoreOutlined />} />
                        </Dropdown>
                    </div>
                ),
                icon: <FolderOutlined style={{ color: '#1890ff' }} />,
                children: buildStructureTree(structure, collection.id)
            };
        }));

        setTreeData(tree);
    };

    // Load collection structure
    const loadCollectionStructure = async (collectionId) => {
        try {
            const response = await apiService.get(`/api/collections/${collectionId}/structure`);
            if (response.success) {
                return response.structure;
            }
        } catch (error) {
            console.error('Error loading collection structure:', error);
        }
        return [];
    };

    // Open modal for creating/editing
    const openModal = (type, collectionId = null, item = null, folderId = null) => {
        setModalType(type);
        setParentCollectionId(collectionId);
        setParentFolderId(folderId);
        setEditingItem(item);

        switch (type) {
            case 'collection':
                setModalTitle(item ? 'Edit Collection' : 'Create Collection');
                form.setFieldsValue({
                    name: item?.name || '',
                    description: item?.description || ''
                });
                break;
            case 'folder':
                setModalTitle('Create Folder');
                form.setFieldsValue({
                    name: '',
                    description: '',
                    parentId: null
                });
                break;
            case 'request':
                setModalTitle('Create Request');
                form.setFieldsValue({
                    name: '',
                    method: 'GET',
                    url: '',
                    headers: [],
                    body: '',
                    params: [],
                    description: ''
                });
                break;
        }

        setIsModalVisible(true);
    };

    // Handle form submission
    const handleSubmit = async (values) => {
        try {
            setLoading(true);

            switch (modalType) {
                case 'collection':
                    if (editingItem) {
                        await apiService.put(`/api/collections/${editingItem.id}`, values);
                        message.success('Collection updated successfully');
                    } else {
                        await apiService.post('/api/collections', values);
                        message.success('Collection created successfully');
                    }
                    break;

                case 'folder':
                    await apiService.post(`/api/collections/${parentCollectionId}/folders`, {
                        ...values,
                        parentId: values.parentId || null
                    });
                    message.success('Folder created successfully');
                    break;

                case 'request':
                    await apiService.post(`/api/collections/${parentCollectionId}/requests`, {
                        ...values,
                        folderId: parentFolderId
                    });
                    message.success('Request created successfully');
                    break;
            }

            setIsModalVisible(false);
            form.resetFields();
            await loadCollections();

        } catch (error) {
            message.error(`Failed to ${modalType === 'collection' && editingItem ? 'update' : 'create'} ${modalType}`);
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Delete collection
    const deleteCollection = async (collectionId) => {
        Modal.confirm({
            title: 'Delete Collection',
            content: 'Are you sure you want to delete this collection? This action cannot be undone.',
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await apiService.delete(`/api/collections/${collectionId}`);
                    message.success('Collection deleted successfully');
                    await loadCollections();
                } catch (error) {
                    message.error('Failed to delete collection');
                    console.error('Error:', error);
                }
            }
        });
    };

    // Handle tree node selection
    const handleSelect = async (selectedKeys, info) => {
        setSelectedKeys(selectedKeys);

        if (info.selected && info.node.key.startsWith('request-')) {
            const requestId = info.node.key.replace('request-', '');
            try {
                const response = await apiService.get(`/api/collections/requests/${requestId}`);
                if (response.success) {
                    const tabId = createNewTab();
                    updateRequest(tabId, {
                        name: response.request.name,
                        method: response.request.method,
                        url: response.request.url,
                        headers: response.request.headers,
                        body: response.request.body,
                        params: response.request.params
                    });
                }
            } catch (error) {
                message.error('Failed to load request');
                console.error('Error:', error);
            }
        }
    };

    // Handle tree node expand
    const handleExpand = async (expandedKeys, { expanded, node }) => {
        setExpandedKeys(expandedKeys);

        if (expanded && node.key.startsWith('collection-')) {
            const collectionId = node.key.replace('collection-', '');
            const structure = await loadCollectionStructure(collectionId);

            // Update tree data with loaded structure
            const updateTreeData = (nodes) => {
                return nodes.map(node => {
                    if (node.key === `collection-${collectionId}`) {
                        return {
                            ...node,
                            children: buildStructureTree(structure, collectionId)
                        };
                    }
                    return node;
                });
            };

            setTreeData(updateTreeData);
        }
    };

    // Build structure tree from flat structure data
    const buildStructureTree = (structure, collectionId) => {
        const folderMap = new Map();
        const requestMap = new Map();

        // Separate folders and requests
        structure.forEach(item => {
            if (item.type === 'folder') {
                folderMap.set(item.id, {
                    key: `folder-${item.id}`,
                    title: (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Space>
                                <FolderOpenOutlined style={{ color: '#52c41a' }} />
                                <Text>{item.name}</Text>
                            </Space>
                            <Dropdown
                                menu={{
                                    items: [
                                        {
                                            key: 'add-subfolder',
                                            label: 'Add Subfolder',
                                            icon: <FolderOutlined />,
                                            onClick: () => openModal('folder', collectionId, null, item.id)
                                        },
                                        {
                                            key: 'add-request',
                                            label: 'Add Request',
                                            icon: <ApiOutlined />,
                                            onClick: () => openModal('request', collectionId, null, item.id)
                                        },
                                        {
                                            key: 'edit',
                                            label: 'Edit Folder',
                                            icon: <EditOutlined />,
                                            onClick: () => openModal('folder', collectionId, item)
                                        },
                                        {
                                            key: 'delete',
                                            label: 'Delete Folder',
                                            icon: <DeleteOutlined />,
                                            danger: true,
                                            onClick: () => deleteFolder(item.id)
                                        }
                                    ]
                                }}
                                trigger={['click']}
                            >
                                <Button type="text" size="small" icon={<MoreOutlined />} />
                            </Dropdown>
                        </div>
                    ),
                    icon: <FolderOpenOutlined style={{ color: '#52c41a' }} />,
                    children: []
                });
            } else if (item.type === 'request') {
                requestMap.set(item.id, {
                    key: `request-${item.id}`,
                    title: (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Space>
                                <FileTextOutlined style={{ color: getMethodColor(item.method) }} />
                                <Text>{item.name}</Text>
                                <Badge count={item.method} size="small" color={getMethodColor(item.method)} />
                            </Space>
                            <Dropdown
                                menu={{
                                    items: [
                                        {
                                            key: 'edit',
                                            label: 'Edit Request',
                                            icon: <EditOutlined />,
                                            onClick: () => openModal('request', collectionId, item, null)
                                        },
                                        {
                                            key: 'duplicate',
                                            label: 'Duplicate',
                                            icon: <PlusOutlined />,
                                            onClick: () => duplicateRequest(item)
                                        },
                                        {
                                            key: 'delete',
                                            label: 'Delete Request',
                                            icon: <DeleteOutlined />,
                                            danger: true,
                                            onClick: () => deleteRequest(item.id)
                                        }
                                    ]
                                }}
                                trigger={['click']}
                            >
                                <Button type="text" size="small" icon={<MoreOutlined />} />
                            </Dropdown>
                        </div>
                    ),
                    icon: <FileTextOutlined style={{ color: getMethodColor(item.method) }} />,
                    isLeaf: true
                });
            }
        });

        // Build hierarchy
        const rootFolders = [];
        const rootRequests = [];

        folderMap.forEach(folder => {
            const folderId = folder.key.replace('folder-', '');
            const folderData = structure.find(item => item.id === folderId);

            if (!folderData.parent_id) {
                rootFolders.push(folder);
            }
        });

        requestMap.forEach(request => {
            const requestId = request.key.replace('request-', '');
            const requestData = structure.find(item => item.id === requestId);

            if (!requestData.parent_id) {
                rootRequests.push(request);
            }
        });

        // Add requests to folders
        requestMap.forEach(request => {
            const requestId = request.key.replace('request-', '');
            const requestData = structure.find(item => item.id === requestId);

            if (requestData.parent_id) {
                const folder = folderMap.get(requestData.parent_id);
                if (folder) {
                    folder.children.push(request);
                }
            }
        });

        // Add subfolders to parent folders
        folderMap.forEach(folder => {
            const folderId = folder.key.replace('folder-', '');
            const folderData = structure.find(item => item.id === folderId);

            if (folderData.parent_id) {
                const parentFolder = folderMap.get(folderData.parent_id);
                if (parentFolder) {
                    parentFolder.children.push(folder);
                }
            }
        });

        return [...rootFolders, ...rootRequests];
    };

    // Get method color
    const getMethodColor = (method) => {
        switch (method?.toUpperCase()) {
            case 'GET': return '#52c41a';
            case 'POST': return '#1890ff';
            case 'PUT': return '#faad14';
            case 'DELETE': return '#ff4d4f';
            case 'PATCH': return '#722ed1';
            default: return '#8c8c8c';
        }
    };

    // Delete folder
    const deleteFolder = async (folderId) => {
        Modal.confirm({
            title: 'Delete Folder',
            content: 'Are you sure you want to delete this folder? All requests inside will also be deleted.',
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await apiService.delete(`/api/collections/folders/${folderId}`);
                    message.success('Folder deleted successfully');
                    await loadCollections();
                } catch (error) {
                    message.error('Failed to delete folder');
                    console.error('Error:', error);
                }
            }
        });
    };

    // Delete request
    const deleteRequest = async (requestId) => {
        Modal.confirm({
            title: 'Delete Request',
            content: 'Are you sure you want to delete this request?',
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await apiService.delete(`/api/collections/requests/${requestId}`);
                    message.success('Request deleted successfully');
                    await loadCollections();
                } catch (error) {
                    message.error('Failed to delete request');
                    console.error('Error:', error);
                }
            }
        });
    };

    // Duplicate request
    const duplicateRequest = async (request) => {
        try {
            const duplicatedRequest = {
                ...request,
                name: `${request.name} (Copy)`,
                description: request.description ? `${request.description} (Copy)` : ''
            };

            await apiService.post(`/api/collections/${parentCollectionId}/requests`, duplicatedRequest);
            message.success('Request duplicated successfully');
            await loadCollections();
        } catch (error) {
            message.error('Failed to duplicate request');
            console.error('Error:', error);
        }
    };

    // Filter tree data based on search
    const filteredTreeData = useMemo(() => {
        if (!searchValue) return treeData;

        const filterTree = (nodes) => {
            return nodes.filter(node => {
                const matches = node.title?.props?.children?.[1]?.props?.children?.toLowerCase().includes(searchValue.toLowerCase());
                if (matches) return true;

                if (node.children) {
                    const filteredChildren = filterTree(node.children);
                    if (filteredChildren.length > 0) {
                        return { ...node, children: filteredChildren };
                    }
                }
                return false;
            });
        };

        return filterTree(treeData);
    }, [treeData, searchValue]);

    // Load collections on component mount
    useEffect(() => {
        // For testing - set auth token if not already set
        if (!apiService.isAuthenticated()) {
            // Set the test token we got earlier
            apiService.setAuthToken(
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNzYxNDczMzM2LCJleHAiOjE3NjE1NTk3MzZ9.AcKZWppehzY_e-8de4qF5fzGaoHVCj6DfgGhiCLYnDA',
                { id: 5, name: 'Test User', email: 'test@example.com' }
            );
        }
        loadCollections();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: isDarkMode ? '#141414' : '#fff'
        }}>
            {/* Header */}
            <div style={{
                padding: '16px',
                borderBottom: `1px solid ${isDarkMode ? '#303030' : '#f0f0f0'}`
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                }}>
                    <Text strong style={{ fontSize: '16px' }}>Collections</Text>
                    <Space>
                        <Tooltip title="Refresh">
                            <Button
                                type="text"
                                icon={<ReloadOutlined />}
                                onClick={loadCollections}
                                loading={loading}
                            />
                        </Tooltip>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => openModal('collection')}
                        >
                            New Collection
                        </Button>
                    </Space>
                </div>

                <Search
                    placeholder="Search collections..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    prefix={<SearchOutlined />}
                    allowClear
                />
            </div>

            {/* Tree */}
            <div style={{
                flex: 1,
                overflow: 'auto',
                padding: '8px'
            }}>
                <Tree
                    treeData={filteredTreeData}
                    expandedKeys={expandedKeys}
                    selectedKeys={selectedKeys}
                    onSelect={handleSelect}
                    onExpand={handleExpand}
                    showIcon
                    blockNode
                    style={{
                        backgroundColor: 'transparent'
                    }}
                />
            </div>

            {/* Modal */}
            <Modal
                title={modalTitle}
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[{ required: true, message: 'Please enter a name' }]}
                    >
                        <AntInput placeholder="Enter name" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                    >
                        <TextArea rows={3} placeholder="Enter description (optional)" />
                    </Form.Item>

                    {modalType === 'folder' && (
                        <Form.Item
                            name="parentId"
                            label="Parent Folder"
                        >
                            <Select
                                placeholder="Select parent folder (optional)"
                                allowClear
                                options={[]} // TODO: Load folder options
                            />
                        </Form.Item>
                    )}

                    {modalType === 'request' && (
                        <>
                            <Form.Item
                                name="method"
                                label="Method"
                                rules={[{ required: true, message: 'Please select a method' }]}
                            >
                                <Select
                                    options={[
                                        { value: 'GET', label: 'GET' },
                                        { value: 'POST', label: 'POST' },
                                        { value: 'PUT', label: 'PUT' },
                                        { value: 'DELETE', label: 'DELETE' },
                                        { value: 'PATCH', label: 'PATCH' }
                                    ]}
                                />
                            </Form.Item>

                            <Form.Item
                                name="url"
                                label="URL"
                                rules={[{ required: true, message: 'Please enter a URL' }]}
                            >
                                <AntInput placeholder="https://api.example.com/endpoint" />
                            </Form.Item>
                        </>
                    )}

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setIsModalVisible(false)}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                {modalType === 'collection' && editingItem ? 'Update' : 'Create'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default HierarchicalCollectionsPanel;
