import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery,
  Drawer,
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import ProfileMenu from '../components/ProfileMenu';

const drawerWidth = 260;

const AppLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${theme.palette.divider}`,
          boxShadow: 'none',
        }}
      >
        <Toolbar>
          {/* Mobile menu button */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              mr: 2,
              display: { md: 'none' },
              color: 'text.primary'
            }}
          >
            <MenuIcon />
          </IconButton>

          {/* Title */}
          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}
            >
              ระบบรายงานตัวชี้วัด WUH SLA Monitoring
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              Walailak University Hospital
            </Typography>
          </Box>

          {/* Theme Toggle & Profile Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ThemeToggle />
            <ProfileMenu />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Navigation */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
        >
          <Sidebar onClose={handleDrawerToggle} />
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
          open
        >
          <Sidebar />
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
            : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        }}
      >
        {/* Toolbar spacer */}
        <Toolbar />

        {/* Content */}
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Outlet />
        </Box>

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            mt: 'auto',
            py: 3,
            px: { xs: 2, sm: 3, md: 4 },
            background: 'rgba(255, 255, 255, 0.05)',
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'center', md: 'center' },
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            {/* Logo & Branding */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 2,
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: 'white',
                }}
              >
                WUH
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={600} color="text.primary">
                  Walailak University Hospital
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  SLA Monitoring System
                </Typography>
              </Box>
            </Box>

            {/* Copyright */}
            <Box sx={{ textAlign: { xs: 'center', md: 'right' } }}>
              <Typography variant="caption" color="text.secondary">
                © 2025 Walailak University Hospital
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                WorkSLA v1.0.0
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;