import React from 'react'
import { Box, Typography, Paper, Alert } from '@mui/material'

const SettingsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        System Settings
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Alert severity="info">
          System settings - Configure OpenProject URL, API token, SLA thresholds, etc.
        </Alert>
      </Paper>
    </Box>
  )
}

export default SettingsPage
