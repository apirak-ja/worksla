import React, { useState } from 'react';
import { Box, IconButton, useTheme } from '@mui/material';
import { LightMode, DarkMode } from '@mui/icons-material';

interface ThemeToggleProps {
  onToggle?: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ onToggle }) => {
  const theme = useTheme();
  const [isDark, setIsDark] = useState(theme.palette.mode === 'dark');

  const handleToggle = () => {
    setIsDark(!isDark);
    if (onToggle) onToggle();
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: 56,
        height: 32,
        borderRadius: 16,
        background: isDark
          ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
          : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        boxShadow: isDark
          ? '0 4px 12px rgba(99, 102, 241, 0.4)'
          : '0 4px 12px rgba(251, 191, 36, 0.4)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: isDark
            ? '0 6px 16px rgba(99, 102, 241, 0.5)'
            : '0 6px 16px rgba(251, 191, 36, 0.5)',
        },
      }}
      onClick={handleToggle}
    >
      {/* Toggle Button */}
      <Box
        sx={{
          position: 'absolute',
          top: 2,
          left: isDark ? 26 : 2,
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          transition: 'left 0.3s ease',
          zIndex: 1,
        }}
      >
        {isDark ? (
          <DarkMode sx={{ fontSize: 16, color: '#4f46e5' }} />
        ) : (
          <LightMode sx={{ fontSize: 16, color: '#f59e0b' }} />
        )}
      </Box>

      {/* Background Icons */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: 6,
          transform: 'translateY(-50%)',
          opacity: isDark ? 0.3 : 1,
          transition: 'opacity 0.3s ease',
        }}
      >
        <LightMode sx={{ fontSize: 14, color: 'white' }} />
      </Box>

      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          right: 6,
          transform: 'translateY(-50%)',
          opacity: isDark ? 1 : 0.3,
          transition: 'opacity 0.3s ease',
        }}
      >
        <DarkMode sx={{ fontSize: 14, color: 'white' }} />
      </Box>
    </Box>
  );
};

export default ThemeToggle;