import { Box, Typography, Button } from '@mui/material';
import { Assignment, Refresh } from '@mui/icons-material';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'ไม่พบข้อมูล',
  message = 'ไม่มีข้อมูลที่จะแสดงในขณะนี้',
  icon = <Assignment sx={{ fontSize: 64 }} />,
  action,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        gap: 2,
        py: 8,
      }}
    >
      <Box sx={{ color: 'text.disabled', mb: 2 }}>{icon}</Box>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center" maxWidth={400}>
        {message}
      </Typography>
      {action && (
        <Button
          variant="outlined"
          onClick={action.onClick}
          startIcon={<Refresh />}
          sx={{ mt: 2 }}
        >
          {action.label}
        </Button>
      )}
    </Box>
  );
};
