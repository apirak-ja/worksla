import React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Assessment,
  Schedule,
  CheckCircle,
  Warning,
  Refresh,
  Assignment,
} from '@mui/icons-material';
import { wpApi } from '../../api/client'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'

const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => wpApi.dashboard().then((res) => res.data),
  })

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error">
        Failed to load dashboard data. Please try again.
      </Alert>
    )
  }

  const stats = data?.stats

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={600}>
          Dashboard
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => refetch()}
        >
          Refresh
        </Button>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Total Work Packages
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {stats?.total || 0}
                  </Typography>
                </Box>
                <Assignment sx={{ fontSize: 50, color: 'primary.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Overdue
                  </Typography>
                  <Typography variant="h4" fontWeight={600} color="error.main">
                    {stats?.overdue_count || 0}
                  </Typography>
                </Box>
                <Warning sx={{ fontSize: 50, color: 'error.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Due Soon (7 days)
                  </Typography>
                  <Typography variant="h4" fontWeight={600} color="warning.main">
                    {stats?.due_soon_count || 0}
                  </Typography>
                </Box>
                <Schedule sx={{ fontSize: 50, color: 'warning.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Completed
                  </Typography>
                  <Typography variant="h4" fontWeight={600} color="success.main">
                    {stats?.by_status?.['ดำเนินการเสร็จ'] || stats?.by_status?.['Closed'] || 0}
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 50, color: 'success.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Stats */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              By Status
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
              {stats?.by_status &&
                Object.entries(stats.by_status).map(([status, count]) => (
                  <Chip
                    key={status}
                    label={`${status}: ${count}`}
                    color="primary"
                    variant="outlined"
                  />
                ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              By Priority
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
              {stats?.by_priority &&
                Object.entries(stats.by_priority).map(([priority, count]) => (
                  <Chip
                    key={priority}
                    label={`${priority}: ${count}`}
                    color={priority === 'High' ? 'error' : 'default'}
                    variant="outlined"
                  />
                ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Overdue & Due Soon */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom color="error.main">
              🚨 Overdue Work Packages
            </Typography>
            {data?.overdue && data.overdue.length > 0 ? (
              <Box mt={2}>
                {data.overdue.slice(0, 5).map((wp) => (
                  <Box
                    key={wp.wp_id}
                    sx={{
                      p: 2,
                      mb: 1,
                      border: '1px solid',
                      borderColor: 'error.light',
                      borderRadius: 1,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'error.lighter' },
                    }}
                    onClick={() => navigate(`/workpackages/${wp.wp_id}`)}
                  >
                    <Typography variant="subtitle2" fontWeight={600}>
                      #{wp.wp_id} {wp.subject}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Due: {wp.due_date ? format(new Date(wp.due_date), 'PPP') : 'N/A'}
                    </Typography>
                  </Box>
                ))}
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  sx={{ mt: 1 }}
                  onClick={() => navigate('/workpackages')}
                >
                  View All
                </Button>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" mt={2}>
                No overdue work packages 🎉
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom color="warning.main">
              ⏰ Due Soon (Next 7 Days)
            </Typography>
            {data?.due_soon && data.due_soon.length > 0 ? (
              <Box mt={2}>
                {data.due_soon.slice(0, 5).map((wp) => (
                  <Box
                    key={wp.wp_id}
                    sx={{
                      p: 2,
                      mb: 1,
                      border: '1px solid',
                      borderColor: 'warning.light',
                      borderRadius: 1,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'warning.lighter' },
                    }}
                    onClick={() => navigate(`/workpackages/${wp.wp_id}`)}
                  >
                    <Typography variant="subtitle2" fontWeight={600}>
                      #{wp.wp_id} {wp.subject}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Due: {wp.due_date ? format(new Date(wp.due_date), 'PPP') : 'N/A'}
                    </Typography>
                  </Box>
                ))}
                <Button
                  fullWidth
                  variant="outlined"
                  color="warning"
                  sx={{ mt: 1 }}
                  onClick={() => navigate('/workpackages')}
                >
                  View All
                </Button>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" mt={2}>
                No work packages due soon
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default DashboardPage
