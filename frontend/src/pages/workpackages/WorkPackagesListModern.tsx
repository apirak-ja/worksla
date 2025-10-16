import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  Stack,
  Paper,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Button,
  Menu,
  MenuItem,
  Badge,
  Skeleton,
  Alert,
  Divider,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Search,
  FilterList,
  Sort,
  Person,
  Schedule,
  TrendingUp,
  Visibility,
  MoreVert,
  Assignment,
  Category,
  CalendarToday,
  Speed,
  Check,
  Clear,
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';
import { wpApi } from '../../api/client';

const WorkPackagesListModern: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_desc');
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['workpackages'],
    queryFn: () => wpApi.list({}).then((res) => res.data),
  });

  const workPackages = data?.items || [];

  const statusColors: Record<string, { color: string; bg: string }> = {
    'New': { color: '#2196F3', bg: 'rgba(33, 150, 243, 0.1)' },
    'รับเรื่อง': { color: '#0288D1', bg: 'rgba(2, 136, 209, 0.1)' },
    'กำลังดำเนินการ': { color: '#FF9800', bg: 'rgba(255, 152, 0, 0.1)' },
    'ดำเนินการเสร็จ': { color: '#4CAF50', bg: 'rgba(76, 175, 80, 0.1)' },
    'ปิดงาน': { color: '#607D8B', bg: 'rgba(96, 125, 139, 0.1)' },
  };

  const getPriorityColor = (priority: string): 'error' | 'warning' | 'success' => {
    if (priority === 'High') return 'error';
    if (priority === 'Low') return 'success';
    return 'warning';
  };

  const filteredWorkPackages = React.useMemo(() => {
    let filtered = workPackages.filter((wp: any) => {
      const matchesSearch =
        !searchQuery ||
        wp.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wp.id?.toString().includes(searchQuery);
      const matchesStatus = statusFilter === 'all' || wp.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || wp.priority === priorityFilter;
      const matchesType = typeFilter === 'all' || wp.type === typeFilter;
      return matchesSearch && matchesStatus && matchesPriority && matchesType;
    });

    // Sorting
    filtered = [...filtered].sort((a: any, b: any) => {
      switch (sortBy) {
        case 'created_desc':
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        case 'created_asc':
          return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
        case 'updated_desc':
          return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
        case 'updated_asc':
          return new Date(a.updated_at || 0).getTime() - new Date(b.updated_at || 0).getTime();
        case 'id_desc':
          return (b.id || 0) - (a.id || 0);
        case 'id_asc':
          return (a.id || 0) - (b.id || 0);
        case 'subject_asc':
          return (a.subject || '').localeCompare(b.subject || '');
        case 'subject_desc':
          return (b.subject || '').localeCompare(a.subject || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [workPackages, searchQuery, statusFilter, priorityFilter, typeFilter, sortBy]);

  const stats = React.useMemo(() => {
    return {
      total: workPackages.length,
      new: workPackages.filter((wp: any) => wp.status === 'New').length,
      inProgress: workPackages.filter((wp: any) => wp.status === 'กำลังดำเนินการ').length,
      completed: workPackages.filter((wp: any) => wp.status === 'ดำเนินการเสร็จ').length,
      closed: workPackages.filter((wp: any) => wp.status === 'ปิดงาน').length,
    };
  }, [workPackages]);

  // Pagination
  const totalPages = Math.ceil(filteredWorkPackages.length / itemsPerPage);
  const paginatedWorkPackages = React.useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredWorkPackages.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredWorkPackages, page, itemsPerPage]);

  // Get unique values for filters
  const uniqueStatuses = React.useMemo(
    () => Array.from(new Set(workPackages.map((wp: any) => wp.status).filter(Boolean))),
    [workPackages]
  );
  const uniquePriorities = React.useMemo(
    () => Array.from(new Set(workPackages.map((wp: any) => wp.priority).filter(Boolean))),
    [workPackages]
  );
  const uniqueTypes = React.useMemo(
    () => Array.from(new Set(workPackages.map((wp: any) => wp.type).filter(Boolean))),
    [workPackages]
  );

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sortOptions = [
    { value: 'created_desc', label: 'วันที่สร้าง (ใหม่สุด)' },
    { value: 'created_asc', label: 'วันที่สร้าง (เก่าสุด)' },
    { value: 'updated_desc', label: 'วันที่อัพเดท (ใหม่สุด)' },
    { value: 'updated_asc', label: 'วันที่อัพเดท (เก่าสุด)' },
    { value: 'id_desc', label: 'หมายเลข (มาก-น้อย)' },
    { value: 'id_asc', label: 'หมายเลข (น้อย-มาก)' },
    { value: 'subject_asc', label: 'ชื่อ (A-Z)' },
    { value: 'subject_desc', label: 'ชื่อ (Z-A)' },
  ];

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3, mb: 3 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} md={6} lg={3} key={i}>
              <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          ไม่สามารถโหลดข้อมูล Work Packages ได้
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', pb: 6 }}>
      {/* Hero Header */}
      <Paper
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          pt: 6,
          pb: 8,
          mb: -4,
        }}
      >
        <Container maxWidth="xl">
          <Typography variant="h3" fontWeight={700} mb={2}>
            📋 Work Packages
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            จัดการและติดตามงานทั้งหมดของคุณ
          </Typography>
        </Container>
      </Paper>

      <Container maxWidth="xl">
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card
              elevation={3}
              sx={{
                borderRadius: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-8px)' },
              }}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                    <Assignment />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {stats.total}
                    </Typography>
                    <Typography variant="caption">ทั้งหมด</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card
              elevation={3}
              sx={{
                borderRadius: 3,
                background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                color: 'white',
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-8px)' },
              }}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                    <Speed />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {stats.new}
                    </Typography>
                    <Typography variant="caption">งานใหม่</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card
              elevation={3}
              sx={{
                borderRadius: 3,
                background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                color: 'white',
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-8px)' },
              }}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                    <Schedule />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {stats.inProgress}
                    </Typography>
                    <Typography variant="caption">กำลังดำเนินการ</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card
              elevation={3}
              sx={{
                borderRadius: 3,
                background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
                color: 'white',
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-8px)' },
              }}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                    <Schedule />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {stats.completed}
                    </Typography>
                    <Typography variant="caption">เสร็จแล้ว</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card
              elevation={3}
              sx={{
                borderRadius: 3,
                background: 'linear-gradient(135deg, #607D8B 0%, #455A64 100%)',
                color: 'white',
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-8px)' },
              }}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                    <Assignment />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {stats.closed}
                    </Typography>
                    <Typography variant="caption">ปิดแล้ว</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search & Filter Bar */}
        <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <TextField
              fullWidth
              placeholder="ค้นหาด้วยหมายเลข หรือหัวข้อ..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1 }}
            />

            <Button
              variant={statusFilter !== 'all' || priorityFilter !== 'all' || typeFilter !== 'all' ? 'contained' : 'outlined'}
              startIcon={<FilterList />}
              onClick={(e) => setFilterAnchorEl(e.currentTarget)}
              sx={{ minWidth: 150 }}
            >
              ตัวกรอง
              {(statusFilter !== 'all' || priorityFilter !== 'all' || typeFilter !== 'all') && (
                <Chip
                  size="small"
                  label="●"
                  sx={{ ml: 1, height: 16, minWidth: 16, '& .MuiChip-label': { px: 0.5 } }}
                />
              )}
            </Button>

            <Button
              variant="outlined"
              startIcon={<Sort />}
              onClick={(e) => setSortAnchorEl(e.currentTarget)}
              sx={{ minWidth: 150 }}
            >
              เรียงลำดับ
            </Button>

            {(searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || typeFilter !== 'all') && (
              <Button
                variant="text"
                startIcon={<Clear />}
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setPriorityFilter('all');
                  setTypeFilter('all');
                  setPage(1);
                }}
                sx={{ minWidth: 120 }}
              >
                ล้างตัวกรอง
              </Button>
            )}
          </Stack>

          {/* Filter Menu */}
          <Menu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={() => setFilterAnchorEl(null)}
            PaperProps={{
              sx: { minWidth: 300, p: 2 },
            }}
          >
            <Typography variant="subtitle2" fontWeight={700} mb={2}>
              กรองตาม
            </Typography>

            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>สถานะ</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                label="สถานะ"
              >
                <MenuItem value="all">
                  <ListItemText primary="ทั้งหมด" />
                </MenuItem>
                {uniqueStatuses.map((status: any) => (
                  <MenuItem key={status} value={status}>
                    <ListItemText primary={status} />
                    {statusFilter === status && (
                      <ListItemIcon>
                        <Check />
                      </ListItemIcon>
                    )}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>ความสำคัญ</InputLabel>
              <Select
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value);
                  setPage(1);
                }}
                label="ความสำคัญ"
              >
                <MenuItem value="all">
                  <ListItemText primary="ทั้งหมด" />
                </MenuItem>
                {uniquePriorities.map((priority: any) => (
                  <MenuItem key={priority} value={priority}>
                    <ListItemText primary={priority} />
                    {priorityFilter === priority && (
                      <ListItemIcon>
                        <Check />
                      </ListItemIcon>
                    )}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>ประเภท</InputLabel>
              <Select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                label="ประเภท"
              >
                <MenuItem value="all">
                  <ListItemText primary="ทั้งหมด" />
                </MenuItem>
                {uniqueTypes.map((type: any) => (
                  <MenuItem key={type} value={type}>
                    <ListItemText primary={type} />
                    {typeFilter === type && (
                      <ListItemIcon>
                        <Check />
                      </ListItemIcon>
                    )}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Menu>

          {/* Sort Menu */}
          <Menu
            anchorEl={sortAnchorEl}
            open={Boolean(sortAnchorEl)}
            onClose={() => setSortAnchorEl(null)}
            PaperProps={{
              sx: { minWidth: 250 },
            }}
          >
            {sortOptions.map((option) => (
              <MenuItem
                key={option.value}
                selected={sortBy === option.value}
                onClick={() => {
                  setSortBy(option.value);
                  setSortAnchorEl(null);
                  setPage(1);
                }}
              >
                <ListItemText primary={option.label} />
                {sortBy === option.value && (
                  <ListItemIcon>
                    <Check />
                  </ListItemIcon>
                )}
              </MenuItem>
            ))}
          </Menu>
        </Paper>

        {/* Results Info */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            แสดง {paginatedWorkPackages.length} จาก {filteredWorkPackages.length} รายการ
            {filteredWorkPackages.length !== workPackages.length && ` (กรองจาก ${workPackages.length} รายการทั้งหมด)`}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            หน้า {page} / {totalPages || 1}
          </Typography>
        </Box>

        {/* Work Packages Grid */}
        <Grid container spacing={3}>
          {paginatedWorkPackages.map((wp: any) => {
            const statusConfig = statusColors[wp.status] || statusColors['New'];
            const createdDate = wp.created_at ? new Date(wp.created_at) : null;

            return (
              <Grid item xs={12} md={6} lg={4} key={wp.id}>
                <Card
                  elevation={2}
                  sx={{
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s',
                    cursor: 'pointer',
                    height: '100%',
                    '&:hover': {
                      borderColor: statusConfig.color,
                      boxShadow: 6,
                      transform: 'translateY(-4px)',
                    },
                  }}
                  onClick={() => navigate(`/workpackages/${wp.id}`)}
                >
                  <CardContent sx={{ p: 3 }}>
                    {/* Header */}
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Chip
                        label={`#${wp.id}`}
                        size="small"
                        sx={{
                          bgcolor: statusConfig.bg,
                          color: statusConfig.color,
                          fontWeight: 700,
                        }}
                      />
                      <IconButton size="small">
                        <MoreVert />
                      </IconButton>
                    </Stack>

                    {/* Title */}
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      mb={2}
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: 64,
                      }}
                    >
                      {wp.subject}
                    </Typography>

                    {/* Status & Priority */}
                    <Stack direction="row" spacing={1} mb={3}>
                      <Chip
                        label={wp.status}
                        size="small"
                        sx={{
                          bgcolor: statusConfig.color,
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                      <Chip
                        label={wp.priority || 'Normal'}
                        size="small"
                        color={getPriorityColor(wp.priority)}
                        icon={<TrendingUp />}
                      />
                      {wp.type && (
                        <Chip
                          label={wp.type}
                          size="small"
                          variant="outlined"
                          icon={<Category />}
                        />
                      )}
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    {/* Meta Info */}
                    <Stack spacing={1.5}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Person fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {wp.assignee_name || 'ยังไม่ได้มอบหมาย'}
                        </Typography>
                      </Stack>

                      {createdDate && (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Schedule fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {formatDistanceToNow(createdDate, { addSuffix: true, locale: th })}
                          </Typography>
                        </Stack>
                      )}
                    </Stack>

                    {/* Action Button */}
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<Visibility />}
                      sx={{
                        mt: 3,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/workpackages/${wp.id}`);
                      }}
                    >
                      ดูรายละเอียด
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Pagination */}
        {filteredWorkPackages.length > 0 && totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: 2,
                  fontWeight: 600,
                },
              }}
            />
          </Box>
        )}

        {filteredWorkPackages.length === 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 3,
              border: '2px dashed',
              borderColor: 'divider',
            }}
          >
            <Typography variant="h6" color="text.secondary" mb={1}>
              ไม่พบ Work Packages
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ลองปรับเปลี่ยนเงื่อนไขการค้นหาหรือตัวกรอง
            </Typography>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default WorkPackagesListModern;
