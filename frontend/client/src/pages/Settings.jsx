import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Switch,
    FormControlLabel,
    Divider,
    Grid,
} from '@mui/material';
import { Save, Settings as SettingsIcon } from '@mui/icons-material';
import EnvironmentManager from '../components/EnvironmentManager';

const SettingsPage = () => {
    const [settings, setSettings] = React.useState({
        notifications: true,
        autoSave: true,
        theme: 'light',
    });
    const [envManagerOpen, setEnvManagerOpen] = useState(false);

    const handleSave = () => {
        // Save settings logic here
        console.log('Settings saved:', settings);
    };

    return (
        <DashboardLayout>
            <Box>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: '#1f2937', mb: 4 }}>
                    Settings
                </Typography>

                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Card sx={{ borderRadius: 3 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                                    General Settings
                                </Typography>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={settings.notifications}
                                                onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                                            />
                                        }
                                        label="Enable Notifications"
                                    />

                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={settings.autoSave}
                                                onChange={(e) => setSettings({ ...settings, autoSave: e.target.checked })}
                                            />
                                        }
                                        label="Auto-save Requests"
                                    />

                                    <Divider />

                                    <TextField
                                        label="API Base URL"
                                        fullWidth
                                        placeholder="https://api.example.com"
                                        variant="outlined"
                                    />

                                    <TextField
                                        label="Request Timeout (seconds)"
                                        type="number"
                                        fullWidth
                                        defaultValue={30}
                                        variant="outlined"
                                    />

                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                                        <Button variant="outlined">Cancel</Button>
                                        <Button
                                            variant="contained"
                                            startIcon={<Save />}
                                            onClick={handleSave}
                                            sx={{
                                                backgroundColor: '#22c55e',
                                                '&:hover': {
                                                    backgroundColor: '#16a34a',
                                                },
                                            }}
                                        >
                                            Save Settings
                                        </Button>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Environment Variables Card */}
                        <Card sx={{ borderRadius: 3, mt: 3 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                            Environment Variables
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Manage variables for different environments (Dev, Staging, Production)
                                        </Typography>
                                    </Box>
                                    <Button
                                        variant="contained"
                                        startIcon={<SettingsIcon />}
                                        onClick={() => setEnvManagerOpen(true)}
                                        sx={{
                                            backgroundColor: '#22c55e',
                                            textTransform: 'none',
                                            '&:hover': {
                                                backgroundColor: '#16a34a',
                                            },
                                        }}
                                    >
                                        Manage
                                    </Button>
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                    Create environments with variables that can be used in requests using <code>{'{{variable}}'}</code> syntax.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>

            {/* Environment Manager Dialog */}
            <EnvironmentManager
                open={envManagerOpen}
                onClose={() => setEnvManagerOpen(false)}
            />
        </DashboardLayout>
    );
};

export default SettingsPage;

