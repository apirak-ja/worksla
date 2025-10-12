import React from 'react'
import { Box, Typography, Paper, Alert } from '@mui/material'

const UsersPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        User Management
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Alert severity="info">
          User management interface - Add/Edit/Delete users and manage roles.
        </Alert>
      </Paper>
    </Box>
  )
}

export default UsersPage
