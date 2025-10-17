/**
 * Work Packages List - Complete Redesign
 * Modern, Professional, Beautiful UI with MUI + TailwindCSS
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
  AvatarGroup,
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
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';
import { wpApi } from '../../api/client';

const WorkPackagesListRedesigned: React.FC = () => {
  const theme = useTheme();
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
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
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

  const getPriorityColor = (priority: string): 'error' | 'warning' | 'success' => {
    if (priority === 'High') return 'error';
    if (priority === 'Low') return 'success';
    return 'warning';
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === 'High') return <PriorityHigh />;
    return <TrendingUp />;
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
        <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 4, mb: 4 }} />
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Grid item xs={12} sm={6} md={2.4} key={i}>
              <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 3, mb: 3 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} md={6} lg={4} key={i}>
              <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert
          severity="error"
          sx={{
            borderRadius: 3,
            boxShadow: `0 4px 20px ${alpha(theme.palette.error.main, 0.2)}`,
          }}
          action={
            <Button color="inherit" size="small" onClick={() => refetch()} startIcon={<Refresh />}>
              ลองอีกครั้ง
            </Button>
          }
        >
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            ไม่สามารถโหลดข้อมูล Work Packages ได้
          </Typography>
          <Typography variant="body2">
            กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตและลองใหม่อีกครั้ง
          </Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
        pb: 6,
      }}
    >
      {/* Modern Hero Header with Gradient & Animations */}
      <Paper
        elevation={0}
        sx={{
          background:
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #7B5BA4 0%, #5A3D7F 50%, #F17422 100%)'
              : 'linear-gradient(135deg, #7B5BA4 0%, #9575CD 50%, #F17422 100%)',
          color: 'white',
          pt: 8,
          pb: 12,
          mb: -6,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.15) 0%, transparent 50%)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '50%',
            height: '200%',
            background:
              'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            animation: 'float 8s ease-in-out infinite',
          },
          '@keyframes float': {
            '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
            '50%': { transform: 'translate(-20px, 20px) scale(1.1)' },
          },
        }}
      >
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          <Fade in timeout={800}>
            <Box>
              <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <Avatar
                  sx={{
                    width: 72,
                    height: 72,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                  }}
                >
                  <Assignment sx={{ fontSize: 40 }} />
                </Avatar>
                <Box>
                  <Typography
                    variant="h3"
                    fontWeight={800}
                    sx={{
                      letterSpacing: 0.5,
                      textShadow: '0 2px 20px rgba(0,0,0,0.3)',
                      mb: 0.5,
                    }}
                  >
                    Work Packages
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      opacity: 0.95,
                      fontWeight: 400,
                    }}
                  >
                    จัดการและติดตามงานทั้งหมดของคุณ
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={2} mt={4} flexWrap="wrap">
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Add />}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.25)',
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                    fontWeight: 700,
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    textTransform: 'none',
                    border: '1px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.35)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
                    },
                  }}
                >
                  สร้างงานใหม่
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Refresh />}
                  onClick={() => refetch()}
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.4)',
                    fontWeight: 600,
                    px: 3,
                    py: 1.5,
                    borderRadius: 3,
                    textTransform: 'none',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.15)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  รีเฟรช
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<FileDownload />}
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.4)',
                    fontWeight: 600,
                    px: 3,
                    py: 1.5,
                    borderRadius: 3,
                    textTransform: 'none',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.15)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  ส่งออกข้อมูล
                </Button>
              </Stack>
            </Box>
          </Fade>
        </Container>
      </Paper>

      <Container maxWidth="xl">
        {/* Modern Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          {[
            { key: 'total', label: 'งานทั้งหมด', value: stats.total, gradient: 'linear-gradient(135deg, #7B5BA4 0%, #9575CD 100%)', icon: Assignment, color: '#7B5BA4' },
            { key: 'new', label: 'งานใหม่', value: stats.new, gradient: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)', icon: FiberNew, color: '#2196F3', onClick: () => setStatusFilter('New') },
            { key: 'inProgress', label: 'กำลังดำเนินการ', value: stats.inProgress, gradient: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)', icon: PlayArrow, color: '#FF9800', onClick: () => setStatusFilter('กำลังดำเนินการ') },
            { key: 'completed', label: 'เสร็จแล้ว', value: stats.completed, gradient: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)', icon: CheckCircle, color: '#4CAF50', onClick: () => setStatusFilter('ดำเนินการเสร็จ') },
            { key: 'closed', label: 'ปิดแล้ว', value: stats.closed, gradient: 'linear-gradient(135deg, #607D8B 0%, #455A64 100%)', icon: Block, color: '#607D8B', onClick: () => setStatusFilter('ปิดงาน') },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Grid item xs={12} sm={6} md={2.4} key={stat.key}>
                <Zoom in timeout={400 + index * 100}>
                  <Card
                    elevation={4}
                    sx={{
                      borderRadius: 4,
                      background: stat.gradient,
                      color: 'white',
                      overflow: 'hidden',
                      position: 'relative',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: stat.onClick ? 'pointer' : 'default',
                      '&:hover': {
                        transform: 'translateY(-12px) scale(1.02)',
                        boxShadow: `0 20px 40px ${alpha(stat.color, 0.4)}`,
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '100%',
                        height: '100%',
                        background:
                          'radial-gradient(circle at top right, rgba(255,255,255,0.2), transparent)',
                      },
                    }}
                    onClick={stat.onClick}
                  >
                    <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                        <Avatar
                          sx={{
                            bgcolor: 'rgba(255,255,255,0.25)',
                            width: 56,
                            height: 56,
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                          }}
                        >
                          <Icon sx={{ fontSize: 30 }} />
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="h3" fontWeight={800} sx={{ lineHeight: 1 }}>
                            {stat.value}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ opacity: 0.9, fontWeight: 500, mt: 0.5 }}
                          >
                            {stat.label}
                          </Typography>
                        </Box>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={
                          stats.total && stat.key !== 'total'
                            ? (stat.value / stats.total) * 100
                            : 100
                        }
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: 'rgba(255,255,255,0.2)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: 'rgba(255,255,255,0.6)',
                          },
                        }}
                      />
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            );
          })}
        </Grid>

        {/* Enhanced Search & Filter Bar */}
        <Paper
          elevation={6}
          sx={{
            p: 3,
            borderRadius: 4,
            mb: 4,
            background:
              theme.palette.mode === 'dark'
                ? alpha(theme.palette.background.paper, 0.8)
                : 'white',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            boxShadow:
              theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(0,0,0,0.4)'
                : '0 8px 32px rgba(123, 91, 164, 0.12)',
          }}
        >
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
                    <Search sx={{ color: 'primary.main' }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSearchQuery('');
                        setPage(1);
                      }}
                    >
                      <Clear />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor:
                    theme.palette.mode === 'dark'
                      ? alpha('#fff', 0.05)
                      : alpha('#7B5BA4', 0.03),
                  transition: 'all 0.3s',
                  '&:hover': {
                    bgcolor:
                      theme.palette.mode === 'dark'
                        ? alpha('#fff', 0.08)
                        : alpha('#7B5BA4', 0.06),
                  },
                  '&.Mui-focused': {
                    bgcolor:
                      theme.palette.mode === 'dark'
                        ? alpha('#fff', 0.1)
                        : alpha('#7B5BA4', 0.08),
                    boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
                  },
                },
              }}
            />

            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newView) => newView && setViewMode(newView)}
              size="large"
              sx={{
                height: 56,
                bgcolor:
                  theme.palette.mode === 'dark'
                    ? alpha('#fff', 0.05)
                    : alpha('#7B5BA4', 0.03),
                borderRadius: 3,
                '& .MuiToggleButton-root': {
                  border: 'none',
                  borderRadius: '12px !important',
                  px: 3,
                  mx: 0.5,
                  transition: 'all 0.3s',
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  },
                },
              }}
            >
              <ToggleButton value="card">
                <Tooltip title="มุมมองการ์ด" arrow>
                  <ViewModule />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="table">
                <Tooltip title="มุมมองตาราง" arrow>
                  <ViewList />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>

            <Badge
              badgeContent={
                (statusFilter !== 'all' ? 1 : 0) +
                (priorityFilter !== 'all' ? 1 : 0) +
                (typeFilter !== 'all' ? 1 : 0)
              }
              color="error"
              sx={{
                '& .MuiBadge-badge': {
                  right: 8,
                  top: 8,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                },
              }}
            >
              <Button
                variant={
                  statusFilter !== 'all' ||
                  priorityFilter !== 'all' ||
                  typeFilter !== 'all'
                    ? 'contained'
                    : 'outlined'
                }
                size="large"
                startIcon={<FilterList />}
                onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                sx={{
                  minWidth: 150,
                  height: 56,
                  borderRadius: 3,
                  px: 3,
                  fontWeight: 600,
                  textTransform: 'none',
                  transition: 'all 0.3s',
                  ...(statusFilter === 'all' &&
                    priorityFilter === 'all' &&
                    typeFilter === 'all' && {
                      borderColor: alpha(theme.palette.divider, 0.3),
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        transform: 'translateY(-2px)',
                        boxShadow: `0 6px 16px ${alpha(
                          theme.palette.primary.main,
                          0.2
                        )}`,
                      },
                    }),
                }}
              >
                ตัวกรอง
              </Button>
            </Badge>

            <Button
              variant="outlined"
              size="large"
              startIcon={<Sort />}
              onClick={(e) => setSortAnchorEl(e.currentTarget)}
              sx={{
                minWidth: 150,
                height: 56,
                borderRadius: 3,
                px: 3,
                fontWeight: 600,
                textTransform: 'none',
                borderColor: alpha(theme.palette.divider, 0.3),
                transition: 'all 0.3s',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  transform: 'translateY(-2px)',
                  boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.2)}`,
                },
              }}
            >
              เรียงลำดับ
            </Button>

            {(searchQuery ||
              statusFilter !== 'all' ||
              priorityFilter !== 'all' ||
              typeFilter !== 'all') && (
              <Fade in>
                <Button
                  variant="text"
                  size="large"
                  color="error"
                  startIcon={<Clear />}
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setPriorityFilter('all');
                    setTypeFilter('all');
                    setPage(1);
                  }}
                  sx={{
                    minWidth: 140,
                    height: 56,
                    borderRadius: 3,
                    px: 3,
                    fontWeight: 600,
                    textTransform: 'none',
                    transition: 'all 0.3s',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.error.main, 0.1),
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  ล้างตัวกรอง
                </Button>
              </Fade>
            )}
          </Stack>

          {/* Filter Menu */}
          <Menu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={() => setFilterAnchorEl(null)}
            PaperProps={{
              sx: { minWidth: 300, p: 2, borderRadius: 3 },
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
              sx: { minWidth: 250, borderRadius: 3 },
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
        <Box
          sx={{
            mb: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            แสดง <Box component="span" fontWeight={700} color="primary.main">{paginatedWorkPackages.length}</Box> จาก{' '}
            <Box component="span" fontWeight={700} color="primary.main">{filteredWorkPackages.length}</Box> รายการ
            {filteredWorkPackages.length !== workPackages.length &&
              ` (กรองจาก ${workPackages.length} รายการทั้งหมด)`}
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            หน้า <Box component="span" fontWeight={700} color="primary.main">{page}</Box> /{' '}
            <Box component="span" fontWeight={700} color="primary.main">{totalPages || 1}</Box>
          </Typography>
        </Box>

        {/* Work Packages List - Card or Table View */}
        {viewMode === 'card' ? (
          <Grid container spacing={3}>
            {paginatedWorkPackages.map((wp: any) => {
              const statusConfig = statusColors[wp.status] || statusColors['New'];
              const StatusIcon = statusConfig.icon;
              const createdDate = wp.created_at ? new Date(wp.created_at) : null;
              const updatedDate = wp.updated_at ? new Date(wp.updated_at) : null;
              const wpId = wp.id || wp.wp_id;

              return (
                <Grid item xs={12} md={6} lg={4} key={wpId}>
                  <Fade in timeout={300}>
                    <Card
                      elevation={3}
                      sx={{
                        borderRadius: 4,
                        border: '1px solid',
                        borderColor: alpha(statusConfig.color, 0.2),
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'pointer',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          borderColor: statusConfig.color,
                          boxShadow: `0 12px 40px ${alpha(statusConfig.color, 0.25)}`,
                          transform: 'translateY(-8px) scale(1.01)',
                          '& .card-actions': {
                            opacity: 1,
                            transform: 'translateY(0)',
                          },
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 4,
                          background: statusConfig.color,
                        },
                      }}
                      onClick={() => wpId && navigate(`/workpackages/${wpId}`)}
                    >
                      <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {/* Header with ID & Menu */}
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip
                              icon={<StatusIcon sx={{ fontSize: 16 }} />}
                              label={`#${wpId}`}
                              size="small"
                              sx={{
                                bgcolor: statusConfig.bg,
                                color: statusConfig.color,
                                fontWeight: 700,
                                border: `1px solid ${alpha(statusConfig.color, 0.3)}`,
                              }}
                            />
                            {wp.priority && (
                              <Chip
                                icon={getPriorityIcon(wp.priority)}
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
                            sx={{
                              transition: 'all 0.3s',
                              '&:hover': {
                                bgcolor: alpha(statusConfig.color, 0.1),
                                transform: 'rotate(90deg)',
                              },
                            }}
                          >
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
                            minHeight: 56,
                            color: 'text.primary',
                          }}
                        >
                          {wp.subject}
                        </Typography>

                        {/* Status & Type */}
                        <Stack direction="row" spacing={1} mb={3} flexWrap="wrap" gap={1}>
                          <Chip
                            label={wp.status}
                            size="small"
                            sx={{
                              bgcolor: statusConfig.color,
                              color: 'white',
                              fontWeight: 600,
                              boxShadow: `0 2px 8px ${alpha(statusConfig.color, 0.3)}`,
                            }}
                          />
                          {wp.type && (
                            <Chip
                              icon={<Category sx={{ fontSize: 16 }} />}
                              label={wp.type}
                              size="small"
                              variant="outlined"
                              sx={{
                                borderColor: alpha(theme.palette.text.primary, 0.3),
                                fontWeight: 600,
                              }}
                            />
                          )}
                        </Stack>

                        <Divider sx={{ my: 2 }} />

                        {/* Meta Info */}
                        <Stack spacing={1.5} flex={1}>
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Avatar
                              sx={{
                                width: 28,
                                height: 28,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: 'primary.main',
                                fontSize: '0.75rem',
                              }}
                            >
                              {wp.assignee_name?.charAt(0) || <PersonOutline />}
                            </Avatar>
                            <Box flex={1}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                ผู้รับผิดชอบ
                              </Typography>
                              <Typography variant="body2" fontWeight={600} noWrap>
                                {wp.assignee_name || 'ยังไม่ได้มอบหมาย'}
                              </Typography>
                            </Box>
                          </Stack>

                          {createdDate && (
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                              <AccessTime sx={{ fontSize: 20, color: 'text.secondary' }} />
                              <Box flex={1}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  สร้างเมื่อ
                                </Typography>
                                <Typography variant="body2" fontWeight={500}>
                                  {formatDistanceToNow(createdDate, {
                                    addSuffix: true,
                                    locale: th,
                                  })}
                                </Typography>
                              </Box>
                            </Stack>
                          )}

                          {updatedDate && (
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                              <Schedule sx={{ fontSize: 20, color: 'text.secondary' }} />
                              <Box flex={1}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  อัพเดทล่าสุด
                                </Typography>
                                <Typography variant="body2" fontWeight={500}>
                                  {format(updatedDate, 'dd/MM/yyyy HH:mm', { locale: th })}
                                </Typography>
                              </Box>
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
                            borderRadius: 2.5,
                            textTransform: 'none',
                            fontWeight: 600,
                            py: 1.2,
                            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                            transition: 'all 0.3s',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                            },
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            wpId && navigate(`/workpackages/${wpId}`);
                          }}
                        >
                          ดูรายละเอียด
                        </Button>
                      </CardContent>
                    </Card>
                  </Fade>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          // Table View
          <TableContainer
            component={Paper}
            elevation={6}
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(0,0,0,0.4)'
                : '0 8px 32px rgba(123, 91, 164, 0.12)',
            }}
          >
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    bgcolor: 'primary.main',
                    '& th': {
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      py: 2.5,
                    },
                  }}
                >
                  <TableCell>หมายเลข</TableCell>
                  <TableCell>หัวข้อ</TableCell>
                  <TableCell>สถานะ</TableCell>
                  <TableCell>ความสำคัญ</TableCell>
                  <TableCell>ประเภท</TableCell>
                  <TableCell>ผู้รับผิดชอบ</TableCell>
                  <TableCell>สร้างเมื่อ</TableCell>
                  <TableCell align="center">การกระทำ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedWorkPackages.map((wp: any) => {
                  const statusConfig = statusColors[wp.status] || statusColors['New'];
                  const StatusIcon = statusConfig.icon;
                  const createdDate = wp.created_at ? new Date(wp.created_at) : null;
                  const wpId = wp.id || wp.wp_id;

                  return (
                    <TableRow
                      key={wpId}
                      hover
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        '&:hover': {
                          bgcolor: alpha(statusConfig.color, 0.05),
                          transform: 'scale(1.01)',
                        },
                      }}
                      onClick={() => wpId && navigate(`/workpackages/${wpId}`)}
                    >
                      <TableCell>
                        <Chip
                          icon={<StatusIcon sx={{ fontSize: 16 }} />}
                          label={`#${wpId}`}
                          size="small"
                          sx={{
                            bgcolor: statusConfig.bg,
                            color: statusConfig.color,
                            fontWeight: 700,
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
                            color: 'white',
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getPriorityIcon(wp.priority)}
                          label={wp.priority || 'Normal'}
                          size="small"
                          color={getPriorityColor(wp.priority)}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip label={wp.type || '-'} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar
                            sx={{
                              width: 24,
                              height: 24,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: 'primary.main',
                              fontSize: '0.7rem',
                            }}
                          >
                            {wp.assignee_name?.charAt(0) || '?'}
                          </Avatar>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {wp.assignee_name || 'ไม่ได้มอบหมาย'}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {createdDate && (
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {format(createdDate, 'dd/MM/yyyy HH:mm', { locale: th })}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="ดูรายละเอียด" arrow>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              wpId && navigate(`/workpackages/${wpId}`);
                            }}
                            sx={{
                              transition: 'all 0.3s',
                              '&:hover': {
                                transform: 'scale(1.2)',
                              },
                            }}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Card Action Menu */}
        <Menu
          anchorEl={cardMenuAnchor?.el}
          open={Boolean(cardMenuAnchor)}
          onClose={() => setCardMenuAnchor(null)}
          PaperProps={{
            sx: { minWidth: 200, borderRadius: 3 },
          }}
        >
          <MenuItem
            onClick={() => {
              cardMenuAnchor && navigate(`/workpackages/${cardMenuAnchor.id}`);
              setCardMenuAnchor(null);
            }}
          >
            <ListItemIcon>
              <Visibility />
            </ListItemIcon>
            <ListItemText>ดูรายละเอียด</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => setCardMenuAnchor(null)}>
            <ListItemIcon>
              <Edit />
            </ListItemIcon>
            <ListItemText>แก้ไข</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => setCardMenuAnchor(null)}>
            <ListItemIcon>
              <Share />
            </ListItemIcon>
            <ListItemText>แชร์</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => setCardMenuAnchor(null)} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <Delete sx={{ color: 'error.main' }} />
            </ListItemIcon>
            <ListItemText>ลบ</ListItemText>
          </MenuItem>
        </Menu>

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
                  borderRadius: 2.5,
                  fontWeight: 600,
                  fontSize: '1rem',
                  minWidth: 44,
                  height: 44,
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                  },
                  '&.Mui-selected': {
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
                  },
                },
              }}
            />
          </Box>
        )}

        {/* Empty State */}
        {filteredWorkPackages.length === 0 && (
          <Fade in>
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
                ลองปรับเปลี่ยนเงื่อนไขการค้นหาหรือตัวกรอง
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Clear />}
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setPriorityFilter('all');
                  setTypeFilter('all');
                  setPage(1);
                }}
                sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 600 }}
              >
                ล้างตัวกรอง
              </Button>
            </Paper>
          </Fade>
        )}
      </Container>
    </Box>
  );
};

export default WorkPackagesListRedesigned;
