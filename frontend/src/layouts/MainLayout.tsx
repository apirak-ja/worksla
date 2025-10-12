import React, { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  Dashboard,
  Work,
  Assessment,
  Settings,
  People,
  ListAlt,
  Logout,
  Menu as MenuIcon,
  ChevronLeft,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext'

const drawerWidth = 260

const MainLayout: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout, hasRole } = useAuth()

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    handleMenuClose()
    await logout()
    navigate('/auth/login')
  }

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard', roles: ['admin', 'analyst', 'viewer'] },
    { text: 'Work Packages', icon: <Work />, path: '/workpackages', roles: ['admin', 'analyst', 'viewer'] },
    { text: 'Reports', icon: <Assessment />, path: '/reports/sla', roles: ['admin', 'analyst', 'viewer'] },
  ]

  const adminMenuItems = [
    { text: 'Users', icon: <People />, path: '/admin/users', roles: ['admin'] },
    { text: 'Assignees', icon: <ListAlt />, path: '/admin/assignees', roles: ['admin'] },
    { text: 'Settings', icon: <Settings />, path: '/admin/settings', roles: ['admin'] },
  ]

  const drawer = (
    <div>
      <Toolbar>
        <Box display="flex" alignItems="center" width="100%">
          <Work sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" noWrap component="div" fontWeight={600}>
            WorkSLA
          </Typography>
        </Box>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeft />
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      <List>
        {menuItems
          .filter((item) => hasRole(item.roles))
          .map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => {
                  navigate(item.path)
                  if (isMobile) handleDrawerToggle()
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
      </List>
      {hasRole('admin') && (
        <>
          <Divider />
          <List subheader={<Box px={2} py={1}><Typography variant="caption" color="text.secondary">ADMIN</Typography></Box>}>
            {adminMenuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => {
                    navigate(item.path)
                    if (isMobile) handleDrawerToggle()
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </>
      )}
    </div>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Open Project - SLA Reporting System
          </Typography>
          <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
            <Avatar sx={{ bgcolor: 'secondary.main' }}>
              {user?.username.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Box px={2} py={1}>
              <Typography variant="subtitle2">{user?.username}</Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.role}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  )
}

export default MainLayout
