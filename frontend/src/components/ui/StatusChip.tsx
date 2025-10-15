import { Chip, ChipProps } from '@mui/material';
import {
  CheckCircle,
  AccessTime,
  Error,
  Cancel,
  HourglassEmpty,
} from '@mui/icons-material';

interface StatusChipProps extends Omit<ChipProps, 'color'> {
  status: string;
}

const statusConfig: Record<string, { color: ChipProps['color']; icon: React.ReactNode }> = {
  // Thai statuses
  'ดำเนินการเสร็จ': { color: 'success', icon: <CheckCircle fontSize="small" /> },
  'รับเรื่อง': { color: 'info', icon: <AccessTime fontSize="small" /> },
  'กำลังดำเนินการ': { color: 'warning', icon: <HourglassEmpty fontSize="small" /> },
  'ระงับ': { color: 'error', icon: <Cancel fontSize="small" /> },
  
  // English statuses
  'Completed': { color: 'success', icon: <CheckCircle fontSize="small" /> },
  'In Progress': { color: 'warning', icon: <HourglassEmpty fontSize="small" /> },
  'New': { color: 'info', icon: <AccessTime fontSize="small" /> },
  'Closed': { color: 'default', icon: <CheckCircle fontSize="small" /> },
  'Rejected': { color: 'error', icon: <Cancel fontSize="small" /> },
  'On Hold': { color: 'error', icon: <Cancel fontSize="small" /> },
};

export const StatusChip: React.FC<StatusChipProps> = ({ status, ...props }) => {
  const config = statusConfig[status] || { color: 'default' as const, icon: null };

  return (
    <Chip
      label={status}
      size="small"
      color={config.color}
      {...(config.icon && { icon: config.icon as React.ReactElement })}
      sx={{
        fontWeight: 500,
        fontSize: '0.75rem',
        height: 24,
        '& .MuiChip-icon': {
          fontSize: '0.9rem',
        },
        ...props.sx,
      }}
      {...props}
    />
  );
};
