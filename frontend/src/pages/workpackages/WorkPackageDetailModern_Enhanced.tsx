import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Chip,
  Avatar,
  Stack,
  Paper,
  Divider,
  Skeleton,
  Alert,
  alpha,
  useTheme,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  IconButton,
  LinearProgress,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import {
  ArrowBack,
  Info,
  Person,
  Category,
  Flag,
  Update,
  DateRange,
  EventNote,
  TrendingUp,
  Edit,
  Share,
  MoreVert,
  Visibility,
  Assignment,
  Description,
  CalendarMonth,
  Build,
  ErrorOutline,
  CheckCircleRounded,
  TaskAlt,
  Analytics,
  Timer,
  ElectricBolt,
  History,
  AttachFile,
  Comment as CommentIcon,
  Star,
  StarBorder,
  ThumbUp,
  Send,
  ExpandMore,
  ChevronRight,
  Circle,
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';
import { wpApi } from '../../api/client';

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
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export const WorkPackageDetailModernEnhanced: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [tabValue, setTabValue] = useState(0);
  const [activities, setActivities] = useState<any[]>([]);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [favorite, setFavorite] = useState(false);

  const wpId = parseInt(id || '0');

  const { data: wpDetail, isLoading, error } = useQuery({
    queryKey: ['workpackage', wpId],
    queryFn: () => wpApi.get(wpId).then((res) => res.data),
    enabled: !!wpId,
  });

  const fetchAllActivities = React.useCallback(async () => {
    if (!wpId) return { journals: [] };
    const PAGE_SIZE = 50;
    let offset = 0;
    let allActivities: any[] = [];
    let hasMore = true;

    while (hasMore && offset < 1000) {
      const response = await wpApi.getJournals(wpId, { offset, page_size: PAGE_SIZE });
      const data = response?.data ?? {};
      const pageActivities = Array.isArray(data.journals) ? data.journals : [];
      allActivities = allActivities.concat(pageActivities);
      hasMore = Boolean(data.has_more);
      offset += PAGE_SIZE;
    }

    return { journals: allActivities };
  }, [wpId]);

  React.useEffect(() => {
    const loadActivities = async () => {
      const result = await fetchAllActivities();
      if (result?.journals) setActivities(result.journals);
    };
    if (wpId) loadActivities();
  }, [wpId, fetchAllActivities]);

  const statusColor = (status?: string) => {
    const s = status?.toLowerCase();
    if (s?.includes('new')) return { bg: '#3b82f6', text: '#1e40af', label: 'ใหม่' };
    if (s?.includes('progress')) return { bg: '#f59e0b', text: '#92400e', label: 'กำลังดำเนิน' };
    if (s?.includes('closed')) return { bg: '#10b981', text: '#065f46', label: 'เสร็จสิ้น' };
    if (s?.includes('rejected')) return { bg: '#ef4444', text: '#7f1d1d', label: 'ปฏิเสธ' };
    return { bg: '#6b7280', text: '#374151', label: 'อื่นๆ' };
  };

  const priorityColor = (priority?: string) => {
    const p = priority?.toLowerCase();
    if (p?.includes('low')) return { color: '#10b981', icon: <Flag sx={{ color: '#10b981' }} /> };
    if (p?.includes('high')) return { color: '#f59e0b', icon: <Flag sx={{ color: '#f59e0b' }} /> };
    if (p?.includes('urgent')) return { color: '#ef4444', icon: <Flag sx={{ color: '#ef4444' }} /> };
    return { color: '#3b82f6', icon: <Flag sx={{ color: '#3b82f6' }} /> };
  };

  const getStatusIcon = (status?: string) => {
    const s = status?.toLowerCase();
    if (s?.includes('new')) return <Info sx={{ color: '#3b82f6' }} />;
    if (s?.includes('progress')) return <Timer sx={{ color: '#f59e0b' }} />;
    if (s?.includes('closed')) return <CheckCircleRounded sx={{ color: '#10b981' }} />;
    return <TaskAlt sx={{ color: '#6b7280' }} />;
  };

  const calculateProgress = () => {
    const status = wpDetail?.status?.toLowerCase();
    if (status?.includes('closed')) return 100;
    if (status?.includes('new')) return 0;
    return 50;
  };

  const totalComments = activities.filter((a: any) => a.notes?.trim()).length;

  const customFieldsDisplay = useMemo(() => {
    if (!(wpDetail as any)?.custom_fields) return [];
    return Object.entries((wpDetail as any)?.custom_fields).map(([key, value]: any) => ({
      key,
      value,
      display: typeof value === 'object' ? JSON.stringify(value) : String(value),
    }));
  }, [(wpDetail as any)?.custom_fields]);

  if (error) {
    return (
      <Container maxWidth="lg" className="py-8">
        <Alert severity="error" className="rounded-xl">
          <ErrorOutline className="mr-2" />
          ไม่สามารถโหลดข้อมูล Work Package ได้
        </Alert>
      </Container>
    );
  }

  if (isLoading || !wpDetail) {
    return (
      <Container maxWidth="lg" className="py-8">
        <Box className="space-y-6">
          <Skeleton variant="rectangular" height={400} className="rounded-3xl" />
          <Skeleton variant="rectangular" height={300} className="rounded-3xl" />
        </Box>
      </Container>
    );
  }

  const wp = wpDetail as any;
  const statusInfo = statusColor(wp?.status);
  const priorityInfo = priorityColor(wp?.priority);

  return (
    <Box
      className="min-h-screen transition-all duration-500"
      sx={{
        background:
          theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #0f172a 0%, #1a1a2e 30%, #16213e 60%, #0f3460 100%)'
            : 'linear-gradient(135deg, #f0f9ff 0%, #f1f5f9 30%, #e0f2fe 60%, #f8fafc 100%)',
        py: { xs: 2, md: 4 },
        minHeight: '100vh',
      }}
    >
      <Container maxWidth="lg">
        <Box className="mb-8">
          <Stack direction="row" spacing={2} alignItems="center" className="mb-6">
            <Tooltip title="ย้อนกลับ">
              <IconButton 
                onClick={() => navigate(-1)} 
                sx={{ 
                  background: alpha(theme.palette.primary.main, 0.15),
                  '&:hover': { background: alpha(theme.palette.primary.main, 0.25) },
                  borderRadius: '12px',
                  p: 1.5,
                }}
              >
                <ArrowBack />
              </IconButton>
            </Tooltip>
            <Box className="flex-grow">
              <Stack direction="row" alignItems="center" spacing={1} className="mb-2">
                <Typography variant="overline" className="text-gray-500 font-semibold tracking-widest">
                  Work Package #{wp?.id}
                </Typography>
                <Chip 
                  icon={<Visibility sx={{ fontSize: '16px !important' }} />}
                  label={`${activities.length} กิจกรรม`}
                  size="small"
                  variant="outlined"
                />
              </Stack>
              <Typography 
                variant="h3" 
                className="font-bold bg-clip-text bg-gradient-to-r"
                sx={{
                  backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {wp?.subject}
              </Typography>
            </Box>
            <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'none', sm: 'flex' } }}>
              <Tooltip title={favorite ? 'ถอดการถูกใจ' : 'ถูกใจ'}>
                <IconButton 
                  size="small"
                  onClick={() => setFavorite(!favorite)}
                  sx={{ 
                    background: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': { background: alpha(theme.palette.primary.main, 0.2) },
                  }}
                >
                  {favorite ? <Star sx={{ color: '#fbbf24' }} /> : <StarBorder />}
                </IconButton>
              </Tooltip>
              <Tooltip title="แก้ไข"><IconButton size="small" sx={{ background: alpha(theme.palette.primary.main, 0.1) }}><Edit /></IconButton></Tooltip>
              <Tooltip title="แชร์"><IconButton size="small" sx={{ background: alpha(theme.palette.primary.main, 0.1) }}><Share /></IconButton></Tooltip>
              <Tooltip title="เพิ่มเติม"><IconButton size="small" sx={{ background: alpha(theme.palette.primary.main, 0.1) }}><MoreVert /></IconButton></Tooltip>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', gap: 1.5 }}>
            {wp?.status && (
              <Chip
                avatar={<Avatar sx={{ background: `${statusInfo.bg} !important` }}>{getStatusIcon(wp.status)}</Avatar>}
                label={wp.status}
                sx={{
                  background: alpha(statusInfo.bg, 0.15),
                  color: statusInfo.bg,
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  height: 'auto',
                  py: 1,
                  border: `2px solid ${alpha(statusInfo.bg, 0.3)}`,
                }}
              />
            )}
            {wp?.type && (
              <Chip
                icon={<Category />}
                label={wp.type}
                sx={{
                  background: alpha(theme.palette.info.main, 0.15),
                  color: theme.palette.info.main,
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  height: 'auto',
                  py: 1,
                  border: `2px solid ${alpha(theme.palette.info.main, 0.3)}`,
                }}
              />
            )}
            {wp?.priority && (
              <Chip
                icon={priorityInfo.icon}
                label={`ความสำคัญ: ${wp.priority}`}
                sx={{
                  background: alpha(priorityInfo.color, 0.15),
                  color: priorityInfo.color,
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  height: 'auto',
                  py: 1,
                  border: `2px solid ${alpha(priorityInfo.color, 0.3)}`,
                }}
              />
            )}
          </Stack>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card 
              className="mb-6 shadow-lg rounded-3xl overflow-hidden"
              sx={{
                background: theme.palette.mode === 'dark' 
                  ? alpha('#1e293b', 0.8)
                  : alpha('#ffffff', 0.95),
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <CardContent className="p-6">
                <Stack direction="row" justifyContent="space-between" alignItems="center" className="mb-4">
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box
                      sx={{
                        p: 1.5,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                        borderRadius: '12px',
                      }}
                    >
                      <TrendingUp sx={{ color: '#ffffff', fontSize: 24 }} />
                    </Box>
                    <Typography variant="h6" className="font-bold">ความคืบหน้า</Typography>
                  </Stack>
                  <Typography variant="h5" className="font-bold text-transparent bg-clip-text"
                    sx={{
                      backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {calculateProgress()}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={calculateProgress()}
                  className="h-3 rounded-full"
                  sx={{
                    background: alpha(theme.palette.primary.main, 0.1),
                    '& .MuiLinearProgress-bar': {
                      background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      borderRadius: '9999px',
                      boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.5)}`,
                    },
                  }}
                />
                <Box className="mt-4 grid grid-cols-3 gap-2">
                  {[
                    { label: 'เริ่มต้น', value: 'ใหม่', color: '#3b82f6' },
                    { label: 'กำลังดำเนิน', value: '50%', color: '#f59e0b' },
                    { label: 'เสร็จสิ้น', value: 'เสร็จ', color: '#10b981' },
                  ].map((item, idx) => (
                    <Box key={idx} className="text-center">
                      <Box 
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          mx: 'auto',
                          mb: 1,
                          background: item.color,
                        }}
                      />
                      <Typography variant="caption" className="text-gray-500 block">{item.label}</Typography>
                      <Typography variant="caption" className="font-semibold">{item.value}</Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>

            <Card 
              className="shadow-lg rounded-3xl overflow-hidden"
              sx={{
                background: theme.palette.mode === 'dark' 
                  ? alpha('#1e293b', 0.8)
                  : alpha('#ffffff', 0.95),
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <Box sx={{ 
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`, 
                background: alpha(theme.palette.primary.main, 0.02),
                p: 2,
              }}>
                <Tabs
                  value={tabValue}
                  onChange={(e, newValue) => setTabValue(newValue)}
                  sx={{
                    '& .MuiTab-root': { 
                      fontWeight: 700, 
                      fontSize: '0.95rem', 
                      textTransform: 'none',
                      py: 1.5,
                      transition: 'all 0.3s ease',
                    },
                    '& .Mui-selected': {
                      background: alpha(theme.palette.primary.main, 0.1),
                      borderRadius: '8px',
                    },
                  }}
                >
                  <Tab label="กิจกรรมและความคิดเห็น" icon={<History sx={{ mr: 1 }} />} iconPosition="start" />
                  <Tab label="รายละเอียด" icon={<Info sx={{ mr: 1 }} />} iconPosition="start" />
                  <Tab label="เวลาและการติดตาม" icon={<Timer sx={{ mr: 1 }} />} iconPosition="start" />
                  <Tab label="ไฟล์แนบ" icon={<AttachFile sx={{ mr: 1 }} />} iconPosition="start" />
                </Tabs>
              </Box>

              <CardContent className="p-6">
                <TabPanel value={tabValue} index={0}>
                  {activities.length > 0 ? (
                    <Timeline sx={{ p: 0, m: 0 }}>
                      {activities.map((activity, index) => (
                        <TimelineItem key={activity.id || index} sx={{ mb: 4 }}>
                          <TimelineOppositeContent sx={{ flex: 0, pr: 3, display: { xs: 'none', md: 'block' }, minWidth: '120px' }}>
                            <Typography variant="caption" className="text-gray-500 font-semibold">
                              {activity.created_at ? formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: th }) : 'ไม่ระบุ'}
                            </Typography>
                            <Typography variant="caption" className="text-gray-400 block">
                              {activity.created_at ? format(new Date(activity.created_at), 'HH:mm', { locale: th }) : ''}
                            </Typography>
                          </TimelineOppositeContent>
                          <TimelineSeparator>
                            <TimelineDot 
                              sx={{ 
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                width: 48,
                                height: 48,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.5)}`,
                              }}
                            >
                              {activity.notes ? <CommentIcon sx={{ color: '#fff' }} /> : <Update sx={{ color: '#fff' }} />}
                            </TimelineDot>
                            {index < activities.length - 1 && <TimelineConnector sx={{ height: 60 }} />}
                          </TimelineSeparator>
                          <TimelineContent sx={{ pt: 1 }}>
                            <Paper 
                              elevation={0} 
                              className="p-5 rounded-2xl transition-all duration-300 hover:shadow-lg"
                              sx={{ 
                                background: alpha(theme.palette.primary.main, 0.04),
                                border: `2px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                                '&:hover': {
                                  background: alpha(theme.palette.primary.main, 0.08),
                                  borderColor: alpha(theme.palette.primary.main, 0.3),
                                }
                              }}
                            >
                              <Stack direction="row" justifyContent="space-between" spacing={2}>
                                <Stack className="flex-grow" spacing={1.5}>
                                  <Stack direction="row" alignItems="center" spacing={1.5}>
                                    <Avatar 
                                      sx={{ 
                                        width: 40, 
                                        height: 40, 
                                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                        fontWeight: 700,
                                        fontSize: '1.1rem',
                                      }}
                                    >
                                      {(activity.user_name || 'U')?.charAt(0).toUpperCase()}
                                    </Avatar>
                                    <Stack spacing={0.3}>
                                      <Typography variant="subtitle2" className="font-bold">{activity.user_name || 'ไม่ระบุ'}</Typography>
                                      <Typography variant="caption" className="text-gray-500">
                                        {activity.created_at ? format(new Date(activity.created_at), 'dd MMM yyyy HH:mm', { locale: th }) : 'ไม่ระบุ'}
                                      </Typography>
                                    </Stack>
                                  </Stack>
                                  {activity.notes && (
                                    <Typography variant="body2" className="text-gray-700 dark:text-gray-300 leading-relaxed mt-2">
                                      {activity.notes}
                                    </Typography>
                                  )}
                                  {activity.details && activity.details.length > 0 && (
                                    <Box className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border-l-4 border-blue-500">
                                      <Typography variant="caption" className="font-bold block mb-3 flex items-center gap-1">
                                        <Circle sx={{ fontSize: '8px', color: '#3b82f6' }} />
                                        มีการเปลี่ยนแปลง
                                      </Typography>
                                      <Stack spacing={2}>
                                        {activity.details.map((d: any, i: number) => (
                                          <Box key={i} className="flex items-start gap-3">
                                            <ChevronRight sx={{ color: '#3b82f6', mt: 0.5 }} />
                                            <Box className="flex-grow">
                                              <Typography variant="caption" className="font-bold text-blue-900 dark:text-blue-100 block mb-1">
                                                {d.property}
                                              </Typography>
                                              <Stack direction="row" spacing={1.5} alignItems="center">
                                                <Chip 
                                                  label={d.old_value || 'ไม่มี'} 
                                                  size="small" 
                                                  sx={{ 
                                                    bgcolor: alpha(theme.palette.error.main, 0.2), 
                                                    color: 'error.main',
                                                    fontWeight: 600,
                                                  }} 
                                                />
                                                <Typography variant="caption" className="font-bold">→</Typography>
                                                <Chip 
                                                  label={d.new_value || 'ไม่มี'} 
                                                  size="small" 
                                                  sx={{ 
                                                    bgcolor: alpha(theme.palette.success.main, 0.2), 
                                                    color: 'success.main',
                                                    fontWeight: 600,
                                                  }} 
                                                />
                                              </Stack>
                                            </Box>
                                          </Box>
                                        ))}
                                      </Stack>
                                    </Box>
                                  )}
                                </Stack>
                                <Box>
                                  <Tooltip title="เพิ่มเติม">
                                    <IconButton size="small" sx={{ mt: -1 }}>
                                      <MoreVert fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </Stack>
                            </Paper>
                          </TimelineContent>
                        </TimelineItem>
                      ))}
                    </Timeline>
                  ) : (
                    <Box className="text-center py-16">
                      <History className="mx-auto mb-4 text-gray-400" sx={{ fontSize: 56 }} />
                      <Typography variant="h6" color="textSecondary" className="font-semibold mb-2">
                        ไม่มีกิจกรรมในขณะนี้
                      </Typography>
                      <Typography variant="body2" color="textSecondary" className="mb-6">
                        เริ่มเขียนความคิดเห็นของคุณเพื่อสร้างประวัติกิจกรรม
                      </Typography>
                      <Button 
                        variant="contained" 
                        startIcon={<CommentIcon />}
                        onClick={() => setCommentDialogOpen(true)}
                        sx={{ borderRadius: '8px' }}
                      >
                        เพิ่มความคิดเห็น
                      </Button>
                    </Box>
                  )}
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      {wp?.description && (
                        <Card 
                          variant="outlined"
                          sx={{
                            background: alpha(theme.palette.info.main, 0.04),
                            border: `2px solid ${alpha(theme.palette.info.main, 0.2)}`,
                            borderRadius: '16px',
                          }}
                        >
                          <CardContent className="p-6">
                            <Stack direction="row" alignItems="center" spacing={1.5} className="mb-4">
                              <Box sx={{ p: 1, background: alpha(theme.palette.info.main, 0.15), borderRadius: '8px' }}>
                                <Description sx={{ color: theme.palette.info.main }} />
                              </Box>
                              <Typography variant="subtitle1" className="font-bold">รายละเอียด</Typography>
                            </Stack>
                            <Typography variant="body2" className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl leading-relaxed whitespace-pre-wrap">
                              {wp.description}
                            </Typography>
                          </CardContent>
                        </Card>
                      )}
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      {wp?.author_name && (
                        <Card 
                          variant="outlined"
                          sx={{
                            background: alpha('#ff9800', 0.04),
                            border: `2px solid ${alpha('#ff9800', 0.2)}`,
                            borderRadius: '16px',
                          }}
                        >
                          <CardContent className="p-6">
                            <Stack direction="row" alignItems="center" spacing={1.5} className="mb-3">
                              <Box sx={{ p: 1, background: alpha('#ff9800', 0.15), borderRadius: '8px' }}>
                                <Person sx={{ color: '#ff9800' }} />
                              </Box>
                              <Typography variant="subtitle2" className="font-bold">ผู้สร้าง</Typography>
                            </Stack>
                            <Typography variant="body2" className="font-semibold text-lg">{wp.author_name}</Typography>
                          </CardContent>
                        </Card>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      {wp?.assignee_name && (
                        <Card 
                          variant="outlined"
                          sx={{
                            background: alpha(theme.palette.error.main, 0.04),
                            border: `2px solid ${alpha(theme.palette.error.main, 0.2)}`,
                            borderRadius: '16px',
                          }}
                        >
                          <CardContent className="p-6">
                            <Stack direction="row" alignItems="center" spacing={1.5} className="mb-3">
                              <Box sx={{ p: 1, background: alpha(theme.palette.error.main, 0.15), borderRadius: '8px' }}>
                                <Assignment sx={{ color: theme.palette.error.main }} />
                              </Box>
                              <Typography variant="subtitle2" className="font-bold">ผู้รับผิดชอบ</Typography>
                            </Stack>
                            <Typography variant="body2" className="font-semibold text-lg">{wp.assignee_name}</Typography>
                          </CardContent>
                        </Card>
                      )}
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      {wp?.type && (
                        <Card 
                          variant="outlined"
                          sx={{
                            background: alpha(theme.palette.warning.main, 0.04),
                            border: `2px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                            borderRadius: '16px',
                          }}
                        >
                          <CardContent className="p-6">
                            <Stack direction="row" alignItems="center" spacing={1.5} className="mb-3">
                              <Box sx={{ p: 1, background: alpha(theme.palette.warning.main, 0.15), borderRadius: '8px' }}>
                                <Category sx={{ color: theme.palette.warning.main }} />
                              </Box>
                              <Typography variant="subtitle2" className="font-bold">ประเภท</Typography>
                            </Stack>
                            <Typography variant="body2" className="font-semibold text-lg">{wp.type}</Typography>
                          </CardContent>
                        </Card>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      {wp?.priority && (
                        <Card 
                          variant="outlined"
                          sx={{
                            background: alpha(priorityInfo.color, 0.04),
                            border: `2px solid ${alpha(priorityInfo.color, 0.2)}`,
                            borderRadius: '16px',
                          }}
                        >
                          <CardContent className="p-6">
                            <Stack direction="row" alignItems="center" spacing={1.5} className="mb-3">
                              <Box sx={{ p: 1, background: alpha(priorityInfo.color, 0.15), borderRadius: '8px' }}>
                                <Flag sx={{ color: priorityInfo.color }} />
                              </Box>
                              <Typography variant="subtitle2" className="font-bold">ความสำคัญ</Typography>
                            </Stack>
                            <Typography variant="body2" className="font-semibold text-lg">{wp.priority}</Typography>
                          </CardContent>
                        </Card>
                      )}
                    </Grid>

                    {customFieldsDisplay.length > 0 && (
                      <Grid item xs={12}>
                        <Accordion 
                          defaultExpanded
                          sx={{
                            background: alpha(theme.palette.success.main, 0.04),
                            border: `2px solid ${alpha(theme.palette.success.main, 0.2)}`,
                            borderRadius: '16px',
                            '&.Mui-expanded': { borderRadius: '16px' },
                          }}
                        >
                          <AccordionSummary expandIcon={<ExpandMore />}>
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                              <Box sx={{ p: 1, background: alpha(theme.palette.success.main, 0.15), borderRadius: '8px' }}>
                                <Build sx={{ color: theme.palette.success.main }} />
                              </Box>
                              <Typography variant="subtitle1" className="font-bold">ข้อมูลเพิ่มเติม</Typography>
                              <Chip label={customFieldsDisplay.length} size="small" color="success" variant="outlined" />
                            </Stack>
                          </AccordionSummary>
                          <AccordionDetails sx={{ pt: 3 }}>
                            <Grid container spacing={2}>
                              {customFieldsDisplay.map((field, idx) => (
                                <Grid item xs={12} sm={6} key={idx}>
                                  <Paper 
                                    variant="outlined"
                                    sx={{
                                      p: 2,
                                      background: alpha(theme.palette.primary.main, 0.05),
                                      borderRadius: '12px',
                                      borderLeft: `4px solid ${theme.palette.primary.main}`,
                                    }}
                                  >
                                    <Typography variant="caption" className="text-gray-500 font-bold block mb-1">
                                      {field.key}
                                    </Typography>
                                    <Typography variant="body2" className="font-semibold">
                                      {field.display}
                                    </Typography>
                                  </Paper>
                                </Grid>
                              ))}
                            </Grid>
                          </AccordionDetails>
                        </Accordion>
                      </Grid>
                    )}
                  </Grid>
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                  <Grid container spacing={3}>
                    {wp?.start_date && (
                      <Grid item xs={12} sm={6}>
                        <Card 
                          variant="outlined"
                          sx={{
                            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                            border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                            borderRadius: '16px',
                          }}
                        >
                          <CardContent className="p-6">
                            <Stack direction="row" alignItems="center" spacing={1.5} className="mb-4">
                              <Box sx={{ p: 1.5, background: alpha(theme.palette.primary.main, 0.15), borderRadius: '8px' }}>
                                <CalendarMonth sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
                              </Box>
                              <Typography variant="subtitle2" className="font-bold">วันที่เริ่มต้น</Typography>
                            </Stack>
                            <Typography variant="h6" className="font-bold text-lg">{format(new Date(wp.start_date), 'dd MMM yyyy', { locale: th })}</Typography>
                            <Typography variant="caption" className="text-gray-500">
                              {formatDistanceToNow(new Date(wp.start_date), { addSuffix: true, locale: th })}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}
                    {wp?.due_date && (
                      <Grid item xs={12} sm={6}>
                        <Card 
                          variant="outlined"
                          sx={{
                            background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.1)} 100%)`,
                            border: `2px solid ${alpha(theme.palette.error.main, 0.3)}`,
                            borderRadius: '16px',
                          }}
                        >
                          <CardContent className="p-6">
                            <Stack direction="row" alignItems="center" spacing={1.5} className="mb-4">
                              <Box sx={{ p: 1.5, background: alpha(theme.palette.error.main, 0.15), borderRadius: '8px' }}>
                                <DateRange sx={{ color: theme.palette.error.main, fontSize: 28 }} />
                              </Box>
                              <Typography variant="subtitle2" className="font-bold">วันที่สิ้นสุด</Typography>
                            </Stack>
                            <Typography variant="h6" className="font-bold text-lg">{format(new Date(wp.due_date), 'dd MMM yyyy', { locale: th })}</Typography>
                            <Typography variant="caption" className="text-gray-500">
                              {formatDistanceToNow(new Date(wp.due_date), { addSuffix: true, locale: th })}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}
                    {wp?.created_at && (
                      <Grid item xs={12} sm={6}>
                        <Card 
                          variant="outlined"
                          sx={{
                            background: alpha(theme.palette.info.main, 0.05),
                            border: `2px solid ${alpha(theme.palette.info.main, 0.3)}`,
                            borderRadius: '16px',
                          }}
                        >
                          <CardContent className="p-6">
                            <Stack direction="row" alignItems="center" spacing={1.5} className="mb-4">
                              <Box sx={{ p: 1.5, background: alpha(theme.palette.info.main, 0.15), borderRadius: '8px' }}>
                                <EventNote sx={{ color: theme.palette.info.main, fontSize: 28 }} />
                              </Box>
                              <Typography variant="subtitle2" className="font-bold">สร้างเมื่อ</Typography>
                            </Stack>
                            <Typography variant="body2" className="font-semibold">{format(new Date(wp.created_at), 'dd MMM yyyy HH:mm', { locale: th })}</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}
                    {wp?.updated_at && (
                      <Grid item xs={12} sm={6}>
                        <Card 
                          variant="outlined"
                          sx={{
                            background: alpha(theme.palette.info.main, 0.05),
                            border: `2px solid ${alpha(theme.palette.info.main, 0.3)}`,
                            borderRadius: '16px',
                          }}
                        >
                          <CardContent className="p-6">
                            <Stack direction="row" alignItems="center" spacing={1.5} className="mb-4">
                              <Box sx={{ p: 1.5, background: alpha(theme.palette.info.main, 0.15), borderRadius: '8px' }}>
                                <Update sx={{ color: theme.palette.info.main, fontSize: 28 }} />
                              </Box>
                              <Typography variant="subtitle2" className="font-bold">อัพเดตล่าสุด</Typography>
                            </Stack>
                            <Typography variant="body2" className="font-semibold">{format(new Date(wp.updated_at), 'dd MMM yyyy HH:mm', { locale: th })}</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}
                  </Grid>
                </TabPanel>

                <TabPanel value={tabValue} index={3}>
                  <Box className="text-center py-16">
                    <Box sx={{ 
                      display: 'inline-flex', 
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      background: alpha(theme.palette.primary.main, 0.1),
                      mb: 3,
                    }}>
                      <AttachFile sx={{ fontSize: 56, color: theme.palette.primary.main }} />
                    </Box>
                    <Typography variant="h6" className="font-bold mb-2">ไม่มีไฟล์แนบ</Typography>
                    <Typography variant="body2" color="textSecondary" className="mb-6">
                      เพิ่มไฟล์เพื่อแชร์เอกสาร รูปภาพ หรือข้อมูลอื่น ๆ
                    </Typography>
                    <Button 
                      variant="contained" 
                      startIcon={<AttachFile />}
                      sx={{ borderRadius: '8px' }}
                    >
                      อัพโหลดไฟล์
                    </Button>
                  </Box>
                </TabPanel>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card 
              className="shadow-lg rounded-3xl mb-6 overflow-hidden"
              sx={{
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.secondary.main, 0.15)} 100%)`,
                border: `2px solid ${alpha(theme.palette.divider, 0.2)}`,
                backdropFilter: 'blur(10px)',
              }}
            >
              <CardHeader 
                title="สรุปข้อมูล"
                titleTypographyProps={{ variant: 'h6', className: 'font-bold' }}
                avatar={<Info sx={{ color: theme.palette.primary.main }} />}
              />
              <CardContent className="p-6 pt-0">
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="caption" className="text-gray-500 font-bold block mb-2">รหัสประจำตัว</Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box 
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '8px',
                          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: 'bold',
                        }}
                      >
                        #{wp?.id}
                      </Box>
                      <Typography variant="h6" className="font-bold">#{wp?.id}</Typography>
                    </Stack>
                  </Box>
                  <Divider />
                  <Box>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" className="mb-2">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <TrendingUp sx={{ color: theme.palette.primary.main }} />
                        <Typography variant="caption" className="font-semibold">ความคืบหน้า</Typography>
                      </Stack>
                      <Typography variant="body2" className="font-bold text-transparent bg-clip-text"
                        sx={{
                          backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }}
                      >
                        {calculateProgress()}%
                      </Typography>
                    </Stack>
                    <LinearProgress 
                      variant="determinate" 
                      value={calculateProgress()} 
                      className="h-2 rounded-full"
                      sx={{
                        background: alpha(theme.palette.primary.main, 0.1),
                        '& .MuiLinearProgress-bar': {
                          background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                        }
                      }}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Card 
              className="shadow-lg rounded-3xl mb-6"
              sx={{
                background: theme.palette.mode === 'dark' 
                  ? alpha('#1e293b', 0.8)
                  : alpha('#ffffff', 0.95),
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <CardHeader 
                title="การดำเนินการด่วน"
                titleTypographyProps={{ variant: 'subtitle1', className: 'font-bold' }}
                avatar={<ElectricBolt sx={{ color: '#fbbf24' }} />}
              />
              <CardContent className="p-6 pt-0">
                <Stack spacing={2}>
                  <Button 
                    variant="contained" 
                    fullWidth 
                    startIcon={<Edit />}
                    sx={{ borderRadius: '8px', py: 1.2 }}
                  >
                    แก้ไข
                  </Button>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    startIcon={<CommentIcon />}
                    onClick={() => setCommentDialogOpen(true)}
                    sx={{ borderRadius: '8px', py: 1.2 }}
                  >
                    เพิ่มความคิดเห็น
                  </Button>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    startIcon={<AttachFile />}
                    sx={{ borderRadius: '8px', py: 1.2 }}
                  >
                    แนบไฟล์
                  </Button>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    startIcon={<Share />}
                    sx={{ borderRadius: '8px', py: 1.2 }}
                  >
                    แชร์
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            <Card 
              className="shadow-lg rounded-3xl"
              sx={{
                background: theme.palette.mode === 'dark' 
                  ? alpha('#1e293b', 0.8)
                  : alpha('#ffffff', 0.95),
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <CardHeader 
                title="สถิติ"
                titleTypographyProps={{ variant: 'subtitle1', className: 'font-bold' }}
                avatar={<Analytics sx={{ color: theme.palette.info.main }} />}
              />
              <CardContent className="p-6 pt-0">
                <Stack spacing={2.5}>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" className="mb-2">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Visibility sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
                        <Typography variant="caption" className="font-semibold">ทำให้เห็น</Typography>
                      </Stack>
                      <Badge badgeContent={activities.length} color="primary" />
                    </Stack>
                    <LinearProgress variant="determinate" value={Math.min(activities.length * 10, 100)} sx={{ height: 6, borderRadius: '3px' }} />
                  </Box>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" className="mb-2">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CommentIcon sx={{ color: '#10b981', fontSize: 20 }} />
                        <Typography variant="caption" className="font-semibold">ความคิดเห็น</Typography>
                      </Stack>
                      <Badge badgeContent={totalComments} color="success" />
                    </Stack>
                    <LinearProgress variant="determinate" value={Math.min(totalComments * 10, 100)} sx={{ height: 6, borderRadius: '3px', backgroundColor: alpha('#10b981', 0.1), '& .MuiLinearProgress-bar': { backgroundColor: '#10b981' } }} />
                  </Box>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" className="mb-2">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <ThumbUp sx={{ color: '#f59e0b', fontSize: 20 }} />
                        <Typography variant="caption" className="font-semibold">การสนับสนุน</Typography>
                      </Stack>
                      <Badge badgeContent={5} color="warning" />
                    </Stack>
                    <LinearProgress variant="determinate" value={50} sx={{ height: 6, borderRadius: '3px', backgroundColor: alpha('#f59e0b', 0.1), '& .MuiLinearProgress-bar': { backgroundColor: '#f59e0b' } }} />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Dialog 
        open={commentDialogOpen} 
        onClose={() => setCommentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            background: theme.palette.mode === 'dark' ? '#1e293b' : '#ffffff',
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <CommentIcon /> เพิ่มความคิดเห็น
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="เขียนความคิดเห็นของคุณ..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCommentDialogOpen(false)}>ยกเลิก</Button>
          <Button 
            variant="contained" 
            startIcon={<Send />}
            onClick={() => {
              setCommentDialogOpen(false);
              setNewComment('');
            }}
          >
            ส่ง
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkPackageDetailModernEnhanced;
