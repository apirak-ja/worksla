/**
 * Modern Main Layout
 * Layout หลักของระบบที่ใช้ HeaderBar, Sidebar และ Footer
 */

import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import {
  Box,
  Drawer,
  useMediaQuery,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { HeaderBar } from '../components/layout/HeaderBar'
import { Sidebar } from '../components/layout/Sidebar'
import { Footer } from '../components/layout/Footer'

const drawerWidth = 280
const appBarHeight = 64

const ModernMainLayout: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileDrawerOpen((prev) => !prev)
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Header Bar */}
      <HeaderBar onMenuClick={handleDrawerToggle} drawerWidth={drawerWidth} />

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
        <Sidebar />
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
        <Sidebar />
      </Drawer>

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
