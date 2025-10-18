/**
 * Modern Main Layout - REDESIGNED
 * Layout หลักของระบบ - สวยงาม ทันสมัย มีสีสัน
 */

import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import {
  Box,
  Drawer,
  useMediaQuery,
  Container,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { ModernHeaderBar } from '../components/layout/ModernHeaderBar'
import { ModernSidebar } from '../components/layout/ModernSidebar'
import { ModernFooter } from '../components/layout/ModernFooter'

const drawerWidth = 280
const appBarHeight = 72

const ModernMainLayout: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileDrawerOpen((prev) => !prev)
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Modern Header Bar */}
      <ModernHeaderBar onMenuClick={handleDrawerToggle} drawerWidth={drawerWidth} />

      {/* Side Drawer - Desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: 'none',
            boxShadow: '4px 0 24px rgba(0,0,0,0.08)',
          },
        }}
      >
        <ModernSidebar />
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
        <ModernSidebar />
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          ml: { xs: 0, md: `${drawerWidth}px` },
          mt: `${appBarHeight}px`,
          minHeight: `calc(100vh - ${appBarHeight}px)`,
        }}
      >
        {/* Content Area - Narrower and More Aesthetic */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
          }}
        >
          <Container 
            maxWidth="xl"
            sx={{
              py: { xs: 3, md: 4 },
              px: { xs: 2, sm: 3, md: 4 },
            }}
          >
            <Outlet />
          </Container>
        </Box>

        {/* Modern Footer */}
        <ModernFooter />
      </Box>
    </Box>
  )
}

export default ModernMainLayout
