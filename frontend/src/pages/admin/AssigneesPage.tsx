import React from 'react'
import { Box, Typography, Paper, Alert } from '@mui/material'

const AssigneesPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Assignee Allowlist
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Alert severity="info">
          Manage assignee allowlist - Add/Remove allowed assignees.
        </Alert>
      </Paper>
    </Box>
  )
}

export default AssigneesPage
