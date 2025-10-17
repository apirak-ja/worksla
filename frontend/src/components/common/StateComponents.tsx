/**
 * State Components
 * Components สำหรับแสดงสถานะต่างๆ
 */

import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Button,
  Stack,
  Alert,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  ErrorOutline as ErrorIcon,
  Inbox as InboxIcon,
} from '@mui/icons-material';

// Loading State
export interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'กำลังโหลด...',
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
    <CircularProgress size={48} />
    <Typography color="text.secondary" variant="body2">
      {message}
    </Typography>
  </Box>
);

// Error State
export interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
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
      p: 3,
    }}
  >
    <ErrorIcon sx={{ fontSize: 64, color: 'error.main', opacity: 0.5 }} />
    <Alert severity="error" sx={{ maxWidth: 500 }}>
      {error}
    </Alert>
    {onRetry && (
      <Button
        startIcon={<RefreshIcon />}
        onClick={onRetry}
        variant="contained"
        color="error"
      >
        ลองอีกครั้ง
      </Button>
    )}
  </Box>
);

// Empty State
export interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'ไม่มีข้อมูล',
  message = 'ไม่พบข้อมูลที่ต้องการแสดง',
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
      p: 3,
    }}
  >
    {icon ? (
      <Box sx={{ fontSize: 64, opacity: 0.5, color: 'text.secondary' }}>
        {icon}
      </Box>
    ) : (
      <InboxIcon sx={{ fontSize: 64, opacity: 0.5, color: 'text.secondary' }} />
    )}
    <Stack spacing={1} alignItems="center">
      <Typography variant="h6" fontWeight={600} color="text.primary">
        {title}
      </Typography>
      <Typography color="text.secondary" variant="body2">
        {message}
      </Typography>
    </Stack>
    {action && (
      <Button onClick={action.onClick} variant="contained">
        {action.label}
      </Button>
    )}
  </Box>
);

export default {
  LoadingState,
  ErrorState,
  EmptyState,
};
