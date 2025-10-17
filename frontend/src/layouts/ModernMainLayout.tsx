import React, { useState, useMemo, useCallback } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
  Avatar,
  Divider,
  useMediaQuery,
  Tooltip,
  Chip,
  Container,
} from '@mui/material'
import { useTheme as useMuiTheme, alpha } from '@mui/material/styles'
import {
  Dashboard as DashboardIcon,
  Work as WorkIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Notifications as NotificationsIcon,
  Help as HelpIcon,
  MoreVertRounded as MoreVertIcon,
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import { useTheme as useThemeMode } from '../context/ThemeContext'
import Footer from '../components/Footer'
import wuhLogo from '../assets/wuh_logo.png'

const drawerWidth = 280
const appBarHeight = 64

interface MenuItem {
  text: string
  icon: React.ReactNode
  path: string
  roles: string[]
}

const ModernMainLayout: React.FC = () => {
  const muiTheme = useMuiTheme()
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'))
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout, hasRole } = useAuth()
  const { mode, toggleTheme } = useThemeMode()

  const handleDrawerToggle = () => {
    setMobileDrawerOpen((prev) => !prev)
  }

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null)
  }

  const handleLogout = async () => {
    handleProfileMenuClose()
    await logout()
    navigate('/auth/login')
  }

  const menuItems: MenuItem[] = useMemo(
    () => [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', roles: ['admin', 'analyst', 'viewer'] },
      { text: 'Work Packages', icon: <WorkIcon />, path: '/workpackages', roles: ['admin', 'analyst', 'viewer'] },
      { text: 'Reports', icon: <ReportIcon />, path: '/reports/sla', roles: ['admin', 'analyst', 'viewer'] },
    ],
    []
  )

  const adminMenuItems: MenuItem[] = useMemo(
    () => [
      { text: 'Settings', icon: <SettingsIcon />, path: '/admin/settings', roles: ['admin'] },
    ],
    []
  )

  const isRouteActive = useCallback(
    (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`),
    [location.pathname]
  )

  const handleNavigate = (path: string) => {
    navigate(path)
    if (isMobile) {
      setMobileDrawerOpen(false)
    }
  }

  const userInitial = user?.username?.charAt(0)?.toUpperCase() || 'U'

  const drawer = (
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
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #6B4FA5 0%, #4A2F7F 100%)'
              : 'linear-gradient(135deg, #6B4FA5 0%, #8B6FB8 100%)',
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
            WorkSLA
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.85 }}>
            SLA Portal
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
            Navigation
          </Typography>
        </Box>
        <List sx={{ px: 1 }}>
          {menuItems
            .filter((item) => hasRole(item.roles))
            .map((item) => {
              const isActive = isRouteActive(item.path)
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
                      ? `linear-gradient(135deg, ${alpha(muiTheme.palette.primary.main, 0.15)}, ${alpha(muiTheme.palette.secondary.main, 0.1)})`
                      : 'transparent',
                    borderLeft: isActive ? `4px solid ${muiTheme.palette.primary.main}` : 'none',
                    color: isActive ? 'primary.main' : 'text.secondary',
                    fontWeight: isActive ? 600 : 500,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${alpha(muiTheme.palette.primary.main, 0.08)}, ${alpha(muiTheme.palette.secondary.main, 0.05)})`,
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
              )
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
                ⚙️ Administration
              </Typography>
            </Box>
            <List sx={{ px: 1 }}>
              {adminMenuItems
                .filter((item) => hasRole(item.roles))
                .map((item) => {
                  const isActive = isRouteActive(item.path)
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
                          ? `linear-gradient(135deg, ${alpha(muiTheme.palette.warning.main, 0.15)}, ${alpha(muiTheme.palette.warning.light, 0.1)})`
                          : 'transparent',
                        borderLeft: isActive ? `4px solid ${muiTheme.palette.warning.main}` : 'none',
                        color: isActive ? 'warning.main' : 'text.secondary',
                        fontWeight: isActive ? 600 : 500,
                        '&:hover': {
                          background: `linear-gradient(135deg, ${alpha(muiTheme.palette.warning.main, 0.08)}, ${alpha(muiTheme.palette.warning.light, 0.05)})`,
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
                  )
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
          bgcolor: muiTheme.palette.mode === 'dark' ? alpha('#000', 0.2) : alpha('#000', 0.02),
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} onClick={handleProfileMenuOpen} sx={{ cursor: 'pointer' }}>
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
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          height: appBarHeight,
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          zIndex: { xs: 1000, md: 1100 },
        }}
      >
        <Toolbar sx={{ minHeight: appBarHeight, px: { xs: 2, md: 3 }, display: 'flex', gap: 2 }}>
          {/* Menu Button - Mobile only */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ display: { md: 'none' } }}
          >
            {mobileDrawerOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>

          {/* Spacer */}
          <Box flex={1} />

          {/* Theme Toggle */}
          <Tooltip title={mode === 'light' ? 'Dark Mode' : 'Light Mode'}>
            <IconButton
              onClick={toggleTheme}
              size="small"
              sx={{
                borderRadius: '8px',
                border: '1px solid',
                borderColor: 'divider',
                padding: '8px',
              }}
            >
              {mode === 'light' ? <DarkModeIcon sx={{ fontSize: 20 }} /> : <LightModeIcon sx={{ fontSize: 20 }} />}
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              size="small"
              sx={{
                borderRadius: '8px',
                border: '1px solid',
                borderColor: 'divider',
                padding: '8px',
              }}
            >
              <NotificationsIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          {/* Help */}
          <Tooltip title="Help">
            <IconButton
              size="small"
              sx={{
                borderRadius: '8px',
                border: '1px solid',
                borderColor: 'divider',
                padding: '8px',
              }}
            >
              <HelpIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          {/* Profile Menu */}
          <Avatar
            onClick={handleProfileMenuOpen}
            sx={{
              bgcolor: 'primary.main',
              width: 40,
              height: 40,
              cursor: 'pointer',
              fontWeight: 700,
              color: 'primary.contrastText',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          >
            {userInitial}
          </Avatar>
        </Toolbar>
      </AppBar>

      {/* Side Drawer - Desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Side Drawer - Mobile */}
      <Drawer
        variant="temporary"
        open={mobileDrawerOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Profile Menu */}
      <Menu
        anchorEl={profileMenuAnchor}
        open={Boolean(profileMenuAnchor)}
        onClose={handleProfileMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem disabled>
          <Stack direction="column" spacing={0.5}>
            <Typography variant="subtitle2" fontWeight={600}>
              {user?.username}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.role?.toUpperCase()}
            </Typography>
          </Stack>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { handleNavigate('/admin/settings'); handleProfileMenuClose(); }}>
          <SettingsIcon sx={{ mr: 1, fontSize: 20 }} />
          <Typography>Settings</Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <LogoutIcon sx={{ mr: 1, fontSize: 20 }} />
          <Typography>Logout</Typography>
        </MenuItem>
      </Menu>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
          mt: `${appBarHeight}px`,
          minHeight: `calc(100vh - ${appBarHeight}px)`,
        }}
      >
        {/* Content Area */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            p: { xs: 2, sm: 3, md: 4 },
          }}
        >
          <Outlet />
        </Box>

        {/* Footer */}
        <Footer />
      </Box>
    </Box>
  )
}

export default ModernMainLayout
