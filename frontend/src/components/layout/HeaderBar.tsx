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
        borderBottom: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        color: 'text.primary',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        backdropFilter: 'blur(8px)',
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
        <Stack direction="row" spacing={1} alignItems="center">
          {/* Theme Toggle */}
          <Tooltip title={mode === 'light' ? 'โหมดมืด' : 'โหมดสว่าง'}>
            <IconButton
              onClick={toggleTheme}
              size="small"
              sx={{
                borderRadius: '10px',
                border: '1px solid',
                borderColor: 'divider',
                padding: '8px',
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  borderColor: 'primary.main',
                },
              }}
            >
              {mode === 'light' ? (
                <DarkModeIcon sx={{ fontSize: 20 }} />
              ) : (
                <LightModeIcon sx={{ fontSize: 20 }} />
              )}
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="การแจ้งเตือน">
            <IconButton
              size="small"
              sx={{
                borderRadius: '10px',
                border: '1px solid',
                borderColor: 'divider',
                padding: '8px',
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  borderColor: 'primary.main',
                },
              }}
            >
              <Badge badgeContent={0} color="error">
                <NotificationsIcon sx={{ fontSize: 20 }} />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Help */}
          <Tooltip title="ช่วยเหลือ">
            <IconButton
              size="small"
              sx={{
                borderRadius: '10px',
                border: '1px solid',
                borderColor: 'divider',
                padding: '8px',
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  borderColor: 'primary.main',
                },
              }}
            >
              <HelpIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          {/* User Profile */}
          <Tooltip title="โปรไฟล์">
            <Avatar
              onClick={handleProfileMenuOpen}
              sx={{
                bgcolor: 'primary.main',
                width: 40,
                height: 40,
                cursor: 'pointer',
                fontWeight: 700,
                color: 'primary.contrastText',
                transition: 'all 0.2s',
                border: '2px solid',
                borderColor: 'divider',
                '&:hover': {
                  transform: 'scale(1.05)',
                  borderColor: 'primary.main',
                  boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`,
                },
              }}
            >
              {userInitial}
            </Avatar>
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
