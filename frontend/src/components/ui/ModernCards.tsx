import React from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
  alpha,
  Stack,
  Icon,
  Chip,
} from '@mui/material'
import { TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon } from '@mui/icons-material'

interface StatCardProps {
  title: string
  value: number | string
  subtitle?: string
  icon?: React.ReactNode
  trend?: number
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
  onClick?: () => void
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'primary',
  onClick,
}) => {
  const theme = useTheme()
  const colorValue = theme.palette[color]

  return (
    <Card
      onClick={onClick}
      sx={{
        borderRadius: 3,
        background: `linear-gradient(135deg, ${alpha(colorValue.main, 0.08)}, ${alpha(colorValue.light, 0.04)})`,
        border: `1px solid ${alpha(colorValue.main, 0.2)}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? {
          transform: 'translateY(-8px)',
          boxShadow: `0 12px 32px ${alpha(colorValue.main, 0.3)}`,
        } : {},
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          {/* Header with Icon */}
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography color="text.secondary" variant="caption" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
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
            <Typography variant="h3" fontWeight={800} sx={{ color: colorValue.main }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>

          {/* Trend */}
          {trend !== undefined && (
            <Chip
              icon={trend > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
              label={`${trend > 0 ? '+' : ''}${trend}%`}
              color={trend > 0 ? 'success' : 'error'}
              variant="outlined"
              size="small"
              sx={{ width: 'fit-content' }}
            />
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}

interface InfoCardProps {
  title: string
  description: string
  icon?: React.ReactNode
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
  action?: {
    label: string
    onClick: () => void
  }
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  description,
  icon,
  color = 'info',
  action,
}) => {
  const theme = useTheme()
  const colorValue = theme.palette[color]

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: `1px solid ${alpha(colorValue.main, 0.3)}`,
        background: `linear-gradient(135deg, ${alpha(colorValue.main, 0.05)}, ${alpha(colorValue.light, 0.02)})`,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2}>
            {icon && (
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  bgcolor: alpha(colorValue.main, 0.15),
                  color: colorValue.main,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {icon}
              </Box>
            )}
            <Box flex={1}>
              <Typography variant="subtitle2" fontWeight={700}>
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {description}
              </Typography>
            </Box>
          </Stack>
          {action && (
            <Box sx={{ textAlign: 'right' }}>
              <Typography
                component="button"
                onClick={action.onClick}
                variant="button"
                sx={{
                  color: colorValue.main,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  p: 0,
                  fontSize: '0.875rem',
                  '&:hover': {
                    opacity: 0.8,
                  },
                }}
              >
                {action.label} →
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}

interface GradientCardProps {
  title: string
  subtitle?: string
  gradient: string
  children?: React.ReactNode
  minHeight?: number
}

export const GradientCard: React.FC<GradientCardProps> = ({
  title,
  subtitle,
  gradient,
  children,
  minHeight = 200,
}) => {
  return (
    <Card
      sx={{
        borderRadius: 3,
        background: gradient,
        color: 'white',
        minHeight,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
      }}
    >
      <CardContent sx={{ p: 3, flex: 1 }}>
        <Stack spacing={2} height="100%">
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {children}
        </Stack>
      </CardContent>
    </Card>
  )
}

export default {
  StatCard,
  InfoCard,
  GradientCard,
}
