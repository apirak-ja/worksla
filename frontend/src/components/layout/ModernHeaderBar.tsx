/**
 * Modern Header Bar Component
 * ออกแบบใหม่ - สวยงาม ทันสมัย มีสีสัน
 */

import React, { useState } from 'react';
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
  InputBase,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Add as AddIcon,
  Language as LanguageIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme as useThemeMode } from '../../context/ThemeContext';

interface ModernHeaderBarProps {
  onMenuClick: () => void;
  drawerWidth: number;
}

export const ModernHeaderBar: React.FC<ModernHeaderBarProps> = ({ onMenuClick, drawerWidth }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchFocused, setSearchFocused] = useState(false);

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
      elevation={0}
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
        height: 72,
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid',
        borderColor: alpha(theme.palette.divider, 0.8),
        boxShadow: theme.palette.mode === 'dark'
          ? '0 4px 24px rgba(0, 0, 0, 0.4)'
          : '0 4px 24px rgba(0, 0, 0, 0.06)',
        transition: 'all 0.3s ease',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        },
      }}
    >
      <Toolbar sx={{ minHeight: 72, px: { xs: 2, md: 4 }, gap: 2 }}>
        {/* Mobile Menu Button */}
        <IconButton
          edge="start"
          onClick={onMenuClick}
          sx={{
            display: { md: 'none' },
            borderRadius: 3,
            width: 44,
            height: 44,
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.15),
              transform: 'scale(1.05)',
            },
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Search Bar */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            flex: 1,
            maxWidth: 480,
            bgcolor: alpha(theme.palette.background.paper, 0.8),
            borderRadius: 3,
            px: 2,
            py: 1,
            border: '2px solid',
            borderColor: searchFocused 
              ? alpha(theme.palette.primary.main, 0.4)
              : alpha(theme.palette.divider, 0.6),
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: searchFocused
              ? `0 4px 16px ${alpha(theme.palette.primary.main, 0.15)}`
              : 'none',
            '&:hover': {
              borderColor: alpha(theme.palette.primary.main, 0.3),
              boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.1)}`,
            },
          }}
        >
          <SearchIcon sx={{ color: 'text.secondary', mr: 1.5 }} />
          <InputBase
            placeholder="ค้นหางาน, รายงาน, ผู้ใช้..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            sx={{ 
              flex: 1,
              '& input::placeholder': {
                opacity: 0.7,
              },
            }}
          />
          <Chip
            label="⌘K"
            size="small"
            sx={{
              height: 24,
              fontSize: '0.7rem',
              fontWeight: 600,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
            }}
          />
        </Box>

        {/* Spacer */}
        <Box flex={1} display={{ xs: 'block', md: 'none' }} />

        {/* Action Buttons */}
        <Stack direction="row" spacing={1} alignItems="center">
          {/* Quick Create Button */}
          <Tooltip title="สร้างงานใหม่" arrow>
            <IconButton
              onClick={() => navigate('/workpackages/new')}
              sx={{
                width: 44,
                height: 44,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #6b4291 100%)',
                  transform: 'translateY(-2px) scale(1.05)',
                  boxShadow: `0 8px 20px ${alpha('#667eea', 0.4)}`,
                },
              }}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>

          {/* Theme Toggle */}
          <Tooltip title={mode === 'light' ? 'โหมดมืด' : 'โหมดสว่าง'} arrow>
            <IconButton
              onClick={toggleTheme}
              sx={{
                width: 44,
                height: 44,
                borderRadius: 3,
                border: '2px solid',
                borderColor: alpha(theme.palette.primary.main, 0.2),
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.15),
                  borderColor: theme.palette.primary.main,
                  transform: 'translateY(-2px) rotate(20deg)',
                  boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.25)}`,
                },
              }}
            >
              {mode === 'light' ? (
                <DarkModeIcon sx={{ color: 'primary.main' }} />
              ) : (
                <LightModeIcon sx={{ color: 'warning.main' }} />
              )}
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="การแจ้งเตือน" arrow>
            <IconButton
              sx={{
                width: 44,
                height: 44,
                borderRadius: 3,
                border: '2px solid',
                borderColor: alpha(theme.palette.error.main, 0.2),
                bgcolor: alpha(theme.palette.error.main, 0.05),
                position: 'relative',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  bgcolor: alpha(theme.palette.error.main, 0.15),
                  borderColor: theme.palette.error.main,
                  transform: 'translateY(-2px) scale(1.05)',
                  boxShadow: `0 6px 20px ${alpha(theme.palette.error.main, 0.25)}`,
                },
              }}
            >
              <Badge 
                badgeContent={5} 
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.65rem',
                    height: 18,
                    minWidth: 18,
                    fontWeight: 700,
                    animation: 'pulse-badge 2s ease-in-out infinite',
                    '@keyframes pulse-badge': {
                      '0%, 100%': { transform: 'scale(1)' },
                      '50%': { transform: 'scale(1.2)' },
                    },
                  },
                }}
              >
                <NotificationsIcon sx={{ color: 'error.main' }} />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Divider */}
          <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 32, alignSelf: 'center' }} />

          {/* User Profile */}
          <Tooltip title="โปรไฟล์" arrow>
            <Box
              onClick={handleProfileMenuOpen}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: 'pointer',
                borderRadius: 3,
                border: '2px solid',
                borderColor: alpha(theme.palette.primary.main, 0.2),
                px: 1.5,
                py: 0.75,
                background: alpha(theme.palette.primary.main, 0.05),
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: alpha(theme.palette.primary.main, 0.15),
                  borderColor: theme.palette.primary.main,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
                },
              }}
            >
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  width: 40,
                  height: 40,
                  fontWeight: 700,
                  fontSize: '1rem',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                  border: '2px solid',
                  borderColor: alpha('#fff', 0.2),
                }}
              >
                {userInitial}
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' }, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={700} noWrap sx={{ lineHeight: 1.2 }}>
                  {user?.username || 'Guest'}
                </Typography>
                <Chip
                  label={user?.role?.toUpperCase() || 'GUEST'}
                  size="small"
                  color={user?.role === 'admin' ? 'warning' : 'primary'}
                  sx={{ 
                    height: 18, 
                    fontSize: '0.65rem', 
                    fontWeight: 700,
                    mt: 0.5,
                  }}
                />
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
              minWidth: 240,
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              border: '1px solid',
              borderColor: 'divider',
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%)'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)',
              backdropFilter: 'blur(20px)',
            },
          }}
        >
          <Box sx={{ px: 3, py: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  width: 48,
                  height: 48,
                  fontWeight: 700,
                }}
              >
                {userInitial}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  {user?.username}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.role?.toUpperCase() || 'GUEST'}
                </Typography>
              </Box>
            </Stack>
          </Box>
          <Divider />
          <MenuItem 
            onClick={() => { navigate('/admin/settings'); handleProfileMenuClose(); }}
            sx={{
              py: 1.5,
              px: 3,
              borderRadius: 2,
              mx: 1,
              my: 0.5,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            <SettingsIcon sx={{ mr: 2, fontSize: 20, color: 'primary.main' }} />
            <Typography variant="body2" fontWeight={600}>ตั้งค่า</Typography>
          </MenuItem>
          <MenuItem 
            onClick={() => { navigate('/profile'); handleProfileMenuClose(); }}
            sx={{
              py: 1.5,
              px: 3,
              borderRadius: 2,
              mx: 1,
              my: 0.5,
              '&:hover': {
                bgcolor: alpha(theme.palette.info.main, 0.1),
              },
            }}
          >
            <PersonIcon sx={{ mr: 2, fontSize: 20, color: 'info.main' }} />
            <Typography variant="body2" fontWeight={600}>โปรไฟล์</Typography>
          </MenuItem>
          <Divider sx={{ my: 1 }} />
          <MenuItem 
            onClick={handleLogout} 
            sx={{
              py: 1.5,
              px: 3,
              borderRadius: 2,
              mx: 1,
              my: 0.5,
              color: 'error.main',
              '&:hover': {
                bgcolor: alpha(theme.palette.error.main, 0.1),
              },
            }}
          >
            <LogoutIcon sx={{ mr: 2, fontSize: 20 }} />
            <Typography variant="body2" fontWeight={700}>ออกจากระบบ</Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default ModernHeaderBar;
