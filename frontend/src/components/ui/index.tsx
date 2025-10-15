/**
 * Shared UI Components
 * - StatusChip: แสดงสถานะแบบ Chip พร้อมสี
 * - LoadingState: แสดงหน้า Loading
 * - EmptyState: แสดงหน้าว่าง
 */

import React from 'react';
import { Box, Chip, CircularProgress, Typography, Button, Paper } from '@mui/material';
import { getStatusColor } from '../../utils/workpackageUtils';

// ============================================================
// Status Chip Component
// ============================================================

interface StatusChipProps {
  status: string;
  size?: 'small' | 'medium';
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, size = 'small' }) => {
  const color = getStatusColor(status);

  return (
    <Chip
      label={status}
      size={size}
      sx={{
        bgcolor: color,
        color: 'white',
        fontWeight: 700,
        fontSize: size === 'small' ? '0.75rem' : '0.875rem',
        textShadow: '0 1px 2px rgba(0,0,0,0.2)',
        boxShadow: `0 2px 8px ${color}40`,
      }}
    />
  );
};

// ============================================================
// Loading State Component
// ============================================================

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'กำลังโหลด...' }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="60vh"
      gap={3}
    >
      <CircularProgress size={60} thickness={4} />
      <Typography variant="h6" color="text.secondary" fontWeight={600}>
        {message}
      </Typography>
    </Box>
  );
};

// ============================================================
// Empty State Component
// ============================================================

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message, action }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 6,
        textAlign: 'center',
        border: '2px dashed',
        borderColor: 'divider',
        borderRadius: 3,
        bgcolor: 'action.hover',
      }}
    >
      {icon && (
        <Box sx={{ color: 'text.disabled', mb: 2 }}>
          {icon}
        </Box>
      )}
      <Typography variant="h5" fontWeight={700} gutterBottom>
        {title}
      </Typography>
      {message && (
        <Typography variant="body2" color="text.secondary" mb={3}>
          {message}
        </Typography>
      )}
      {action && (
        <Button variant="contained" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </Paper>
  );
};
