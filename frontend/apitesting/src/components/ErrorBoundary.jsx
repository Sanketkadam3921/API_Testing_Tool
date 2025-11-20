import React from 'react';
import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import { ErrorOutline, Refresh } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error,
            errorInfo,
        });
        // Log to console in development
        if (import.meta.env.DEV) {
            console.error('ErrorBoundary caught an error:', error, errorInfo);
        }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '400px',
                        p: 3,
                    }}
                >
                    <Card sx={{ maxWidth: 600, width: '100%' }}>
                        <CardContent sx={{ textAlign: 'center', p: 4 }}>
                            <ErrorOutline
                                sx={{
                                    fontSize: 64,
                                    color: 'error.main',
                                    mb: 2,
                                }}
                            />
                            <Typography variant="h5" gutterBottom>
                                Something went wrong
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                We're sorry, but something unexpected happened. Please try refreshing the page.
                            </Typography>
                            {import.meta.env.DEV && this.state.error && (
                                <Box
                                    sx={{
                                        backgroundColor: 'grey.100',
                                        p: 2,
                                        borderRadius: 1,
                                        mb: 3,
                                        textAlign: 'left',
                                        maxHeight: 200,
                                        overflow: 'auto',
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        component="pre"
                                        sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                                    >
                                        {this.state.error.toString()}
                                        {this.state.errorInfo?.componentStack}
                                    </Typography>
                                </Box>
                            )}
                            <Button
                                variant="contained"
                                startIcon={<Refresh />}
                                onClick={this.handleReset}
                                sx={{
                                    backgroundColor: '#22c55e',
                                    '&:hover': {
                                        backgroundColor: '#16a34a',
                                    },
                                }}
                            >
                                Try Again
                            </Button>
                        </CardContent>
                    </Card>
                </Box>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;


