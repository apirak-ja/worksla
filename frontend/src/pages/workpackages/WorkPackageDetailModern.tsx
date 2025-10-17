import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  Stack,
  Paper,
  Divider,
  Skeleton,
  Alert,
  List,
  ListItem,
  alpha,
  useTheme,
  Tabs,
  Tab,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
  IconButton,
  CardHeader,
  ListItemIcon,
  ListItemText,
  LinearProgress,
} from '@mui/material';
import {
  ArrowBack,
  Timeline,
  Info,
  Person,
  Schedule,
  Category,
  Flag,
  Comment,
  Update,
  Place,
  DateRange,
  EventNote,
  Phone,
  Business,
  CheckCircle,
  FiberManualRecord,
  PlayCircleOutline,
  CheckCircleOutline,
  ErrorOutline,
  AccessTime,
  TrendingUp,
  Edit,
  Share,
  MoreVert,
  Visibility,
  BookmarkBorder,
  Speed,
  Assignment,
  PriorityHigh,
  Description,
  AccountCircle,
  LocationOn,
  Work,
  CalendarMonth,
  ContactPhone,
  Build,
  Warning,
  CheckCircleRounded,
  HourglassTop,
  Pending,
  TaskAlt,
  AutoAwesome,
  Analytics,
  Groups,
  Architecture,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { wpApi } from '../../api/client';
import DOMPurify from 'dompurify';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const WorkPackageDetailModern: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  const wpId = parseInt(id || '0');

  const { data: wpDetail, isLoading, error } = useQuery({
    queryKey: ['workpackage', wpId],
    queryFn: () => wpApi.get(wpId).then((res) => res.data),
    enabled: !!wpId,
  });

  const fetchAllActivities = React.useCallback(async () => {
    if (!wpId) {
      return {
        wp_id: wpId,
        journals: [],
        total: 0,
        offset: 0,
        page_size: 0,
        has_more: false,
      }
    }

    const PAGE_SIZE = 50
    const MAX_ITERATIONS = 20

    let offset = 0
    let allActivities: any[] = []
    let hasMore = true
    let iterations = 0
    let latestMeta: Record<string, any> | null = null

    while (hasMore && iterations < MAX_ITERATIONS) {
      const response = await wpApi.getJournals(wpId, { offset, page_size: PAGE_SIZE })
      const data = response?.data ?? {}
      const pageActivities = Array.isArray(data.journals) ? data.journals : []

      allActivities = allActivities.concat(pageActivities)
      hasMore = Boolean(data.has_more)
      offset += PAGE_SIZE
      iterations += 1
      latestMeta = data

      if (!hasMore) {
        break
      }
    }

    return {
      ...(latestMeta ?? {}),
      wp_id: latestMeta?.wp_id ?? wpId,
      journals: allActivities,
      total: allActivities.length,
      offset: 0,
      page_size: PAGE_SIZE,
      has_more: hasMore,
    }
  }, [wpId])

  const { data: journals } = useQuery({
    queryKey: ['workpackage-journals', wpId],
    queryFn: fetchAllActivities,
    enabled: !!wpId,
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const calculateDuration = (date1: string, date2: string): string => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffMs = Math.abs(d1.getTime() - d2.getTime());
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} วัน`;
    if (diffHours > 0) return `${diffHours} ชม.`;
    return `${diffMins} นาที`;
  };

  if (isLoading) {
    return (
      <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Stack spacing={4}>
            <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 4 }} />
            <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 3 }} />
            <Grid container spacing={4}>
              <Grid item xs={12} lg={8}>
                <Skeleton variant="rectangular" height={500} sx={{ borderRadius: 3 }} />
              </Grid>
              <Grid item xs={12} lg={4}>
                <Stack spacing={3}>
                  {[200, 180, 160, 140].map((height, i) => (
                    <Skeleton key={i} variant="rectangular" height={height} sx={{ borderRadius: 3 }} />
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </Stack>
        </Container>
      </Box>
    );
  }

  if (error || !wpDetail) {
    return (
      <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>
        <Container maxWidth="xl" sx={{ py: 6 }}>
          <Alert 
            severity="error" 
            icon={<ErrorOutline fontSize="large" />}
            sx={{ 
              borderRadius: 4,
              p: 4,
              fontSize: '1.1rem',
              boxShadow: theme.shadows[4]
            }}
          >
            <Typography variant="h6" fontWeight={700} mb={1}>
              ไม่สามารถโหลดข้อมูลได้
            </Typography>
            <Typography>
              Work Package ID: {wpId} ไม่พบในระบบ หรือเกิดข้อผิดพลาดในการเชื่อมต่อ
            </Typography>
          </Alert>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/workpackages')}
            variant="contained"
            size="large"
            sx={{ mt: 4, borderRadius: 3, px: 4, py: 1.5 }}
          >
            กลับไปยังรายการงาน
          </Button>
        </Container>
      </Box>
    );
  }

  const wp: any = wpDetail;
  const activities = journals?.journals || [];

  // Enhanced Status Configuration
  const statusConfig: Record<string, { 
    color: string; 
    icon: any;
    label: string;
    bgColor: string;
    progress: number;
  }> = {
    'New': { 
      color: '#1976d2',
      icon: <FiberManualRecord />,
      label: 'งานใหม่',
      bgColor: '#e3f2fd',
      progress: 10
    },
    'รับเรื่อง': { 
      color: '#0288d1',
      icon: <CheckCircleRounded />,
      label: 'รับเรื่องแล้ว',
      bgColor: '#e1f5fe',
      progress: 25
    },
    'กำลังดำเนินการ': { 
      color: '#ed6c02',
      icon: <HourglassTop />,
      label: 'กำลังดำเนินการ',
      bgColor: '#fff3e0',
      progress: 60
    },
    'ดำเนินการเสร็จ': { 
      color: '#2e7d32',
      icon: <TaskAlt />,
      label: 'เสร็จสิ้น',
      bgColor: '#e8f5e8',
      progress: 90
    },
    'ปิดงาน': { 
      color: '#424242',
      icon: <CheckCircle />,
      label: 'ปิดงาน',
      bgColor: '#f5f5f5',
      progress: 100
    },
  };

  const currentStatus = statusConfig[wp.status] || statusConfig['New'];

  const getPriorityColor = (priority: string): 'error' | 'warning' | 'success' => {
    if (!priority) return 'success';
    const p = priority.toLowerCase();
    if (p.includes('high') || p.includes('สูง')) return 'error';
    if (p.includes('low') || p.includes('ต่ำ')) return 'success';
    return 'warning';
  };

  // Extract status changes from activities
  const statusChanges = activities
    .filter((a: any) => a.details?.some((d: any) => d.property === 'Status'))
    .map((a: any) => {
      const statusDetail = a.details.find((d: any) => d.property === 'Status');
      return {
        from: statusDetail.old_value,
        to: statusDetail.new_value,
        date: a.created_at,
        user: a.user_name,
      };
    });

  const totalComments = activities.filter((a: any) => a.notes && a.notes.trim().length > 0).length;
  const totalChanges = activities.reduce((sum: number, a: any) => sum + (a.details?.length || 0), 0);
  const daysSinceCreated = wp.created_at ? Math.ceil((new Date().getTime() - new Date(wp.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Clean Top Navigation */}
      <Box 
        sx={{ 
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          borderBottom: `1px solid ${alpha('#000', 0.08)}`,
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          backdropFilter: 'blur(20px)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <Container maxWidth="xl">
          <Stack 
            direction="row" 
            alignItems="center" 
            justifyContent="space-between"
            sx={{ py: 2 }}
          >
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/workpackages')}
              variant="text"
              sx={{ 
                color: 'text.secondary',
                fontWeight: 600,
                px: 2,
                '&:hover': { 
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  color: 'primary.main'
                }
              }}
            >
              กลับ
            </Button>

            <Stack direction="row" spacing={1}>
              {[
                { icon: <Visibility />, tooltip: 'ดูรายละเอียด' },
                { icon: <Edit />, tooltip: 'แก้ไข' },
                { icon: <Share />, tooltip: 'แชร์' },
                { icon: <BookmarkBorder />, tooltip: 'บุ๊คมาร์ค' },
                { icon: <MoreVert />, tooltip: 'เพิ่มเติม' },
              ].map((item, index) => (
                <Tooltip key={index} title={item.tooltip}>
                  <IconButton 
                    size="small" 
                    sx={{ 
                      color: 'text.secondary',
                      '&:hover': { 
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        color: 'primary.main'
                      }
                    }}
                  >
                    {item.icon}
                  </IconButton>
                </Tooltip>
              ))}
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Clean Professional Hero Section */}
        <Card 
          elevation={0}
          sx={{ 
            mb: 4,
            borderRadius: 4,
            overflow: 'hidden',
            border: `1px solid ${alpha('#000', 0.08)}`,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          }}
        >
          {/* Status Header Bar */}
          <Box
            sx={{
              bgcolor: currentStatus.color,
              color: 'white',
              px: 4,
              py: 2,
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 4,
                background: `linear-gradient(90deg, ${currentStatus.color}, ${alpha(currentStatus.color, 0.6)})`,
              }
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={2}>
                {currentStatus.icon}
                <Typography variant="h6" fontWeight={700}>
                  {currentStatus.label}
                </Typography>
                <Chip
                  label={`${currentStatus.progress}% เสร็จสิ้น`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
              </Stack>
              <Chip
                label={`#${wp.id || wp.wp_id}`}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                }}
              />
            </Stack>
          </Box>

          {/* Main Content */}
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={4} alignItems="center">
              {/* Left: Title & Meta */}
              <Grid item xs={12} lg={8}>
                <Stack spacing={3}>
                  <Typography 
                    variant="h3" 
                    fontWeight={800}
                    sx={{ 
                      fontSize: { xs: '1.75rem', md: '2.25rem' },
                      lineHeight: 1.2,
                      color: 'text.primary',
                    }}
                  >
                    {wp.subject}
                  </Typography>
                  
                  <Stack direction="row" spacing={4} flexWrap="wrap">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <AccountCircle fontSize="small" color="action" />
                      <Typography variant="body1" fontWeight={600} color="text.secondary">
                        {wp.assignee_name || 'ยังไม่ได้มอบหมาย'}
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CalendarMonth fontSize="small" color="action" />
                      <Typography variant="body1" color="text.secondary">
                        อัปเดต {wp.updated_at ? format(new Date(wp.updated_at), 'dd MMM yyyy', { locale: th }) : '-'}
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Category fontSize="small" color="action" />
                      <Typography variant="body1" color="text.secondary">
                        {wp.type || 'ไม่ระบุประเภท'}
                      </Typography>
                    </Stack>
                  </Stack>

                  {/* Priority & Progress */}
                  <Stack direction="row" alignItems="center" spacing={3}>
                    <Chip
                      icon={<Flag />}
                      label={wp.priority || 'Normal'}
                      color={getPriorityColor(wp.priority)}
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                    <Box sx={{ flexGrow: 1, maxWidth: 300 }}>
                      <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                        <Typography variant="caption" fontWeight={600} color="text.secondary">
                          ความคืบหน้า
                        </Typography>
                        <Typography variant="caption" fontWeight={700} color="primary.main">
                          {currentStatus.progress}%
                        </Typography>
                      </Stack>
                      <LinearProgress 
                        variant="determinate" 
                        value={currentStatus.progress} 
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          bgcolor: alpha(currentStatus.color, 0.1),
                          '& .MuiLinearProgress-bar': {
                            bgcolor: currentStatus.color,
                            borderRadius: 3,
                          }
                        }} 
                      />
                    </Box>
                  </Stack>
                </Stack>
              </Grid>
              
              {/* Right: Stats Grid */}
              <Grid item xs={12} lg={4}>
                <Grid container spacing={2}>
                  {[
                    { 
                      icon: <Timeline color="primary" />, 
                      value: activities.length, 
                      label: 'กิจกรรม',
                      color: theme.palette.primary.main 
                    },
                    { 
                      icon: <Comment color="warning" />, 
                      value: totalComments, 
                      label: 'ความคิดเห็น',
                      color: theme.palette.warning.main 
                    },
                    { 
                      icon: <Update color="success" />, 
                      value: totalChanges, 
                      label: 'การเปลี่ยนแปลง',
                      color: theme.palette.success.main 
                    },
                    { 
                      icon: <Schedule color="info" />, 
                      value: daysSinceCreated, 
                      label: 'วันที่ผ่านมา',
                      color: theme.palette.info.main 
                    },
                  ].map((stat, index) => (
                    <Grid item xs={6} key={index}>
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 2.5,
                          textAlign: 'center',
                          borderRadius: 3,
                          border: `2px solid ${alpha(stat.color, 0.1)}`,
                          bgcolor: alpha(stat.color, 0.02),
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            borderColor: alpha(stat.color, 0.3),
                            bgcolor: alpha(stat.color, 0.05),
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 25px ${alpha(stat.color, 0.15)}`,
                          }
                        }}
                      >
                        <Avatar
                          sx={{ 
                            bgcolor: alpha(stat.color, 0.1), 
                            color: stat.color,
                            width: 40, 
                            height: 40,
                            mx: 'auto',
                            mb: 1
                          }}
                        >
                          {stat.icon}
                        </Avatar>
                        <Typography variant="h4" fontWeight={900} color={stat.color}>
                          {stat.value}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          {stat.label}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Status Timeline - Enhanced Design */}
        {statusChanges.length > 0 && (
          <Card 
            elevation={0}
            sx={{ 
              mb: 4, 
              borderRadius: 4,
              border: `1px solid ${alpha('#000', 0.08)}`,
              overflow: 'hidden'
            }}
          >
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <Analytics />
                </Avatar>
              }
              title={
                <Typography variant="h6" fontWeight={700}>
                  ประวัติการเปลี่ยนสถานะ
                </Typography>
              }
              subheader={`${statusChanges.length} ครั้งการเปลี่ยนแปลง`}
              action={
                <Chip
                  icon={<TrendingUp />}
                  label="วิเคราะห์"
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              }
              sx={{ pb: 1 }}
            />
            <CardContent sx={{ pt: 0 }}>
              <Stack direction="row" spacing={3} sx={{ overflowX: 'auto', pb: 2 }}>
                {statusChanges.map((change: any, index: number) => (
                  <Paper
                    key={index}
                    elevation={0}
                    sx={{
                      p: 3,
                      minWidth: 260,
                      borderRadius: 3,
                      border: `2px solid ${alpha(statusConfig[change.to]?.color || '#ddd', 0.2)}`,
                      bgcolor: alpha(statusConfig[change.to]?.color || '#ddd', 0.02),
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        bgcolor: statusConfig[change.to]?.color || '#ddd',
                        borderRadius: '12px 12px 0 0',
                      }
                    }}
                  >
                    <Stack spacing={2}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar
                          sx={{ 
                            bgcolor: alpha(statusConfig[change.to]?.color || '#ddd', 0.1),
                            color: statusConfig[change.to]?.color || '#ddd',
                            width: 32,
                            height: 32
                          }}
                        >
                          {statusConfig[change.to]?.icon || <FiberManualRecord />}
                        </Avatar>
                        <Typography variant="body2" fontWeight={700} color="text.secondary">
                          {change.from || 'เริ่มต้น'} → {change.to}
                        </Typography>
                      </Stack>
                      
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <AccountCircle fontSize="small" color="action" />
                        <Typography variant="subtitle2" fontWeight={800}>
                          {change.user}
                        </Typography>
                      </Stack>
                      
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CalendarMonth fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(change.date), 'dd MMM yyyy, HH:mm', { locale: th })}
                        </Typography>
                      </Stack>
                      
                      {index > 0 && (
                        <Chip
                          icon={<AccessTime fontSize="small" />}
                          label={calculateDuration(change.date, statusChanges[index - 1].date)}
                          size="small"
                          sx={{ 
                            height: 28,
                            bgcolor: alpha(theme.palette.success.main, 0.1),
                            color: 'success.main',
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Main Content Grid */}
        <Grid container spacing={4}>
          {/* Left Column - Tabbed Content */}
          <Grid item xs={12} lg={8}>
            <Card 
              elevation={0} 
              sx={{ 
                borderRadius: 4, 
                border: `1px solid ${alpha('#000', 0.08)}`,
                overflow: 'hidden',
              }}
            >
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                sx={{ 
                  borderBottom: `1px solid ${alpha('#000', 0.08)}`,
                  px: 2,
                  '& .MuiTab-root': {
                    minHeight: 64,
                    fontWeight: 700,
                    fontSize: '1rem',
                    textTransform: 'none',
                    px: 3,
                  },
                }}
              >
                <Tab 
                  icon={<Description />} 
                  label="รายละเอียดงาน" 
                  iconPosition="start"
                />
                <Tab 
                  icon={
                    <Badge badgeContent={activities.length} color="error" max={99}>
                      <Timeline />
                    </Badge>
                  } 
                  label="ประวัติกิจกรรม" 
                  iconPosition="start"
                />
              </Tabs>

              {/* Tab 1: Enhanced Details */}
              <TabPanel value={tabValue} index={0}>
                <Box sx={{ p: 4 }}>
                  <Grid container spacing={4}>
                    {/* Description Section */}
                    {wp.description && (
                      <Grid item xs={12}>
                        <Card 
                          elevation={0}
                          sx={{ 
                            borderRadius: 3,
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                            bgcolor: alpha(theme.palette.primary.main, 0.02)
                          }}
                        >
                          <CardHeader
                            avatar={
                              <Avatar sx={{ bgcolor: 'primary.main' }}>
                                <Description />
                              </Avatar>
                            }
                            title="รายละเอียดงาน"
                            titleTypographyProps={{ fontWeight: 700, variant: 'h6' }}
                          />
                          <CardContent sx={{ pt: 0 }}>
                            <Paper 
                              elevation={0}
                              sx={{ 
                                p: 3, 
                                bgcolor: '#fff',
                                borderRadius: 2,
                                border: `1px solid ${alpha('#000', 0.06)}`,
                              }}
                            >
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: DOMPurify.sanitize(wp.description || ''),
                                }}
                                style={{
                                  lineHeight: 1.8,
                                  color: '#333',
                                  fontSize: '1rem',
                                }}
                              />
                            </Paper>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}

                    {/* Work Information - Categorized */}
                    <Grid item xs={12}>
                      <Card 
                        elevation={0}
                        sx={{ 
                          borderRadius: 3,
                          border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                          bgcolor: alpha(theme.palette.info.main, 0.02)
                        }}
                      >
                        <CardHeader
                          avatar={
                            <Avatar sx={{ bgcolor: 'info.main' }}>
                              <Info />
                            </Avatar>
                          }
                          title="ข้อมูลงานทั่วไป"
                          titleTypographyProps={{ fontWeight: 700, variant: 'h6' }}
                        />
                        <CardContent sx={{ pt: 0 }}>
                          <Grid container spacing={3}>
                            {/* Basic Info */}
                            <Grid item xs={12} md={6}>
                              <Paper 
                                elevation={0} 
                                sx={{ 
                                  p: 3, 
                                  borderRadius: 3,
                                  border: `1px solid ${alpha('#000', 0.06)}`,
                                  height: '100%'
                                }}
                              >
                                <Typography variant="subtitle1" fontWeight={700} mb={2} color="text.primary">
                                  📋 ข้อมูลพื้นฐาน
                                </Typography>
                                <Stack spacing={2}>
                                  <Stack direction="row" alignItems="center" spacing={2}>
                                    <Category fontSize="small" color="action" />
                                    <Box>
                                      <Typography variant="caption" color="text.secondary">หมวดหมู่</Typography>
                                      <Typography variant="body2" fontWeight={600}>
                                        {wp.category || 'ไม่ระบุ'}
                                      </Typography>
                                    </Box>
                                  </Stack>
                                  <Stack direction="row" alignItems="center" spacing={2}>
                                    <Business fontSize="small" color="action" />
                                    <Box>
                                      <Typography variant="caption" color="text.secondary">โครงการ</Typography>
                                      <Typography variant="body2" fontWeight={600}>
                                        {wp.project_name || '-'}
                                      </Typography>
                                    </Box>
                                  </Stack>
                                  <Stack direction="row" alignItems="center" spacing={2}>
                                    <AccountCircle fontSize="small" color="action" />
                                    <Box>
                                      <Typography variant="caption" color="text.secondary">ผู้สร้าง</Typography>
                                      <Typography variant="body2" fontWeight={600}>
                                        {wp.author_name || '-'}
                                      </Typography>
                                    </Box>
                                  </Stack>
                                </Stack>
                              </Paper>
                            </Grid>

                            {/* Timeline */}
                            <Grid item xs={12} md={6}>
                              <Paper 
                                elevation={0} 
                                sx={{ 
                                  p: 3, 
                                  borderRadius: 3,
                                  border: `1px solid ${alpha('#000', 0.06)}`,
                                  height: '100%'
                                }}
                              >
                                <Typography variant="subtitle1" fontWeight={700} mb={2} color="text.primary">
                                  ⏰ ไทม์ไลน์
                                </Typography>
                                <Stack spacing={2}>
                                  <Stack direction="row" alignItems="center" spacing={2}>
                                    <EventNote fontSize="small" color="action" />
                                    <Box>
                                      <Typography variant="caption" color="text.secondary">วันที่สร้าง</Typography>
                                      <Typography variant="body2" fontWeight={600}>
                                        {wp.created_at
                                          ? format(new Date(wp.created_at), 'dd MMMM yyyy, HH:mm', { locale: th })
                                          : '-'}
                                      </Typography>
                                    </Box>
                                  </Stack>
                                  <Stack direction="row" alignItems="center" spacing={2}>
                                    <Update fontSize="small" color="action" />
                                    <Box>
                                      <Typography variant="caption" color="text.secondary">อัปเดตล่าสุด</Typography>
                                      <Typography variant="body2" fontWeight={600}>
                                        {wp.updated_at
                                          ? format(new Date(wp.updated_at), 'dd MMMM yyyy, HH:mm', { locale: th })
                                          : '-'}
                                      </Typography>
                                    </Box>
                                  </Stack>
                                  {wp.due_date && (
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                      <Schedule fontSize="small" color="error" />
                                      <Box>
                                        <Typography variant="caption" color="text.secondary">กำหนดเสร็จ</Typography>
                                        <Typography variant="body2" fontWeight={600} color="error.main">
                                          {format(new Date(wp.due_date), 'dd MMMM yyyy', { locale: th })}
                                        </Typography>
                                      </Box>
                                    </Stack>
                                  )}
                                </Stack>
                              </Paper>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              </TabPanel>

              {/* Tab 2: Activities */}
              <TabPanel value={tabValue} index={1}>
                <Box sx={{ p: 4 }}>
                  {activities.length > 0 ? (
                    <List sx={{ width: '100%' }}>
                      {activities.map((activity: any, index: number) => {
                        const activityDate = activity.created_at ? new Date(activity.created_at) : null;
                        const hasComment = activity.notes && activity.notes.trim().length > 0;
                        const hasChanges = activity.details && activity.details.length > 0;

                        return (
                          <ListItem
                            key={activity.id || index}
                            alignItems="flex-start"
                            sx={{
                              mb: 3,
                              p: 0,
                              flexDirection: 'column',
                            }}
                          >
                            <Paper
                              elevation={0}
                              sx={{
                                width: '100%',
                                p: 4,
                                borderRadius: 3,
                                border: `2px solid ${hasComment ? alpha(theme.palette.warning.main, 0.2) : alpha(theme.palette.primary.main, 0.2)}`,
                                bgcolor: hasComment 
                                  ? alpha(theme.palette.warning.main, 0.02)
                                  : alpha(theme.palette.primary.main, 0.02),
                                position: 'relative',
                                '&::before': {
                                  content: '""',
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  height: 4,
                                  bgcolor: hasComment ? 'warning.main' : 'primary.main',
                                  borderRadius: '12px 12px 0 0',
                                },
                              }}
                            >
                              {/* Activity Header */}
                              <Stack direction="row" alignItems="center" spacing={3} mb={3}>
                                <Avatar
                                  sx={{
                                    bgcolor: hasComment ? 'warning.main' : 'primary.main',
                                    width: 48,
                                    height: 48,
                                  }}
                                >
                                  {hasComment ? <Comment /> : <Update />}
                                </Avatar>
                                <Box flex={1}>
                                  <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
                                    <Typography variant="h6" fontWeight={800}>
                                      {activity.user_name || 'ไม่ระบุ'}
                                    </Typography>
                                    <Chip
                                      label={`#${index + 1}`}
                                      size="small"
                                      sx={{ 
                                        height: 28,
                                        fontWeight: 700,
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        color: 'primary.main',
                                      }}
                                    />
                                    {activityDate && (
                                      <Typography variant="body2" color="text.secondary">
                                        📅 {format(activityDate, 'dd/MM/yyyy HH:mm', { locale: th })}
                                      </Typography>
                                    )}
                                    {index > 0 && (
                                      <Chip
                                        icon={<AccessTime fontSize="small" />}
                                        label={calculateDuration(activity.created_at, activities[index - 1].created_at)}
                                        size="small"
                                        sx={{
                                          height: 28,
                                          bgcolor: alpha(theme.palette.success.main, 0.1),
                                          color: 'success.main',
                                          fontWeight: 600,
                                        }}
                                      />
                                    )}
                                  </Stack>
                                </Box>
                              </Stack>

                              {/* Comment */}
                              {hasComment && (
                                <Box
                                  sx={{
                                    p: 3,
                                    mb: 3,
                                    bgcolor: alpha(theme.palette.warning.main, 0.08),
                                    borderLeft: '4px solid',
                                    borderColor: 'warning.main',
                                    borderRadius: 2,
                                  }}
                                >
                                  <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                                    <Comment fontSize="small" color="warning" />
                                    <Typography variant="subtitle2" fontWeight={700} color="warning.dark">
                                      ความคิดเห็น
                                    </Typography>
                                  </Stack>
                                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                                    {activity.notes}
                                  </Typography>
                                </Box>
                              )}

                              {/* Changes */}
                              {hasChanges && (
                                <Box>
                                  <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                                    <Update fontSize="small" color="primary" />
                                    <Typography variant="subtitle1" fontWeight={700}>
                                      การเปลี่ยนแปลง ({activity.details.length} รายการ)
                                    </Typography>
                                  </Stack>
                                  <Grid container spacing={2}>
                                    {activity.details.map((detail: any, i: number) => (
                                      <Grid item xs={12} sm={6} key={i}>
                                        <Paper
                                          elevation={0}
                                          sx={{
                                            p: 3,
                                            bgcolor: alpha(theme.palette.primary.main, 0.04),
                                            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                            borderRadius: 2,
                                          }}
                                        >
                                          <Typography 
                                            variant="subtitle2" 
                                            fontWeight={800}
                                            mb={1}
                                          >
                                            {detail.property}
                                          </Typography>
                                          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                                            {detail.old_value && (
                                              <>
                                                <Chip
                                                  label={detail.old_value}
                                                  size="small"
                                                  sx={{ 
                                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                                    color: 'error.main',
                                                    fontWeight: 600,
                                                  }}
                                                />
                                                <Typography variant="body2" fontWeight={800}>
                                                  →
                                                </Typography>
                                              </>
                                            )}
                                            <Chip
                                              label={detail.new_value || 'ไม่มี'}
                                              size="small"
                                              sx={{ 
                                                bgcolor: alpha(theme.palette.success.main, 0.1),
                                                color: 'success.main',
                                                fontWeight: 700,
                                              }}
                                            />
                                          </Stack>
                                        </Paper>
                                      </Grid>
                                    ))}
                                  </Grid>
                                </Box>
                              )}

                              {!hasComment && !hasChanges && (
                                <Alert severity="info" sx={{ borderRadius: 2 }}>
                                  ไม่มีข้อมูลกิจกรรม
                                </Alert>
                              )}
                            </Paper>
                          </ListItem>
                        );
                      })}
                    </List>
                  ) : (
                    <Alert 
                      severity="info" 
                      icon={<Timeline fontSize="large" />}
                      sx={{ 
                        borderRadius: 3, 
                        p: 4,
                        fontSize: '1.1rem' 
                      }}
                    >
                      <Typography variant="h6" fontWeight={700} mb={1}>
                        ยังไม่มีประวัติกิจกรรม
                      </Typography>
                      <Typography>
                        เมื่อมีการอัปเดตหรือแสดงความคิดเห็น จะแสดงที่นี่
                      </Typography>
                    </Alert>
                  )}
                </Box>
              </TabPanel>
            </Card>
          </Grid>

          {/* Right Column - Enhanced Sidebar */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              {/* Assignee Card */}
              <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha('#000', 0.08)}` }}>
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <Groups />
                    </Avatar>
                  }
                  title="ทีมงาน"
                  titleTypographyProps={{ fontWeight: 700 }}
                />
                <CardContent sx={{ pt: 0 }}>
                  <Stack direction="row" alignItems="center" spacing={3}>
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        bgcolor: 'primary.main',
                        fontSize: '1.5rem',
                        fontWeight: 800,
                      }}
                    >
                      {wp.assignee_name?.charAt(0) || '?'}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        {wp.assignee_name || 'ยังไม่ได้มอบหมาย'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ผู้รับผิดชอบหลัก
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha('#000', 0.08)}` }}>
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: 'info.main' }}>
                      <ContactPhone />
                    </Avatar>
                  }
                  title="ข้อมูลการติดต่อ"
                  titleTypographyProps={{ fontWeight: 700 }}
                />
                <CardContent sx={{ pt: 0 }}>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <AccountCircle color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary="ผู้สร้างงาน"
                        secondary={wp.author_name || '-'}
                        secondaryTypographyProps={{ fontWeight: 600 }}
                      />
                    </ListItem>
                    {wp.customField10 && (
                      <ListItem>
                        <ListItemIcon>
                          <Person color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary="ผู้แจ้ง"
                          secondary={wp.customField10}
                          secondaryTypographyProps={{ fontWeight: 600 }}
                        />
                      </ListItem>
                    )}
                    {wp.customField12 && (
                      <ListItem>
                        <ListItemIcon>
                          <Phone color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary="ติดต่อกลับ"
                          secondary={wp.customField12}
                          secondaryTypographyProps={{ fontWeight: 600 }}
                        />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>

              {/* Location & Schedule */}
              <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha('#000', 0.08)}` }}>
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: 'warning.main' }}>
                      <LocationOn />
                    </Avatar>
                  }
                  title="สถานที่และกำหนดการ"
                  titleTypographyProps={{ fontWeight: 700 }}
                />
                <CardContent sx={{ pt: 0 }}>
                  <List dense>
                    {wp.customField1 && (
                      <ListItem>
                        <ListItemIcon>
                          <Place color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary="สถานที่"
                          secondary={wp.customField1}
                          secondaryTypographyProps={{ fontWeight: 600 }}
                        />
                      </ListItem>
                    )}
                    {wp.customField11 && (
                      <ListItem>
                        <ListItemIcon>
                          <DateRange color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary="วันที่ต้องการ"
                          secondary={wp.customField11}
                          secondaryTypographyProps={{ fontWeight: 600 }}
                        />
                      </ListItem>
                    )}
                    {wp.start_date && (
                      <ListItem>
                        <ListItemIcon>
                          <EventNote color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary="วันที่เริ่ม"
                          secondary={format(new Date(wp.start_date), 'dd MMMM yyyy', { locale: th })}
                          secondaryTypographyProps={{ fontWeight: 600 }}
                        />
                      </ListItem>
                    )}
                    {wp.due_date && (
                      <ListItem>
                        <ListItemIcon>
                          <Schedule color="error" />
                        </ListItemIcon>
                        <ListItemText
                          primary="กำหนดเสร็จ"
                          secondary={format(new Date(wp.due_date), 'dd MMMM yyyy', { locale: th })}
                          secondaryTypographyProps={{ fontWeight: 600, color: 'error.main' }}
                        />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>

              {/* Work Type & Priority */}
              <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha('#000', 0.08)}` }}>
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <Work />
                    </Avatar>
                  }
                  title="ประเภทและความสำคัญ"
                  titleTypographyProps={{ fontWeight: 700 }}
                />
                <CardContent sx={{ pt: 0 }}>
                  <Stack spacing={2}>
                    {wp.customField3 && (
                      <Box>
                        <Typography variant="body2" color="text.secondary" fontWeight={600} mb={1}>
                          ประเภทงาน
                        </Typography>
                        <Chip
                          icon={<Build />}
                          label={wp.customField3}
                          color="primary"
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                    )}
                    
                    {wp.customField9 && (
                      <Box>
                        <Typography variant="body2" color="text.secondary" fontWeight={600} mb={1}>
                          ความเร่งด่วน
                        </Typography>
                        <Chip
                          icon={<Warning />}
                          label={wp.customField9}
                          color={wp.customField9 === 'ด่วน' ? 'error' : 'warning'}
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                    )}
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary" fontWeight={600} mb={1}>
                        ระดับความสำคัญ
                      </Typography>
                      <Chip
                        icon={<Flag />}
                        label={wp.priority || 'Normal'}
                        color={getPriorityColor(wp.priority)}
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default WorkPackageDetailModern;