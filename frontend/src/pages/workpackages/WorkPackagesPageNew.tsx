import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Grid,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  InputAdornment,
  Pagination,
  Stack,
  Paper,
  Divider,
} from '@mui/material';
import {
  Refresh,
  Search,
  FilterList,
  ViewModule,
  ViewList,
  Assignment,
  Person,
  Event,
  TrendingUp,
  AccessTime,
  FiberManualRecord,
  ArrowForward,
} from '@mui/icons-material';
import { wpApi, WorkPackage } from '../../api/client';
import { format, formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';

const WorkPackagesPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [applyAssigneeFilter, setApplyAssigneeFilter] = useState(true);
  const [filters, setFilters] = useState<any>({
    status: '',
    priority: '',
    search: '',
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['workpackages', page, pageSize, filters, applyAssigneeFilter],
    queryFn: () =>
      wpApi
        .list({
          page,
          page_size: pageSize,
          apply_assignee_filter: applyAssigneeFilter,
          ...filters,
        })
        .then((res) => res.data),
  });

  const getPriorityColor = (priority: string) => {
    const priorityMap: Record<string, any> = {
      High: { color: 'error', icon: '🔴' },
      Normal: { color: 'warning', icon: '🟡' },
      Low: { color: 'success', icon: '🟢' },
    };
    return priorityMap[priority] || { color: 'default', icon: '⚪' };
  };

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      New: '#64B5F6',
      'รับเรื่อง': '#FFA726',
      'กำลังดำเนินการ': '#42A5F5',
      'ดำเนินการเสร็จ': '#66BB6A',
      'ปิดงาน': '#78909C',
      Completed: '#66BB6A',
      'In Progress': '#42A5F5',
    };
    return statusMap[status] || '#90A4AE';
  };

  const renderWorkPackageCard = (wp: WorkPackage) => (
    <Card
      key={wp.wp_id}
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 6,
          transform: 'translateY(-4px)',
          borderColor: 'primary.main',
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        {/* Header with ID and Priority */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
          <Chip
            label={`#${wp.wp_id}`}
            size="small"
            icon={<Assignment />}
            sx={{ fontWeight: 600 }}
          />
          <Chip
            label={wp.priority || 'Normal'}
            size="small"
            color={getPriorityColor(wp.priority || 'Normal').color}
            icon={<TrendingUp />}
          />
        </Box>

        {/* Title */}
        <Typography
          variant="h6"
          component="h3"
          sx={{
            mb: 1.5,
            fontWeight: 600,
            fontSize: '1rem',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            minHeight: '2.8em',
          }}
        >
          {wp.subject}
        </Typography>

        {/* Status Badge */}
        <Box mb={2}>
          <Chip
            label={wp.status || 'Unknown'}
            size="small"
            icon={<FiberManualRecord sx={{ fontSize: '0.6rem !important' }} />}
            sx={{
              bgcolor: getStatusColor(wp.status || ''),
              color: 'white',
              fontWeight: 500,
              '& .MuiChip-icon': {
                color: 'white !important',
              },
            }}
          />
        </Box>

        {/* Meta Information */}
        <Stack spacing={1}>
          {/* Type */}
          {wp.type && (
            <Box display="flex" alignItems="center" gap={1}>
              <Assignment sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {wp.type}
              </Typography>
            </Box>
          )}

          {/* Assignee */}
          {wp.assignee_name && (
            <Box display="flex" alignItems="center" gap={1}>
              <Avatar sx={{ width: 20, height: 20, fontSize: '0.7rem', bgcolor: 'primary.main' }}>
                {wp.assignee_name.charAt(0)}
              </Avatar>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                {wp.assignee_name}
              </Typography>
            </Box>
          )}

          {/* Due Date */}
          {wp.due_date && (
            <Box display="flex" alignItems="center" gap={1}>
              <Event sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {format(new Date(wp.due_date), 'dd MMM yyyy', { locale: th })}
              </Typography>
            </Box>
          )}

          {/* Updated At */}
          {wp.updated_at && (
            <Box display="flex" alignItems="center" gap={1}>
              <AccessTime sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {formatDistanceToNow(new Date(wp.updated_at), { addSuffix: true, locale: th })}
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>

      <Divider />

      <CardActions sx={{ p: 2, pt: 1.5 }}>
        <Button
          fullWidth
          variant="outlined"
          endIcon={<ArrowForward />}
          onClick={() => navigate(`/workpackages/${wp.wp_id}`)}
          sx={{ borderRadius: 1.5 }}
        >
          ดูรายละเอียด
        </Button>
      </CardActions>
    </Card>
  );

  const renderWorkPackageList = (wp: WorkPackage) => (
    <Card
      key={wp.wp_id}
      elevation={0}
      sx={{
        mb: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 3,
          borderColor: 'primary.main',
        },
      }}
    >
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          {/* ID & Priority */}
          <Grid item xs={12} sm={2} md={1}>
            <Box display="flex" flexDirection="column" gap={1}>
              <Chip label={`#${wp.wp_id}`} size="small" variant="outlined" />
              <Chip
                label={wp.priority || 'Normal'}
                size="small"
                color={getPriorityColor(wp.priority || 'Normal').color}
              />
            </Box>
          </Grid>

          {/* Title & Meta */}
          <Grid item xs={12} sm={6} md={5}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              {wp.subject}
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
              <Chip
                label={wp.status || 'Unknown'}
                size="small"
                sx={{
                  bgcolor: getStatusColor(wp.status || ''),
                  color: 'white',
                  fontWeight: 500,
                }}
              />
              {wp.type && <Chip label={wp.type} size="small" variant="outlined" />}
            </Box>
          </Grid>

          {/* Assignee */}
          <Grid item xs={12} sm={4} md={3}>
            <Box display="flex" alignItems="center" gap={1}>
              <Person sx={{ color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {wp.assignee_name || 'ไม่ระบุ'}
              </Typography>
            </Box>
            {wp.due_date && (
              <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                <Event sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {format(new Date(wp.due_date), 'dd MMM yyyy', { locale: th })}
                </Typography>
              </Box>
            )}
          </Grid>

          {/* Actions */}
          <Grid item xs={12} sm={12} md={3}>
            <Box display="flex" justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
              <Button
                variant="outlined"
                endIcon={<ArrowForward />}
                onClick={() => navigate(`/workpackages/${wp.wp_id}`)}
                size="small"
              >
                ดูรายละเอียด
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">เกิดข้อผิดพลาดในการโหลดข้อมูล Work Packages</Alert>
      </Box>
    );
  }

  const workPackages = data?.items || [];
  const totalPages = data?.total_pages || 1;

  return (
    <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            📋 Work Packages
          </Typography>
          <Typography variant="body2" color="text.secondary">
            จัดการและติดตามงานทั้งหมด
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Tooltip title="Refresh">
            <IconButton onClick={() => refetch()} color="primary">
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Filters */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Grid container spacing={2} alignItems="center">
          {/* Search */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="ค้นหางาน..."
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Status Filter */}
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              select
              size="small"
              label="สถานะ"
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <MenuItem value="">ทั้งหมด</MenuItem>
              <MenuItem value="New">New</MenuItem>
              <MenuItem value="รับเรื่อง">รับเรื่อง</MenuItem>
              <MenuItem value="กำลังดำเนินการ">กำลังดำเนินการ</MenuItem>
              <MenuItem value="ดำเนินการเสร็จ">ดำเนินการเสร็จ</MenuItem>
              <MenuItem value="ปิดงาน">ปิดงาน</MenuItem>
            </TextField>
          </Grid>

          {/* Priority Filter */}
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              select
              size="small"
              label="ลำดับความสำคัญ"
              value={filters.priority || ''}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            >
              <MenuItem value="">ทั้งหมด</MenuItem>
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Normal">Normal</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
            </TextField>
          </Grid>

          {/* Assignee Filter Toggle */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={applyAssigneeFilter}
                  onChange={(e) => setApplyAssigneeFilter(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  กรองตาม Assignee
                </Typography>
              }
            />
          </Grid>

          {/* View Mode Toggle */}
          <Grid item xs={12} sm={6} md={2}>
            <Box display="flex" justifyContent="flex-end" gap={0.5}>
              <Tooltip title="Grid View">
                <IconButton
                  size="small"
                  color={viewMode === 'grid' ? 'primary' : 'default'}
                  onClick={() => setViewMode('grid')}
                >
                  <ViewModule />
                </IconButton>
              </Tooltip>
              <Tooltip title="List View">
                <IconButton
                  size="small"
                  color={viewMode === 'list' ? 'primary' : 'default'}
                  onClick={() => setViewMode('list')}
                >
                  <ViewList />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Stats Summary */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6} sm={3}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <Typography variant="h4" fontWeight={700}>
              {data?.total || 0}
            </Typography>
            <Typography variant="body2">งานทั้งหมด</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
            <Typography variant="h4" fontWeight={700}>
              {workPackages.filter((wp: WorkPackage) => wp.status === 'กำลังดำเนินการ').length}
            </Typography>
            <Typography variant="body2">กำลังดำเนินการ</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
            <Typography variant="h4" fontWeight={700}>
              {workPackages.filter((wp: WorkPackage) => wp.status === 'ดำเนินการเสร็จ').length}
            </Typography>
            <Typography variant="body2">เสร็จสิ้น</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
            <Typography variant="h4" fontWeight={700}>
              {workPackages.filter((wp: WorkPackage) => wp.status === 'New').length}
            </Typography>
            <Typography variant="body2">งานใหม่</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Work Packages Display */}
      {workPackages.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
          <Assignment sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            ไม่พบ Work Package
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {applyAssigneeFilter
              ? 'ไม่มีงานที่กรองตามผู้รับผิดชอบที่เลือก'
              : 'ไม่มีงานในขณะนี้'}
          </Typography>
        </Paper>
      ) : viewMode === 'grid' ? (
        <Grid container spacing={3}>
          {workPackages.map((wp: WorkPackage) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={wp.wp_id}>
              {renderWorkPackageCard(wp)}
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box>{workPackages.map((wp: WorkPackage) => renderWorkPackageList(wp))}</Box>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Box>
  );
};

export default WorkPackagesPage;
