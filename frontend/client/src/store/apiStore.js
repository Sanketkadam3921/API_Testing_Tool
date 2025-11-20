import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Request data structure
const createEmptyRequest = (id) => ({
    id,
    name: `Request ${id}`,
    method: 'GET',
    url: '',
    headers: [],
    body: '',
    params: [],
    timestamp: Date.now(),
});

// Response data structure
const createEmptyResponse = () => ({
    status: null,
    statusText: '',
    data: null,
    headers: {},
    responseTime: 0,
    size: '0 B',
    error: null,
    timestamp: null,
});

export const useApiStore = create(
    persist(
        (set, get) => ({
            // State
            tabs: [],
            activeTabId: null,
            requests: {},
            responses: {},
            history: [],
            collections: [
                {
                    id: 'sample_1',
                    name: 'JSONPlaceholder API',
                    description: 'Sample REST API for testing',
                    requests: [
                        {
                            id: 'req_1',
                            name: 'Get All Posts',
                            method: 'GET',
                            url: 'https://jsonplaceholder.typicode.com/posts',
                            headers: [],
                            body: '',
                            params: [],
                        },
                        {
                            id: 'req_2',
                            name: 'Get Post by ID',
                            method: 'GET',
                            url: 'https://jsonplaceholder.typicode.com/posts/1',
                            headers: [],
                            body: '',
                            params: [],
                        },
                        {
                            id: 'req_3',
                            name: 'Create Post',
                            method: 'POST',
                            url: 'https://jsonplaceholder.typicode.com/posts',
                            headers: [{ key: 'Content-Type', value: 'application/json' }],
                            body: JSON.stringify({
                                title: 'foo',
                                body: 'bar',
                                userId: 1,
                            }, null, 2),
                            params: [],
                        },
                    ],
                    createdAt: Date.now(),
                },
                {
                    id: 'sample_2',
                    name: 'HTTP Status Codes',
                    description: 'Test different HTTP status codes',
                    requests: [
                        {
                            id: 'req_4',
                            name: '200 OK',
                            method: 'GET',
                            url: 'https://httpbin.org/status/200',
                            headers: [],
                            body: '',
                            params: [],
                        },
                        {
                            id: 'req_5',
                            name: '404 Not Found',
                            method: 'GET',
                            url: 'https://httpbin.org/status/404',
                            headers: [],
                            body: '',
                            params: [],
                        },
                        {
                            id: 'req_6',
                            name: '500 Server Error',
                            method: 'GET',
                            url: 'https://httpbin.org/status/500',
                            headers: [],
                            body: '',
                            params: [],
                        },
                    ],
                    createdAt: Date.now(),
                },
            ],
            isLoading: false,

            // Actions
            createNewTab: () => {
                const id = `tab_${Date.now()}`;
                const newRequest = createEmptyRequest(id);

                set((state) => ({
                    tabs: [...state.tabs, { id, name: newRequest.name }],
                    activeTabId: id,
                    requests: { ...state.requests, [id]: newRequest },
                    responses: { ...state.responses, [id]: createEmptyResponse() },
                }));

                return id;
            },

            closeTab: (tabId) => {
                set((state) => {
                    const newTabs = state.tabs.filter(tab => tab.id !== tabId);
                    const newRequests = { ...state.requests };
                    const newResponses = { ...state.responses };

                    delete newRequests[tabId];
                    delete newResponses[tabId];

                    let newActiveTabId = state.activeTabId;
                    if (state.activeTabId === tabId) {
                        newActiveTabId = newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null;
                    }

                    return {
                        tabs: newTabs,
                        activeTabId: newActiveTabId,
                        requests: newRequests,
                        responses: newResponses,
                    };
                });
            },

            setActiveTab: (tabId) => {
                set({ activeTabId: tabId });
            },

            updateTabName: (tabId, name) => {
                set((state) => ({
                    tabs: state.tabs.map(tab =>
                        tab.id === tabId ? { ...tab, name } : tab
                    ),
                    requests: {
                        ...state.requests,
                        [tabId]: { ...state.requests[tabId], name }
                    },
                }));
            },

            updateRequest: (tabId, updates) => {
                set((state) => ({
                    requests: {
                        ...state.requests,
                        [tabId]: { ...state.requests[tabId], ...updates }
                    },
                }));
            },

            addHeader: (tabId, key = '', value = '') => {
                set((state) => ({
                    requests: {
                        ...state.requests,
                        [tabId]: {
                            ...state.requests[tabId],
                            headers: [...state.requests[tabId].headers, { key, value }]
                        },
                    },
                }));
            },

            updateHeader: (tabId, index, key, value) => {
                set((state) => {
                    const headers = [...state.requests[tabId].headers];
                    headers[index] = { key, value };
                    return {
                        requests: {
                            ...state.requests,
                            [tabId]: { ...state.requests[tabId], headers }
                        },
                    };
                });
            },

            removeHeader: (tabId, index) => {
                set((state) => {
                    const headers = state.requests[tabId].headers.filter((_, i) => i !== index);
                    return {
                        requests: {
                            ...state.requests,
                            [tabId]: { ...state.requests[tabId], headers }
                        },
                    };
                });
            },

            addParam: (tabId, key = '', value = '') => {
                set((state) => ({
                    requests: {
                        ...state.requests,
                        [tabId]: {
                            ...state.requests[tabId],
                            params: [...state.requests[tabId].params, { key, value }]
                        },
                    },
                }));
            },

            updateParam: (tabId, index, key, value) => {
                set((state) => {
                    const params = [...state.requests[tabId].params];
                    params[index] = { key, value };
                    return {
                        requests: {
                            ...state.requests,
                            [tabId]: { ...state.requests[tabId], params }
                        },
                    };
                });
            },

            removeParam: (tabId, index) => {
                set((state) => {
                    const params = state.requests[tabId].params.filter((_, i) => i !== index);
                    return {
                        requests: {
                            ...state.requests,
                            [tabId]: { ...state.requests[tabId], params }
                        },
                    };
                });
            },

            setResponse: (tabId, response) => {
                set((state) => ({
                    responses: {
                        ...state.responses,
                        [tabId]: { ...response, timestamp: Date.now() }
                    },
                }));
            },

            addToHistory: (request, response) => {
                set((state) => ({
                    history: [
                        { request, response, timestamp: Date.now() },
                        ...state.history.slice(0, 99) // Keep last 100 items
                    ],
                }));
            },

            setLoading: (loading) => {
                set({ isLoading: loading });
            },

            clearHistory: () => {
                set({ history: [] });
            },

            // Collections management
            createCollection: (name, description) => {
                const id = `collection_${Date.now()}`;
                const newCollection = {
                    id,
                    name,
                    description,
                    requests: [],
                    createdAt: Date.now(),
                };

                set((state) => ({
                    collections: [...state.collections, newCollection],
                }));

                return id;
            },

            updateCollection: (id, updates) => {
                set((state) => ({
                    collections: state.collections.map(collection =>
                        collection.id === id ? { ...collection, ...updates } : collection
                    ),
                }));
            },

            deleteCollection: (id) => {
                set((state) => ({
                    collections: state.collections.filter(collection => collection.id !== id),
                }));
            },

            addRequestToCollection: (collectionId, request) => {
                set((state) => ({
                    collections: state.collections.map(collection =>
                        collection.id === collectionId
                            ? { ...collection, requests: [...collection.requests, request] }
                            : collection
                    ),
                }));
            },

            removeRequestFromCollection: (collectionId, requestId) => {
                set((state) => ({
                    collections: state.collections.map(collection =>
                        collection.id === collectionId
                            ? { ...collection, requests: collection.requests.filter(req => req.id !== requestId) }
                            : collection
                    ),
                }));
            },

            // Getters
            getActiveRequest: () => {
                const state = get();
                return state.activeTabId ? state.requests[state.activeTabId] : null;
            },

            getActiveResponse: () => {
                const state = get();
                return state.activeTabId ? state.responses[state.activeTabId] : null;
            },

            getRequestById: (tabId) => {
                const state = get();
                return state.requests[tabId] || null;
            },

            getResponseById: (tabId) => {
                const state = get();
                return state.responses[tabId] || null;
            },
        }),
        {
            name: 'api-testing-store',
            partialize: (state) => ({
                history: state.history,
                collections: state.collections,
            }),
        }
    )
);
