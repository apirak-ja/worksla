import React from 'react'
import { Chip, ChipProps, useTheme, alpha } from '@mui/material'

const statusMap: Record<string, { color: any; label: string }> = {
  new: { color: 'info', label: 'New' },
  in_progress: { color: 'warning', label: 'In Progress' },
  on_hold: { color: 'error', label: 'On Hold' },
  closed: { color: 'success', label: 'Closed' },
  completed: { color: 'success', label: 'Completed' },
  cancelled: { color: 'error', label: 'Cancelled' },
  active: { color: 'success', label: 'Active' },
  inactive: { color: 'default', label: 'Inactive' },
}

interface StatusChipProps extends Omit<ChipProps, 'label' | 'color'> {
  status: string
  customLabel?: string
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, customLabel, ...props }) => {
  const theme = useTheme()
  const config = statusMap[status.toLowerCase()] || { color: 'default', label: status }

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
  )
}

interface PriorityChipProps extends Omit<ChipProps, 'label' | 'color'> {
  priority: string
  customLabel?: string
}

const priorityMap: Record<string, { color: any; label: string }> = {
  low: { color: 'info', label: 'Low' },
  medium: { color: 'warning', label: 'Medium' },
  high: { color: 'error', label: 'High' },
  critical: { color: 'error', label: 'Critical' },
}

export const PriorityChip: React.FC<PriorityChipProps> = ({ priority, customLabel, ...props }) => {
  const config = priorityMap[priority.toLowerCase()] || { color: 'default', label: priority }

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
  )
}

export default {
  StatusChip,
  PriorityChip,
}
