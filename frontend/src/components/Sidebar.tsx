import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Avatar,
  useTheme,
} from '@mui/material';
import {
  Dashboard,
  Work,
  Assessment,
  Settings,
  Work as WorkIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { hasRole } = useAuth();

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard', roles: ['admin', 'analyst', 'viewer'] },
    { text: 'Work Packages', icon: <Work />, path: '/workpackages', roles: ['admin', 'analyst', 'viewer'] },
    { text: 'Reports', icon: <Assessment />, path: '/reports', roles: ['admin', 'analyst', 'viewer'] },
  ];

  const adminMenuItems = [
    { text: 'Admin · Assignees', icon: <Settings />, path: '/admin/assignees', roles: ['admin'] },
  ];

  const handleMenuClick = (path: string) => {
    navigate(path);
    if (onClose) onClose();
  };

  return (
    <Box
      sx={{
        width: 260,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #1f2937 0%, #111827 100%)'
          : 'linear-gradient(135deg, #f3f4f6 0%, #ffffff 50%, #fef3c7 100%)',
        borderRight: `1px solid ${theme.palette.divider}`,
      }}
    >
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: 'primary.main',
              fontSize: '1.25rem',
              fontWeight: 'bold',
            }}
          >
            WUH
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600} color="text.primary">
              WorkSLA
            </Typography>
            <Typography variant="caption" color="text.secondary">
              SLA Monitoring System
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Menu Items */}
      <Box sx={{ flex: 1, py: 2 }}>
        <List>
          {menuItems
            .filter((item) => hasRole(item.roles))
            .map((item) => (
              <ListItem key={item.text} disablePadding sx={{ px: 2, py: 0.5 }}>
                <ListItemButton
                  onClick={() => handleMenuClick(item.path)}
                  selected={location.pathname === item.path}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    transition: 'all 0.3s ease',
                    '&.Mui-selected': {
                      background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
                      color: 'white',
                      boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                      transform: 'scale(1.02)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
                        transform: 'scale(1.03)',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'white',
                      },
                    },
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(0, 0, 0, 0.04)',
                      transform: 'scale(1.01)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: location.pathname === item.path ? 'white' : 'text.secondary',
                      minWidth: 40,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.95rem',
                      fontWeight: location.pathname === item.path ? 600 : 500,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
        </List>

        {/* Admin Section */}
        {hasRole(['admin']) && adminMenuItems.length > 0 && (
          <>
            <Divider sx={{ my: 2, mx: 2 }} />
            <Typography
              variant="overline"
              sx={{
                px: 3,
                py: 1,
                color: 'text.secondary',
                fontWeight: 600,
                letterSpacing: 1,
              }}
            >
              Administration
            </Typography>
            <List>
              {adminMenuItems.map((item) => (
                <ListItem key={item.text} disablePadding sx={{ px: 2, py: 0.5 }}>
                  <ListItemButton
                    onClick={() => handleMenuClick(item.path)}
                    selected={location.pathname === item.path}
                    sx={{
                      borderRadius: 2,
                      mx: 1,
                      transition: 'all 0.3s ease',
                      '&.Mui-selected': {
                        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
                        transform: 'scale(1.02)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                          transform: 'scale(1.03)',
                        },
                        '& .MuiListItemIcon-root': {
                          color: 'white',
                        },
                      },
                      '&:hover': {
                        backgroundColor: theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'rgba(0, 0, 0, 0.04)',
                        transform: 'scale(1.01)',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: location.pathname === item.path ? 'white' : 'text.secondary',
                        minWidth: 40,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: '0.95rem',
                        fontWeight: location.pathname === item.path ? 600 : 500,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Box textAlign="center">
          <Typography variant="caption" color="text.secondary" display="block">
            WorkSLA v1.0.0
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            © 2025 Walailak University
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Sidebar;