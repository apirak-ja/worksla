/**
 * Priority Chip Component
 * Chip สำหรับแสดงความสำคัญ
 */

import React from 'react';
import { Chip, ChipProps } from '@mui/material';

const priorityMap: Record<string, { color: any; label: string }> = {
  low: { color: 'info', label: 'ต่ำ' },
  medium: { color: 'warning', label: 'ปานกลาง' },
  high: { color: 'error', label: 'สูง' },
  critical: { color: 'error', label: 'วิกฤต' },
};

export interface PriorityChipProps extends Omit<ChipProps, 'label' | 'color'> {
  priority: string;
  customLabel?: string;
}

export const PriorityChip: React.FC<PriorityChipProps> = ({
  priority,
  customLabel,
  ...props
}) => {
  const config = priorityMap[priority.toLowerCase()] || {
    color: 'default',
    label: priority,
  };

  return (
    <Chip
      {...props}
      label={customLabel || config.label}
      color={config.color}
      size={props.size || 'small'}
      variant="outlined"
      sx={{
        fontWeight: 600,
        fontSize: '0.75rem',
        ...props.sx,
      }}
    />
  );
};

export default PriorityChip;
