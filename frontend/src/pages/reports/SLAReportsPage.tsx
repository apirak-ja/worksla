import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Paper,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Download as DownloadIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';

interface SLAMetrics {
  total_work_packages: number;
  completed: number;
  overdue: number;
  due_soon: number;
  completion_rate: number;
  period: {
    start_date: string;
    end_date: string;
  };
}

const SLAReportsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });
  const [selectedAssignee, setSelectedAssignee] = useState('');

  // Fetch SLA metrics
  const { data: slaMetrics, isLoading: slaLoading } = useQuery({
    queryKey: ['sla-metrics', dateRange, selectedAssignee],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('from', dateRange.start_date);
      params.append('to', dateRange.end_date);
      if (selectedAssignee) {
        params.append('assignee_ids', selectedAssignee);
      }
      
      const response = await api.get(`/reports/sla?${params}`);
      return response.data;
    }
  });

  // Fetch assignees for filter
  const { data: assignees = [] } = useQuery({
    queryKey: ['assignees'],
    queryFn: async () => {
      const response = await api.get('/admin/assignees', { params: { active_only: true } });
      return response.data;
    }
  });

  // Mock data for charts (ในระบบจริงจะดึงจาก API)
  const weeklyData = [
    { week: 'Week 1', completed: 85, overdue: 10, due_soon: 15 },
    { week: 'Week 2', completed: 78, overdue: 15, due_soon: 12 },
    { week: 'Week 3', completed: 92, overdue: 8, due_soon: 18 },
    { week: 'Week 4', completed: 88, overdue: 12, due_soon: 20 },
  ];

  const priorityData = [
    { name: 'High', value: 35, color: '#f44336' },
    { name: 'Normal', value: 45, color: '#ff9800' },
    { name: 'Low', value: 20, color: '#4caf50' },
  ];

  const handleExport = (format: 'csv' | 'pdf') => {
    // TODO: Implement export functionality
    console.log(`Exporting as ${format}`);
  };

  const KPICard: React.FC<{
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" component="div" sx={{ color, fontWeight: 'bold' }}>
              {value}
            </Typography>
            <Typography variant="h6" color="textSecondary">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ color, fontSize: 48 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (slaLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  const metrics = slaMetrics || {
    total_work_packages: 0,
    completed: 0,
    overdue: 0,
    due_soon: 0,
    completion_rate: 0
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          SLA Reports
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => handleExport('csv')}
          >
            Export CSV
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => handleExport('pdf')}
          >
            Export PDF
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={dateRange.start_date}
              onChange={(e) => setDateRange(prev => ({ ...prev, start_date: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={dateRange.end_date}
              onChange={(e) => setDateRange(prev => ({ ...prev, end_date: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Assignee</InputLabel>
              <Select
                value={selectedAssignee}
                label="Assignee"
                onChange={(e) => setSelectedAssignee(e.target.value)}
              >
                <MenuItem value="">All Assignees</MenuItem>
                {assignees.map((assignee: any) => (
                  <MenuItem key={assignee.op_user_id} value={assignee.op_user_id}>
                    {assignee.display_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Chip
              label={`${metrics.total_work_packages} Work Packages`}
              color="primary"
              variant="outlined"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Total Work Packages"
            value={metrics.total_work_packages}
            icon={<AssessmentIcon />}
            color="#2196f3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Completed"
            value={metrics.completed}
            icon={<CheckCircleIcon />}
            color="#4caf50"
            subtitle={`${metrics.completion_rate.toFixed(1)}% completion rate`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Overdue"
            value={metrics.overdue}
            icon={<WarningIcon />}
            color="#f44336"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Due Soon"
            value={metrics.due_soon}
            icon={<ScheduleIcon />}
            color="#ff9800"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Weekly Trend */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Weekly SLA Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completed" fill="#4caf50" name="Completed" />
                  <Bar dataKey="overdue" fill="#f44336" name="Overdue" />
                  <Bar dataKey="due_soon" fill="#ff9800" name="Due Soon" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Priority Distribution */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Priority Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Completion Rate Trend */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Monthly Completion Rate Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="completed" 
                    stroke="#2196f3" 
                    strokeWidth={3}
                    name="Completion Rate"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Summary */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Report Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" paragraph>
                <strong>Period:</strong> {dateRange.start_date} to {dateRange.end_date}
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Total Work Packages:</strong> {metrics.total_work_packages}
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Completion Rate:</strong> {metrics.completion_rate.toFixed(1)}%
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" paragraph>
                <strong>SLA Performance:</strong>{' '}
                <Chip
                  label={metrics.completion_rate >= 90 ? 'Excellent' : metrics.completion_rate >= 80 ? 'Good' : 'Needs Improvement'}
                  color={metrics.completion_rate >= 90 ? 'success' : metrics.completion_rate >= 80 ? 'warning' : 'error'}
                  size="small"
                />
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Overdue Rate:</strong> {metrics.total_work_packages > 0 ? ((metrics.overdue / metrics.total_work_packages) * 100).toFixed(1) : 0}%
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SLAReportsPage;
