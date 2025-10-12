import React from 'react'
import { Box, Typography, Paper, Alert } from '@mui/material'

const ReportsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Reports
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Alert severity="info">
          SLA Reports & Productivity Analytics - Generate PDF/CSV reports.
        </Alert>
      </Paper>
    </Box>
  )
}

export default ReportsPage
