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
} from '@mui/material';
import {
  Assessment,
  Schedule,
  CheckCircle,
  Warning,
  Refresh,
  Assignment,
  TrendingUp,
  Person,
  Sync,
} from '@mui/icons-material';
import { wpApi } from '../../api/client'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { LoadingState, ErrorState, StatusChip } from '../../components/ui'

const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => wpApi.dashboard().then((res) => res.data),
  })

  if (isLoading) {
    return <LoadingState message="กำลังโหลดข้อมูล Dashboard..." />
  }

  if (error) {
    return <ErrorState error="ไม่สามารถโหลดข้อมูล Dashboard ได้" onRetry={() => refetch()} />
  }

  const stats = data?.stats

  return (
    <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Header with gradient */}
      <Box 
        sx={{ 
          p: 4, 
          mb: 4, 
          borderRadius: 3, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Box>
          <Typography variant="h3" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Assessment sx={{ fontSize: 48 }} />
            Dashboard Overview
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            ภาพรวมและสถานะของ Work Packages ทั้งหมด - อัพเดตเมื่อ {format(new Date(), 'dd MMMM yyyy HH:mm', { locale: th })}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={() => refetch()}
          sx={{ 
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            borderRadius: 2,
            px: 3,
            py: 1.5,
            fontWeight: 600,
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.3)',
            }
          }}
        >
          รีเฟรช
        </Button>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 3, 
              border: '2px solid', 
              borderColor: 'primary.light',
              background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 24px rgba(102, 126, 234, 0.3)',
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Assignment sx={{ fontSize: 56, color: 'primary.main' }} />
                <Box 
                  sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'white', 
                    borderRadius: 2, 
                    px: 2, 
                    py: 0.5,
                    fontWeight: 700,
                    fontSize: '0.75rem'
                  }}
                >
                  TOTAL
                </Box>
              </Box>
              <Typography color="text.secondary" variant="body2" gutterBottom fontWeight={600}>
                งานทั้งหมด
              </Typography>
              <Typography variant="h3" fontWeight={700} color="primary.main">
                {stats?.total || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Work Packages
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 3, 
              border: '2px solid', 
              borderColor: 'error.light',
              background: 'linear-gradient(135deg, #ef535015 0%, #d3232315 100%)',
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 24px rgba(239, 83, 80, 0.3)',
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Warning sx={{ fontSize: 56, color: 'error.main' }} />
                <Box 
                  sx={{ 
                    bgcolor: 'error.main', 
                    color: 'white', 
                    borderRadius: 2, 
                    px: 2, 
                    py: 0.5,
                    fontWeight: 700,
                    fontSize: '0.75rem'
                  }}
                >
                  URGENT
                </Box>
              </Box>
              <Typography color="text.secondary" variant="body2" gutterBottom fontWeight={600}>
                เกินกำหนด
              </Typography>
              <Typography variant="h3" fontWeight={700} color="error.main">
                {stats?.overdue_count || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Overdue Items
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 3, 
              border: '2px solid', 
              borderColor: 'warning.light',
              background: 'linear-gradient(135deg, #ff980015 0%, #ff572215 100%)',
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 24px rgba(255, 152, 0, 0.3)',
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Schedule sx={{ fontSize: 56, color: 'warning.main' }} />
                <Box 
                  sx={{ 
                    bgcolor: 'warning.main', 
                    color: 'white', 
                    borderRadius: 2, 
                    px: 2, 
                    py: 0.5,
                    fontWeight: 700,
                    fontSize: '0.75rem'
                  }}
                >
                  SOON
                </Box>
              </Box>
              <Typography color="text.secondary" variant="body2" gutterBottom fontWeight={600}>
                ใกล้ครบกำหนด
              </Typography>
              <Typography variant="h3" fontWeight={700} color="warning.main">
                {stats?.due_soon_count || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Due in 7 Days
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 3, 
              border: '2px solid', 
              borderColor: 'success.light',
              background: 'linear-gradient(135deg, #4caf5015 0%, #2e7d3215 100%)',
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 24px rgba(76, 175, 80, 0.3)',
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <CheckCircle sx={{ fontSize: 56, color: 'success.main' }} />
                <Box 
                  sx={{ 
                    bgcolor: 'success.main', 
                    color: 'white', 
                    borderRadius: 2, 
                    px: 2, 
                    py: 0.5,
                    fontWeight: 700,
                    fontSize: '0.75rem'
                  }}
                >
                  DONE
                </Box>
              </Box>
              <Typography color="text.secondary" variant="body2" gutterBottom fontWeight={600}>
                เสร็จสมบูรณ์
              </Typography>
              <Typography variant="h3" fontWeight={700} color="success.main">
                {stats?.by_status?.['ดำเนินการเสร็จ'] || stats?.by_status?.['Closed'] || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Stats */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <TrendingUp color="primary" sx={{ fontSize: 28 }} />
              <Typography variant="h6" fontWeight={700}>
                สถานะงาน (By Status)
              </Typography>
            </Box>
            <Box display="flex" flexWrap="wrap" gap={1.5} mt={2}>
              {stats?.by_status &&
                Object.entries(stats.by_status).map(([status, count]) => (
                  <StatusChip key={status} status={status} sx={{ px: 2, py: 2.5, fontSize: '0.875rem' }} />
                ))}
            </Box>
            <Box mt={2} p={2} bgcolor="grey.100" borderRadius={2}>
              <Typography variant="body2" color="text.secondary">
                รวมทั้งหมด: <strong>{String(Object.values(stats?.by_status || {}).reduce((a: number, b: any) => a + Number(b), 0))}</strong> งาน
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Warning color="error" sx={{ fontSize: 28 }} />
              <Typography variant="h6" fontWeight={700}>
                ลำดับความสำคัญ (By Priority)
              </Typography>
            </Box>
            <Box display="flex" flexWrap="wrap" gap={1.5} mt={2}>
              {stats?.by_priority &&
                Object.entries(stats.by_priority).map(([priority, count]) => (
                  <Chip
                    key={priority}
                    label={`${priority}: ${count}`}
                    color={priority === 'High' ? 'error' : priority === 'Normal' ? 'warning' : 'success'}
                    sx={{ 
                      px: 2, 
                      py: 2.5, 
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      boxShadow: 2
                    }}
                  />
                ))}
            </Box>
            <Box mt={2} p={2} bgcolor="grey.100" borderRadius={2}>
              <Typography variant="body2" color="text.secondary">
                รวมทั้งหมด: <strong>{String(Object.values(stats?.by_priority || {}).reduce((a: number, b: any) => a + Number(b), 0))}</strong> งาน
              </Typography>
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
