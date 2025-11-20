import React, { memo } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

const MetricCard = memo(({ 
    title, 
    value, 
    change, 
    changeLabel, 
    positiveChange = true,
    chartData = [],
    chartColor = '#22c55e'
}) => {
    return (
        <Card
            sx={{
                height: '100%',
                borderRadius: 3,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
                transition: 'all 0.3s ease',
                '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)',
                    transform: 'translateY(-2px)',
                },
            }}
        >
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography
                            variant="body2"
                            sx={{
                                color: '#6b7280',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                mb: 1,
                            }}
                        >
                            {title}
                        </Typography>
                        <Typography
                            variant="h4"
                            sx={{
                                color: '#1f2937',
                                fontSize: '2rem',
                                fontWeight: 700,
                                mb: 1,
                                lineHeight: 1.2,
                            }}
                        >
                            {value}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {positiveChange ? (
                                <TrendingUp sx={{ fontSize: 16, color: '#22c55e' }} />
                            ) : (
                                <TrendingDown sx={{ fontSize: 16, color: '#ef4444' }} />
                            )}
                            <Typography
                                variant="body2"
                                sx={{
                                    color: positiveChange ? '#22c55e' : '#ef4444',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                }}
                            >
                                {change}
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: '#6b7280',
                                    fontSize: '0.875rem',
                                    ml: 0.5,
                                }}
                            >
                                {changeLabel}
                            </Typography>
                        </Box>
                    </Box>
                    
                    {/* Mini Chart */}
                    <Box
                        sx={{
                            width: 80,
                            height: 60,
                            display: 'flex',
                            alignItems: 'flex-end',
                            gap: 0.5,
                            ml: 2,
                        }}
                    >
                        {chartData.length > 0 ? (
                            chartData.map((height, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        width: '100%',
                                        height: `${height}%`,
                                        backgroundColor: chartColor,
                                        borderRadius: '2px 2px 0 0',
                                        transition: 'all 0.3s ease',
                                    }}
                                />
                            ))
                        ) : (
                            // Default chart bars if no data provided
                            Array.from({ length: 7 }).map((_, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        width: '100%',
                                        height: `${Math.random() * 40 + 20}%`,
                                        backgroundColor: positiveChange ? '#22c55e' : '#3b82f6',
                                        borderRadius: '2px 2px 0 0',
                                    }}
                                />
                            ))
                        )}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
});

MetricCard.displayName = 'MetricCard';

export default MetricCard;
