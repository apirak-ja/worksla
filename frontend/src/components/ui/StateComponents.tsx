import React from 'react'
import { Box, CircularProgress, Typography, Button, Stack, Alert } from '@mui/material'
import { Refresh as RefreshIcon, Error as ErrorIcon } from '@mui/icons-material'

interface LoadingStateProps {
  message?: string
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading...' }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '300px',
      gap: 2,
    }}
  >
    <CircularProgress />
    <Typography color="text.secondary">{message}</Typography>
  </Box>
)

interface ErrorStateProps {
  error: string
  onRetry?: () => void
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '300px',
      gap: 2,
    }}
  >
    <Alert severity="error" sx={{ maxWidth: 500 }}>
      {error}
    </Alert>
    {onRetry && (
      <Button
        startIcon={<RefreshIcon />}
        onClick={onRetry}
        variant="contained"
      >
        Try Again
      </Button>
    )}
  </Box>
)

interface EmptyStateProps {
  title?: string
  message?: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Data',
  message = 'No data available',
  icon,
  action,
}) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '300px',
      gap: 2,
    }}
  >
    {icon && <Box sx={{ fontSize: 48, opacity: 0.5 }}>{icon}</Box>}
    <Stack spacing={1} alignItems="center">
      <Typography variant="h6" fontWeight={600}>
        {title}
      </Typography>
      <Typography color="text.secondary">{message}</Typography>
    </Stack>
    {action && (
      <Button onClick={action.onClick} variant="contained">
        {action.label}
      </Button>
    )}
  </Box>
)

export default {
  LoadingState,
  ErrorState,
  EmptyState,
}
