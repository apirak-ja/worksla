import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
} from '@mui/material';

interface SectionProps {
  title?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  sx?: object;
}

const Section: React.FC<SectionProps> = ({
  title,
  children,
  action,
  sx = {}
}) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: theme.palette.mode === 'dark'
          ? '0 4px 20px rgba(0, 0, 0, 0.3)'
          : '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: `1px solid ${theme.palette.divider}`,
        background: theme.palette.background.paper,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: theme.palette.mode === 'dark'
            ? '0 8px 30px rgba(0, 0, 0, 0.4)'
            : '0 8px 30px rgba(0, 0, 0, 0.12)',
          transform: 'translateY(-2px)',
        },
        ...sx,
      }}
    >
      {/* Header */}
      {(title || action) && (
        <Box
          sx={{
            px: 3,
            py: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {title && (
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                fontSize: '1.125rem',
              }}
            >
              {title}
            </Typography>
          )}
          {action && (
            <Box sx={{ ml: 'auto' }}>
              {action}
            </Box>
          )}
        </Box>
      )}

      {/* Content */}
      <CardContent sx={{ p: 3 }}>
        {children}
      </CardContent>
    </Card>
  );
};

export default Section;