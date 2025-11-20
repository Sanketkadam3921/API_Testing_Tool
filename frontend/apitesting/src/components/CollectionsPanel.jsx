import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Divider,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Add,
  Delete,
  PlayArrow,
  Folder,
  FolderOpen,
  Api,
  ExpandMore,
} from "@mui/icons-material";
import { useTheme } from "../context/ThemeContext";
import { useApiStore } from "../store/apiStore";
import { apiService } from "../services/apiService";
import { validateUrl } from "../utils/validators";
import toast from "react-hot-toast";

const CollectionsPanel = () => {
  const { createNewTab, updateRequest } = useApiStore();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCollectionDialog, setOpenCollectionDialog] = useState(false);
  const [openRequestDialog, setOpenRequestDialog] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);
  const [expandedCollections, setExpandedCollections] = useState([]);
  const [newCollection, setNewCollection] = useState({
    name: "",
    description: "",
  });
  const [newRequest, setNewRequest] = useState({
    name: "",
    method: "GET",
    url: "",
    headers: [],
    body: "",
    params: [],
    description: "",
  });
  const [urlError, setUrlError] = useState("");

  // Load collections from backend
  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCollections();
      if (response.success && Array.isArray(response.collections)) {
        // Load requests for each collection
        const collectionsWithRequests = await Promise.all(
          response.collections.map(async (collection) => {
            try {
              const requestsResponse = await apiService.getRequests(
                collection.id
              );
              return {
                ...collection,
                requests:
                  requestsResponse.success &&
                  Array.isArray(requestsResponse.requests)
                    ? requestsResponse.requests
                    : [],
              };
            } catch (error) {
              console.error(
                `Error loading requests for collection ${collection.id}:`,
                error
              );
              return { ...collection, requests: [] };
            }
          })
        );
        setCollections(collectionsWithRequests);
        if (import.meta.env.DEV) {
          console.log("Collections loaded:", collectionsWithRequests.length);
        }
      } else {
        setCollections([]);
      }
    } catch (error) {
      console.error("Error loading collections:", error);
      toast.error("Failed to load collections");
      setCollections([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCollection = async (collectionId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this collection? This will also delete all folders and requests inside it."
      )
    ) {
      try {
        if (import.meta.env.DEV) {
          console.log("Deleting collection:", collectionId);
        }
        const response = await apiService.deleteCollection(collectionId);
        if (import.meta.env.DEV) {
          console.log("Delete response:", response);
        }
        if (response.success) {
          toast.success("Collection deleted successfully");
          // Remove from local state immediately for better UX
          setCollections((prev) => prev.filter((c) => c.id !== collectionId));
          // Then reload to ensure consistency
          await loadCollections();
        } else {
          const errorMsg = response.message || "Failed to delete collection";
          toast.error(errorMsg);
          console.error("Delete collection response:", response);
        }
      } catch (error) {
        console.error("Error deleting collection:", error);
        const errorMsg =
          error.response?.data?.message ||
          error.message ||
          "Failed to delete collection";
        toast.error(errorMsg);
        // Reload collections even on error to ensure UI is in sync
        await loadCollections();
      }
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollection.name.trim()) {
      toast.error("Collection name is required");
      return;
    }

    try {
      const response = await apiService.createCollection({
        name: newCollection.name.trim(),
        description: newCollection.description.trim() || "",
        user_id: "default-user-id",
      });

      if (response.success) {
        toast.success("Collection created successfully");
        setOpenCollectionDialog(false);
        setNewCollection({ name: "", description: "" });
        loadCollections();
      } else {
        toast.error("Failed to create collection");
      }
    } catch (error) {
      console.error("Error creating collection:", error);
      toast.error("Failed to create collection");
    }
  };

  const handleOpenRequestDialog = (collectionId) => {
    setSelectedCollectionId(collectionId);
    setNewRequest({
      name: "",
      method: "GET",
      url: "",
      headers: [],
      body: "",
      params: [],
      description: "",
    });
    setUrlError("");
    setOpenRequestDialog(true);
  };

  const handleCreateRequest = async () => {
    if (!newRequest.name.trim()) {
      toast.error("Request name is required");
      return;
    }

    if (!newRequest.url.trim()) {
      toast.error("Request URL is required");
      return;
    }

    // Validate URL
    const urlValidation = validateUrl(newRequest.url);
    if (!urlValidation.valid) {
      toast.error(urlValidation.error || "Invalid URL");
      setUrlError(urlValidation.error || "Invalid URL");
      return;
    }

    // Validate JSON body for POST/PUT/PATCH
    if (
      (newRequest.method === "POST" ||
        newRequest.method === "PUT" ||
        newRequest.method === "PATCH") &&
      newRequest.body.trim()
    ) {
      try {
        JSON.parse(newRequest.body);
      } catch (_error) {
        toast.error(
          "Body must be valid JSON format for POST/PUT/PATCH requests"
        );
        return;
      }
    }

    try {
      const requestData = {
        name: newRequest.name.trim(),
        method: newRequest.method,
        url: newRequest.url.trim(),
        headers: newRequest.headers || [],
        body: newRequest.body.trim() || null,
        params: newRequest.params || [],
        description: newRequest.description.trim() || "",
      };

      const response = await apiService.createRequest(
        selectedCollectionId,
        requestData
      );

      if (response.success) {
        toast.success("Request created successfully");
        setOpenRequestDialog(false);
        setNewRequest({
          name: "",
          method: "GET",
          url: "",
          headers: [],
          body: "",
          params: [],
          description: "",
        });
        setUrlError("");
        loadCollections();
      } else {
        toast.error(response.message || "Failed to create request");
      }
    } catch (error) {
      console.error("Error creating request:", error);
      toast.error(error.response?.data?.message || "Failed to create request");
    }
  };

  const handleRunRequest = (request) => {
    const tabId = createNewTab();

    // Normalize headers and params to ensure they're arrays
    const normalizedRequest = {
      ...request,
      headers: Array.isArray(request.headers)
        ? request.headers
        : typeof request.headers === "string"
        ? (() => {
            try {
              const parsed = JSON.parse(request.headers);
              return Array.isArray(parsed) ? parsed : [];
            } catch {
              return [];
            }
          })()
        : typeof request.headers === "object" && request.headers !== null
        ? Object.entries(request.headers).map(([key, value]) => ({
            key,
            value: String(value),
          }))
        : [],
      params: Array.isArray(request.params)
        ? request.params
        : typeof request.params === "string"
        ? (() => {
            try {
              const parsed = JSON.parse(request.params);
              return Array.isArray(parsed) ? parsed : [];
            } catch {
              return [];
            }
          })()
        : typeof request.params === "object" && request.params !== null
        ? Object.entries(request.params).map(([key, value]) => ({
            key,
            value: String(value),
          }))
        : [],
    };

    updateRequest(tabId, normalizedRequest);
  };

  const handleAccordionChange = (collectionId) => (event, isExpanded) => {
    setExpandedCollections((prev) =>
      isExpanded
        ? [...prev, collectionId]
        : prev.filter((id) => id !== collectionId)
    );
  };

  const getMethodColor = (method) => {
    switch (method) {
      case "GET":
        return "success";
      case "POST":
        return "primary";
      case "PUT":
        return "warning";
      case "DELETE":
        return "error";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 100,
        }}
      >
        <CircularProgress size={20} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1.5 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1.5,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 600, fontSize: "0.875rem", color: "#1f2937" }}
        >
          Collections
        </Typography>
        <IconButton
          size="small"
          onClick={() => setOpenCollectionDialog(true)}
          sx={{
            width: 28,
            height: 28,
            backgroundColor: "#22c55e",
            color: "#ffffff",
            "&:hover": {
              backgroundColor: "#16a34a",
            },
          }}
          title="New Collection"
        >
          <Add sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      {collections.length === 0 ? (
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: "0.75rem" }}
          >
            No collections
          </Typography>
        </Box>
      ) : (
        <Box>
          {collections.map((collection) => (
            <Accordion
              key={collection.id}
              expanded={expandedCollections.includes(collection.id)}
              onChange={handleAccordionChange(collection.id)}
              sx={{
                mb: 0.5,
                boxShadow: "none",
                border: "1px solid rgba(0,0,0,0.06)",
                borderRadius: 1,
                "&:before": {
                  display: "none",
                },
                "&.Mui-expanded": {
                  margin: "0 0 4px 0",
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore sx={{ fontSize: 18 }} />}
                sx={{
                  minHeight: 36,
                  maxHeight: 36,
                  "&.Mui-expanded": {
                    minHeight: 36,
                  },
                  px: 1.5,
                  py: 0.5,
                  "&:hover": {
                    backgroundColor: "rgba(0,0,0,0.02)",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    pr: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    {expandedCollections.includes(collection.id) ? (
                      <FolderOpen
                        sx={{ fontSize: 16, color: "#22c55e", flexShrink: 0 }}
                      />
                    ) : (
                      <Folder
                        sx={{ fontSize: 16, color: "#22c55e", flexShrink: 0 }}
                      />
                    )}
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        fontSize: "0.8125rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        flex: 1,
                      }}
                    >
                      {collection.name}
                    </Typography>
                    <Chip
                      label={collection.requests?.length || 0}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: "0.65rem",
                        fontWeight: 600,
                        backgroundColor: "#f3f4f6",
                        color: "#6b7280",
                        flexShrink: 0,
                      }}
                    />
                  </Box>
                  <Box
                    sx={{ display: "flex", gap: 0.25 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenRequestDialog(collection.id);
                      }}
                      sx={{
                        width: 24,
                        height: 24,
                        color: "#6b7280",
                        "&:hover": {
                          backgroundColor: "rgba(34,197,94,0.1)",
                          color: "#22c55e",
                        },
                      }}
                      title="Add Request"
                    >
                      <Add sx={{ fontSize: 14 }} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCollection(collection.id);
                      }}
                      sx={{
                        width: 24,
                        height: 24,
                        color: "#6b7280",
                        "&:hover": {
                          backgroundColor: "rgba(239,68,68,0.1)",
                          color: "#ef4444",
                        },
                      }}
                      title="Delete Collection"
                    >
                      <Delete sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0.5, pt: 0.5, pb: 0.5 }}>
                {collection.requests && collection.requests.length > 0 ? (
                  <List dense sx={{ pt: 0, pb: 0 }}>
                    {collection.requests.map((request, requestIndex) => (
                      <ListItem
                        key={requestIndex}
                        onClick={() => handleRunRequest(request)}
                        sx={{
                          borderRadius: 0.75,
                          mx: 0.5,
                          mb: 0.25,
                          py: 0.5,
                          px: 1,
                          minHeight: 36,
                          backgroundColor: "transparent",
                          cursor: "pointer",
                          "&:hover": {
                            backgroundColor: "rgba(34,197,94,0.08)",
                          },
                          transition: "background-color 0.15s ease",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.75,
                            width: "100%",
                            minWidth: 0,
                          }}
                        >
                          <Chip
                            label={request.method}
                            size="small"
                            color={getMethodColor(request.method)}
                            sx={{
                              height: 18,
                              fontSize: "0.65rem",
                              fontWeight: 600,
                              flexShrink: 0,
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 400,
                              fontSize: "0.8125rem",
                              flexGrow: 1,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              color: "#1f2937",
                            }}
                          >
                            {request.name}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRunRequest(request);
                            }}
                            sx={{
                              width: 20,
                              height: 20,
                              color: "#6b7280",
                              flexShrink: 0,
                              "&:hover": {
                                backgroundColor: "rgba(34,197,94,0.15)",
                                color: "#22c55e",
                              },
                            }}
                            title="Run request"
                          >
                            <PlayArrow sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ p: 1.5, textAlign: "center" }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: "0.75rem" }}
                    >
                      No requests
                    </Typography>
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {/* Create Collection Dialog */}
      <Dialog
        open={openCollectionDialog}
        onClose={() => setOpenCollectionDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            borderBottom: "1px solid rgba(0,0,0,0.08)",
            pb: 2,
          }}
        >
          Create New Collection
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Collection Name *"
            fullWidth
            variant="outlined"
            value={newCollection.name}
            onChange={(e) =>
              setNewCollection({ ...newCollection, name: e.target.value })
            }
            required
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => setOpenCollectionDialog(false)}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateCollection}
            variant="contained"
            sx={{
              backgroundColor: "#22c55e",
              textTransform: "none",
              borderRadius: 2,
              "&:hover": {
                backgroundColor: "#16a34a",
              },
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Request Dialog */}
      <Dialog
        open={openRequestDialog}
        onClose={() => setOpenRequestDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            borderBottom: "1px solid rgba(0,0,0,0.08)",
            pb: 2,
          }}
        >
          Create New Request
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              autoFocus
              label="Request Name *"
              fullWidth
              value={newRequest.name}
              onChange={(e) =>
                setNewRequest({ ...newRequest, name: e.target.value })
              }
              required
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Method *</InputLabel>
                <Select
                  value={newRequest.method}
                  label="Method *"
                  onChange={(e) =>
                    setNewRequest({ ...newRequest, method: e.target.value })
                  }
                >
                  <MenuItem value="GET">GET</MenuItem>
                  <MenuItem value="POST">POST</MenuItem>
                  <MenuItem value="PUT">PUT</MenuItem>
                  <MenuItem value="PATCH">PATCH</MenuItem>
                  <MenuItem value="DELETE">DELETE</MenuItem>
                  <MenuItem value="HEAD">HEAD</MenuItem>
                  <MenuItem value="OPTIONS">OPTIONS</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="URL *"
                fullWidth
                value={newRequest.url}
                onChange={(e) => {
                  const newUrl = e.target.value;
                  setNewRequest({ ...newRequest, url: newUrl });

                  // Validate URL in real-time
                  if (newUrl.trim()) {
                    const validation = validateUrl(newUrl);
                    if (!validation.valid) {
                      setUrlError(validation.error || "Invalid URL");
                    } else {
                      setUrlError("");
                    }
                  } else {
                    setUrlError("");
                  }
                }}
                placeholder="https://api.example.com/endpoint"
                required
                error={!!urlError}
                helperText={
                  urlError || "Enter a valid URL with http:// or https://"
                }
              />
            </Box>
            {(newRequest.method === "POST" ||
              newRequest.method === "PUT" ||
              newRequest.method === "PATCH") && (
              <>
                <Alert severity="info" sx={{ fontSize: "0.875rem" }}>
                  Body must be valid JSON format for {newRequest.method}{" "}
                  requests
                </Alert>
                <TextField
                  label="Body (JSON)"
                  fullWidth
                  multiline
                  rows={6}
                  value={newRequest.body}
                  onChange={(e) =>
                    setNewRequest({ ...newRequest, body: e.target.value })
                  }
                  placeholder='{"key": "value"}'
                  helperText="Enter valid JSON format"
                />
              </>
            )}
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={newRequest.description}
              onChange={(e) =>
                setNewRequest({ ...newRequest, description: e.target.value })
              }
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => setOpenRequestDialog(false)}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateRequest}
            variant="contained"
            sx={{
              backgroundColor: "#22c55e",
              textTransform: "none",
              borderRadius: 2,
              "&:hover": {
                backgroundColor: "#16a34a",
              },
            }}
          >
            Create Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CollectionsPanel;
