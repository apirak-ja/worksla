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

// ===== TIME-IN-STATUS CALCULATION UTILITIES (BY NEIGHBOR ACTIVITIES) =====

/**
 * Type for any activity with flexible field names
 */
type AnyActivity = {
  id?: number | string;
  version?: number;
  created_at?: string;
  createdAt?: string;
  created_on?: string;
  createdOn?: string;
  details?: Array<{
    property?: string;
    name?: string;
    from?: any;
    to?: any;
    old_value?: any;
    new_value?: any;
  }>;
  notes?: string | null;
  user_name?: string;
};

/**
 * Interface for status span calculated by neighbor activities
 */
interface StatusSpan {
  index: number;         // index ของ activity ที่เป็นตัว "จบช่วง" (activity i)
  startTs: number;       // time(activity i-1) in ms
  endTs: number;         // time(activity i) in ms
  durationMs: number;    // end - start
  fromStatus: string;    // จาก activity i (from)
  toStatus: string;      // จาก activity i (to)
}

/**
 * Duration formatter with Thai locale
 * @param ms - Duration in milliseconds
 * @returns Formatted string like "2 วัน 3 ชม. 15 นาที"
 */
const formatDuration = (ms: number): string => {
  if (!Number.isFinite(ms) || ms < 0) {
    return '-';
  }

  if (ms < 60000) {
    return 'น้อยกว่าหนึ่งนาที';
  }

  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} วัน`);
  if (hours > 0) parts.push(`${hours} ชม.`);
  if (minutes > 0) parts.push(`${minutes} นาที`);

  return parts.join(' ');
};

/**
 * Get timestamp from activity (supports multiple field names)
 * @param a - Activity object
 * @returns Epoch time in milliseconds
 */
const getTs = (a: AnyActivity): number => {
  if (!a) return 0;

  const rawDate = a.created_at || a.createdAt || a.created_on || a.createdOn;
  if (rawDate) {
    const timestamp = Date.parse(rawDate);
    if (!Number.isNaN(timestamp)) return timestamp;
  }

  // Fallback to version or id
  if (typeof a.version === 'number') {
    return a.version * 1000000000;
  }
  if (typeof a.id === 'number') {
    return a.id * 100000000;
  }

  return 0;
};

/**
 * Extract status name from various formats
 * @param v - Status value (can be object, string, or number)
 * @returns Status name as string
 */
const pickName = (v: any): string => {
  if (!v) return '';
  if (typeof v === 'string') return v.trim();
  if (typeof v === 'number') return String(v);
  if (typeof v === 'object' && v.name) return String(v.name).trim();
  return String(v).trim();
};

/**
 * Extract status change from activity details
 * @param a - Activity object
 * @returns Status change info or null
 */
const getStatusChange = (a: AnyActivity): { fromStatus: string; toStatus: string } | null => {
  if (!a?.details || !Array.isArray(a.details)) {
    return null;
  }

  const statusDetail = a.details.find(
    (d) => d.property === 'status' || d.property === 'Status' || d.name === 'status' || d.name === 'Status'
  );

  if (!statusDetail) {
    return null;
  }

  // Support both old_value/new_value and from/to
  const fromRaw = statusDetail.old_value ?? statusDetail.from;
  const toRaw = statusDetail.new_value ?? statusDetail.to;

  if (!toRaw) {
    return null;
  }

  return {
    fromStatus: pickName(fromRaw),
    toStatus: pickName(toRaw),
  };
};

/**
 * Extract "Created" time from activities or work package
 * @param activitiesAsc - Activities sorted oldest to newest
 * @param wpDetail - Work package detail object
 * @returns Epoch time in ms for "New (Created)" or 0 if unavailable
 */
const extractCreatedTime = (activitiesAsc: AnyActivity[], wpDetail: any): number => {
  // Try first activity
  if (activitiesAsc && activitiesAsc.length > 0) {
    const firstTs = getTs(activitiesAsc[0]);
    if (firstTs > 0) return firstTs;
  }

  // Fallback to work package created_at
  if (wpDetail?.created_at) {
    const ts = Date.parse(wpDetail.created_at);
    if (!Number.isNaN(ts)) return ts;
  }

  return 0;
};

/**
 * Compute status spans using neighbor activities formula:
 * Each status span = time(activity i) - time(activity i-1)
 * 
 * @param activitiesAsc - Activities sorted oldest to newest
 * @returns Array of status spans
 */
const computeStatusSpansByNeighbor = (activitiesAsc: AnyActivity[]): StatusSpan[] => {
  const spans: StatusSpan[] = [];

  if (!activitiesAsc || activitiesAsc.length < 2) {
    return spans;
  }

  // Loop from i=1 to N-1
  for (let i = 1; i < activitiesAsc.length; i++) {
    const currentActivity = activitiesAsc[i];
    const change = getStatusChange(currentActivity);

    if (!change) {
      continue; // Not a status-changed activity
    }

    const prevActivity = activitiesAsc[i - 1];
    const startTs = getTs(prevActivity);
    const endTs = getTs(currentActivity);

    // Skip if timestamps are invalid or negative duration
    if (startTs <= 0 || endTs <= 0 || endTs < startTs) {
      continue;
    }

    const durationMs = Math.max(0, endTs - startTs);

    spans.push({
      index: i,
      startTs,
      endTs,
      durationMs,
      fromStatus: change.fromStatus,
      toStatus: change.toStatus,
    });
  }

  return spans;
};

/**
 * Compute tail span (optional) - time from last activity to now/updated_at
 * @param activitiesAsc - Activities sorted oldest to newest
 * @param endRefMs - Reference end time (now or updated_at)
 * @returns Tail span or null
 */
const computeTailSpan = (
  activitiesAsc: AnyActivity[],
  endRefMs: number
): { durationMs: number; status: string } | null => {
  if (!activitiesAsc || activitiesAsc.length === 0) {
    return null;
  }

  const lastActivity = activitiesAsc[activitiesAsc.length - 1];
  const lastChange = getStatusChange(lastActivity);

  if (!lastChange) {
    return null; // Last activity is not a status change
  }

  const lastTs = getTs(lastActivity);
  if (lastTs <= 0 || endRefMs <= lastTs) {
    return null;
  }

  const durationMs = Math.max(0, endRefMs - lastTs);

  return {
    durationMs,
    status: lastChange.toStatus,
  };
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

  // Sort activities from oldest to newest
  const activitiesAsc = React.useMemo(() => {
    if (!Array.isArray(activities) || activities.length === 0) {
      return [];
    }

    const sorted = [...activities].sort((a, b) => {
      return getTs(a) - getTs(b);
    });

    return sorted;
  }, [activities]);

  // Extract "Created" time (New)
  const createdTs = React.useMemo(() => {
    return extractCreatedTime(activitiesAsc, wpDetail);
  }, [activitiesAsc, wpDetail]);

  // Compute status spans by neighbor activities formula
  const statusSpans = React.useMemo(() => {
    return computeStatusSpansByNeighbor(activitiesAsc);
  }, [activitiesAsc]);

  // Compute tail span (optional - time from last activity to now)
  const tailSpan = React.useMemo(() => {
    if (!wpDetail) return null;

    const endRefMs = wpDetail.updated_at
      ? Date.parse(wpDetail.updated_at)
      : Date.now();

    return computeTailSpan(activitiesAsc, endRefMs);
  }, [activitiesAsc, wpDetail]);

  // Enhanced activities with duration annotations for display
  const activitiesWithDurations = React.useMemo(() => {
    return activitiesAsc.map((activity, i) => {
      const change = getStatusChange(activity);

      if (!change || i === 0) {
        // Not a status change or first activity
        return {
          ...activity,
          isStatusChange: !!change,
          isFirstActivity: i === 0,
          timeInPrevStatusMs: 0,
          timeInPrevStatusText: '',
          prevStatus: '',
        };
      }

      // Find matching span
      const matchingSpan = statusSpans.find((span) => span.index === i);

      if (!matchingSpan) {
        return {
          ...activity,
          isStatusChange: true,
          isFirstActivity: false,
          timeInPrevStatusMs: 0,
          timeInPrevStatusText: '',
          prevStatus: change.fromStatus,
        };
      }

      return {
        ...activity,
        isStatusChange: true,
        isFirstActivity: false,
        timeInPrevStatusMs: matchingSpan.durationMs,
        timeInPrevStatusText: formatDuration(matchingSpan.durationMs),
        prevStatus: matchingSpan.fromStatus,
        toStatus: matchingSpan.toStatus,
      };
    });
  }, [activitiesAsc, statusSpans]);

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

  const totalComments = activitiesAsc.filter(
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
                        value: `${activitiesAsc.length.toLocaleString()} รายการ`,
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
                  <Badge badgeContent={activitiesAsc.length} color="error" max={99}>
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

                  {/* Status Duration Cards - Calculated by Neighbor Activities */}
                  {(createdTs > 0 || statusSpans.length > 0) && (
                    <Fade in timeout={500}>
                      <Box>
                        <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                          <Avatar
                            sx={{
                              bgcolor: '#f59e0b',
                              width: 52,
                              height: 52,
                              boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)',
                            }}
                          >
                            <HistoryToggleOff sx={{ fontSize: 28 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="h4" fontWeight={900} sx={{ 
                              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                              backgroundClip: 'text',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                            }}>
                              ⏱️ สรุปเวลาแต่ละสถานะ
                            </Typography>
                            <Typography variant="body2" color="text.secondary" fontWeight={600}>
                              คำนวณจากกิจกรรมถัดไป − กิจกรรมก่อนหน้า
                            </Typography>
                          </Box>
                        </Stack>

                        {/* Timeline Summary */}
                        <Box sx={{ mb: 4, p: 3, bgcolor: alpha('#f59e0b', 0.1), borderRadius: 3, border: `1px solid ${alpha('#f59e0b', 0.2)}` }}>
                          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                            <AccessTime sx={{ color: '#f59e0b' }} />
                            <Typography variant="h6" fontWeight={700} color="#92400e">
                              สรุปไทม์ไลน์
                            </Typography>
                          </Stack>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="text.secondary">
                                <strong>จำนวนช่วงสถานะ:</strong> {statusSpans.length} ช่วง
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="text.secondary">
                                <strong>สถานะปัจจุบัน:</strong>{' '}
                                {statusSpans.length > 0 ? statusSpans[statusSpans.length - 1].toStatus : wpDetail?.status || 'ไม่ระบุ'}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Box>

                        <Grid container spacing={3}>
                          {/* First Card: New (Created) - Show Time, Not Duration */}
                          {createdTs > 0 && (
                            <Grid item xs={12} sm={6} lg={4}>
                              <Zoom in timeout={400}>
                                <Paper
                                  elevation={0}
                                  sx={{
                                    p: 4,
                                    borderRadius: 4,
                                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(79, 70, 229, 0.1) 100%)',
                                    border: `2px solid ${alpha('#6366f1', 0.3)}`,
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
                                      background: `linear-gradient(90deg, #6366f1 0%, ${alpha('#6366f1', 0.5)} 100%)`,
                                    },
                                    '&:hover': {
                                      borderColor: '#6366f1',
                                      boxShadow: `0 20px 40px ${alpha('#6366f1', 0.25)}, inset 0 0 0 1px ${alpha('#6366f1', 0.1)}`,
                                      transform: 'translateY(-6px) scale(1.02)',
                                    },
                                  }}
                                >
                                  <Stack spacing={3}>
                                    <Stack direction="row" alignItems="center" spacing={1.5}>
                                      <Chip
                                        label="เริ่มต้น"
                                        size="small"
                                        icon={<PlayArrow sx={{ fontSize: 16 }} />}
                                        sx={{
                                          bgcolor: 'rgba(255, 255, 255, 0.9)',
                                          color: '#4f46e5',
                                          fontWeight: 700,
                                          border: `1px solid ${alpha('#6366f1', 0.2)}`,
                                          fontSize: '0.8rem',
                                        }}
                                      />
                                      <Chip
                                        label="New (Created)"
                                        sx={{
                                          bgcolor: '#6366f1',
                                          color: 'white',
                                          fontWeight: 800,
                                          fontSize: '0.9rem',
                                          height: 36,
                                          border: `2px solid ${alpha('#6366f1', 0.3)}`,
                                          boxShadow: `0 4px 12px ${alpha('#6366f1', 0.3)}`,
                                        }}
                                      />
                                    </Stack>

                                    <Divider sx={{ borderColor: alpha('#6366f1', 0.15) }} />

                                    <Box
                                      sx={{
                                        textAlign: 'center',
                                        py: 3,
                                        px: 2,
                                        bgcolor: 'rgba(255, 255, 255, 0.6)',
                                        borderRadius: 3,
                                        border: `1px solid ${alpha('#6366f1', 0.1)}`,
                                      }}
                                    >
                                      <Stack spacing={1} alignItems="center">
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                          <DateRange sx={{ color: '#6366f1', fontSize: 24 }} />
                                          <Typography
                                            variant="body2"
                                            fontWeight={700}
                                            sx={{ 
                                              color: '#4f46e5', 
                                              textTransform: 'uppercase', 
                                              letterSpacing: 0.5, 
                                              fontSize: '0.75rem' 
                                            }}
                                          >
                                            เวลาที่สร้างงาน
                                          </Typography>
                                        </Stack>
                                        <Typography variant="h5" fontWeight={900} sx={{ color: '#4f46e5' }}>
                                          {format(new Date(createdTs), 'dd/MM/yyyy', { locale: th })}
                                        </Typography>
                                        <Typography variant="body2" fontWeight={600} sx={{ color: '#4f46e5' }}>
                                          {format(new Date(createdTs), 'HH:mm:ss น.', { locale: th })}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#4f46e5', opacity: 0.85, mt: 1 }}>
                                          🚀 จุดเริ่มต้นของงาน
                                        </Typography>
                                      </Stack>
                                    </Box>
                                  </Stack>
                                </Paper>
                              </Zoom>
                            </Grid>
                          )}

                          {/* Subsequent Cards: Status Spans with Duration */}
                          {statusSpans.map((span, index) => {
                            const fromStatus = span.fromStatus || 'ไม่ระบุ';
                            const toStatus = span.toStatus || 'ไม่ระบุ';
                            const durationText = formatDuration(span.durationMs);
                            const normalizedToStatus = (toStatus || '').toLowerCase();

                            // Enhanced color palette based on status
                            let bgColor = '#6366f1';
                            let textColor = '#4f46e5';
                            let gradient = 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(79, 70, 229, 0.1) 100%)';

                            if (normalizedToStatus.includes('new') || normalizedToStatus.includes('ใหม่')) {
                              bgColor = '#6366f1';
                              textColor = '#4f46e5';
                              gradient = 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(79, 70, 229, 0.1) 100%)';
                            } else if (normalizedToStatus.includes('รับเรื่อง')) {
                              bgColor = '#06b6d4';
                              textColor = '#0891b2';
                              gradient = 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(8, 145, 178, 0.1) 100%)';
                            } else if (normalizedToStatus.includes('กำลังดำเนินการ')) {
                              bgColor = '#f59e0b';
                              textColor = '#d97706';
                              gradient = 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.1) 100%)';
                            } else if (normalizedToStatus.includes('เสร็จ') || normalizedToStatus.includes('ปิด')) {
                              bgColor = '#10b981';
                              textColor = '#059669';
                              gradient = 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)';
                            }

                            return (
                              <Grid item xs={12} sm={6} lg={4} key={`span-${index}`}>
                                <Zoom in timeout={500 + index * 100}>
                                  <Paper
                                    elevation={0}
                                    sx={{
                                      p: 4,
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
                                    <Stack spacing={3}>
                                      {/* Status Transition */}
                                      <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
                                        <Chip
                                          label={fromStatus}
                                          size="small"
                                          sx={{
                                            bgcolor: 'rgba(255, 255, 255, 0.9)',
                                            color: textColor,
                                            fontWeight: 700,
                                            border: `1px solid ${alpha(bgColor, 0.2)}`,
                                            fontSize: '0.8rem',
                                          }}
                                        />
                                        <Box sx={{ color: bgColor, display: 'flex', alignItems: 'center' }}>
                                          <TrendingFlat sx={{ fontSize: 24 }} />
                                        </Box>
                                        <Chip
                                          label={toStatus}
                                          sx={{
                                            bgcolor: bgColor,
                                            color: 'white',
                                            fontWeight: 800,
                                            fontSize: '0.9rem',
                                            height: 36,
                                            border: `2px solid ${alpha(bgColor, 0.3)}`,
                                            boxShadow: `0 4px 12px ${alpha(bgColor, 0.3)}`,
                                          }}
                                        />
                                      </Stack>

                                      <Divider sx={{ borderColor: alpha(bgColor, 0.15) }} />

                                      {/* Duration Display */}
                                      <Box
                                        sx={{
                                          textAlign: 'center',
                                          py: 3,
                                          px: 2,
                                          bgcolor: 'rgba(255, 255, 255, 0.6)',
                                          borderRadius: 3,
                                          border: `1px solid ${alpha(bgColor, 0.1)}`,
                                        }}
                                      >
                                        <Stack spacing={1} alignItems="center">
                                          <Stack direction="row" alignItems="center" spacing={1}>
                                            <AccessTime sx={{ color: bgColor, fontSize: 24 }} />
                                            <Typography
                                              variant="body2"
                                              fontWeight={700}
                                              sx={{ 
                                                color: textColor, 
                                                textTransform: 'uppercase', 
                                                letterSpacing: 0.5, 
                                                fontSize: '0.75rem' 
                                              }}
                                            >
                                              อยู่ในสถานะ {fromStatus}
                                            </Typography>
                                          </Stack>
                                          <Typography variant="h4" fontWeight={900} sx={{ color: textColor }}>
                                            {durationText}
                                          </Typography>
                                          <Typography variant="caption" sx={{ color: textColor, opacity: 0.85 }}>
                                            คำนวณจาก activity #{span.index} − #{span.index - 1}
                                          </Typography>
                                        </Stack>
                                      </Box>

                                      <Divider sx={{ borderColor: alpha(bgColor, 0.15) }} />

                                      {/* Timestamp Info */}
                                      <Stack spacing={1}>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                                          📅 เริ่ม: {format(new Date(span.startTs), 'dd/MM/yyyy HH:mm:ss', { locale: th })}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                                          📅 จบ: {format(new Date(span.endTs), 'dd/MM/yyyy HH:mm:ss', { locale: th })}
                                        </Typography>
                                      </Stack>
                                    </Stack>
                                  </Paper>
                                </Zoom>
                              </Grid>
                            );
                          })}

                          {/* Tail Span: Current Status Duration (Optional) */}
                          {tailSpan && (
                            <Grid item xs={12} sm={6} lg={4}>
                              <Zoom in timeout={500 + statusSpans.length * 100}>
                                <Paper
                                  elevation={0}
                                  sx={{
                                    p: 4,
                                    borderRadius: 4,
                                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)',
                                    border: `2px solid ${alpha('#ef4444', 0.3)}`,
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
                                      background: `linear-gradient(90deg, #ef4444 0%, ${alpha('#ef4444', 0.5)} 100%)`,
                                    },
                                    '&::after': {
                                      content: '"LIVE"',
                                      position: 'absolute',
                                      top: 12,
                                      right: 12,
                                      fontSize: '0.7rem',
                                      fontWeight: 900,
                                      color: 'white',
                                      bgcolor: '#ef4444',
                                      px: 1,
                                      py: 0.25,
                                      borderRadius: 1,
                                      animation: 'pulse 2s infinite',
                                    },
                                    '&:hover': {
                                      borderColor: '#ef4444',
                                      boxShadow: `0 20px 40px ${alpha('#ef4444', 0.25)}, inset 0 0 0 1px ${alpha('#ef4444', 0.1)}`,
                                      transform: 'translateY(-6px) scale(1.02)',
                                    },
                                  }}
                                >
                                  <Stack spacing={3}>
                                    <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
                                      <Chip
                                        label={tailSpan.status}
                                        sx={{
                                          bgcolor: '#ef4444',
                                          color: 'white',
                                          fontWeight: 800,
                                          fontSize: '0.9rem',
                                          height: 36,
                                          border: `2px solid ${alpha('#ef4444', 0.3)}`,
                                          boxShadow: `0 4px 12px ${alpha('#ef4444', 0.3)}`,
                                        }}
                                      />
                                      <Chip
                                        label="ปัจจุบัน"
                                        size="small"
                                        sx={{
                                          bgcolor: '#dc2626',
                                          color: 'white',
                                          fontWeight: 700,
                                          animation: 'pulse 2s infinite',
                                        }}
                                      />
                                    </Stack>

                                    <Divider sx={{ borderColor: alpha('#ef4444', 0.15) }} />

                                    <Box
                                      sx={{
                                        textAlign: 'center',
                                        py: 3,
                                        px: 2,
                                        bgcolor: 'rgba(255, 255, 255, 0.6)',
                                        borderRadius: 3,
                                        border: `1px solid ${alpha('#ef4444', 0.1)}`,
                                      }}
                                    >
                                      <Stack spacing={1} alignItems="center">
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                          <AccessTime sx={{ color: '#ef4444', fontSize: 24 }} />
                                          <Typography
                                            variant="body2"
                                            fontWeight={700}
                                            sx={{ 
                                              color: '#dc2626', 
                                              textTransform: 'uppercase', 
                                              letterSpacing: 0.5, 
                                              fontSize: '0.75rem' 
                                            }}
                                          >
                                            อยู่ในสถานะปัจจุบัน
                                          </Typography>
                                        </Stack>
                                        <Typography variant="h4" fontWeight={900} sx={{ color: '#dc2626' }}>
                                          {formatDuration(tailSpan.durationMs)}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#dc2626', opacity: 0.85 }}>
                                          ตั้งแต่ activity สุดท้ายจนถึงปัจจุบัน
                                        </Typography>
                                      </Stack>
                                    </Box>
                                  </Stack>
                                </Paper>
                              </Zoom>
                            </Grid>
                          )}
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
                {activitiesWithDurations.length > 0 ? (
                  <List sx={{ width: '100%' }}>
                    {activitiesWithDurations.map((activity: any, index: number) => {
                      const activityDate = activity.created_at ? new Date(activity.created_at) : null;
                      const hasComment = activity.notes && activity.notes.trim().length > 0;
                      const hasChanges = activity.details && activity.details.length > 0;
                      const isStatusChange = activity.isStatusChange;
                      const isFirstActivity = activity.isFirstActivity;

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
                                    : isStatusChange
                                    ? alpha('#6366f1', 0.4)
                                    : alpha(theme.palette.primary.main, 0.3)
                                }`,
                                background: hasComment
                                  ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
                                  : isStatusChange
                                  ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)'
                                  : 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'translateX(10px)',
                                  boxShadow: `0 12px 30px ${alpha(
                                    hasComment 
                                      ? theme.palette.warning.main 
                                      : isStatusChange 
                                      ? '#6366f1'
                                      : theme.palette.primary.main,
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
                                  bgcolor: hasComment 
                                    ? 'warning.main' 
                                    : isStatusChange 
                                    ? '#6366f1'
                                    : 'primary.main',
                                },
                              }}
                            >
                              {/* Activity Header */}
                              <Stack direction="row" alignItems="center" spacing={3} mb={3}>
                                <Avatar
                                  sx={{
                                    bgcolor: hasComment 
                                      ? '#f59e0b' 
                                      : isStatusChange 
                                      ? '#6366f1' 
                                      : '#3b82f6',
                                    width: 56,
                                    height: 56,
                                    boxShadow: `0 4px 12px ${alpha(
                                      hasComment 
                                        ? '#f59e0b' 
                                        : isStatusChange 
                                        ? '#6366f1'
                                        : '#3b82f6',
                                      0.4
                                    )}`,
                                  }}
                                >
                                  {hasComment ? <Comment /> : isStatusChange ? <HistoryToggleOff /> : <Update />}
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
                                        background: isStatusChange 
                                          ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                                          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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

                              {/* First Activity: Show Created Time */}
                              {isFirstActivity && (
                                <Box
                                  sx={{
                                    p: 3,
                                    mb: 3,
                                    bgcolor: 'rgba(99, 102, 241, 0.1)',
                                    borderLeft: '4px solid #6366f1',
                                    borderRadius: 2,
                                  }}
                                >
                                  <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                                    <PlayArrow fontSize="small" sx={{ color: '#6366f1' }} />
                                    <Typography variant="subtitle2" fontWeight={800} color="#4f46e5">
                                      🚀 Created (New)
                                    </Typography>
                                  </Stack>
                                  <Typography
                                    variant="body1"
                                    sx={{
                                      lineHeight: 1.7,
                                      color: '#4338ca',
                                      fontWeight: 600,
                                    }}
                                  >
                                    งานถูกสร้างเมื่อ{' '}
                                    <strong style={{ color: '#3730a3' }}>
                                      {activityDate ? format(activityDate, 'dd/MM/yyyy HH:mm:ss น.', { locale: th }) : 'ไม่ระบุ'}
                                    </strong>
                                  </Typography>
                                </Box>
                              )}

                              {/* Status Change Duration Information */}
                              {isStatusChange && !isFirstActivity && activity.timeInPrevStatusText && (
                                <Box
                                  sx={{
                                    p: 3,
                                    mb: 3,
                                    bgcolor: 'rgba(99, 102, 241, 0.1)',
                                    borderLeft: '4px solid #6366f1',
                                    borderRadius: 2,
                                  }}
                                >
                                  <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                                    <AccessTime fontSize="small" sx={{ color: '#6366f1' }} />
                                    <Typography variant="subtitle2" fontWeight={800} color="#4f46e5">
                                      ⏱️ ระยะเวลาในสถานะ
                                    </Typography>
                                  </Stack>
                                  <Typography
                                    variant="body1"
                                    sx={{
                                      lineHeight: 1.7,
                                      color: '#4338ca',
                                      fontWeight: 600,
                                    }}
                                  >
                                    อยู่ในสถานะ "{activity.prevStatus}" นาน{' '}
                                    <strong style={{ color: '#3730a3' }}>{activity.timeInPrevStatusText}</strong>{' '}
                                    (คำนวณจาก activity ถัดไป − ก่อนหน้า)
                                  </Typography>
                                </Box>
                              )}

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
                                      const isDetailStatusChange = detail.property === 'status' || detail.property === 'Status';

                                      return (
                                        <Grid item xs={12} sm={isDetailStatusChange ? 12 : 6} key={i}>
                                          <Paper
                                            elevation={0}
                                            sx={{
                                              p: 2.5,
                                              bgcolor: isDetailStatusChange 
                                                ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)'
                                                : 'rgba(255,255,255,0.7)',
                                              border: `2px solid ${isDetailStatusChange ? alpha('#6366f1', 0.3) : alpha(theme.palette.primary.main, 0.2)}`,
                                              borderRadius: 2,
                                              transition: 'all 0.3s ease',
                                              '&:hover': {
                                                transform: 'scale(1.02)',
                                                borderColor: isDetailStatusChange ? '#6366f1' : theme.palette.primary.main,
                                                boxShadow: isDetailStatusChange 
                                                  ? '0 8px 24px rgba(99, 102, 241, 0.2)'
                                                  : '0 4px 12px rgba(0, 0, 0, 0.1)',
                                              },
                                            }}
                                          >
                                            <Stack spacing={1.5}>
                                              <Typography variant="subtitle2" fontWeight={900} sx={{ color: isDetailStatusChange ? '#6366f1' : 'text.primary' }}>
                                                {detail.property}
                                                {isDetailStatusChange && ' 🎯'}
                                              </Typography>
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
                                                    <Typography variant="body2" fontWeight={900} sx={{ color: isDetailStatusChange ? '#6366f1' : 'text.primary' }}>
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
