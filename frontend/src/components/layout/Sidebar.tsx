/**
 * Sidebar Component
 * แถบเมนูด้านข้าง
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
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Work as WorkIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import wuhLogo from '../../assets/wuh_logo.png';

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  roles: string[];
}

export const Sidebar: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, hasRole } = useAuth();

  const menuItems: MenuItem[] = useMemo(
    () => [
      { text: 'แดชบอร์ด', icon: <DashboardIcon />, path: '/dashboard', roles: ['admin', 'analyst', 'viewer'] },
      { text: 'งานทั้งหมด', icon: <WorkIcon />, path: '/workpackages', roles: ['admin', 'analyst', 'viewer'] },
      { text: 'รายงาน SLA', icon: <ReportIcon />, path: '/reports/sla', roles: ['admin', 'analyst', 'viewer'] },
    ],
    []
  );

  const adminMenuItems: MenuItem[] = useMemo(
    () => [
      { text: 'ตั้งค่าระบบ', icon: <SettingsIcon />, path: '/admin/settings', roles: ['admin'] },
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
        bgcolor: 'background.paper',
      }}
    >
      {/* Logo & Branding Section - Modern Design */}
      <Box
        sx={{
          px: 3,
          py: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2.5,
          background: 'linear-gradient(180deg, #7B5BA4 0%, #6B4A94 50%, #5A3D7F 100%)',
          color: 'common.white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -50,
            right: -50,
            width: 150,
            height: 150,
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            borderRadius: '50%',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -30,
            left: -30,
            width: 100,
            height: 100,
            background: 'radial-gradient(circle, rgba(241,116,34,0.15) 0%, transparent 70%)',
            borderRadius: '50%',
          },
        }}
      >
        {/* Logo Container with Animation */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Box
            component="img"
            src={wuhLogo}
            alt="Walailak University Hospital"
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              objectFit: 'contain',
              backgroundColor: 'rgba(255,255,255,0.95)',
              p: 1.5,
              border: '3px solid rgba(255,255,255,0.3)',
              boxShadow: '0 12px 32px rgba(0,0,0,0.3), 0 0 0 0 rgba(255,255,255,0.4)',
              transition: 'all 0.3s ease',
              animation: 'pulse 2s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': {
                  boxShadow: '0 12px 32px rgba(0,0,0,0.3), 0 0 0 0 rgba(255,255,255,0.4)',
                },
                '50%': {
                  boxShadow: '0 12px 32px rgba(0,0,0,0.3), 0 0 0 10px rgba(255,255,255,0)',
                },
              },
              '&:hover': {
                transform: 'scale(1.05) rotate(5deg)',
                boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
              },
            }}
          />
        </Box>

        {/* Text Content */}
        <Box textAlign="center" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography 
            variant="h5" 
            fontWeight={800} 
            noWrap
            sx={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F0E5FF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 0.5,
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            WorkSLA
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              opacity: 0.95,
              fontWeight: 500,
              letterSpacing: 0.5,
              display: 'block',
              mb: 0.5,
            }}
          >
            ระบบรายงานตัวชี้วัด
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              opacity: 0.75,
              fontSize: '0.7rem',
              display: 'block',
            }}
          >
            SLA Monitoring System
          </Typography>
        </Box>

        {/* Decorative Badge */}
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            bgcolor: 'rgba(241, 116, 34, 0.2)',
            border: '1px solid rgba(241, 116, 34, 0.3)',
            borderRadius: '12px',
            px: 1.5,
            py: 0.5,
            zIndex: 1,
          }}
        >
          <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 600 }}>
            v2.0
          </Typography>
        </Box>
      </Box>

      {/* Navigation Menu */}
      <Box flex={1} display="flex" flexDirection="column" sx={{ overflowY: 'auto' }} py={2}>
        {/* Main Menu */}
        <Box px={2} py={1}>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 1,
              fontSize: '0.7rem',
              display: 'block',
              mb: 1,
            }}
          >
            เมนูหลัก
          </Typography>
        </Box>
        <List sx={{ px: 1 }}>
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
                    mx: 1.5,
                    mb: 0.75,
                    borderRadius: 2,
                    px: 2,
                    py: 1.25,
                    transition: 'all 0.2s ease',
                    background: isActive
                      ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)}, ${alpha(theme.palette.secondary.main, 0.1)})`
                      : 'transparent',
                    borderLeft: isActive ? `4px solid ${theme.palette.primary.main}` : 'none',
                    color: isActive ? 'primary.main' : 'text.secondary',
                    fontWeight: isActive ? 600 : 500,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
                      transform: 'translateX(4px)',
                    },
                    '& .MuiListItemIcon-root': {
                      color: isActive ? 'primary.main' : 'text.secondary',
                      minWidth: 40,
                    },
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              );
            })}
        </List>

        {/* Admin Section */}
        {hasRole('admin') && adminMenuItems.some((item) => hasRole(item.roles)) && (
          <>
            <Divider sx={{ my: 2, mx: 2 }} />
            <Box px={2} py={1}>
              <Typography
                variant="caption"
                sx={{
                  color: 'warning.main',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  fontSize: '0.7rem',
                  display: 'block',
                  mb: 1,
                }}
              >
                ⚙️ จัดการระบบ
              </Typography>
            </Box>
            <List sx={{ px: 1 }}>
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
                        mx: 1.5,
                        mb: 0.75,
                        borderRadius: 2,
                        px: 2,
                        py: 1.25,
                        transition: 'all 0.2s ease',
                        background: isActive
                          ? `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.15)}, ${alpha(theme.palette.warning.light, 0.1)})`
                          : 'transparent',
                        borderLeft: isActive ? `4px solid ${theme.palette.warning.main}` : 'none',
                        color: isActive ? 'warning.main' : 'text.secondary',
                        fontWeight: isActive ? 600 : 500,
                        '&:hover': {
                          background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.08)}, ${alpha(theme.palette.warning.light, 0.05)})`,
                          transform: 'translateX(4px)',
                        },
                        '& .MuiListItemIcon-root': {
                          color: isActive ? 'warning.main' : 'text.secondary',
                          minWidth: 40,
                        },
                      }}
                    >
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.text} />
                    </ListItemButton>
                  );
                })}
            </List>
          </>
        )}
      </Box>

      {/* User Profile Section */}
      <Divider />
      <Box
        sx={{
          px: 2,
          py: 2,
          bgcolor: theme.palette.mode === 'dark' ? alpha('#000', 0.2) : alpha('#000', 0.02),
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ cursor: 'pointer' }}>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              width: 40,
              height: 40,
              fontWeight: 700,
              color: 'primary.contrastText',
            }}
          >
            {userInitial}
          </Avatar>
          <Box flex={1} minWidth={0}>
            <Typography variant="subtitle2" fontWeight={600} noWrap>
              {user?.username || 'Guest'}
            </Typography>
            <Chip
              label={user?.role?.toUpperCase() || 'GUEST'}
              size="small"
              color={user?.role === 'admin' ? 'warning' : 'primary'}
              variant="outlined"
              sx={{ fontWeight: 600, fontSize: '0.65rem', height: 18 }}
            />
          </Box>
          <MoreVertIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
        </Stack>
      </Box>
    </Box>
  );
};

export default Sidebar;
