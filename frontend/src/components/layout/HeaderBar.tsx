/**
 * Header Bar Component
 * แถบด้านบนของระบบ
 */

import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Stack,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Help as HelpIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme as useThemeMode } from '../../context/ThemeContext';

interface HeaderBarProps {
  onMenuClick: () => void;
  drawerWidth: number;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ onMenuClick, drawerWidth }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleProfileMenuClose();
    await logout();
    navigate('/auth/login');
  };

  const userInitial = user?.username?.charAt(0)?.toUpperCase() || 'U';

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
        height: 64,
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
        borderBottom: '1px solid',
        borderColor: 'divider',
        color: 'text.primary',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        backdropFilter: 'blur(12px)',
        transition: 'all 0.3s ease',
      }}
    >
      <Toolbar sx={{ minHeight: 64, px: { xs: 2, md: 3 }, display: 'flex', gap: 2 }}>
        {/* Mobile Menu Button */}
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{
            display: { md: 'none' },
            borderRadius: '10px',
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Page Title (Optional) */}
        <Box flex={1}>
          <Typography variant="h6" fontWeight={700} color="text.primary">
            {/* Dynamic page title can go here */}
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          {/* Theme Toggle */}
          <Tooltip title={mode === 'light' ? 'โหมดมืด' : 'โหมดสว่าง'} arrow>
            <IconButton
              onClick={toggleTheme}
              size="medium"
              sx={{
                borderRadius: '12px',
                border: '1.5px solid',
                borderColor: alpha(theme.palette.primary.main, 0.2),
                padding: '10px',
                background: alpha(theme.palette.primary.main, 0.05),
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: alpha(theme.palette.primary.main, 0.15),
                  borderColor: theme.palette.primary.main,
                  transform: 'translateY(-2px) rotate(15deg)',
                  boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                },
              }}
            >
              {mode === 'light' ? (
                <DarkModeIcon sx={{ fontSize: 22, color: 'primary.main' }} />
              ) : (
                <LightModeIcon sx={{ fontSize: 22, color: 'warning.main' }} />
              )}
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="การแจ้งเตือน" arrow>
            <IconButton
              size="medium"
              sx={{
                borderRadius: '12px',
                border: '1.5px solid',
                borderColor: alpha(theme.palette.info.main, 0.2),
                padding: '10px',
                background: alpha(theme.palette.info.main, 0.05),
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                '&:hover': {
                  background: alpha(theme.palette.info.main, 0.15),
                  borderColor: theme.palette.info.main,
                  transform: 'translateY(-2px) scale(1.05)',
                  boxShadow: `0 6px 20px ${alpha(theme.palette.info.main, 0.3)}`,
                },
              }}
            >
              <Badge 
                badgeContent={3} 
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.65rem',
                    height: 18,
                    minWidth: 18,
                    fontWeight: 700,
                  },
                }}
              >
                <NotificationsIcon sx={{ fontSize: 22, color: 'info.main' }} />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Help */}
          <Tooltip title="ช่วยเหลือ" arrow>
            <IconButton
              size="medium"
              sx={{
                borderRadius: '12px',
                border: '1.5px solid',
                borderColor: alpha(theme.palette.success.main, 0.2),
                padding: '10px',
                background: alpha(theme.palette.success.main, 0.05),
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: alpha(theme.palette.success.main, 0.15),
                  borderColor: theme.palette.success.main,
                  transform: 'translateY(-2px) scale(1.05)',
                  boxShadow: `0 6px 20px ${alpha(theme.palette.success.main, 0.3)}`,
                },
              }}
            >
              <HelpIcon sx={{ fontSize: 22, color: 'success.main' }} />
            </IconButton>
          </Tooltip>

          {/* Divider */}
          <Box sx={{ width: 1, height: 32, bgcolor: 'divider', mx: 0.5 }} />

          {/* User Profile */}
          <Tooltip title="โปรไฟล์" arrow>
            <Box
              onClick={handleProfileMenuOpen}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: 'pointer',
                borderRadius: '12px',
                border: '1.5px solid',
                borderColor: alpha(theme.palette.primary.main, 0.2),
                px: 1.5,
                py: 0.75,
                background: alpha(theme.palette.primary.main, 0.05),
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: alpha(theme.palette.primary.main, 0.15),
                  borderColor: theme.palette.primary.main,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.25)}`,
                },
              }}
            >
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  width: 36,
                  height: 36,
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  color: 'primary.contrastText',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
              >
                {userInitial}
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' }, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600} noWrap sx={{ lineHeight: 1.2 }}>
                  {user?.username || 'Guest'}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: '0.7rem' }}>
                  {user?.role?.toUpperCase() || 'GUEST'}
                </Typography>
              </Box>
            </Box>
          </Tooltip>
        </Stack>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfileMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{
            sx: {
              mt: 1.5,
              minWidth: 220,
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              {user?.username}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.role?.toUpperCase() || 'GUEST'}
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => { navigate('/admin/settings'); handleProfileMenuClose(); }}>
            <SettingsIcon sx={{ mr: 1.5, fontSize: 20 }} />
            <Typography variant="body2">ตั้งค่า</Typography>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} />
            <Typography variant="body2">ออกจากระบบ</Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default HeaderBar;
