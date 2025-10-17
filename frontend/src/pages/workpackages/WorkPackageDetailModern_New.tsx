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
  Star,
  BookmarkBorder,
  Notifications,
  Speed,
  Assignment,
  PriorityHigh,
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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
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
      <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh' }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Stack spacing={3}>
            <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 3 }} />
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} lg={8}>
                <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
              </Grid>
              <Grid item xs={12} lg={4}>
                <Stack spacing={2}>
                  <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} />
                  <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 3 }} />
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
      <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh' }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert 
            severity="error" 
            sx={{ 
              borderRadius: 3,
              '& .MuiAlert-message': { fontSize: '1.1rem' }
            }}
          >
            ❌ ไม่สามารถโหลดข้อมูล Work Package ได้
          </Alert>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/workpackages')}
            variant="contained"
            sx={{ mt: 3, borderRadius: 2 }}
          >
            กลับไปยังรายการ
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
    gradient: string;
  }> = {
    'New': { 
      color: '#2196F3',
      icon: <FiberManualRecord />,
      label: 'งานใหม่',
      gradient: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)'
    },
    'รับเรื่อง': { 
      color: '#0288D1',
      icon: <CheckCircleOutline />,
      label: 'รับเรื่องแล้ว',
      gradient: 'linear-gradient(135deg, #0288D1 0%, #0277BD 100%)'
    },
    'กำลังดำเนินการ': { 
      color: '#FF9800',
      icon: <PlayCircleOutline />,
      label: 'กำลังดำเนินการ',
      gradient: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)'
    },
    'ดำเนินการเสร็จ': { 
      color: '#4CAF50',
      icon: <CheckCircle />,
      label: 'เสร็จสิ้น',
      gradient: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)'
    },
    'ปิดงาน': { 
      color: '#757575',
      icon: <CheckCircle />,
      label: 'ปิดงาน',
      gradient: 'linear-gradient(135deg, #757575 0%, #616161 100%)'
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
    <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      {/* Top Navigation Bar */}
      <Box 
        sx={{ 
          borderBottom: '1px solid #e0e0e0',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backdropFilter: 'blur(20px)',
          bgcolor: alpha('#ffffff', 0.95),
        }}
      >
        <Container maxWidth="xl" sx={{ py: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/workpackages')}
              sx={{ 
                color: 'text.secondary',
                '&:hover': { 
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  color: 'primary.main'
                }
              }}
            >
              กลับ
            </Button>

            <Stack direction="row" spacing={1}>
              <Tooltip title="ดู">
                <IconButton size="small" sx={{ color: 'text.secondary' }}>
                  <Visibility fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="แก้ไข">
                <IconButton size="small" sx={{ color: 'text.secondary' }}>
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="แชร์">
                <IconButton size="small" sx={{ color: 'text.secondary' }}>
                  <Share fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="บุ๊คมาร์ค">
                <IconButton size="small" sx={{ color: 'text.secondary' }}>
                  <BookmarkBorder fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="เพิ่มเติม">
                <IconButton size="small" sx={{ color: 'text.secondary' }}>
                  <MoreVert fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Hero Section */}
        <Card 
          elevation={0}
          sx={{ 
            mb: 4,
            borderRadius: 4,
            overflow: 'hidden',
            background: 'white',
            border: '1px solid #e0e0e0',
          }}
        >
          {/* Header with Gradient */}
          <Box
            className="bg-gradient-to-br from-blue-500 to-purple-600"
            sx={{
              background: currentStatus.gradient,
              color: 'white',
              p: 4,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                pointerEvents: 'none',
              }
            }}
          >
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} lg={8}>
                <Stack spacing={3}>
                  {/* Badge Row */}
                  <Stack direction="row" spacing={2} flexWrap="wrap">
                    <Chip
                      label={`WP #${wp.id || wp.wp_id}`}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontWeight: 800,
                        fontSize: '1rem',
                        height: 36,
                        backdropFilter: 'blur(10px)',
                      }}
                    />
                    <Chip
                      icon={currentStatus.icon}
                      label={currentStatus.label}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontWeight: 700,
                        height: 36,
                        backdropFilter: 'blur(10px)',
                      }}
                    />
                    <Chip
                      icon={<Flag />}
                      label={wp.priority || 'Normal'}
                      color={getPriorityColor(wp.priority)}
                      sx={{ height: 36, fontWeight: 600 }}
                    />
                  </Stack>
                  
                  {/* Title */}
                  <Typography 
                    variant="h3" 
                    fontWeight={800}
                    sx={{ 
                      fontSize: { xs: '1.75rem', md: '2.5rem' },
                      lineHeight: 1.2,
                      textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  >
                    {wp.subject}
                  </Typography>
                  
                  {/* Meta Info */}
                  <Stack direction="row" spacing={4} alignItems="center" flexWrap="wrap">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Person fontSize="small" />
                      <Typography variant="body1" fontWeight={600}>
                        {wp.assignee_name || 'ยังไม่ได้มอบหมาย'}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Update fontSize="small" />
                      <Typography variant="body1">
                        อัปเดต {wp.updated_at ? format(new Date(wp.updated_at), 'dd MMM yyyy', { locale: th }) : '-'}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Category fontSize="small" />
                      <Typography variant="body1">
                        {wp.type || 'ไม่ระบุประเภท'}
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </Grid>
              
              {/* Stats Cards */}
              <Grid item xs={12} lg={4}>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 2,
                        textAlign: 'center',
                        bgcolor: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: 3,
                        border: '1px solid rgba(255,255,255,0.2)',
                      }}
                    >
                      <Typography variant="h4" fontWeight={900} color="white">
                        {activities.length}
                      </Typography>
                      <Typography variant="caption" color="white" sx={{ opacity: 0.9 }}>
                        กิจกรรม
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={4}>
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 2,
                        textAlign: 'center',
                        bgcolor: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: 3,
                        border: '1px solid rgba(255,255,255,0.2)',
                      }}
                    >
                      <Typography variant="h4" fontWeight={900} color="white">
                        {totalComments}
                      </Typography>
                      <Typography variant="caption" color="white" sx={{ opacity: 0.9 }}>
                        ความคิดเห็น
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={4}>
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 2,
                        textAlign: 'center',
                        bgcolor: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: 3,
                        border: '1px solid rgba(255,255,255,0.2)',
                      }}
                    >
                      <Typography variant="h4" fontWeight={900} color="white">
                        {daysSinceCreated}
                      </Typography>
                      <Typography variant="caption" color="white" sx={{ opacity: 0.9 }}>
                        วัน
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>

          {/* Status Timeline Summary */}
          {statusChanges.length > 0 && (
            <Box sx={{ p: 4, bgcolor: alpha(currentStatus.color, 0.02) }}>
              <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                <TrendingUp color="primary" />
                <Typography variant="h6" fontWeight={700} color="text.primary">
                  ประวัติการเปลี่ยนสถานะ
                </Typography>
                <Chip
                  label={`${statusChanges.length} ครั้ง`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Stack>
              
              <Stack direction="row" spacing={3} sx={{ overflowX: 'auto', pb: 1 }}>
                {statusChanges.map((change: any, index: number) => (
                  <Paper
                    key={index}
                    elevation={0}
                    sx={{
                      p: 3,
                      minWidth: 240,
                      borderRadius: 3,
                      border: '2px solid',
                      borderColor: statusConfig[change.to]?.color || '#ddd',
                      background: `linear-gradient(135deg, ${alpha(statusConfig[change.to]?.color || '#ddd', 0.08)} 0%, ${alpha(statusConfig[change.to]?.color || '#ddd', 0.02)} 100%)`,
                      position: 'relative',
                    }}
                  >
                    <Stack spacing={2}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {statusConfig[change.to]?.icon || <FiberManualRecord />}
                        <Typography variant="body2" fontWeight={700} color="text.secondary">
                          {change.from || 'เริ่มต้น'} → {change.to}
                        </Typography>
                      </Stack>
                      
                      <Typography variant="subtitle1" fontWeight={800}>
                        {change.user}
                      </Typography>
                      
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(change.date), 'dd MMM yyyy, HH:mm น.', { locale: th })}
                      </Typography>
                      
                      {index > 0 && (
                        <Chip
                          icon={<Schedule fontSize="small" />}
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
            </Box>
          )}
        </Card>

        {/* Main Content Grid */}
        <Grid container spacing={4}>
          {/* Left Column - Main Content */}
          <Grid item xs={12} lg={8}>
            <Card 
              elevation={0} 
              sx={{ 
                borderRadius: 4, 
                border: '1px solid #e0e0e0',
                overflow: 'hidden',
              }}
            >
              {/* Tabs */}
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                sx={{ 
                  borderBottom: 1, 
                  borderColor: 'divider',
                  px: 2,
                  '& .MuiTab-root': {
                    minHeight: 64,
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                  },
                }}
              >
                <Tab 
                  icon={<Info />} 
                  label="รายละเอียด" 
                  iconPosition="start"
                  sx={{ px: 3 }}
                />
                <Tab 
                  icon={
                    <Badge badgeContent={activities.length} color="error" max={99}>
                      <Timeline />
                    </Badge>
                  } 
                  label="กิจกรรม" 
                  iconPosition="start"
                  sx={{ px: 3 }}
                />
              </Tabs>

              {/* Tab Content */}
              <TabPanel value={tabValue} index={0}>
                <Box sx={{ p: 4 }}>
                  {/* Description */}
                  {wp.description && (
                    <Box mb={4}>
                      <Typography variant="h6" fontWeight={700} mb={3} color="text.primary">
                        📄 รายละเอียดงาน
                      </Typography>
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 4, 
                          bgcolor: '#f8f9fa',
                          borderRadius: 3,
                          border: '1px solid #e0e0e0',
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
                    </Box>
                  )}

                  {/* Work Details Table */}
                  <Box>
                    <Typography variant="h6" fontWeight={700} mb={3} color="text.primary">
                      ℹ️ ข้อมูลงาน
                    </Typography>
                    <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
                      <Table>
                        <TableBody>
                          <TableRow sx={{ '&:nth-of-type(odd)': { bgcolor: '#f8f9fa' } }}>
                            <TableCell sx={{ fontWeight: 700, width: '30%', py: 2 }}>
                              หมวดหมู่
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Chip 
                                icon={<Category />}
                                label={wp.category || 'ไม่ระบุ'} 
                                color="secondary"
                                sx={{ fontWeight: 600 }}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow sx={{ '&:nth-of-type(odd)': { bgcolor: '#f8f9fa' } }}>
                            <TableCell sx={{ fontWeight: 700, py: 2 }}>
                              โครงการ
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Business fontSize="small" color="action" />
                                <Typography>{wp.project_name || '-'}</Typography>
                              </Stack>
                            </TableCell>
                          </TableRow>
                          <TableRow sx={{ '&:nth-of-type(odd)': { bgcolor: '#f8f9fa' } }}>
                            <TableCell sx={{ fontWeight: 700, py: 2 }}>
                              สร้างเมื่อ
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <EventNote fontSize="small" color="action" />
                                <Typography>
                                  {wp.created_at
                                    ? format(new Date(wp.created_at), 'dd MMMM yyyy, HH:mm น.', { locale: th })
                                    : '-'}
                                </Typography>
                              </Stack>
                            </TableCell>
                          </TableRow>
                          <TableRow sx={{ '&:nth-of-type(odd)': { bgcolor: '#f8f9fa' } }}>
                            <TableCell sx={{ fontWeight: 700, py: 2 }}>
                              อัปเดตล่าสุด
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Update fontSize="small" color="action" />
                                <Typography>
                                  {wp.updated_at
                                    ? format(new Date(wp.updated_at), 'dd MMMM yyyy, HH:mm น.', { locale: th })
                                    : '-'}
                                </Typography>
                              </Stack>
                            </TableCell>
                          </TableRow>
                          {wp.due_date && (
                            <TableRow sx={{ '&:nth-of-type(odd)': { bgcolor: '#f8f9fa' } }}>
                              <TableCell sx={{ fontWeight: 700, py: 2 }}>
                                กำหนดเสร็จ
                              </TableCell>
                              <TableCell sx={{ py: 2 }}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <Schedule fontSize="small" color="error" />
                                  <Typography color="error.main" fontWeight={600}>
                                    {format(new Date(wp.due_date), 'dd MMMM yyyy', { locale: th })}
                                  </Typography>
                                </Stack>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </Paper>
                  </Box>
                </Box>
              </TabPanel>

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
                              mb: 4,
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
                                border: '2px solid',
                                borderColor: hasComment ? 'warning.main' : 'primary.main',
                                background: hasComment 
                                  ? 'linear-gradient(135deg, rgba(255, 152, 0, 0.02) 0%, rgba(255, 152, 0, 0.08) 100%)'
                                  : 'linear-gradient(135deg, rgba(33, 150, 243, 0.02) 0%, rgba(33, 150, 243, 0.08) 100%)',
                                position: 'relative',
                                '&::before': {
                                  content: '""',
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  height: 4,
                                  background: hasComment 
                                    ? 'linear-gradient(90deg, #FF9800 0%, #F57C00 100%)'
                                    : 'linear-gradient(90deg, #2196F3 0%, #1976D2 100%)',
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
                                        📅 {format(activityDate, 'dd/MM/yyyy HH:mm น.', { locale: th })}
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
                                      <Grid item xs={12} key={i}>
                                        <Paper
                                          elevation={0}
                                          sx={{
                                            p: 3,
                                            bgcolor: alpha(theme.palette.primary.main, 0.04),
                                            border: '1px solid',
                                            borderColor: alpha(theme.palette.primary.main, 0.2),
                                            borderRadius: 2,
                                          }}
                                        >
                                          <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
                                            <Typography 
                                              variant="subtitle2" 
                                              sx={{ fontWeight: 800, minWidth: 'fit-content' }}
                                            >
                                              {detail.property}:
                                            </Typography>
                                            {detail.old_value && (
                                              <>
                                                <Chip
                                                  label={detail.old_value}
                                                  size="small"
                                                  sx={{ 
                                                    height: 32,
                                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                                    color: 'error.main',
                                                    fontWeight: 600,
                                                  }}
                                                />
                                                <Typography variant="h6" fontWeight={800}>
                                                  →
                                                </Typography>
                                              </>
                                            )}
                                            <Chip
                                              label={detail.new_value || 'ไม่มี'}
                                              size="small"
                                              sx={{ 
                                                height: 32,
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
                    <Alert severity="info" sx={{ borderRadius: 3, fontSize: '1.1rem' }}>
                      ยังไม่มีประวัติกิจกรรม
                    </Alert>
                  )}
                </Box>
              </TabPanel>
            </Card>
          </Grid>

          {/* Right Column - Sidebar */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              {/* Assignee Card */}
              <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e0e0' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={700} mb={3}>
                    👤 ผู้รับผิดชอบ
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Stack direction="row" alignItems="center" spacing={3}>
                    <Avatar
                      sx={{
                        width: 64,
                        height: 64,
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
              <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e0e0' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={700} mb={3}>
                    📞 ข้อมูลการติดต่อ
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" fontWeight={600} mb={1}>
                        ผู้สร้างงาน
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Person fontSize="small" color="action" />
                        <Typography variant="body1" fontWeight={700}>
                          {wp.author_name || '-'}
                        </Typography>
                      </Stack>
                    </Box>
                    
                    {wp.customField10 && (
                      <Box>
                        <Typography variant="body2" color="text.secondary" fontWeight={600} mb={1}>
                          ผู้แจ้ง
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Person fontSize="small" color="action" />
                          <Typography variant="body1" fontWeight={700}>
                            {wp.customField10}
                          </Typography>
                        </Stack>
                      </Box>
                    )}
                    
                    {wp.customField12 && (
                      <Box>
                        <Typography variant="body2" color="text.secondary" fontWeight={600} mb={1}>
                          ติดต่อกลับ
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Phone fontSize="small" color="action" />
                          <Typography variant="body1" fontWeight={700}>
                            {wp.customField12}
                          </Typography>
                        </Stack>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>

              {/* Location & Schedule */}
              <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e0e0' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={700} mb={3}>
                    📍 สถานที่และกำหนดการ
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Stack spacing={3}>
                    {wp.customField1 && (
                      <Box>
                        <Typography variant="body2" color="text.secondary" fontWeight={600} mb={1}>
                          สถานที่
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Place fontSize="small" color="action" />
                          <Typography variant="body1" fontWeight={700}>
                            {wp.customField1}
                          </Typography>
                        </Stack>
                      </Box>
                    )}
                    
                    {wp.customField11 && (
                      <Box>
                        <Typography variant="body2" color="text.secondary" fontWeight={600} mb={1}>
                          วันที่ต้องการ
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <DateRange fontSize="small" color="action" />
                          <Typography variant="body1" fontWeight={700}>
                            {wp.customField11}
                          </Typography>
                        </Stack>
                      </Box>
                    )}
                    
                    {wp.start_date && (
                      <Box>
                        <Typography variant="body2" color="text.secondary" fontWeight={600} mb={1}>
                          วันที่เริ่ม
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <EventNote fontSize="small" color="action" />
                          <Typography variant="body1" fontWeight={700}>
                            {format(new Date(wp.start_date), 'dd MMMM yyyy', { locale: th })}
                          </Typography>
                        </Stack>
                      </Box>
                    )}
                    
                    {wp.due_date && (
                      <Box>
                        <Typography variant="body2" color="text.secondary" fontWeight={600} mb={1}>
                          กำหนดเสร็จ
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Schedule fontSize="small" color="error" />
                          <Typography variant="body1" color="error.main" fontWeight={700}>
                            {format(new Date(wp.due_date), 'dd MMMM yyyy', { locale: th })}
                          </Typography>
                        </Stack>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>

              {/* Work Type & Priority */}
              <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e0e0' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={700} mb={3}>
                    🔧 ประเภทและความสำคัญ
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Stack spacing={3}>
                    {wp.customField3 && (
                      <Box>
                        <Typography variant="body2" color="text.secondary" fontWeight={600} mb={1}>
                          ประเภทงาน
                        </Typography>
                        <Chip
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