import React from 'react';
import { Box, Card, CardContent, Typography, Button } from '@mui/material';

const BannerCard = ({ 
    title, 
    subtitle, 
    buttonText = 'Go now', 
    buttonAction,
    gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
}) => {
    return (
        <Card
            sx={{
                height: '100%',
                minHeight: 200,
                borderRadius: 3,
                background: gradient,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                '&:hover': {
                    boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                    transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
            }}
        >
            <CardContent sx={{ p: 4, position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box>
                    <Typography
                        variant="h4"
                        sx={{
                            color: '#ffffff',
                            fontSize: '1.75rem',
                            fontWeight: 700,
                            mb: 1,
                            lineHeight: 1.2,
                        }}
                    >
                        {title}
                    </Typography>
                    {subtitle && (
                        <Typography
                            variant="body1"
                            sx={{
                                color: 'rgba(255,255,255,0.9)',
                                fontSize: '0.875rem',
                                lineHeight: 1.5,
                            }}
                        >
                            {subtitle}
                        </Typography>
                    )}
                </Box>
                <Button
                    variant="contained"
                    onClick={buttonAction}
                    sx={{
                        mt: 3,
                        backgroundColor: '#22c55e',
                        color: '#ffffff',
                        borderRadius: 2,
                        px: 3,
                        py: 1.5,
                        textTransform: 'none',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        boxShadow: '0 4px 12px rgba(34,197,94,0.4)',
                        '&:hover': {
                            backgroundColor: '#16a34a',
                            boxShadow: '0 6px 16px rgba(34,197,94,0.5)',
                        },
                    }}
                >
                    {buttonText}
                </Button>
            </CardContent>
            
            {/* Decorative background elements */}
            <Box
                sx={{
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    filter: 'blur(40px)',
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: -30,
                    left: -30,
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.08)',
                    filter: 'blur(30px)',
                }}
            />
        </Card>
    );
};

export default BannerCard;

