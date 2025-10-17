import React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Chip,
  Card,
  CardContent,
  LinearProgress,
  useTheme,
  useMediaQuery,
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
  ShowChart,
  PieChart as PieChartIcon,
} from '@mui/icons-material';
import { wpApi } from '../../api/client'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { LoadingState, ErrorState, StatusChip } from '../../components/ui'
import { StatCard, InfoCard } from '../../components/ui/ModernCards'
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'

const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
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
  
  // Prepare chart data
  const chartData = stats?.by_status ? Object.entries(stats.by_status).map(([status, count]) => ({
    name: status,
    value: count as number
  })) : []

  const priorityData = stats?.by_priority ? Object.entries(stats.by_priority).map(([priority, count]) => ({
    name: priority,
    value: count as number
  })) : []

  const COLORS = ['#6B4FA5', '#F17422', '#4CAF50', '#FF9800', '#F44336', '#2196F3']

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
          <StatCard
            title="งานทั้งหมด"
            value={stats?.total || 0}
            icon={<Assignment />}
            color="primary"
            onClick={() => navigate('/workpackages')}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="เกินกำหนด"
            value={stats?.overdue_count || 0}
            icon={<Warning />}
            color="error"
            onClick={() => navigate('/workpackages')}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="ใกล้ครบกำหนด"
            value={stats?.due_soon_count || 0}
            icon={<Schedule />}
            color="warning"
            onClick={() => navigate('/workpackages')}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="เสร็จสมบูรณ์"
            value={stats?.by_status?.['ดำเนินการเสร็จ'] || stats?.by_status?.['Closed'] || 0}
            icon={<CheckCircle />}
            color="success"
            onClick={() => navigate('/workpackages')}
          />
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
            <Box display="flex" alignItems="center" gap={1} mb={3}>
              <PieChartIcon color="primary" sx={{ fontSize: 28 }} />
              <Typography variant="h6" fontWeight={700}>
                สถานะงาน (By Status)
              </Typography>
            </Box>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" textAlign="center" py={5}>
                ไม่มีข้อมูล
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
            <Box display="flex" alignItems="center" gap={1} mb={3}>
              <ShowChart color="error" sx={{ fontSize: 28 }} />
              <Typography variant="h6" fontWeight={700}>
                ลำดับความสำคัญ (By Priority)
              </Typography>
            </Box>
            {priorityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#F17422" radius={8} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" textAlign="center" py={5}>
                ไม่มีข้อมูล
              </Typography>
            )}
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
