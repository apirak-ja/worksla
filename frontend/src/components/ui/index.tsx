/**
 * Shared UI Components
 * - StatusChip: แสดงสถานะแบบ Chip พร้อมสี
 * - LoadingState: แสดงหน้า Loading
 */

import React from 'react';
import { Box, Chip, CircularProgress, Typography } from '@mui/material';
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
