/**
 * Work Packages List - ULTRA MODERN VERSION
 * Professional, Clean, Beautiful UI with Advanced Features
 * Version 3.0 - Enhanced Design
 */

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
  ToggleButtonGroup,
  ToggleButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  alpha,
  useTheme,
  LinearProgress,
  Fade,
  Zoom,
  Slide,
  Collapse,
  ButtonGroup,
  CardActionArea,
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
  Speed,
  Check,
  Clear,
  ViewModule,
  ViewList,
  FiberNew,
  PlayArrow,
  CheckCircle,
  Block,
  PriorityHigh,
  AccessTime,
  PersonOutline,
  Refresh,
  FileDownload,
  Add,
  Edit,
  Delete,
  Share,
  Description,
  FilterAlt,
  TuneRounded,
  GridView,
  ViewWeek,
  CalendarMonth,
  AttachFile,
  Comment,
  Update,
  Timeline,
  BarChart,
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';
import { wpApi } from '../../api/client';

const WorkPackagesListUltraModern: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_desc');
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [showFilters, setShowFilters] = useState(false);
  const [cardMenuAnchor, setCardMenuAnchor] = useState<{ el: HTMLElement; id: number } | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['workpackages'],
    queryFn: () => wpApi.list({}).then((res) => res.data),
  });

  const workPackages = data?.items || [];

  const statusColors: Record<string, { color: string; bg: string; icon: any }> = {
    'New': { color: '#2196F3', bg: 'rgba(33, 150, 243, 0.1)', icon: FiberNew },
    'รับเรื่อง': { color: '#0288D1', bg: 'rgba(2, 136, 209, 0.1)', icon: Assignment },
    'กำลังดำเนินการ': { color: '#FF9800', bg: 'rgba(255, 152, 0, 0.1)', icon: PlayArrow },
    'ดำเนินการเสร็จ': { color: '#4CAF50', bg: 'rgba(76, 175, 80, 0.1)', icon: CheckCircle },
    'ปิดงาน': { color: '#607D8B', bg: 'rgba(96, 125, 139, 0.1)', icon: Block },
  };

  const getPriorityColor = (priority: string): 'error' | 'warning' | 'success' | 'default' => {
    if (priority === 'High' || priority === 'สูง') return 'error';
    if (priority === 'Low' || priority === 'ต่ำ') return 'success';
    if (priority === 'Medium' || priority === 'ปานกลาง') return 'warning';
    return 'default';
  };

  const filteredWorkPackages = React.useMemo(() => {
    let filtered = workPackages.filter((wp: any) => {
      const matchesSearch =
        !searchQuery ||
        wp.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wp.id?.toString().includes(searchQuery) ||
        wp.assignee_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || wp.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || wp.priority === priorityFilter;
      const matchesType = typeFilter === 'all' || wp.type === typeFilter;
      return matchesSearch && matchesStatus && matchesPriority && matchesType;
    });

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

  const totalPages = Math.ceil(filteredWorkPackages.length / itemsPerPage);
  const paginatedWorkPackages = React.useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredWorkPackages.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredWorkPackages, page, itemsPerPage]);

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

  const activeFiltersCount = 
    (statusFilter !== 'all' ? 1 : 0) +
    (priorityFilter !== 'all' ? 1 : 0) +
    (typeFilter !== 'all' ? 1 : 0);

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setTypeFilter('all');
    setPage(1);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: theme.palette.mode === 'dark' ? '#0a0e27' : '#f8fafc',
        position: 'relative',
      }}
    >
      <Container maxWidth="xl" sx={{ mt: 0, mb: 6 }}>
        {/* 📊 MODERN STATS CARDS - Compact & Informative */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { key: 'new', label: 'งานใหม่', value: stats.new, color: '#2196F3', icon: FiberNew, onClick: () => setStatusFilter('New') },
            { key: 'inProgress', label: 'กำลังดำเนินการ', value: stats.inProgress, color: '#FF9800', icon: PlayArrow, onClick: () => setStatusFilter('กำลังดำเนินการ') },
            { key: 'completed', label: 'เสร็จแล้ว', value: stats.completed, color: '#4CAF50', icon: CheckCircle, onClick: () => setStatusFilter('ดำเนินการเสร็จ') },
            { key: 'closed', label: 'ปิดแล้ว', value: stats.closed, color: '#607D8B', icon: Block, onClick: () => setStatusFilter('ปิดงาน') },
          ].map((stat, index) => {
            const Icon = stat.icon;
            const isActive = (statusFilter !== 'all' && 
              ((stat.key === 'new' && statusFilter === 'New') ||
               (stat.key === 'inProgress' && statusFilter === 'กำลังดำเนินการ') ||
               (stat.key === 'completed' && statusFilter === 'ดำเนินการเสร็จ') ||
               (stat.key === 'closed' && statusFilter === 'ปิดงาน')));
            
            return (
              <Grid item xs={6} sm={3} md={3} key={stat.key}>
                <Card
                  elevation={isActive ? 8 : 2}
                  sx={{
                    borderRadius: 3,
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: `2px solid ${isActive ? stat.color : 'transparent'}`,
                    bgcolor: isActive ? alpha(stat.color, 0.1) : 'background.paper',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 24px ${alpha(stat.color, 0.2)}`,
                    },
                  }}
                  onClick={stat.onClick}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="h4" fontWeight={800} color={stat.color} sx={{ lineHeight: 1, mb: 0.5 }}>
                          {stat.value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                          {stat.label}
                        </Typography>
                      </Box>
                      <Avatar
                        sx={{
                          bgcolor: alpha(stat.color, 0.15),
                          width: 48,
                          height: 48,
                        }}
                      >
                        <Icon sx={{ color: stat.color, fontSize: 24 }} />
                      </Avatar>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* 🔍 ULTRA MODERN SEARCH & FILTER BAR - Easy to Use */}
        <Paper
          elevation={3}
          sx={{
            borderRadius: 3,
            mb: 3,
            overflow: 'hidden',
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          {/* Main Search Row */}
          <Box sx={{ p: 2 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
              {/* Search Field */}
              <TextField
                fullWidth
                placeholder="ค้นหางาน... (หมายเลข, หัวข้อ, ผู้รับผิดชอบ)"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchQuery('')}>
                        <Clear />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                    },
                  },
                }}
              />

              {/* Quick Actions */}
              <Stack direction="row" spacing={1}>
                {/* View Mode Toggle */}
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(e, newView) => newView && setViewMode(newView)}
                  size="small"
                >
                  <ToggleButton value="card">
                    <Tooltip title="มุมมองการ์ด">
                      <GridView fontSize="small" />
                    </Tooltip>
                  </ToggleButton>
                  <ToggleButton value="table">
                    <Tooltip title="มุมมองตาราง">
                      <ViewWeek fontSize="small" />
                    </Tooltip>
                  </ToggleButton>
                </ToggleButtonGroup>

                {/* Filters Toggle */}
                <Badge badgeContent={activeFiltersCount} color="error">
                  <Button
                    variant={showFilters ? 'contained' : 'outlined'}
                    startIcon={<TuneRounded />}
                    onClick={() => setShowFilters(!showFilters)}
                    size="small"
                    sx={{ minWidth: 100 }}
                  >
                    ตัวกรอง
                  </Button>
                </Badge>

                {/* Sort Menu */}
                <Button
                  variant="outlined"
                  startIcon={<Sort />}
                  onClick={(e) => setSortAnchorEl(e.currentTarget)}
                  size="small"
                  sx={{ minWidth: 100 }}
                >
                  เรียง
                </Button>

                {/* Clear All */}
                {(searchQuery || activeFiltersCount > 0) && (
                  <Tooltip title="ล้างทั้งหมด">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={clearAllFilters}
                      sx={{
                        border: `1px solid ${alpha(theme.palette.error.main, 0.5)}`,
                      }}
                    >
                      <Clear fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            </Stack>
          </Box>

          {/* Expandable Filter Panel */}
          <Collapse in={showFilters}>
            <Divider />
            <Box sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>สถานะ</InputLabel>
                    <Select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setPage(1);
                      }}
                      label="สถานะ"
                    >
                      <MenuItem value="all">ทั้งหมด</MenuItem>
                      {uniqueStatuses.map((status: any) => (
                        <MenuItem key={status} value={status}>
                          {status}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>ความสำคัญ</InputLabel>
                    <Select
                      value={priorityFilter}
                      onChange={(e) => {
                        setPriorityFilter(e.target.value);
                        setPage(1);
                      }}
                      label="ความสำคัญ"
                    >
                      <MenuItem value="all">ทั้งหมด</MenuItem>
                      {uniquePriorities.map((priority: any) => (
                        <MenuItem key={priority} value={priority}>
                          {priority}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={4}>
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
                      <MenuItem value="all">ทั้งหมด</MenuItem>
                      {uniqueTypes.map((type: any) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {/* Active Filters Display */}
              {activeFiltersCount > 0 && (
                <Stack direction="row" spacing={1} mt={2} flexWrap="wrap" gap={1}>
                  <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
                    กรองโดย:
                  </Typography>
                  {statusFilter !== 'all' && (
                    <Chip
                      label={`สถานะ: ${statusFilter}`}
                      size="small"
                      onDelete={() => setStatusFilter('all')}
                      color="primary"
                    />
                  )}
                  {priorityFilter !== 'all' && (
                    <Chip
                      label={`ความสำคัญ: ${priorityFilter}`}
                      size="small"
                      onDelete={() => setPriorityFilter('all')}
                      color="primary"
                    />
                  )}
                  {typeFilter !== 'all' && (
                    <Chip
                      label={`ประเภท: ${typeFilter}`}
                      size="small"
                      onDelete={() => setTypeFilter('all')}
                      color="primary"
                    />
                  )}
                </Stack>
              )}
            </Box>
          </Collapse>
        </Paper>

        {/* Results Summary */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} px={1}>
          <Typography variant="body2" color="text.secondary">
            แสดง <strong>{paginatedWorkPackages.length}</strong> จาก{' '}
            <strong>{filteredWorkPackages.length}</strong> รายการ
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              แสดงต่อหน้า:
            </Typography>
            <ButtonGroup size="small" variant="outlined">
              {[12, 24, 48].map((size) => (
                <Button
                  key={size}
                  variant={itemsPerPage === size ? 'contained' : 'outlined'}
                  onClick={() => {
                    setItemsPerPage(size);
                    setPage(1);
                  }}
                  sx={{ minWidth: 40 }}
                >
                  {size}
                </Button>
              ))}
            </ButtonGroup>
          </Stack>
        </Stack>

        {/* Work Packages Display */}
        {viewMode === 'card' ? (
          // 🎴 BEAUTIFUL CARD VIEW
          <Grid container spacing={3}>
            {paginatedWorkPackages.map((wp: any, index) => {
              const statusConfig = statusColors[wp.status] || statusColors['New'];
              const StatusIcon = statusConfig.icon;
              const createdDate = wp.created_at ? new Date(wp.created_at) : null;
              const updatedDate = wp.updated_at ? new Date(wp.updated_at) : null;
              const wpId = wp.id || wp.wp_id;

              return (
                <Grid item xs={12} sm={6} lg={4} key={wpId}>
                  <Zoom in timeout={200 + index * 50}>
                    <Card
                      elevation={2}
                      sx={{
                        height: '100%',
                        borderRadius: 3,
                        border: `1px solid ${alpha(statusConfig.color, 0.2)}`,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: `0 16px 48px ${alpha(statusConfig.color, 0.25)}`,
                          borderColor: statusConfig.color,
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 4,
                          background: `linear-gradient(90deg, ${statusConfig.color}, ${alpha(statusConfig.color, 0.6)})`,
                        },
                      }}
                    >
                      <CardActionArea onClick={() => wpId && navigate(`/workpackages/${wpId}`)}>
                        <CardContent sx={{ p: 3 }}>
                          {/* Header */}
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                            <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
                              <Chip
                                icon={<StatusIcon sx={{ fontSize: 14 }} />}
                                label={`WP-${wpId}`}
                                size="small"
                                sx={{
                                  fontWeight: 700,
                                  bgcolor: statusConfig.bg,
                                  color: statusConfig.color,
                                  border: `1px solid ${alpha(statusConfig.color, 0.3)}`,
                                }}
                              />
                              {wp.priority && (
                                <Chip
                                  label={wp.priority}
                                  size="small"
                                  color={getPriorityColor(wp.priority)}
                                  sx={{ fontWeight: 600 }}
                                />
                              )}
                            </Stack>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCardMenuAnchor({ el: e.currentTarget, id: wpId });
                              }}
                            >
                              <MoreVert fontSize="small" />
                            </IconButton>
                          </Stack>

                          {/* Title */}
                          <Typography
                            variant="subtitle1"
                            fontWeight={700}
                            mb={2}
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              minHeight: 48,
                              color: 'text.primary',
                              lineHeight: 1.4,
                            }}
                          >
                            {wp.subject}
                          </Typography>

                          {/* Status & Type */}
                          <Stack direction="row" spacing={1} mb={2} flexWrap="wrap" gap={0.5}>
                            <Chip
                              label={wp.status}
                              size="small"
                              sx={{
                                bgcolor: statusConfig.color,
                                color: '#fff',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                              }}
                            />
                            {wp.type && (
                              <Chip
                                icon={<Category sx={{ fontSize: 14 }} />}
                                label={wp.type}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.75rem' }}
                              />
                            )}
                          </Stack>

                          <Divider sx={{ my: 2 }} />

                          {/* Info Grid */}
                          <Stack spacing={1.5}>
                            {/* Assignee */}
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                              <Avatar
                                sx={{
                                  width: 32,
                                  height: 32,
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  color: 'primary.main',
                                  fontSize: '0.875rem',
                                  fontWeight: 700,
                                }}
                              >
                                {wp.assignee_name?.charAt(0)?.toUpperCase() || <PersonOutline />}
                              </Avatar>
                              <Box flex={1} minWidth={0}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  ผู้รับผิดชอบ
                                </Typography>
                                <Typography variant="body2" fontWeight={600} noWrap>
                                  {wp.assignee_name || 'ยังไม่ได้มอบหมาย'}
                                </Typography>
                              </Box>
                            </Stack>

                            {/* Time Info */}
                            <Stack direction="row" spacing={2}>
                              {createdDate && (
                                <Box flex={1}>
                                  <Stack direction="row" alignItems="center" spacing={0.5} mb={0.5}>
                                    <AccessTime sx={{ fontSize: 14, color: 'text.secondary' }} />
                                    <Typography variant="caption" color="text.secondary">
                                      สร้างเมื่อ
                                    </Typography>
                                  </Stack>
                                  <Typography variant="body2" fontWeight={500} fontSize="0.75rem">
                                    {formatDistanceToNow(createdDate, {
                                      addSuffix: true,
                                      locale: th,
                                    })}
                                  </Typography>
                                </Box>
                              )}
                              {updatedDate && (
                                <Box flex={1}>
                                  <Stack direction="row" alignItems="center" spacing={0.5} mb={0.5}>
                                    <Update sx={{ fontSize: 14, color: 'text.secondary' }} />
                                    <Typography variant="caption" color="text.secondary">
                                      อัพเดท
                                    </Typography>
                                  </Stack>
                                  <Typography variant="body2" fontWeight={500} fontSize="0.75rem">
                                    {format(updatedDate, 'dd/MM HH:mm')}
                                  </Typography>
                                </Box>
                              )}
                            </Stack>
                          </Stack>
                        </CardContent>
                      </CardActionArea>

                      {/* Quick Action Footer */}
                      <Divider />
                      <Box sx={{ px: 2, py: 1.5, bgcolor: alpha(statusConfig.color, 0.03) }}>
                        <Stack direction="row" spacing={1} justifyContent="space-between">
                          <Button
                            size="small"
                            startIcon={<Visibility />}
                            onClick={(e) => {
                              e.stopPropagation();
                              wpId && navigate(`/workpackages/${wpId}`);
                            }}
                            sx={{ textTransform: 'none', fontWeight: 600 }}
                          >
                            ดูรายละเอียด
                          </Button>
                          <Stack direction="row" spacing={0.5}>
                            <Tooltip title="แนบไฟล์">
                              <IconButton size="small">
                                <AttachFile fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="ความคิดเห็น">
                              <IconButton size="small">
                                <Comment fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </Stack>
                      </Box>
                    </Card>
                  </Zoom>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          // 📋 PROFESSIONAL TABLE VIEW
          <TableContainer
            component={Paper}
            elevation={3}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    background: theme.palette.mode === 'dark'
                      ? 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)'
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                >
                  <TableCell sx={{ color: '#fff', fontWeight: 700, py: 2 }}>
                    ID
                  </TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>
                    หัวข้อ
                  </TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700, minWidth: 140 }}>
                    สถานะ
                  </TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>
                    ความสำคัญ
                  </TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>
                    ประเภท
                  </TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700, minWidth: 180 }}>
                    ผู้รับผิดชอบ
                  </TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700, minWidth: 140 }}>
                    สร้างเมื่อ
                  </TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700, minWidth: 140 }}>
                    อัพเดทล่าสุด
                  </TableCell>
                  <TableCell align="center" sx={{ color: '#fff', fontWeight: 700 }}>
                    การกระทำ
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedWorkPackages.map((wp: any, index) => {
                  const statusConfig = statusColors[wp.status] || statusColors['New'];
                  const StatusIcon = statusConfig.icon;
                  const createdDate = wp.created_at ? new Date(wp.created_at) : null;
                  const updatedDate = wp.updated_at ? new Date(wp.updated_at) : null;
                  const wpId = wp.id || wp.wp_id;

                  return (
                    <TableRow
                      key={wpId}
                      hover
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: alpha(statusConfig.color, 0.05),
                          transform: 'scale(1.01)',
                        },
                        '&:nth-of-type(even)': {
                          bgcolor: alpha(theme.palette.action.hover, 0.3),
                        },
                      }}
                      onClick={() => wpId && navigate(`/workpackages/${wpId}`)}
                    >
                      <TableCell>
                        <Chip
                          icon={<StatusIcon sx={{ fontSize: 14 }} />}
                          label={wpId}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            bgcolor: statusConfig.bg,
                            color: statusConfig.color,
                            border: `1px solid ${alpha(statusConfig.color, 0.3)}`,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 300 }}>
                          {wp.subject}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={wp.status}
                          size="small"
                          sx={{
                            bgcolor: statusConfig.color,
                            color: '#fff',
                            fontWeight: 600,
                            minWidth: 120,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={wp.priority || 'Normal'}
                          size="small"
                          color={getPriorityColor(wp.priority)}
                          sx={{ fontWeight: 600, minWidth: 80 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={wp.type || '-'}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar
                            sx={{
                              width: 28,
                              height: 28,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: 'primary.main',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            }}
                          >
                            {wp.assignee_name?.charAt(0)?.toUpperCase() || '?'}
                          </Avatar>
                          <Typography variant="body2" noWrap fontWeight={500}>
                            {wp.assignee_name || 'ไม่ได้มอบหมาย'}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {createdDate && (
                          <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                            {format(createdDate, 'dd/MM/yyyy', { locale: th })}
                            <br />
                            <Typography component="span" variant="caption" color="text.disabled">
                              {format(createdDate, 'HH:mm')}
                            </Typography>
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {updatedDate && (
                          <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                            {formatDistanceToNow(updatedDate, {
                              addSuffix: true,
                              locale: th,
                            })}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="ดูรายละเอียด">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                wpId && navigate(`/workpackages/${wpId}`);
                              }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="แก้ไข">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Sort Menu */}
        <Menu
          anchorEl={sortAnchorEl}
          open={Boolean(sortAnchorEl)}
          onClose={() => setSortAnchorEl(null)}
          PaperProps={{
            sx: { minWidth: 250, borderRadius: 2 },
          }}
        >
          {[
            { value: 'created_desc', label: '📅 วันที่สร้าง (ใหม่สุด)' },
            { value: 'created_asc', label: '📅 วันที่สร้าง (เก่าสุด)' },
            { value: 'updated_desc', label: '🔄 อัพเดท (ล่าสุด)' },
            { value: 'updated_asc', label: '🔄 อัพเดท (เก่าสุด)' },
            { value: 'id_desc', label: '🔢 ID (มาก-น้อย)' },
            { value: 'id_asc', label: '🔢 ID (น้อย-มาก)' },
            { value: 'subject_asc', label: '🔤 ชื่อ (A-Z)' },
            { value: 'subject_desc', label: '🔤 ชื่อ (Z-A)' },
          ].map((option) => (
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
                  <Check color="primary" />
                </ListItemIcon>
              )}
            </MenuItem>
          ))}
        </Menu>

        {/* Card Action Menu */}
        <Menu
          anchorEl={cardMenuAnchor?.el}
          open={Boolean(cardMenuAnchor)}
          onClose={() => setCardMenuAnchor(null)}
          PaperProps={{
            sx: { minWidth: 200, borderRadius: 2 },
          }}
        >
          <MenuItem
            onClick={() => {
              cardMenuAnchor && navigate(`/workpackages/${cardMenuAnchor.id}`);
              setCardMenuAnchor(null);
            }}
          >
            <ListItemIcon>
              <Visibility fontSize="small" />
            </ListItemIcon>
            <ListItemText>ดูรายละเอียด</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => setCardMenuAnchor(null)}>
            <ListItemIcon>
              <Edit fontSize="small" />
            </ListItemIcon>
            <ListItemText>แก้ไข</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => setCardMenuAnchor(null)}>
            <ListItemIcon>
              <Share fontSize="small" />
            </ListItemIcon>
            <ListItemText>แชร์</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => setCardMenuAnchor(null)}>
            <ListItemIcon>
              <Timeline fontSize="small" />
            </ListItemIcon>
            <ListItemText>ประวัติการทำงาน</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => setCardMenuAnchor(null)} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <Delete fontSize="small" sx={{ color: 'error.main' }} />
            </ListItemIcon>
            <ListItemText>ลบ</ListItemText>
          </MenuItem>
        </Menu>

        {/* Pagination */}
        {filteredWorkPackages.length > 0 && totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
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
                  fontSize: '0.95rem',
                  minWidth: 40,
                  height: 40,
                },
              }}
            />
          </Box>
        )}

        {/* Empty State */}
        {filteredWorkPackages.length === 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 8,
              textAlign: 'center',
              borderRadius: 4,
              border: '2px dashed',
              borderColor: 'divider',
              bgcolor: alpha(theme.palette.background.paper, 0.5),
            }}
          >
            <Description sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h5" fontWeight={700} color="text.secondary" mb={1}>
              ไม่พบ Work Packages
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              {searchQuery || activeFiltersCount > 0
                ? 'ลองปรับเปลี่ยนเงื่อนไขการค้นหาหรือตัวกรอง'
                : 'ยังไม่มีงานในระบบ เริ่มต้นโดยการสร้างงานใหม่'}
            </Typography>
            {(searchQuery || activeFiltersCount > 0) && (
              <Button
                variant="outlined"
                startIcon={<Clear />}
                onClick={clearAllFilters}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
              >
                ล้างตัวกรอง
              </Button>
            )}
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default WorkPackagesListUltraModern;
