/**
 * Status Chip Component
 * Chip สำหรับแสดงสถานะ
 */

import React from 'react';
import { Chip, ChipProps } from '@mui/material';

const statusMap: Record<string, { color: any; label: string }> = {
  new: { color: 'info', label: 'ใหม่' },
  in_progress: { color: 'warning', label: 'กำลังดำเนินการ' },
  on_hold: { color: 'error', label: 'ระงับชั่วคราว' },
  closed: { color: 'success', label: 'ปิดงาน' },
  completed: { color: 'success', label: 'เสร็จสมบูรณ์' },
  cancelled: { color: 'error', label: 'ยกเลิก' },
  active: { color: 'success', label: 'ใช้งาน' },
  inactive: { color: 'default', label: 'ไม่ใช้งาน' },
};

export interface StatusChipProps extends Omit<ChipProps, 'label' | 'color'> {
  status: string;
  customLabel?: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({
  status,
  customLabel,
  ...props
}) => {
  const config = statusMap[status.toLowerCase()] || {
    color: 'default',
    label: status,
  };

  return (
    <Chip
      {...props}
      label={customLabel || config.label}
      color={config.color}
      size={props.size || 'small'}
      sx={{
        fontWeight: 600,
        fontSize: '0.75rem',
        ...props.sx,
      }}
    />
  );
};

export default StatusChip;
