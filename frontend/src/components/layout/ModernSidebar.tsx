/**
 * Modern Sidebar Component
 * ออกแบบใหม่ - สวยงาม ทันสมัย มีสีสัน
 */

import React, { useMemo, useCallback } from 'react';
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Stack,
  Avatar,
  Chip,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Work as WorkIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  TrendingUp,
  CalendarMonth,
  BarChart,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import wuhLogo from '../../assets/wuh_logo.png';

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  roles: string[];
  color?: string;
  badge?: number;
}

export const ModernSidebar: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, hasRole } = useAuth();

  const menuItems: MenuItem[] = useMemo(
    () => [
      { 
        text: 'แดชบอร์ด', 
        icon: <DashboardIcon />, 
        path: '/dashboard', 
        roles: ['admin', 'analyst', 'viewer'],
        color: '#6366f1',
      },
      { 
        text: 'งานทั้งหมด', 
        icon: <WorkIcon />, 
        path: '/workpackages', 
        roles: ['admin', 'analyst', 'viewer'],
        color: '#8b5cf6',
        badge: 12,
      },
      { 
        text: 'รายงาน SLA', 
        icon: <ReportIcon />, 
        path: '/reports/sla', 
        roles: ['admin', 'analyst', 'viewer'],
        color: '#10b981',
      },
    ],
    []
  );

  const adminMenuItems: MenuItem[] = useMemo(
    () => [
      { 
        text: 'ตั้งค่าระบบ', 
        icon: <SettingsIcon />, 
        path: '/admin/settings', 
        roles: ['admin'],
        color: '#f59e0b',
      },
    ],
    []
  );

  const isRouteActive = useCallback(
    (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`),
    [location.pathname]
  );

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const userInitial = user?.username?.charAt(0)?.toUpperCase() || 'U';

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
          : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: theme.palette.mode === 'dark'
            ? 'radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)'
            : 'radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.03) 0%, transparent 50%)',
          pointerEvents: 'none',
        },
      }}
    >
      {/* Ultra Modern Logo Section */}
      <Box
        sx={{
          px: 3,
          py: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          position: 'relative',
          zIndex: 1,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
          },
        }}
      >
        {/* Logo with Glow Effect */}
        <Box
          sx={{
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: -8,
              background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
              borderRadius: '50%',
              animation: 'pulse-glow 3s ease-in-out infinite',
              '@keyframes pulse-glow': {
                '0%, 100%': { opacity: 0.3, transform: 'scale(1)' },
                '50%': { opacity: 0.6, transform: 'scale(1.1)' },
              },
            },
          }}
        >
          <Box
            component="img"
            src={wuhLogo}
            alt="WorkSLA"
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              objectFit: 'contain',
              backgroundColor: 'rgba(255,255,255,0.98)',
              p: 1.5,
              border: '3px solid rgba(255,255,255,0.4)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 0 0 rgba(255,255,255,0.5)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              zIndex: 1,
              '&:hover': {
                transform: 'translateY(-4px) scale(1.05)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
              },
            }}
          />
        </Box>

        {/* Text with Gradient */}
        <Box textAlign="center" color="white">
          <Typography 
            variant="h5" 
            fontWeight={800}
            sx={{
              background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 0.5,
              letterSpacing: 0.5,
            }}
          >
            WorkSLA Pro
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              opacity: 0.9,
              fontWeight: 600,
              fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.9)',
            }}
          >
            SLA Management System
          </Typography>
        </Box>

        {/* Version Badge */}
        <Chip
          label="v3.0 ULTRA"
          size="small"
          sx={{
            bgcolor: 'rgba(255,255,255,0.2)',
            color: 'white',
            fontWeight: 700,
            fontSize: '0.65rem',
            border: '1px solid rgba(255,255,255,0.3)',
            backdropFilter: 'blur(10px)',
          }}
        />
      </Box>

      {/* Navigation Menu */}
      <Box flex={1} display="flex" flexDirection="column" sx={{ overflowY: 'auto', py: 3 }}>
        {/* Main Menu */}
        <Box px={2} mb={1}>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 1.2,
              fontSize: '0.7rem',
              px: 2,
            }}
          >
            📊 เมนูหลัก
          </Typography>
        </Box>
        <List sx={{ px: 2 }}>
          {menuItems
            .filter((item) => hasRole(item.roles))
            .map((item) => {
              const isActive = isRouteActive(item.path);
              return (
                <ListItemButton
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  selected={isActive}
                  sx={{
                    mb: 1,
                    borderRadius: 3,
                    px: 2,
                    py: 1.5,
                    position: 'relative',
                    overflow: 'hidden',
                    background: isActive
                      ? `linear-gradient(135deg, ${alpha(item.color || theme.palette.primary.main, 0.15)}, ${alpha(item.color || theme.palette.primary.main, 0.05)})`
                      : 'transparent',
                    border: isActive 
                      ? `2px solid ${alpha(item.color || theme.palette.primary.main, 0.3)}`
                      : '2px solid transparent',
                    color: isActive ? item.color : 'text.secondary',
                    fontWeight: isActive ? 700 : 500,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&::before': isActive ? {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 4,
                      height: '60%',
                      bgcolor: item.color,
                      borderRadius: '0 4px 4px 0',
                    } : {},
                    '&:hover': {
                      background: `linear-gradient(135deg, ${alpha(item.color || theme.palette.primary.main, 0.1)}, ${alpha(item.color || theme.palette.primary.main, 0.03)})`,
                      transform: 'translateX(6px)',
                      border: `2px solid ${alpha(item.color || theme.palette.primary.main, 0.2)}`,
                      boxShadow: `0 4px 12px ${alpha(item.color || theme.palette.primary.main, 0.2)}`,
                    },
                    '& .MuiListItemIcon-root': {
                      color: isActive ? item.color : 'text.secondary',
                      minWidth: 44,
                      transition: 'all 0.3s',
                    },
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 700 : 600,
                      fontSize: '0.9rem',
                    }}
                  />
                  {item.badge && (
                    <Chip
                      label={item.badge}
                      size="small"
                      sx={{
                        height: 20,
                        minWidth: 20,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        bgcolor: item.color,
                        color: 'white',
                      }}
                    />
                  )}
                </ListItemButton>
              );
            })}
        </List>

        {/* Admin Section */}
        {hasRole('admin') && adminMenuItems.some((item) => hasRole(item.roles)) && (
          <>
            <Divider sx={{ my: 2, mx: 3 }} />
            <Box px={2} mb={1}>
              <Typography
                variant="caption"
                sx={{
                  color: 'warning.main',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: 1.2,
                  fontSize: '0.7rem',
                  px: 2,
                }}
              >
                ⚙️ จัดการระบบ
              </Typography>
            </Box>
            <List sx={{ px: 2 }}>
              {adminMenuItems
                .filter((item) => hasRole(item.roles))
                .map((item) => {
                  const isActive = isRouteActive(item.path);
                  return (
                    <ListItemButton
                      key={item.path}
                      onClick={() => handleNavigate(item.path)}
                      selected={isActive}
                      sx={{
                        mb: 1,
                        borderRadius: 3,
                        px: 2,
                        py: 1.5,
                        background: isActive
                          ? `linear-gradient(135deg, ${alpha(item.color || theme.palette.warning.main, 0.15)}, ${alpha(item.color || theme.palette.warning.main, 0.05)})`
                          : 'transparent',
                        border: isActive 
                          ? `2px solid ${alpha(item.color || theme.palette.warning.main, 0.3)}`
                          : '2px solid transparent',
                        color: isActive ? item.color : 'text.secondary',
                        fontWeight: isActive ? 700 : 500,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          background: `linear-gradient(135deg, ${alpha(item.color || theme.palette.warning.main, 0.1)}, ${alpha(item.color || theme.palette.warning.main, 0.03)})`,
                          transform: 'translateX(6px)',
                          border: `2px solid ${alpha(item.color || theme.palette.warning.main, 0.2)}`,
                        },
                        '& .MuiListItemIcon-root': {
                          color: isActive ? item.color : 'text.secondary',
                          minWidth: 44,
                        },
                      }}
                    >
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText 
                        primary={item.text}
                        primaryTypographyProps={{
                          fontWeight: isActive ? 700 : 600,
                          fontSize: '0.9rem',
                        }}
                      />
                    </ListItemButton>
                  );
                })}
            </List>
          </>
        )}
      </Box>

      {/* Ultra Modern User Profile Section */}
      <Box
        sx={{
          px: 2,
          py: 2.5,
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.8) 100%)'
            : 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
          borderTop: `1px solid ${theme.palette.divider}`,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '10%',
            right: '10%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.3), transparent)',
          },
        }}
      >
        <Stack 
          direction="row" 
          alignItems="center" 
          spacing={1.5}
          sx={{
            cursor: 'pointer',
            p: 1.5,
            borderRadius: 3,
            transition: 'all 0.3s',
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              transform: 'translateY(-2px)',
            },
          }}
        >
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              width: 44,
              height: 44,
              fontWeight: 700,
              fontSize: '1.1rem',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              border: '2px solid',
              borderColor: alpha('#6366f1', 0.3),
            }}
          >
            {userInitial}
          </Avatar>
          <Box flex={1} minWidth={0}>
            <Typography variant="subtitle2" fontWeight={700} noWrap>
              {user?.username || 'Guest'}
            </Typography>
            <Chip
              label={user?.role?.toUpperCase() || 'GUEST'}
              size="small"
              color={user?.role === 'admin' ? 'warning' : 'primary'}
              sx={{ 
                fontWeight: 700, 
                fontSize: '0.65rem', 
                height: 20,
                borderRadius: 1.5,
              }}
            />
          </Box>
          <Tooltip title="การแจ้งเตือน">
            <IconButton size="small" sx={{ bgcolor: alpha(theme.palette.info.main, 0.1) }}>
              <NotificationsIcon fontSize="small" color="info" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    </Box>
  );
};

export default ModernSidebar;
