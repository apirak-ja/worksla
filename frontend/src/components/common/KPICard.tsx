/**
 * KPI Card Component
 * การ์ดสำหรับแสดง Key Performance Indicators
 */

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';

export interface KPICardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  onClick?: () => void;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'primary',
  onClick,
}) => {
  const theme = useTheme();
  const colorValue = theme.palette[color];

  return (
    <Card
      onClick={onClick}
      sx={{
        borderRadius: 3,
        background: `linear-gradient(135deg, ${alpha(colorValue.main, 0.08)}, ${alpha(colorValue.light, 0.04)})`,
        border: `1px solid ${alpha(colorValue.main, 0.2)}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: onClick ? 'pointer' : 'default',
        height: '100%',
        '&:hover': onClick
          ? {
              transform: 'translateY(-8px)',
              boxShadow: `0 12px 32px ${alpha(colorValue.main, 0.3)}`,
            }
          : {},
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          {/* Header with Icon */}
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography
                color="text.secondary"
                variant="caption"
                fontWeight={600}
                sx={{
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                {title}
              </Typography>
            </Box>
            {icon && (
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: alpha(colorValue.main, 0.12),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colorValue.main,
                }}
              >
                {icon}
              </Box>
            )}
          </Stack>

          {/* Value */}
          <Box>
            <Typography
              variant="h3"
              fontWeight={800}
              sx={{ color: colorValue.main }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>

          {/* Trend */}
          {trend && (
            <Chip
              icon={
                trend.direction === 'up' ? (
                  <TrendingUpIcon />
                ) : (
                  <TrendingDownIcon />
                )
              }
              label={`${trend.direction === 'up' ? '+' : ''}${trend.value}%`}
              color={trend.direction === 'up' ? 'success' : 'error'}
              variant="outlined"
              size="small"
              sx={{ width: 'fit-content' }}
            />
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default KPICard;
