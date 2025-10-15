import { Box, Typography, Button, Alert } from '@mui/material';
import { Error as ErrorIcon, Refresh } from '@mui/icons-material';

interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: Error | string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'เกิดข้อผิดพลาด',
  message = 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
  error,
  onRetry,
}) => {
  const errorMessage = error instanceof Error ? error.message : error;

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
        px: 3,
      }}
    >
      <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
      <Typography variant="h6" color="error" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center" maxWidth={500}>
        {message}
      </Typography>
      {errorMessage && (
        <Alert severity="error" sx={{ mt: 2, maxWidth: 600 }}>
          {errorMessage}
        </Alert>
      )}
      {onRetry && (
        <Button
          variant="contained"
          onClick={onRetry}
          startIcon={<Refresh />}
          sx={{ mt: 2 }}
        >
          ลองอีกครั้ง
        </Button>
      )}
    </Box>
  );
};
