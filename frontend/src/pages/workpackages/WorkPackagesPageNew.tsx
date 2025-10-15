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
} from '@mui/icons-material';
import { wpApi, WorkPackage } from '../../api/client'
import { format } from 'date-fns'
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
    primary: { bg: 'rgba(123, 91, 164, 0.1)', text: '#7B5BA4' },
    success: { bg: 'rgba(76, 175, 80, 0.1)', text: '#4CAF50' },
    warning: { bg: 'rgba(255, 152, 0, 0.1)', text: '#FF9800' },
    error: { bg: 'rgba(244, 67, 54, 0.1)', text: '#F44336' },
    info: { bg: 'rgba(33, 150, 243, 0.1)', text: '#2196F3' },
  };

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        border: '2px solid',
        borderColor: colorMap[color].bg,
        background: `linear-gradient(135deg, ${colorMap[color].bg} 0%, transparent 100%)`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: `0 12px 24px ${colorMap[color].bg}`,
          borderColor: colorMap[color].text,
        },
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box sx={{ color: colorMap[color].text, fontSize: 48 }}>
            {icon}
          </Box>
          <Box
            sx={{
              bgcolor: colorMap[color].text,
              color: 'white',
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            {title}
          </Box>
        </Box>
        <Typography variant="h3" fontWeight={700} color={colorMap[color].text}>
          {value}
        </Typography>
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
        sx={{
          mb: 4,
          p: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.37)',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h3" fontWeight={700} gutterBottom>
              📋 Work Packages
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              จัดการและติดตาม Work Packages ทั้งหมด
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.3)',
                },
              }}
              startIcon={<GetApp />}
            >
              Export
            </Button>
            <Button
              variant="contained"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.3)',
                },
              }}
              startIcon={<Refresh />}
              onClick={() => refetch()}
            >
              รีเฟรช
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={6} sm={3}>
          <SummaryCard
            title="ทั้งหมด"
            value={data?.data?.total || 0}
            color="primary"
            icon={<Assignment />}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <SummaryCard
            title="งานใหม่"
            value={data?.data?.items?.filter((wp: any) => wp.status === 'New').length || 0}
            color="info"
            icon={<NewReleases />}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <SummaryCard
            title="กำลังดำเนินการ"
            value={data?.data?.items?.filter((wp: any) => wp.status === 'กำลังดำเนินการ').length || 0}
            color="warning"
            icon={<PlayArrow />}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <SummaryCard
            title="เสร็จสิ้น"
            value={data?.data?.items?.filter((wp: any) => wp.status === 'ดำเนินการเสร็จ').length || 0}
            color="success"
            icon={<CheckCircle />}
          />
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
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
        <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>เรื่อง</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>สถานะ</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>ผู้รับผิดชอบ</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>ลำดับความสำคัญ</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>อัปเดตล่าสุด</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">การกระทำ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.data?.items?.map((wp) => (
                  <TableRow 
                    key={wp.wp_id}
                    hover
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' }
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
                elevation={2}
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    elevation: 6,
                    transform: 'translateY(-2px)',
                  }
                }}
                onClick={() => navigate(`/workpackages/${wp.wp_id}`)}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6" component="div" noWrap>
                      #{wp.wp_id}
                    </Typography>
                    <StatusChip status={wp.status} />
                  </Box>
                  
                  <Typography variant="body1" fontWeight="medium" mb={1} sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {wp.subject}
                  </Typography>
                  
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Assignment fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {wp.assignee || 'ไม่ได้กำหนด'}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Chip
                      label={wp.priority || 'Normal'}
                      size="small"
                      color={getPriorityColor(wp.priority)}
                      variant="outlined"
                    />
                    <Typography variant="caption" color="text.secondary">
                      {wp.updated_at ? formatDateThai(wp.updated_at) : '-'}
                    </Typography>
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