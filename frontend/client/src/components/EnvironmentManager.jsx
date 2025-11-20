import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Chip,
    Alert,
    CircularProgress,
    Tooltip,
} from '@mui/material';
import {
    Add,
    Delete,
    Edit,
    Close,
    Settings as SettingsIcon,
} from '@mui/icons-material';
import { apiService } from '../services/apiService';
import toast from 'react-hot-toast';

const EnvironmentManager = ({ open, onClose, onSelectEnvironment }) => {
    const [environments, setEnvironments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingEnv, setEditingEnv] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        variables: '',
    });

    useEffect(() => {
        if (open) {
            loadEnvironments();
        }
    }, [open]);

    const loadEnvironments = async () => {
        try {
            setLoading(true);
            const response = await apiService.getEnvironments();
            if (response.success) {
                setEnvironments(response.environments || []);
            }
        } catch {
            toast.error('Failed to load environments');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (env = null) => {
        if (env) {
            setEditingEnv(env);
            setFormData({
                name: env.name,
                variables: JSON.stringify(env.variables || {}, null, 2),
            });
        } else {
            setEditingEnv(null);
            setFormData({ name: '', variables: '' });
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingEnv(null);
        setFormData({ name: '', variables: '' });
    };

    const handleSave = async () => {
        try {
            let variables = {};
            if (formData.variables.trim()) {
                variables = JSON.parse(formData.variables);
            }

            if (editingEnv) {
                const response = await apiService.updateEnvironment(editingEnv.id, {
                    name: formData.name,
                    variables,
                });
                if (response.success) {
                    toast.success('Environment updated');
                    loadEnvironments();
                    handleCloseDialog();
                }
            } else {
                const response = await apiService.createEnvironment({
                    name: formData.name,
                    variables,
                });
                if (response.success) {
                    toast.success('Environment created');
                    loadEnvironments();
                    handleCloseDialog();
                }
            }
        } catch (error) {
            if (error.message.includes('JSON')) {
                toast.error('Invalid JSON format for variables');
            } else {
                toast.error('Failed to save environment');
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this environment?')) {
            try {
                const response = await apiService.deleteEnvironment(id);
                if (response.success) {
                    toast.success('Environment deleted');
                    loadEnvironments();
                }
            } catch {
                toast.error('Failed to delete environment');
            }
        }
    };

    const handleSelect = (env) => {
        if (onSelectEnvironment) {
            onSelectEnvironment(env);
        }
        onClose();
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Environments</Typography>
                    <Box>
                        <Tooltip title="New Environment">
                            <IconButton size="small" onClick={() => handleOpenDialog()}>
                                <Add />
                            </IconButton>
                        </Tooltip>
                        <IconButton size="small" onClick={onClose}>
                            <Close />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : environments.length === 0 ? (
                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                            No environments yet. Create one to manage variables.
                        </Alert>
                    ) : (
                        <List>
                            {environments.map((env) => (
                                <ListItem
                                    key={env.id}
                                    sx={{
                                        borderRadius: 2,
                                        mb: 1,
                                        border: '1px solid rgba(0,0,0,0.08)',
                                        '&:hover': {
                                            backgroundColor: 'rgba(34,197,94,0.05)',
                                            borderColor: 'rgba(34,197,94,0.2)',
                                        },
                                        cursor: onSelectEnvironment ? 'pointer' : 'default',
                                    }}
                                    onClick={() => onSelectEnvironment && handleSelect(env)}
                                >
                                    <SettingsIcon sx={{ mr: 2, color: '#22c55e' }} />
                                    <ListItemText
                                        primary={
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                {env.name}
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography variant="caption" color="text.secondary">
                                                {Object.keys(env.variables || {}).length} variables
                                            </Typography>
                                        }
                                    />
                                    <ListItemSecondaryAction>
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            <Tooltip title="Edit">
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpenDialog(env);
                                                    }}
                                                >
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(env.id);
                                                    }}
                                                    sx={{ color: '#ef4444' }}
                                                >
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </DialogContent>
            </Dialog>

            {/* Create/Edit Environment Dialog */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingEnv ? 'Edit Environment' : 'Create Environment'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Environment Name"
                        fullWidth
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Variables (JSON)"
                        fullWidth
                        multiline
                        rows={8}
                        value={formData.variables}
                        onChange={(e) => setFormData({ ...formData, variables: e.target.value })}
                        placeholder='{"base_url": "https://api.example.com", "api_key": "your-key"}'
                        helperText="Enter variables as JSON object. Use {{variable}} in requests to substitute values."
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        sx={{
                            backgroundColor: '#22c55e',
                            '&:hover': { backgroundColor: '#16a34a' },
                        }}
                    >
                        {editingEnv ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default EnvironmentManager;

