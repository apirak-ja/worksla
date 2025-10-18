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
  Skeleton,
  Alert,
  List,
  ListItem,
  alpha,
  useTheme,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  IconButton,
  Fade,
  Zoom,
  Grow,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';
import {
  ArrowBack,
  Timeline,
  Info,
  Person,
  Schedule,
  Category as CategoryIcon,
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
  ErrorOutline,
  AccessTime,
  Edit,
  Share,
  MoreVert,
  Visibility,
  BookmarkBorder,
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
  TaskAlt,
  Groups,
  Speed,
  LocalOffer,
  Label,
  Bolt,
  Star,
  Domain,
  Computer,
  Apartment,
  Category,
  HistoryToggleOff,
  TrendingFlat,
  PlayArrow,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { wpApi } from '../../api/client';
import DOMPurify from 'dompurify';

const formatDurationText = (durationMs: number, options?: { suffix?: string; minimumUnit?: 'minute' | 'second' }) => {
  if (!Number.isFinite(durationMs) || durationMs < 0) {
    return '-';
  }

  const { suffix, minimumUnit = 'minute' } = options || {};
  const totalSeconds = Math.floor(durationMs / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (days > 0) {
    parts.push(`${days} วัน`);
  }
  if (hours > 0) {
    parts.push(`${hours} ชั่วโมง`);
  }
  if (minutes > 0 || (minimumUnit === 'minute' && parts.length === 0)) {
    parts.push(`${minutes} นาที`);
  }
  if (minimumUnit === 'second' && parts.length === 0) {
    parts.push(`${seconds} วินาที`);
  }

  const text = parts.join(' ');
  return suffix ? `${text} ${suffix}` : text;
};

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
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const WorkPackageDetailPro: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  const isDark = theme.palette.mode === 'dark';
  const pageBackground = isDark
    ? alpha(theme.palette.background.default, 0.96)
    : alpha(theme.palette.grey[50], 0.96);
  const surfacePaper = isDark
    ? alpha(theme.palette.background.paper, 0.78)
    : theme.palette.background.paper;
  const surfaceMuted = isDark
    ? alpha(theme.palette.background.paper, 0.6)
    : alpha(theme.palette.grey[100], 0.92);
  const borderColor = isDark
    ? alpha(theme.palette.common.white, 0.12)
    : alpha(theme.palette.grey[900], 0.08);
  const subtleShadow = isDark
    ? '0 24px 60px rgba(0,0,0,0.55)'
    : '0 24px 60px rgba(15,23,42,0.14)';
  const textMuted = isDark
    ? alpha(theme.palette.common.white, 0.7)
    : alpha(theme.palette.text.primary, 0.65);
  const accentGradient = isDark
    ? `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.25)} 0%, ${alpha(
        theme.palette.primary.main,
        0.35
      )} 100%)`
    : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.18)} 0%, ${alpha(
        theme.palette.primary.dark,
        0.12
      )} 100%)`;

  const wpId = parseInt(id || '0');

  const { data: wpDetail, isLoading, error } = useQuery({
    queryKey: ['workpackage', wpId],
    queryFn: () => wpApi.get(wpId).then((res) => res.data),
    enabled: !!wpId,
  });

  const { data: journals } = useQuery({
    queryKey: ['workpackage-journals', wpId],
    queryFn: async () => {
      if (!wpId) {
        return {
          wp_id: wpId,
          journals: [],
          total: 0,
          offset: 0,
          page_size: 0,
          has_more: false,
        };
      }

      const PAGE_SIZE = 50;
      const MAX_ITERATIONS = 20;

      let offset = 0;
      let allActivities: any[] = [];
      let hasMore = true;
      let iterations = 0;
      let latestMeta: Record<string, any> | null = null;

      while (hasMore && iterations < MAX_ITERATIONS) {
        const response = await wpApi.getJournals(wpId, { offset, page_size: PAGE_SIZE });
        const data = response?.data ?? {};
        const pageActivities = Array.isArray(data.journals) ? data.journals : [];

        allActivities = allActivities.concat(pageActivities);
        hasMore = Boolean(data.has_more);
        offset += PAGE_SIZE;
        iterations += 1;
        latestMeta = data;

        if (!hasMore) {
          break;
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
      };
    },
    enabled: !!wpId,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
  });

  // Activities array (always defined so hooks below run consistently)
  const activities = journals?.journals || [];

  // Sort activities from oldest to newest — keep as a hook so it runs on every render
  const chronologicalActivities = React.useMemo(() => {
    if (!Array.isArray(activities) || activities.length === 0) {
      return [];
    }

    const getActivityTimestamp = (entry: any): number => {
      if (!entry) return 0;

      const rawDate = entry.created_at || entry.createdAt || entry.created_on || entry.createdOn;
      if (rawDate) {
        const timestamp = Date.parse(rawDate);
        if (!Number.isNaN(timestamp)) return timestamp;
      }

      if (typeof entry.version === 'number') {
        return entry.version * 1000000000;
      }

      if (typeof entry.id === 'number') {
        return entry.id * 100000000;
      }

      return 0;
    };

    const sorted = [...activities].sort((a, b) => {
      return getActivityTimestamp(a) - getActivityTimestamp(b);
    });

    return sorted;
  }, [activities, wpId]);

  // Calculate status timeline from activities with correct duration calculation
  const statusTimeline = React.useMemo(() => {
    if (!wpDetail) {
      return [];
    }

    const wpData: any = wpDetail;
    const createdAt = wpData.created_at ? new Date(wpData.created_at) : null;

    type RawEntry = {
      status: string;
      enteredAt: Date;
      actor: string;
      activityId: number;
    };

    const entries: RawEntry[] = [];

    // Determine the initial status at creation time
    let initialStatus = wpData.status || 'New';
    const firstStatusChange = chronologicalActivities.find((activity: any) => {
      if (activity.details && Array.isArray(activity.details)) {
        return activity.details.some(
          (d: any) => (d.property === 'status' || d.property === 'Status') && d.new_value
        );
      }
      return false;
    });

    if (firstStatusChange) {
      const firstChange = firstStatusChange.details.find(
        (d: any) => d.property === 'status' || d.property === 'Status'
      );
      if (firstChange?.old_value) {
        initialStatus = firstChange.old_value;
      }
    }

    if (createdAt) {
      entries.push({
        status: initialStatus,
        enteredAt: createdAt,
        actor: wpData.author_name || 'System',
        activityId: -1,
      });
    }

    // Collect all subsequent status changes
    chronologicalActivities.forEach((activity: any) => {
      if (!activity?.details || !Array.isArray(activity.details)) {
        return;
      }

      const statusDetail = activity.details.find(
        (d: any) => d.property === 'status' || d.property === 'Status'
      );
      if (!statusDetail || !statusDetail.new_value) {
        return;
      }

      const enteredAt = activity.created_at ? new Date(activity.created_at) : new Date();
      entries.push({
        status: statusDetail.new_value,
        enteredAt,
        actor: activity.user_name || 'ไม่ระบุ',
        activityId: activity.id,
      });
    });

    if (entries.length === 0 && createdAt) {
      entries.push({
        status: wpData.status || 'ไม่ระบุ',
        enteredAt: createdAt,
        actor: wpData.author_name || 'System',
        activityId: -1,
      });
    }

    const sorted = entries.sort((a, b) => a.enteredAt.getTime() - b.enteredAt.getTime());

    const formatted = sorted.map((entry, index) => {
      const previous = sorted[index - 1];
      const next = sorted[index + 1];

      let transitionDurationMs: number | undefined;
      let transitionDurationText: string | undefined;
      let previousStatus: string | undefined;

      if (previous) {
        const diffPrev = entry.enteredAt.getTime() - previous.enteredAt.getTime();
        if (diffPrev >= 0) {
          transitionDurationMs = diffPrev;
          transitionDurationText = formatDurationText(diffPrev);
          previousStatus = previous.status;
        }
      }

      const referenceEnd = next ? next.enteredAt : new Date();
      const timeInStatusDiff = referenceEnd.getTime() - entry.enteredAt.getTime();

      const timeInStatusMs = timeInStatusDiff >= 0 ? timeInStatusDiff : undefined;
      const timeInStatusText =
        timeInStatusMs !== undefined
          ? formatDurationText(timeInStatusMs, { suffix: next ? '' : '(จนถึงปัจจุบัน)' })
          : undefined;

      return {
        activityId: entry.activityId,
        status: entry.status,
        enteredAt: entry.enteredAt,
        user: entry.actor,
        previousStatus,
        transitionDurationMs,
        transitionDurationText,
        timeInStatusMs,
        timeInStatusText,
        isCurrent: !next,
      };
    });

    return formatted;
  }, [chronologicalActivities, wpDetail]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (isLoading) {
    return (
      <Box sx={{ bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Stack spacing={3}>
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 4 }} />
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 4 }} />
          </Stack>
        </Container>
      </Box>
    );
  }

  if (error || !wpDetail) {
    return (
      <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', pt: 8 }}>
        <Container maxWidth="lg">
          <Alert severity="error" icon={<ErrorOutline />} sx={{ borderRadius: 3, p: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={1}>
              ไม่สามารถโหลดข้อมูลได้
            </Typography>
            <Typography>Work Package ID: {wpId} ไม่พบในระบบ</Typography>
          </Alert>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/workpackages')}
            variant="contained"
            sx={{ mt: 3, borderRadius: 3 }}
          >
            กลับไปยังรายการงาน
          </Button>
        </Container>
      </Box>
    );
  }

  const wp: any = wpDetail;


  // Status Configuration with modern colors
  const statusConfig: Record<
    string,
    {
      color: string;
      icon: any;
      label: string;
      bgColor: string;
      gradient: string;
    }
  > = {
    New: {
      color: '#3b82f6',
      icon: <FiberManualRecord />,
      label: 'งานใหม่',
      bgColor: '#eff6ff',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    รับเรื่อง: {
      color: '#06b6d4',
      icon: <CheckCircleRounded />,
      label: 'รับเรื่องแล้ว',
      bgColor: '#ecfeff',
      gradient: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
    },
    'กำลังดำเนินการ': {
      color: '#f59e0b',
      icon: <HourglassTop />,
      label: 'กำลังดำเนินการ',
      bgColor: '#fef3c7',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    },
    'ดำเนินการเสร็จ': {
      color: '#10b981',
      icon: <TaskAlt />,
      label: 'เสร็จสิ้น',
      bgColor: '#d1fae5',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    },
    'ปิดงาน': {
      color: '#6b7280',
      icon: <CheckCircle />,
      label: 'ปิดงาน',
      bgColor: '#f3f4f6',
      gradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
    },
  };

  const currentStatus = statusConfig[wp.status] || statusConfig['New'];

  const getPriorityConfig = (
    priority: string
  ): {
    color: string;
    icon: any;
    label: string;
  } => {
    const p = (priority || 'normal').toLowerCase();
    if (p.includes('high') || p.includes('สูง') || p.includes('urgent')) {
      return { color: '#ef4444', icon: <PriorityHigh />, label: priority };
    }
    if (p.includes('low') || p.includes('ต่ำ')) {
      return { color: '#10b981', icon: <Flag />, label: priority };
    }
    return { color: '#f59e0b', icon: <Flag />, label: priority };
  };

  const priorityConfig = getPriorityConfig(wp.priority);

  const totalComments = chronologicalActivities.filter(
    (a: any) => a.notes && a.notes.trim().length > 0
  ).length;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: pageBackground,
        transition: 'background-color 0.4s ease',
      }}
    >
      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
        <Stack spacing={{ xs: 4, md: 6 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={{ xs: 2, md: 3 }}
            alignItems={{ xs: 'flex-start', md: 'center' }}
            justifyContent="space-between"
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 1.5, sm: 2 }}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
            >
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate('/workpackages')}
                sx={{
                  borderRadius: 999,
                  px: 2.5,
                  fontWeight: 600,
                }}
              >
                กลับรายการงาน
              </Button>
              <Chip
                icon={<Assignment />}
                label={`WP #${wp.id || wp.wp_id}`}
                sx={{
                  fontWeight: 700,
                  height: 36,
                  borderRadius: 999,
                  bgcolor: alpha(theme.palette.primary.main, isDark ? 0.25 : 0.12),
                  color: theme.palette.primary.main,
                  '& .MuiChip-icon': {
                    color: theme.palette.primary.main,
                  },
                }}
              />
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              {[{ icon: <Edit />, tooltip: 'แก้ไขงาน' }, { icon: <MoreVert />, tooltip: 'เพิ่มเติม' }].map(
                (action, index) => (
                  <Tooltip key={index} title={action.tooltip} arrow>
                    <IconButton
                      sx={{
                        border: `1px solid ${borderColor}`,
                        bgcolor: surfaceMuted,
                        transition: 'all 0.25s ease',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.12),
                          color: theme.palette.primary.main,
                        },
                      }}
                    >
                      {action.icon}
                    </IconButton>
                  </Tooltip>
                )
              )}
            </Stack>
          </Stack>

          <Grow in timeout={500}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 4,
                position: 'relative',
                overflow: 'hidden',
                bgcolor: surfacePaper,
                border: `1px solid ${borderColor}`,
                boxShadow: subtleShadow,
                p: { xs: 3, md: 4 },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  inset: 0,
                  background: accentGradient,
                  opacity: isDark ? 0.25 : 0.18,
                  pointerEvents: 'none',
                },
              }}
            >
              <Stack spacing={{ xs: 3, md: 4 }} sx={{ position: 'relative', zIndex: 1 }}>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={{ xs: 2, md: 3 }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', md: 'center' }}
                >
                  <Stack direction="row" spacing={1.5} flexWrap="wrap" alignItems="center">
                    <Chip
                      icon={currentStatus.icon}
                      label={currentStatus.label}
                      sx={{
                        bgcolor: alpha(currentStatus.color, 0.15),
                        color: currentStatus.color,
                        fontWeight: 700,
                        borderRadius: 999,
                        '& .MuiChip-icon': {
                          color: currentStatus.color,
                        },
                      }}
                    />
                    <Chip
                      icon={priorityConfig.icon}
                      label={wp.priority || 'ไม่ระบุ'}
                      sx={{
                        bgcolor: alpha(priorityConfig.color, 0.15),
                        color: priorityConfig.color,
                        fontWeight: 700,
                        borderRadius: 999,
                        '& .MuiChip-icon': {
                          color: priorityConfig.color,
                        },
                      }}
                    />
                    {wp.category && (
                      <Chip
                        icon={<Label />}
                        label={wp.category}
                        sx={{
                          bgcolor: alpha(theme.palette.secondary.main, 0.12),
                          color: theme.palette.secondary.dark,
                          fontWeight: 700,
                          borderRadius: 999,
                          '& .MuiChip-icon': {
                            color: theme.palette.secondary.dark,
                          },
                        }}
                      />
                    )}
                  </Stack>

                  <Typography variant="body2" color={textMuted} fontWeight={500}>
                    อัปเดตล่าสุด:{' '}
                    {wp.updated_at
                      ? format(new Date(wp.updated_at), 'dd MMM yyyy HH:mm', { locale: th })
                      : 'ไม่ระบุ'}
                  </Typography>
                </Stack>

                <Box>
                  <Typography
                    variant="h3"
                    fontWeight={800}
                    sx={{
                      lineHeight: 1.25,
                      fontSize: { xs: '2rem', md: '2.5rem' },
                    }}
                  >
                    {wp.subject}
                  </Typography>
                  <Typography variant="body1" color={textMuted} sx={{ mt: 1.5 }}>
                    โครงการ {wp.project_name || 'ไม่ระบุ'} • หมวดงาน {wp.type || 'ไม่ระบุ'}
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  {(
                    [
                      {
                        icon: <Person fontSize="small" />,
                        label: 'ผู้รับผิดชอบ',
                        value: wp.assignee_name || 'ยังไม่ระบุ',
                      },
                      {
                        icon: <CalendarMonth fontSize="small" />,
                        label: 'สร้างเมื่อ',
                        value: wp.created_at
                          ? format(new Date(wp.created_at), 'dd MMM yyyy HH:mm', { locale: th })
                          : '-',
                      },
                      {
                        icon: <Update fontSize="small" />,
                        label: 'กิจกรรมทั้งหมด',
                        value: `${chronologicalActivities.length.toLocaleString()} รายการ`,
                      },
                      {
                        icon: <Comment fontSize="small" />,
                        label: 'ความคิดเห็น',
                        value: `${totalComments} รายการ`,
                      },
                    ] as const
                  ).map((metric, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2.5,
                          height: '100%',
                          borderRadius: 3,
                          borderColor,
                          bgcolor: surfaceMuted,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1,
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar
                            sx={{
                              bgcolor: alpha(theme.palette.primary.main, 0.15),
                              color: theme.palette.primary.main,
                              width: 36,
                              height: 36,
                            }}
                          >
                            {metric.icon}
                          </Avatar>
                          <Typography variant="subtitle2" color={textMuted} fontWeight={700}>
                            {metric.label}
                          </Typography>
                        </Stack>
                        <Typography variant="h6" fontWeight={800} sx={{ mt: 0.5 }}>
                          {metric.value}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            </Paper>
          </Grow>

          <Fade in timeout={650}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 5,
                overflow: 'hidden',
                bgcolor: surfacePaper,
                border: `1px solid ${borderColor}`,
                boxShadow: subtleShadow,
              }}
            >
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              sx={{
                borderBottom: '1px solid',
                borderColor: 'divider',
                px: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.02),
                '& .MuiTab-root': {
                  minHeight: 64,
                  fontWeight: 700,
                  fontSize: '1rem',
                  textTransform: 'none',
                  px: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: theme.palette.primary.main,
                    transform: 'translateY(-2px)',
                  },
                  '&.Mui-selected': {
                    color: theme.palette.primary.main,
                  },
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                },
              }}
            >
              <Tab icon={<Description />} label="รายละเอียด" iconPosition="start" />
              <Tab
                icon={
                  <Badge badgeContent={chronologicalActivities.length} color="error" max={99}>
                    <Timeline />
                  </Badge>
                }
                label="ประวัติกิจกรรม"
                iconPosition="start"
              />
            </Tabs>

            {/* Tab 1: Details */}
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ px: 4 }}>
                <Stack spacing={4}>
                  {/* Description */}
                  {wp.description && (
                    <Fade in timeout={600}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 4,
                          borderRadius: 4,
                          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                          border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                          <Avatar
                            sx={{
                              bgcolor: theme.palette.primary.main,
                              width: 48,
                              height: 48,
                            }}
                          >
                            <Description />
                          </Avatar>
                          <Typography variant="h5" fontWeight={800} color="primary">
                            📝 รายละเอียดงาน
                          </Typography>
                        </Stack>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 3,
                            bgcolor: 'white',
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <div
                            dangerouslySetInnerHTML={{
                              __html: DOMPurify.sanitize(wp.description || ''),
                            }}
                            style={{
                              lineHeight: 1.8,
                              color: '#374151',
                              fontSize: '1.05rem',
                            }}
                          />
                        </Paper>
                      </Paper>
                    </Fade>
                  )}

                  {/* Status Duration Cards */}
                  {statusTimeline.length > 0 && (
                    <Fade in timeout={500}>
                      <Box>
                        <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                          <Avatar
                            sx={{
                              bgcolor: '#f59e0b',
                              width: 48,
                              height: 48,
                            }}
                          >
                            <HistoryToggleOff />
                          </Avatar>
                          <Typography variant="h5" fontWeight={800} color="#92400e">
                            ⏱️ ระยะเวลาในแต่ละสถานะ
                          </Typography>
                        </Stack>

                        <Grid container spacing={3}>
                          {statusTimeline.map((item, index) => {
                            const toStatus = item.status || 'ไม่ระบุ';
                            const fromStatus = item.previousStatus || 'สร้างงาน';
                            const normalizedStatus = (toStatus || '').toLowerCase();
                            const isInitialEntry = item.activityId === -1 || !item.previousStatus;
                            const transitionText = item.transitionDurationText;
                            const timeInStatusText = item.timeInStatusText;
                            const enteredAt = item.enteredAt ? new Date(item.enteredAt) : null;
                            const displayUser = item.user || 'System';
                            const userInitial = displayUser.charAt(0).toUpperCase();

                            // Color based on destination status - Modern palette
                            let bgColor = '#6366f1';
                            let textColor = '#4f46e5';
                            let gradient = 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(79, 70, 229, 0.1) 100%)';

                            if (normalizedStatus.includes('new') || normalizedStatus.includes('ใหม่')) {
                              bgColor = '#6366f1';
                              textColor = '#4f46e5';
                              gradient = 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(79, 70, 229, 0.1) 100%)';
                            } else if (normalizedStatus.includes('รับเรื่อง')) {
                              bgColor = '#06b6d4';
                              textColor = '#0891b2';
                              gradient = 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(8, 145, 178, 0.1) 100%)';
                            } else if (normalizedStatus.includes('กำลังดำเนินการ')) {
                              bgColor = '#f59e0b';
                              textColor = '#d97706';
                              gradient = 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.1) 100%)';
                            } else if (normalizedStatus.includes('เสร็จ') || normalizedStatus.includes('ปิด')) {
                              bgColor = '#10b981';
                              textColor = '#059669';
                              gradient = 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)';
                            }

                            return (
                              <Grid item xs={12} sm={6} lg={4} key={index}>
                                <Zoom in timeout={400 + index * 100}>
                                  <Paper
                                    elevation={0}
                                    sx={{
                                      p: 3.5,
                                      borderRadius: 4,
                                      background: gradient,
                                      border: `2px solid ${alpha(bgColor, 0.3)}`,
                                      position: 'relative',
                                      overflow: 'hidden',
                                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                      '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '4px',
                                        background: `linear-gradient(90deg, ${bgColor} 0%, ${alpha(bgColor, 0.5)} 100%)`,
                                      },
                                      '&:hover': {
                                        borderColor: bgColor,
                                        boxShadow: `0 20px 40px ${alpha(bgColor, 0.25)}, inset 0 0 0 1px ${alpha(bgColor, 0.1)}`,
                                        transform: 'translateY(-6px) scale(1.02)',
                                      },
                                    }}
                                  >
                                    <Stack spacing={2.5}>
                                      {/* Status Transition with Icon */}
                                      <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
                                        {item.previousStatus ? (
                                          <>
                                            <Chip
                                              label={fromStatus}
                                              size="small"
                                              sx={{
                                                bgcolor: 'rgba(255, 255, 255, 0.8)',
                                                color: textColor,
                                                fontWeight: 700,
                                                border: `1px solid ${alpha(bgColor, 0.2)}`,
                                                fontSize: '0.8rem',
                                              }}
                                            />
                                            <Box sx={{ color: bgColor, display: 'flex', alignItems: 'center' }}>
                                              <TrendingFlat sx={{ fontSize: 24 }} />
                                            </Box>
                                          </>
                                        ) : (
                                          <Chip
                                            label="เริ่มต้น"
                                            size="small"
                                            sx={{
                                              bgcolor: 'rgba(255, 255, 255, 0.8)',
                                              color: textColor,
                                              fontWeight: 700,
                                              border: `1px solid ${alpha(bgColor, 0.2)}`,
                                              fontSize: '0.8rem',
                                            }}
                                          />
                                        )}
                                        {!item.previousStatus && (
                                          <Box sx={{ color: bgColor, display: 'flex', alignItems: 'center' }}>
                                            <PlayArrow sx={{ fontSize: 20 }} />
                                          </Box>
                                        )}
                                        <Chip
                                          label={toStatus}
                                          sx={{
                                            bgcolor: bgColor,
                                            color: 'white',
                                            fontWeight: 800,
                                            fontSize: '0.85rem',
                                            height: 32,
                                            border: `2px solid ${alpha(bgColor, 0.3)}`,
                                            boxShadow: `0 4px 12px ${alpha(bgColor, 0.3)}`,
                                          }}
                                        />
                                        {item.isCurrent && (
                                          <Chip
                                            label="สถานะปัจจุบัน"
                                            size="small"
                                            sx={{
                                              bgcolor: alpha(bgColor, 0.2),
                                              color: textColor,
                                              fontWeight: 700,
                                              border: `1px solid ${alpha(bgColor, 0.2)}`,
                                            }}
                                          />
                                        )}
                                      </Stack>

                                      <Divider sx={{ borderColor: alpha(bgColor, 0.15) }} />

                                      {/* Duration Display - Prominent */}
                                      <Box
                                        sx={{
                                          textAlign: 'center',
                                          py: 2,
                                          px: 2,
                                          bgcolor: 'rgba(255, 255, 255, 0.5)',
                                          borderRadius: 2,
                                          border: `1px solid ${alpha(bgColor, 0.1)}`,
                                        }}
                                      >
                                        <Stack spacing={0.75} alignItems="center">
                                          <Stack direction="row" alignItems="center" spacing={1}>
                                            <AccessTime sx={{ color: bgColor, fontSize: 22 }} />
                                            <Typography
                                              variant="body2"
                                              fontWeight={700}
                                              sx={{ color: textColor, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.75rem' }}
                                            >
                                              เวลาที่อยู่ในสถานะนี้
                                            </Typography>
                                          </Stack>
                                          <Typography variant="h5" fontWeight={900} sx={{ color: textColor }}>
                                            {timeInStatusText || 'กำลังคำนวณ...'}
                                          </Typography>
                                          {transitionText ? (
                                            <Typography variant="caption" sx={{ color: textColor, opacity: 0.85 }}>
                                              จากสถานะ {fromStatus} หลัง {transitionText}
                                            </Typography>
                                          ) : (
                                            <Typography variant="caption" sx={{ color: textColor, opacity: 0.85 }}>
                                              {isInitialEntry ? 'จุดเริ่มต้นของงาน' : 'ไม่มีข้อมูลเวลาเดิม'}
                                            </Typography>
                                          )}
                                        </Stack>
                                      </Box>

                                      <Divider sx={{ borderColor: alpha(bgColor, 0.15) }} />

                                      {/* User and Timestamp */}
                                      <Stack spacing={1.5}>
                                        <Stack direction="row" alignItems="center" spacing={1.5}>
                                          <Avatar
                                            sx={{
                                              bgcolor: alpha(bgColor, 0.15),
                                              color: bgColor,
                                              width: 32,
                                              height: 32,
                                              fontSize: '0.9rem',
                                              fontWeight: 800,
                                            }}
                                          >
                                            {userInitial || '?'}
                                          </Avatar>
                                          <Box>
                                            <Typography variant="body2" fontWeight={700} sx={{ color: textColor }}>
                                              {displayUser}
                                            </Typography>
                                            {enteredAt && (
                                              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                                                {format(enteredAt, 'dd/MM/yyyy HH:mm', { locale: th })}
                                              </Typography>
                                            )}
                                          </Box>
                                        </Stack>
                                      </Stack>
                                    </Stack>
                                  </Paper>
                                </Zoom>
                              </Grid>
                            );
                          })}
                        </Grid>
                      </Box>
                    </Fade>
                  )}

                  {/* Information Table - Ultra Modern */}
                  <Fade in timeout={800}>
                    <Box>
                      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar sx={{ 
                            bgcolor: 'transparent',
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            width: 52, 
                            height: 52,
                            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
                          }}>
                            <Category sx={{ fontSize: 28 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="h4" fontWeight={900} sx={{ 
                              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                              backgroundClip: 'text',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                            }}>
                              ข้อมูลรายละเอียด
                            </Typography>
                            <Typography variant="body2" color="text.secondary" fontWeight={600}>
                              รายละเอียดครบถ้วนของงาน
                            </Typography>
                          </Box>
                        </Stack>
                      </Stack>

                      <TableContainer
                        component={Paper}
                        elevation={0}
                        sx={{
                          borderRadius: 4,
                          border: `1px solid ${alpha('#6366f1', 0.15)}`,
                          overflow: 'hidden',
                          bgcolor: 'rgba(255, 255, 255, 0.8)',
                          backdropFilter: 'blur(10px)',
                        }}
                      >
                        <Table>
                          <TableBody>
                            {/* Basic Information Section */}
                            <TableRow sx={{ bgcolor: alpha('#3b82f6', 0.1) }}>
                              <TableCell
                                colSpan={2}
                                sx={{
                                  borderBottom: `3px solid ${alpha('#3b82f6', 0.3)}`,
                                  py: 2,
                                }}
                              >
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                  <Avatar sx={{ bgcolor: '#3b82f6', width: 36, height: 36 }}>
                                    <Category />
                                  </Avatar>
                                  <Typography variant="h6" fontWeight={800} color="#1e40af">
                                    ข้อมูลพื้นฐาน
                                  </Typography>
                                </Stack>
                              </TableCell>
                            </TableRow>
                            {wp.type && (
                              <TableRow sx={{ '&:hover': { bgcolor: alpha('#3b82f6', 0.05) } }}>
                                <TableCell sx={{ width: '35%', fontWeight: 700, color: 'text.secondary' }}>
                                  📋 ประเภท
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#1e40af' }}>
                                  {wp.type}
                                </TableCell>
                              </TableRow>
                            )}
                            {wp.priority && (
                              <TableRow sx={{ '&:hover': { bgcolor: alpha('#3b82f6', 0.05) } }}>
                                <TableCell sx={{ width: '35%', fontWeight: 700, color: 'text.secondary' }}>
                                  🎯 ระดับความสำคัญ
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    icon={priorityConfig.icon}
                                    label={wp.priority}
                                    sx={{
                                      bgcolor: alpha(priorityConfig.color, 0.15),
                                      color: priorityConfig.color,
                                      fontWeight: 800,
                                      border: `2px solid ${alpha(priorityConfig.color, 0.3)}`,
                                    }}
                                  />
                                </TableCell>
                              </TableRow>
                            )}
                            {wp.category && (
                              <TableRow sx={{ '&:hover': { bgcolor: alpha('#3b82f6', 0.05) } }}>
                                <TableCell sx={{ width: '35%', fontWeight: 700, color: 'text.secondary' }}>
                                  🏷️ Category
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={wp.category}
                                    sx={{
                                      bgcolor: alpha('#8b5cf6', 0.1),
                                      color: '#5b21b6',
                                      fontWeight: 700,
                                      border: `1px solid ${alpha('#8b5cf6', 0.3)}`,
                                    }}
                                  />
                                </TableCell>
                              </TableRow>
                            )}

                            {/* Contact Information Section */}
                            <TableRow sx={{ bgcolor: alpha('#ec4899', 0.1) }}>
                              <TableCell
                                colSpan={2}
                                sx={{
                                  borderBottom: `3px solid ${alpha('#ec4899', 0.3)}`,
                                  borderTop: `3px solid ${alpha('#3b82f6', 0.2)}`,
                                  py: 2,
                                }}
                              >
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                  <Avatar sx={{ bgcolor: '#ec4899', width: 36, height: 36 }}>
                                    <ContactPhone />
                                  </Avatar>
                                  <Typography variant="h6" fontWeight={800} color="#9f1239">
                                    ข้อมูลการติดต่อ
                                  </Typography>
                                </Stack>
                              </TableCell>
                            </TableRow>
                            {wp.customField12 && (
                              <TableRow sx={{ '&:hover': { bgcolor: alpha('#ec4899', 0.05) } }}>
                                <TableCell sx={{ width: '35%', fontWeight: 700, color: 'text.secondary' }}>
                                  📞 ผู้แจ้ง-ติดต่อกลับ
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#9f1239' }}>
                                  {wp.customField12}
                                </TableCell>
                              </TableRow>
                            )}
                            {wp.customField10 && (
                              <TableRow sx={{ '&:hover': { bgcolor: alpha('#ec4899', 0.05) } }}>
                                <TableCell sx={{ width: '35%', fontWeight: 700, color: 'text.secondary' }}>
                                  👨 แจ้งโดย
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#9f1239' }}>
                                  {wp.customField10}
                                </TableCell>
                              </TableRow>
                            )}
                            {wp.author_name && (
                              <TableRow sx={{ '&:hover': { bgcolor: alpha('#ec4899', 0.05) } }}>
                                <TableCell sx={{ width: '35%', fontWeight: 700, color: 'text.secondary' }}>
                                  ✍️ ผู้สร้างงาน
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#9f1239' }}>
                                  {wp.author_name}
                                </TableCell>
                              </TableRow>
                            )}

                            {/* Location Information Section */}
                            <TableRow sx={{ bgcolor: alpha('#10b981', 0.1) }}>
                              <TableCell
                                colSpan={2}
                                sx={{
                                  borderBottom: `3px solid ${alpha('#10b981', 0.3)}`,
                                  borderTop: `3px solid ${alpha('#ec4899', 0.2)}`,
                                  py: 2,
                                }}
                              >
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                  <Avatar sx={{ bgcolor: '#10b981', width: 36, height: 36 }}>
                                    <LocationOn />
                                  </Avatar>
                                  <Typography variant="h6" fontWeight={800} color="#065f46">
                                    ข้อมูลสถานที่
                                  </Typography>
                                </Stack>
                              </TableCell>
                            </TableRow>
                            {wp.customField1 && (
                              <TableRow sx={{ '&:hover': { bgcolor: alpha('#10b981', 0.05) } }}>
                                <TableCell sx={{ width: '35%', fontWeight: 700, color: 'text.secondary' }}>
                                  📍 สถานที่ตั้ง
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#065f46' }}>
                                  {wp.customField1}
                                </TableCell>
                              </TableRow>
                            )}
                            {wp.customField5 && (
                              <TableRow sx={{ '&:hover': { bgcolor: alpha('#10b981', 0.05) } }}>
                                <TableCell sx={{ width: '35%', fontWeight: 700, color: 'text.secondary' }}>
                                  🏢 หน่วยงานที่ตั้ง
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#065f46' }}>
                                  {wp.customField5}
                                </TableCell>
                              </TableRow>
                            )}
                            {wp.customField3 && (
                              <TableRow sx={{ '&:hover': { bgcolor: alpha('#10b981', 0.05) } }}>
                                <TableCell sx={{ width: '35%', fontWeight: 700, color: 'text.secondary' }}>
                                  💻 ประเภทงาน-คอมฮาร์ดแวร์
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#065f46' }}>
                                  {wp.customField3}
                                </TableCell>
                              </TableRow>
                            )}
                            {wp.project_name && (
                              <TableRow sx={{ '&:hover': { bgcolor: alpha('#10b981', 0.05) } }}>
                                <TableCell sx={{ width: '35%', fontWeight: 700, color: 'text.secondary' }}>
                                  📁 โครงการ
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#065f46' }}>
                                  {wp.project_name}
                                </TableCell>
                              </TableRow>
                            )}

                            {/* Schedule Section */}
                            <TableRow sx={{ bgcolor: alpha('#f59e0b', 0.1) }}>
                              <TableCell
                                colSpan={2}
                                sx={{
                                  borderBottom: `3px solid ${alpha('#f59e0b', 0.3)}`,
                                  borderTop: `3px solid ${alpha('#10b981', 0.2)}`,
                                  py: 2,
                                }}
                              >
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                  <Avatar sx={{ bgcolor: '#f59e0b', width: 36, height: 36 }}>
                                    <Schedule />
                                  </Avatar>
                                  <Typography variant="h6" fontWeight={800} color="#92400e">
                                    กำหนดการ
                                  </Typography>
                                </Stack>
                              </TableCell>
                            </TableRow>
                            {wp.customField11 && (
                              <TableRow sx={{ '&:hover': { bgcolor: alpha('#f59e0b', 0.05) } }}>
                                <TableCell sx={{ width: '35%', fontWeight: 700, color: 'text.secondary' }}>
                                  📅 วันที่ต้องการ
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#92400e' }}>
                                  {wp.customField11}
                                </TableCell>
                              </TableRow>
                            )}
                            {wp.customField9 && (
                              <TableRow sx={{ '&:hover': { bgcolor: alpha('#f59e0b', 0.05) } }}>
                                <TableCell sx={{ width: '35%', fontWeight: 700, color: 'text.secondary' }}>
                                  ⚡ ความเร่งด่วน
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    icon={<Bolt />}
                                    label={wp.customField9}
                                    sx={{
                                      bgcolor: wp.customField9?.toLowerCase().includes('ด่วน') ? '#ef4444' : '#f59e0b',
                                      color: 'white',
                                      fontWeight: 800,
                                    }}
                                  />
                                </TableCell>
                              </TableRow>
                            )}
                            {wp.start_date && (
                              <TableRow sx={{ '&:hover': { bgcolor: alpha('#f59e0b', 0.05) } }}>
                                <TableCell sx={{ width: '35%', fontWeight: 700, color: 'text.secondary' }}>
                                  🚀 วันที่เริ่ม
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#92400e' }}>
                                  {format(new Date(wp.start_date), 'dd MMMM yyyy', { locale: th })}
                                </TableCell>
                              </TableRow>
                            )}
                            {wp.due_date && (
                              <TableRow sx={{ '&:hover': { bgcolor: alpha('#f59e0b', 0.05) } }}>
                                <TableCell sx={{ width: '35%', fontWeight: 700, color: 'text.secondary' }}>
                                  🏁 กำหนดเสร็จ (Finish date)
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#92400e' }}>
                                  {format(new Date(wp.due_date), 'dd MMMM yyyy', { locale: th })}
                                </TableCell>
                              </TableRow>
                            )}

                            {/* Assignment Section */}
                            <TableRow sx={{ bgcolor: alpha('#0ea5e9', 0.1) }}>
                              <TableCell
                                colSpan={2}
                                sx={{
                                  borderBottom: `3px solid ${alpha('#0ea5e9', 0.3)}`,
                                  borderTop: `3px solid ${alpha('#f59e0b', 0.2)}`,
                                  py: 2,
                                }}
                              >
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                  <Avatar sx={{ bgcolor: '#0ea5e9', width: 36, height: 36 }}>
                                    <Groups />
                                  </Avatar>
                                  <Typography variant="h6" fontWeight={800} color="#075985">
                                    ผู้รับผิดชอบ
                                  </Typography>
                                </Stack>
                              </TableCell>
                            </TableRow>
                            <TableRow sx={{ '&:hover': { bgcolor: alpha('#0ea5e9', 0.05) } }}>
                              <TableCell sx={{ width: '35%', fontWeight: 700, color: 'text.secondary' }}>
                                👤 ผู้รับผิดชอบหลัก
                              </TableCell>
                              <TableCell>
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                  <Avatar
                                    sx={{
                                      bgcolor: '#0ea5e9',
                                      width: 40,
                                      height: 40,
                                      fontSize: '1.2rem',
                                      fontWeight: 900,
                                    }}
                                  >
                                    {wp.assignee_name?.charAt(0) || '?'}
                                  </Avatar>
                                  <Typography variant="body1" fontWeight={700} color="#075985">
                                    {wp.assignee_name || 'ยังไม่ได้มอบหมาย'}
                                  </Typography>
                                </Stack>
                              </TableCell>
                            </TableRow>

                            {/* Dates Section */}
                            <TableRow sx={{ bgcolor: alpha('#8b5cf6', 0.1) }}>
                              <TableCell
                                colSpan={2}
                                sx={{
                                  borderBottom: `3px solid ${alpha('#8b5cf6', 0.3)}`,
                                  borderTop: `3px solid ${alpha('#0ea5e9', 0.2)}`,
                                  py: 2,
                                }}
                              >
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                  <Avatar sx={{ bgcolor: '#8b5cf6', width: 36, height: 36 }}>
                                    <AccessTime />
                                  </Avatar>
                                  <Typography variant="h6" fontWeight={800} color="#5b21b6">
                                    ข้อมูลวันที่
                                  </Typography>
                                </Stack>
                              </TableCell>
                            </TableRow>
                            {wp.created_at && (
                              <TableRow sx={{ '&:hover': { bgcolor: alpha('#8b5cf6', 0.05) } }}>
                                <TableCell sx={{ width: '35%', fontWeight: 700, color: 'text.secondary' }}>
                                  📝 วันที่สร้าง
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#5b21b6' }}>
                                  {format(new Date(wp.created_at), 'dd MMMM yyyy HH:mm', { locale: th })}
                                </TableCell>
                              </TableRow>
                            )}
                            {wp.updated_at && (
                              <TableRow sx={{ '&:hover': { bgcolor: alpha('#8b5cf6', 0.05) } }}>
                                <TableCell sx={{ width: '35%', fontWeight: 700, color: 'text.secondary' }}>
                                  🔄 วันที่อัปเดตล่าสุด
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#5b21b6' }}>
                                  {format(new Date(wp.updated_at), 'dd MMMM yyyy HH:mm', { locale: th })}
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </Fade>
                </Stack>
              </Box>
            </TabPanel>

            {/* Tab 2: Activities */}
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ px: 4 }}>
                {chronologicalActivities.length > 0 ? (
                  <List sx={{ width: '100%' }}>
                    {chronologicalActivities.map((activity: any, index: number) => {
                      const activityDate = activity.created_at ? new Date(activity.created_at) : null;
                      const hasComment = activity.notes && activity.notes.trim().length > 0;
                      const hasChanges = activity.details && activity.details.length > 0;

                      return (
                        <Zoom in key={activity.id || index} timeout={300 + index * 50}>
                          <ListItem
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
                                borderRadius: 4,
                                border: `3px solid ${
                                  hasComment
                                    ? alpha(theme.palette.warning.main, 0.3)
                                    : alpha(theme.palette.primary.main, 0.3)
                                }`,
                                background: hasComment
                                  ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
                                  : 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'translateX(10px)',
                                  boxShadow: `0 12px 30px ${alpha(
                                    hasComment ? theme.palette.warning.main : theme.palette.primary.main,
                                    0.3
                                  )}`,
                                },
                                '&::before': {
                                  content: '""',
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: 6,
                                  height: '100%',
                                  bgcolor: hasComment ? 'warning.main' : 'primary.main',
                                },
                              }}
                            >
                              {/* Activity Header */}
                              <Stack direction="row" alignItems="center" spacing={3} mb={3}>
                                <Avatar
                                  sx={{
                                    bgcolor: hasComment ? '#f59e0b' : '#3b82f6',
                                    width: 56,
                                    height: 56,
                                    boxShadow: `0 4px 12px ${alpha(
                                      hasComment ? '#f59e0b' : '#3b82f6',
                                      0.4
                                    )}`,
                                  }}
                                >
                                  {hasComment ? <Comment /> : <Update />}
                                </Avatar>
                                <Box flex={1}>
                                  <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={2}
                                    flexWrap="wrap"
                                  >
                                    <Typography variant="h6" fontWeight={900}>
                                      {activity.user_name || 'ไม่ระบุ'}
                                    </Typography>
                                    <Chip
                                      label={`กิจกรรม #${index + 1}`}
                                      size="small"
                                      sx={{
                                        height: 28,
                                        fontWeight: 800,
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                      }}
                                    />
                                    {activityDate && (
                                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                        📅 {format(activityDate, 'dd/MM/yyyy HH:mm', { locale: th })}
                                      </Typography>
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
                                    bgcolor: 'rgba(255,255,255,0.7)',
                                    borderLeft: '4px solid #f59e0b',
                                    borderRadius: 2,
                                  }}
                                >
                                  <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                                    <Comment fontSize="small" sx={{ color: '#f59e0b' }} />
                                    <Typography variant="subtitle2" fontWeight={800} color="#92400e">
                                      💬 ความคิดเห็น
                                    </Typography>
                                  </Stack>
                                  <Typography
                                    variant="body1"
                                    sx={{
                                      whiteSpace: 'pre-wrap',
                                      lineHeight: 1.7,
                                      color: '#374151',
                                      fontWeight: 500,
                                    }}
                                  >
                                    {activity.notes}
                                  </Typography>
                                </Box>
                              )}

                              {/* Changes */}
                              {hasChanges && (
                                <Box>
                                  <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                                    <Update fontSize="small" color="primary" />
                                    <Typography variant="subtitle1" fontWeight={800}>
                                      🔄 การเปลี่ยนแปลง ({activity.details.length} รายการ)
                                    </Typography>
                                  </Stack>
                                  <Grid container spacing={2}>
                                    {activity.details.map((detail: any, i: number) => {
                                      // Find matching status change in timeline to get duration
                                      const isStatusChange = detail.property === 'status' || detail.property === 'Status';
                                      const matchingTimeline = isStatusChange
                                        ? statusTimeline.find((t) => t.activityId === activity.id)
                                        : null;
                                      const timelinePreviousStatus = matchingTimeline?.previousStatus || 'เริ่มต้น';
                                      const timelineTransitionText = matchingTimeline?.transitionDurationText || 'ไม่พบข้อมูลเวลาเดิม';
                                      const timelineTimeInStatusText = matchingTimeline?.timeInStatusText;

                                      return (
                                        <Grid item xs={12} sm={isStatusChange ? 12 : 6} key={i}>
                                          <Paper
                                            elevation={0}
                                            sx={{
                                              p: 2.5,
                                              bgcolor: isStatusChange 
                                                ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)'
                                                : 'rgba(255,255,255,0.7)',
                                              border: `2px solid ${isStatusChange ? alpha('#6366f1', 0.3) : alpha(theme.palette.primary.main, 0.2)}`,
                                              borderRadius: 2,
                                              transition: 'all 0.3s ease',
                                              '&:hover': {
                                                transform: 'scale(1.02)',
                                                borderColor: isStatusChange ? '#6366f1' : theme.palette.primary.main,
                                                boxShadow: isStatusChange 
                                                  ? '0 8px 24px rgba(99, 102, 241, 0.2)'
                                                  : '0 4px 12px rgba(0, 0, 0, 0.1)',
                                              },
                                            }}
                                          >
                                            <Stack spacing={1.5}>
                                              <Stack direction="row" alignItems="center" justifyContent="space-between">
                                                <Typography variant="subtitle2" fontWeight={900} sx={{ color: isStatusChange ? '#6366f1' : 'text.primary' }}>
                                                  {detail.property}
                                                  {isStatusChange && ' 🎯'}
                                                </Typography>
                                                {isStatusChange && matchingTimeline && (
                                                  <Chip
                                                    icon={<AccessTime sx={{ fontSize: 16 }} />}
                                                    label={timelineTransitionText}
                                                    size="small"
                                                    sx={{
                                                      bgcolor: alpha('#6366f1', 0.15),
                                                      color: '#6366f1',
                                                      fontWeight: 800,
                                                      fontSize: '0.75rem',
                                                      height: 26,
                                                      border: `1px solid ${alpha('#6366f1', 0.3)}`,
                                                      '& .MuiChip-icon': { color: '#6366f1' },
                                                    }}
                                                  />
                                                )}
                                              </Stack>
                                              <Stack
                                                direction="row"
                                                alignItems="center"
                                                spacing={1}
                                                flexWrap="wrap"
                                              >
                                                {detail.old_value && (
                                                  <>
                                                    <Chip
                                                      label={detail.old_value}
                                                      size="small"
                                                      sx={{
                                                        bgcolor: alpha('#ef4444', 0.15),
                                                        color: '#ef4444',
                                                        fontWeight: 700,
                                                        border: '1px solid',
                                                        borderColor: alpha('#ef4444', 0.3),
                                                      }}
                                                    />
                                                    <Typography variant="body2" fontWeight={900} sx={{ color: isStatusChange ? '#6366f1' : 'text.primary' }}>
                                                      →
                                                    </Typography>
                                                  </>
                                                )}
                                                <Chip
                                                  label={detail.new_value || 'ไม่มี'}
                                                  size="small"
                                                  sx={{
                                                    bgcolor: alpha('#10b981', 0.15),
                                                    color: '#10b981',
                                                    fontWeight: 700,
                                                    border: '1px solid',
                                                    borderColor: alpha('#10b981', 0.3),
                                                  }}
                                                />
                                              </Stack>
                                              {isStatusChange && matchingTimeline && (
                                                <Box
                                                  sx={{
                                                    mt: 1,
                                                    pt: 1.5,
                                                    borderTop: `1px solid ${alpha('#6366f1', 0.2)}`,
                                                  }}
                                                >
                                                  <Stack spacing={0.5}>
                                                    <Typography
                                                      variant="caption"
                                                      sx={{ color: '#6366f1', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}
                                                    >
                                                      ⏱️ สถานะ {timelinePreviousStatus} ใช้เวลา: {timelineTransitionText}
                                                    </Typography>
                                                    {timelineTimeInStatusText && (
                                                      <Typography variant="caption" sx={{ color: '#6366f1', fontWeight: 600, opacity: 0.85 }}>
                                                        อยู่ในสถานะใหม่ {timelineTimeInStatusText}
                                                      </Typography>
                                                    )}
                                                  </Stack>
                                                </Box>
                                              )}
                                            </Stack>
                                          </Paper>
                                        </Grid>
                                      );
                                    })}
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
                        </Zoom>
                      );
                    })}
                  </List>
                ) : (
                  <Alert severity="info" icon={<Timeline />} sx={{ borderRadius: 3, p: 4 }}>
                    <Typography variant="h6" fontWeight={700} mb={1}>
                      ยังไม่มีประวัติกิจกรรม
                    </Typography>
                    <Typography>เมื่อมีการอัปเดตหรือแสดงความคิดเห็น จะแสดงที่นี่</Typography>
                  </Alert>
                )}
              </Box>
            </TabPanel>
          </Card>
        </Fade>
      </Stack>
      </Container>
    </Box>
  );
};

export default WorkPackageDetailPro;
