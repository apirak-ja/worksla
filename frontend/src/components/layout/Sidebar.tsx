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
      {/* Logo & Branding Section */}
      <Box
        sx={{
          px: 3,
          py: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          background: 'linear-gradient(135deg, #7B5BA4 0%, #9F7DC1 100%)',
          color: 'common.white',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          component="img"
          src={wuhLogo}
          alt="Walailak University Hospital"
          sx={{
            width: 70,
            height: 70,
            borderRadius: '50%',
            objectFit: 'contain',
            backgroundColor: 'rgba(255,255,255,0.15)',
            p: 1,
            border: '2px solid rgba(255,255,255,0.25)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          }}
        />
        <Box textAlign="center">
          <Typography variant="h6" fontWeight={700} noWrap>
            WorkSLA Portal
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.85 }}>
            ระบบรายงานตัวชี้วัด
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
