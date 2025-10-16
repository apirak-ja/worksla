import * as React from 'react'
import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  InputAdornment,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Skeleton,
  Stack,
} from '@mui/material';
import {
  Refresh,
  Search,
  ViewModule,
  ViewList,
  Assignment,
  ArrowForward,
  Clear,
  GetApp,
  CheckCircle,
  NewReleases,
  PlayArrow,
  People,
} from '@mui/icons-material';
import { wpApi, WorkPackage } from '../../api/client'
import { format, formatDistanceToNow } from 'date-fns'
import { th } from 'date-fns/locale'

// ============================================================
// Utility Functions
// ============================================================

const getStatusColor = (status: string) => {
  const statusColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
    'New': 'info',
    'รับเรื่อง': 'primary', 
    'กำลังดำเนินการ': 'warning',
    'ดำเนินการเสร็จ': 'success',
    'ปิดงาน': 'default',
  };
  return statusColors[status] || 'default';
};

const getPriorityColor = (priority: string) => {
  const priorityColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
    'High': 'error',
    'Normal': 'warning', 
    'Low': 'success',
  };
  return priorityColors[priority] || 'default';
};

const formatDateThai = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy HH:mm', { locale: th });
  } catch {
    return dateString;
  }
};

// ============================================================
// Summary Card Component  
// ============================================================

interface SummaryCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: 'primary' | 'success' | 'warning' | 'error' | 'info';
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon, color }) => {
  const colorMap = {
    primary: { accent: '#6366f1', soft: 'rgba(99, 102, 241, 0.12)', ring: 'rgba(99, 102, 241, 0.26)' },
    success: { accent: '#22c55e', soft: 'rgba(34, 197, 94, 0.12)', ring: 'rgba(34, 197, 94, 0.26)' },
    warning: { accent: '#f97316', soft: 'rgba(249, 115, 22, 0.12)', ring: 'rgba(249, 115, 22, 0.24)' },
    error: { accent: '#ef4444', soft: 'rgba(239, 68, 68, 0.12)', ring: 'rgba(239, 68, 68, 0.24)' },
    info: { accent: '#0ea5e9', soft: 'rgba(14, 165, 233, 0.12)', ring: 'rgba(14, 165, 233, 0.24)' },
  } as const;

  const palette = colorMap[color];

  return (
    <Card
      elevation={0}
      className="group relative h-full overflow-hidden rounded-3xl border border-slate-100 bg-white/90 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-2xl"
      sx={{ p: 0 }}
    >
      <Box
        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        sx={{ background: `linear-gradient(135deg, ${palette.accent}1a 0%, transparent 70%)` }}
      />
      <CardContent className="relative z-10 flex h-full flex-col gap-5 p-5">
        <Box className="flex items-start justify-between">
          <Box
            className="flex h-14 w-14 items-center justify-center rounded-2xl"
            sx={{ backgroundColor: palette.soft, color: palette.accent, fontSize: 36 }}
          >
            {icon}
          </Box>
          <Chip
            label={title}
            size="small"
            sx={{
              bgcolor: 'white',
              color: palette.accent,
              fontWeight: 700,
              border: '1px solid',
              borderColor: palette.ring,
              textTransform: 'uppercase',
            }}
          />
        </Box>
        <Typography variant="h3" fontWeight={700} sx={{ color: palette.accent }}>
          {value}
        </Typography>
        <Box
          className="flex items-center gap-2 rounded-2xl px-3 py-1"
          sx={{ backgroundColor: palette.soft, color: palette.accent, fontWeight: 600, alignSelf: 'flex-start' }}
        >
          <Box className="h-2 w-2 rounded-full" sx={{ backgroundColor: palette.accent }} />
          <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: 0.5 }}>
            UPDATED SNAPSHOT
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

// ============================================================
// Status Chip Component
// ============================================================

interface StatusChipProps {
  status: string;
}

const StatusChip: React.FC<StatusChipProps> = ({ status }) => {
  return (
    <Chip
      label={status}
      size="small"
      color={getStatusColor(status)}
      variant="filled"
      sx={{ fontWeight: 600 }}
    />
  );
};

// ============================================================
// Loading/Empty States
// ============================================================

const LoadingState: React.FC = () => (
  <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh" gap={3}>
    <Box width="100%">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} variant="rectangular" width="100%" height={80} sx={{ mb: 2, borderRadius: 2 }} />
      ))}
    </Box>
    <Typography variant="h6" color="text.secondary" fontWeight={600}>
      กำลังโหลด...
    </Typography>
  </Box>
);

const EmptyState: React.FC<{ icon: React.ReactNode; title: string; message?: string }> = ({ 
  icon, title, message 
}) => (
  <Paper
    elevation={0}
    sx={{
      p: 6,
      textAlign: 'center',
      border: '2px dashed',
      borderColor: 'divider',
      borderRadius: 3,
      bgcolor: 'action.hover',
    }}
  >
    {icon}
    <Typography variant="h5" fontWeight={700} gutterBottom>
      {title}
    </Typography>
    {message && (
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    )}
  </Paper>
);

// ============================================================
// Main Component
// ============================================================

const WorkPackagesPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [applyAssigneeFilter, setApplyAssigneeFilter] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['work-packages', page, pageSize, filters, applyAssigneeFilter],
    queryFn: () => wpApi.list({ page: page + 1, pageSize, filters, applyAssigneeFilter }),
  });

  const summaryStats = useMemo(() => {
    const items = (data?.data?.items ?? []) as WorkPackage[]
    const total = data?.data?.total ?? 0

    const assignees = new Set<string>()
    let latestUpdate: Date | null = null

    items.forEach((wp) => {
      if (wp.assignee) {
        assignees.add(wp.assignee)
      }

      if (wp.updated_at) {
        const updatedDate = new Date(wp.updated_at)
        if (!latestUpdate || updatedDate > latestUpdate) {
          latestUpdate = updatedDate
        }
      }
    })

    return {
      total,
      newCount: items.filter((wp) => wp.status === 'New').length,
      inProgress: items.filter((wp) => wp.status === 'กำลังดำเนินการ').length,
      done: items.filter((wp) => wp.status === 'ดำเนินการเสร็จ').length,
      assigneeCount: assignees.size,
      latestUpdate,
    }
  }, [data])

  const latestUpdateLabel = summaryStats.latestUpdate
    ? format(summaryStats.latestUpdate, 'dd MMM yyyy HH:mm', { locale: th })
    : 'ไม่มีข้อมูล'

  const latestUpdateRelative = summaryStats.latestUpdate
    ? formatDistanceToNow(summaryStats.latestUpdate, { addSuffix: true, locale: th })
    : null

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Hero Header */}
      <Box
        className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-slate-900 text-white shadow-2xl"
        sx={{
          mb: 4,
          px: { xs: 3, md: 6 },
          py: { xs: 4, md: 6 },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.55), transparent 52%), radial-gradient(circle at 85% 15%, rgba(192, 132, 252, 0.4), transparent 50%)',
            opacity: 0.6,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0.2,
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0) 0%, rgba(15, 23, 42, 0.6) 100%)',
          }}
        />

        <Box className="relative z-10">
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={4}
            alignItems={{ xs: 'flex-start', md: 'center' }}
            justifyContent="space-between"
          >
            <Box>
              <Typography
                variant="overline"
                sx={{
                  letterSpacing: 2,
                  color: 'rgba(255, 255, 255, 0.65)',
                  fontWeight: 700,
                }}
              >
                WORK PACKAGE CONTROL CENTER
              </Typography>
              <Typography variant="h3" fontWeight={800} sx={{ mt: 1 }}>
                Work Packages Overview
              </Typography>
              <Typography variant="body1" sx={{ mt: 1.5, color: 'rgba(255, 255, 255, 0.85)', maxWidth: 520 }}>
                จัดการและติดตาม Work Packages ด้วยอินเตอร์เฟซใหม่ที่เน้นความโปร่งใสและข้อมูลที่สำคัญในพริบตา
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 3 }}>
                <Chip
                  icon={<Assignment sx={{ color: 'inherit' }} />}
                  label={`ทั้งหมด ${summaryStats.total.toLocaleString()}`}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    borderRadius: 2,
                    '& .MuiChip-icon': { color: 'rgba(255, 255, 255, 0.7)' },
                  }}
                />
                <Chip
                  icon={<PlayArrow sx={{ color: 'inherit' }} />}
                  label={`กำลังดำเนินการ ${summaryStats.inProgress.toLocaleString()}`}
                  sx={{
                    bgcolor: 'rgba(99, 102, 241, 0.18)',
                    color: 'white',
                    borderRadius: 2,
                    '& .MuiChip-icon': { color: 'rgba(255, 255, 255, 0.7)' },
                  }}
                />
                <Chip
                  icon={<CheckCircle sx={{ color: 'inherit' }} />}
                  label={`เสร็จสิ้น ${summaryStats.done.toLocaleString()}`}
                  sx={{
                    bgcolor: 'rgba(34, 197, 94, 0.18)',
                    color: 'white',
                    borderRadius: 2,
                    '& .MuiChip-icon': { color: 'rgba(255, 255, 255, 0.7)' },
                  }}
                />
                <Chip
                  icon={<People sx={{ color: 'inherit' }} />}
                  label={`ผู้รับผิดชอบ ${summaryStats.assigneeCount}`}
                  sx={{
                    bgcolor: 'rgba(14, 165, 233, 0.18)',
                    color: 'white',
                    borderRadius: 2,
                    '& .MuiChip-icon': { color: 'rgba(255, 255, 255, 0.7)' },
                  }}
                />
              </Stack>
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
              <Button
                variant="contained"
                startIcon={<GetApp />}
                sx={{
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.14)',
                  color: 'white',
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.24)',
                    boxShadow: '0 20px 40px rgba(15, 23, 42, 0.35)',
                  },
                }}
              >
                Export รายงาน
              </Button>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={() => refetch()}
                sx={{
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  bgcolor: '#6366f1',
                  color: 'white',
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: '0 10px 30px rgba(99, 102, 241, 0.45)',
                  '&:hover': {
                    bgcolor: '#4f46e5',
                    boxShadow: '0 18px 40px rgba(79, 70, 229, 0.55)',
                  },
                }}
              >
                รีเฟรชข้อมูล
              </Button>
            </Stack>
          </Stack>

          <Box
            className="mt-6 grid gap-3 md:grid-cols-3"
            sx={{
              borderRadius: 3,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              backgroundColor: 'rgba(15, 23, 42, 0.35)',
              p: { xs: 2, md: 3 },
            }}
          >
            <Box>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                อัปเดตล่าสุด
              </Typography>
              <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5 }}>
                {latestUpdateLabel}
              </Typography>
              {latestUpdateRelative && (
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.65)' }}>
                  {latestUpdateRelative}
                </Typography>
              )}
            </Box>
            <Box>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                งานที่เปิดใหม่ (24 ชม.)
              </Typography>
              <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5 }}>
                {summaryStats.newCount.toLocaleString()}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.65)' }}>
                เปรียบเทียบกับรอบก่อนหน้า
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                ผู้รับผิดชอบทั้งหมด
              </Typography>
              <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5 }}>
                {summaryStats.assigneeCount}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.65)' }}>
                รวมทั้งภายในและภายนอกทีม
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={6} sm={3}>
          <SummaryCard
            title="ทั้งหมด"
            value={summaryStats.total.toLocaleString()}
            color="primary"
            icon={<Assignment />}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <SummaryCard
            title="งานใหม่"
            value={summaryStats.newCount.toLocaleString()}
            color="info"
            icon={<NewReleases />}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <SummaryCard
            title="กำลังดำเนินการ"
            value={summaryStats.inProgress.toLocaleString()}
            color="warning"
            icon={<PlayArrow />}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <SummaryCard
            title="เสร็จสิ้น"
            value={summaryStats.done.toLocaleString()}
            color="success"
            icon={<CheckCircle />}
          />
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper
        elevation={0}
        className="supports-[backdrop-filter]:backdrop-blur-md"
        sx={{
          p: { xs: 2.5, md: 3 },
          mb: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'rgba(148, 163, 184, 0.25)',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          boxShadow: '0 25px 45px rgba(15, 23, 42, 0.08)',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
          sx={{ mb: { xs: 2, md: 3 } }}
        >
          <Typography variant="subtitle1" fontWeight={700} color="text.primary">
            เครื่องมือค้นหาและตัวกรอง
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" color="text.secondary">
              อัปเดตล่าสุด:
            </Typography>
            <Chip
              label={latestUpdateRelative || 'ไม่มีข้อมูล'}
              size="small"
              sx={{
                borderRadius: 2,
                fontWeight: 600,
                bgcolor: 'rgba(99, 102, 241, 0.14)',
                color: 'primary.main',
              }}
            />
          </Stack>
        </Stack>

        <Grid container spacing={3} alignItems="center">
          {/* Search */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="ค้นหา Work Package..."
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              InputProps={{
                startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
                endAdornment: filters.search && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setFilters({ ...filters, search: '' })}>
                      <Clear />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
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
              <Tooltip title="Table View">
                <IconButton
                  size="small"
                  color={viewMode === 'table' ? 'primary' : 'default'}
                  onClick={() => setViewMode('table')}
                >
                  <ViewList />
                </IconButton>
              </Tooltip>
              <Tooltip title="Grid View">
                <IconButton
                  size="small"
                  color={viewMode === 'grid' ? 'primary' : 'default'}
                  onClick={() => setViewMode('grid')}
                >
                  <ViewModule />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Data Display */}
      {isLoading ? (
        <LoadingState />
      ) : data?.data?.items?.length === 0 ? (
        <EmptyState
          icon={<Assignment sx={{ fontSize: 64 }} />}
          title="ไม่พบ Work Package"
          message="ไม่มีข้อมูล Work Package ในขณะนี้"
        />
      ) : viewMode === 'table' ? (
        <Paper
          elevation={0}
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg"
          sx={{ backdropFilter: 'blur(6px)' }}
        >
          <TableContainer>
            <Table size="medium">
              <TableHead
                sx={{
                  backgroundColor: 'rgba(15, 23, 42, 0.03)',
                  '& .MuiTableCell-root': {
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 0.35,
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                    borderBottomColor: 'rgba(148, 163, 184, 0.3)',
                  },
                }}
              >
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>เรื่อง</TableCell>
                  <TableCell>สถานะ</TableCell>
                  <TableCell>ผู้รับผิดชอบ</TableCell>
                  <TableCell>ลำดับความสำคัญ</TableCell>
                  <TableCell>อัปเดตล่าสุด</TableCell>
                  <TableCell align="right">การกระทำ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.data?.items?.map((wp, index) => (
                  <TableRow
                    key={wp.wp_id}
                    hover
                    sx={{
                      cursor: 'pointer',
                      backgroundColor: index % 2 === 0 ? 'rgba(248, 250, 252, 0.6)' : 'inherit',
                      '&:hover': {
                        bgcolor: 'rgba(99, 102, 241, 0.08)',
                      },
                      '& .MuiTableCell-root': {
                        borderBottomColor: 'rgba(148, 163, 184, 0.18)',
                      },
                    }}
                    onClick={() => navigate(`/workpackages/${wp.wp_id}`)}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="primary">
                        #{wp.wp_id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        maxWidth: 300,
                      }}>
                        {wp.subject}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <StatusChip status={wp.status} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {wp.assignee || 'ไม่ได้กำหนด'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={wp.priority || 'Normal'}
                        size="small"
                        color={getPriorityColor(wp.priority)}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {wp.updated_at ? formatDateThai(wp.updated_at) : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/workpackages/${wp.wp_id}`);
                        }}
                      >
                        <ArrowForward />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            component="div"
            count={data?.data?.total || 0}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={pageSize}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 20, 50, 100]}
            labelRowsPerPage="แสดงผลต่อหน้า:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} จาก ${count !== -1 ? count : `มากกว่า ${to}`}`}
          />
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {data?.data?.items?.map((wp) => (
            <Grid item xs={12} sm={6} lg={4} key={wp.wp_id}>
              <Card
                elevation={0}
                className="group relative h-full overflow-hidden rounded-3xl border border-slate-200 bg-white/95 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-2xl"
                sx={{ cursor: 'pointer', backdropFilter: 'blur(6px)' }}
                onClick={() => navigate(`/workpackages/${wp.wp_id}`)}
              >
                <Box
                  className="absolute inset-x-6 top-6 h-1 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  sx={{ background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)' }}
                />
                <CardContent className="relative z-10 flex h-full flex-col gap-3 p-5">
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
                      #{wp.wp_id}
                    </Typography>
                    <StatusChip status={wp.status} />
                  </Box>

                  <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      color: 'text.primary',
                    }}
                  >
                    {wp.subject}
                  </Typography>

                  <Box display="flex" alignItems="center" gap={1}>
                    <Assignment fontSize="small" sx={{ color: 'primary.main', opacity: 0.8 }} />
                    <Typography variant="body2" color="text.secondary">
                      {wp.assignee || 'ไม่ได้กำหนด'}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                      label={wp.priority || 'Normal'}
                      size="small"
                      color={getPriorityColor(wp.priority)}
                      variant="outlined"
                      sx={{ borderRadius: 2, fontWeight: 600 }}
                    />
                    <Box className="ml-auto flex items-center gap-1 text-xs text-slate-500">
                      <Box className="h-2 w-2 rounded-full bg-slate-300" />
                      {wp.updated_at ? formatDateThai(wp.updated_at) : '-'}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Pagination for Grid View */}
      {viewMode === 'grid' && data?.data?.items?.length > 0 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <TablePagination
            component="div"
            count={data?.data?.total || 0}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={pageSize}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 20, 50, 100]}
            labelRowsPerPage="แสดงผลต่อหน้า:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} จาก ${count !== -1 ? count : `มากกว่า ${to}`}`}
          />
        </Box>
      )}
    </Box>
  );
};

export default WorkPackagesPage;