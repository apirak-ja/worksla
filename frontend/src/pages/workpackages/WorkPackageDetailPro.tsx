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

  // Avoid early returns (hooks must not be conditional). We'll render loading/error states inside the main return.
  const wp: any = wpDetail || {};


  // Status Configuration with modern colors
  const statusConfig = React.useMemo<
    Record<
      string,
      {
        color: string;
        label: string;
        bgColor: string;
        gradient: string;
      }
    >
  >(
    () => ({
      New: {
        color: '#3b82f6',
        label: 'งานใหม่',
        bgColor: '#eff6ff',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
      รับเรื่อง: {
        color: '#06b6d4',
        label: 'รับเรื่องแล้ว',
        bgColor: '#ecfeff',
        gradient: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
      },
      'กำลังดำเนินการ': {
        color: '#f59e0b',
        label: 'กำลังดำเนินการ',
        bgColor: '#fef3c7',
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      },
      'ดำเนินการเสร็จ': {
        color: '#10b981',
        label: 'เสร็จสิ้น',
        bgColor: '#d1fae5',
        gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      },
      'ปิดงาน': {
        color: '#6b7280',
        label: 'ปิดงาน',
        bgColor: '#f3f4f6',
        gradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
      },
    }),
    []
  );

  const getStatusIcon = React.useCallback((statusName: string) => {
    switch (statusName) {
      case 'New':
        return <FiberManualRecord />;
      case 'รับเรื่อง':
        return <CheckCircleRounded />;
      case 'กำลังดำเนินการ':
        return <HourglassTop />;
      case 'ดำเนินการเสร็จ':
        return <TaskAlt />;
      case 'ปิดงาน':
        return <CheckCircle />;
      default:
        return <HistoryToggleOff />;
    }
  }, []);

  const currentStatus = React.useMemo(() => {
    const config = statusConfig[wp.status] || statusConfig['New'];
    return { ...config, icon: getStatusIcon(wp.status || 'New') };
  }, [wp.status, statusConfig, getStatusIcon]);

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

  const timelineCards = React.useMemo(() => {
    type TimelineCard = {
      id: string;
      title: string;
      subtitle?: string;
      duration?: string;
      timestamp?: string;
      accentColor: string;
      icon: React.ReactElement;
      isCurrent?: boolean;
    };

    const cards: TimelineCard[] = [];

    const lookupStatus = (name: string) => {
      const config = statusConfig[name];
      return config ? { ...config, icon: getStatusIcon(name) } : {
        color: '#475569',
        icon: getStatusIcon('default'),
        label: name || 'ไม่ระบุ',
        bgColor: '#e2e8f0',
        gradient: '',
      };
    };

    const spansDescending = [...statusSpans].reverse();
    const latestSpan = spansDescending[0];
    const currentStatusName = (tailSpan?.status || latestSpan?.toStatus || '').trim();

    if (currentStatusName) {
      const statusVisual = lookupStatus(currentStatusName);
      const durationValue = tailSpan?.durationMs ?? latestSpan?.durationMs ?? 0;
      const durationText = durationValue > 0 ? formatDuration(durationValue) : undefined;
      const timestampSource = latestSpan?.endTs || (wp.updated_at ? Date.parse(wp.updated_at) : undefined);
      const timestampText =
        timestampSource && Number.isFinite(timestampSource)
          ? format(new Date(timestampSource), 'dd MMM yyyy HH:mm', { locale: th })
          : undefined;

      cards.push({
        id: 'timeline-current',
        title: statusVisual.label || currentStatusName,
        subtitle: 'สถานะปัจจุบัน',
        duration: durationText ? `อยู่ในสถานะนี้ ${durationText}` : undefined,
        timestamp: timestampText ? `อัปเดตล่าสุด ${timestampText}` : undefined,
        accentColor: statusVisual.color,
        icon: statusVisual.icon,
        isCurrent: true,
      });
    }

    spansDescending.slice(1).forEach((span) => {
      const statusName = (span.toStatus || '').trim();
      if (!statusName) {
        return;
      }

      const statusVisual = lookupStatus(statusName);
      const durationText = formatDuration(span.durationMs);
      const timestampText = span.endTs
        ? format(new Date(span.endTs), 'dd MMM yyyy HH:mm', { locale: th })
        : undefined;

      cards.push({
        id: `timeline-${span.index}`,
        title: statusVisual.label || statusName,
        subtitle: span.fromStatus ? `จากสถานะ ${span.fromStatus}` : undefined,
        duration: durationText !== '-' ? `ใช้เวลา ${durationText}` : undefined,
        timestamp: timestampText ? `เปลี่ยนเมื่อ ${timestampText}` : undefined,
        accentColor: statusVisual.color,
        icon: statusVisual.icon,
      });
    });

    if (createdTs > 0) {
      const createdText = format(new Date(createdTs), 'dd MMM yyyy HH:mm', { locale: th });
      cards.push({
        id: 'timeline-created',
        title: 'สร้างงาน',
        subtitle: 'เริ่มต้นกระบวนการ',
        timestamp: `สร้างเมื่อ ${createdText}`,
        accentColor: '#64748b',
        icon: <PlayArrow />,
      });
    }

    return cards;
  }, [statusSpans, tailSpan, createdTs, wp.updated_at, statusConfig]);

  const infoCards = React.useMemo(() => {
    return [
      wp.created_at
        ? {
            id: 'created',
            label: 'สร้างเมื่อ',
            value: format(new Date(wp.created_at), 'dd MMM yyyy', { locale: th }),
            helper: format(new Date(wp.created_at), "'เวลา' HH:mm 'น.'", { locale: th }),
            icon: <CalendarMonth />,
            accentColor: '#2563eb',
          }
        : null,
      wp.assignee_name
        ? {
            id: 'assignee',
            label: 'ผู้รับผิดชอบ',
            value: wp.assignee_name,
            helper: wp.assignee_mail || wp.assignee_email || '',
            icon: <Person />,
            accentColor: '#0ea5e9',
          }
        : null,
      wp.type
        ? {
            id: 'type',
            label: 'ประเภทงาน',
            value: wp.type,
            helper: '',
            icon: <Category />,
            accentColor: '#10b981',
          }
        : null,
    ].filter((item): item is {
      id: string;
      label: string;
      value: string;
      helper: string;
      icon: React.ReactElement;
      accentColor: string;
    } => Boolean(item));
  }, [wp.created_at, wp.assignee_name, wp.assignee_mail, wp.assignee_email, wp.type]);

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
      {/* Loading State */}
      {isLoading && (
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Stack spacing={3}>
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 4 }} />
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 4 }} />
          </Stack>
        </Container>
      )}
      {/* Error State */}
      {!isLoading && (error || !wpDetail) && (
        <Container maxWidth="lg" sx={{ py: 4 }}>
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
      )}

      {/* Main Content */}
      {!isLoading && wpDetail && (
      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
        <Stack spacing={{ xs: 3, md: 4 }}>
          {/* Hero Section - Professional Variant */}
          <Grow in timeout={700}>
            <Paper
              elevation={0}
              sx={{
                position: 'relative',
                borderRadius: { xs: 5, md: 6 },
                overflow: 'hidden',
                bgcolor: isDark ? alpha(theme.palette.background.paper, 0.94) : '#ffffff',
                border: `1px solid ${alpha(theme.palette.divider, isDark ? 0.35 : 0.18)}`,
                boxShadow: isDark
                  ? '0 22px 60px rgba(0, 0, 0, 0.45)'
                  : '0 22px 60px rgba(15, 23, 42, 0.12)',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  background: isDark
                    ? `radial-gradient(120% 120% at 100% 0%, ${alpha(theme.palette.primary.light, 0.25)} 0%, transparent 55%), radial-gradient(120% 120% at 0% 100%, ${alpha(
                        theme.palette.primary.dark,
                        0.18
                      )} 0%, transparent 55%)`
                    : `radial-gradient(120% 120% at 100% 0%, ${alpha(theme.palette.primary.light, 0.15)} 0%, transparent 55%), radial-gradient(120% 120% at 0% 100%, ${alpha(
                        theme.palette.primary.main,
                        0.08
                      )} 0%, transparent 55%)`,
                }}
              />
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ p: { xs: 3.5, md: 5 } }}>
                  <Stack spacing={{ xs: 3, md: 4 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      spacing={2}
                      flexWrap="wrap"
                    >
                      <Stack direction="row" spacing={2.5} alignItems="center">
                        <IconButton
                          onClick={() => navigate('/workpackages')}
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            border: `1px solid ${alpha(theme.palette.primary.main, isDark ? 0.5 : 0.25)}`,
                            color: theme.palette.primary.main,
                            bgcolor: isDark
                              ? alpha(theme.palette.primary.main, 0.12)
                              : alpha(theme.palette.primary.main, 0.06),
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.18),
                              transform: 'translateX(-4px)',
                              boxShadow: `0 12px 26px ${alpha(theme.palette.primary.main, 0.22)}`,
                            },
                          }}
                        >
                          <ArrowBack />
                        </IconButton>
                        <Stack spacing={1}>
                          <Typography
                            variant="caption"
                            fontWeight={700}
                            color={textMuted}
                            sx={{ textTransform: 'uppercase', letterSpacing: 0.8 }}
                          >
                            Work Package
                          </Typography>
                          <Paper
                            elevation={0}
                            sx={{
                              px: 2.5,
                              py: 1,
                              borderRadius: '999px',
                              border: `1px solid ${alpha(theme.palette.primary.main, isDark ? 0.5 : 0.25)}`,
                              bgcolor: isDark
                                ? alpha(theme.palette.primary.main, 0.18)
                                : alpha(theme.palette.primary.main, 0.1),
                            }}
                          >
                            <Typography
                              variant="h6"
                              fontWeight={800}
                              sx={{ color: isDark ? '#e2e8f0' : theme.palette.primary.dark }}
                            >
                              #{wp.id || wp.wp_id}
                            </Typography>
                          </Paper>
                        </Stack>
                      </Stack>
                      <Chip
                        icon={<AccessTime sx={{ fontSize: 18 }} />}
                        label={
                          wp.updated_at
                            ? `อัปเดต ${format(new Date(wp.updated_at), 'dd MMM yyyy HH:mm', { locale: th })}`
                            : 'ไม่ระบุเวลาอัปเดต'
                        }
                        sx={{
                          borderRadius: '999px',
                          height: 42,
                          px: 2.5,
                          bgcolor: isDark ? alpha(theme.palette.common.white, 0.06) : alpha(theme.palette.grey[100], 0.9),
                          border: `1px solid ${alpha(theme.palette.divider, isDark ? 0.5 : 0.35)}`,
                          fontWeight: 600,
                          color: isDark ? alpha(theme.palette.common.white, 0.8) : alpha(theme.palette.text.primary, 0.75),
                          '& .MuiChip-icon': {
                            color: theme.palette.primary.main,
                          },
                        }}
                      />
                    </Stack>

                    <Divider sx={{ borderColor: alpha(theme.palette.divider, isDark ? 0.45 : 0.2) }} />

                    <Stack spacing={{ xs: 3, md: 3.5 }}>
                      <Stack spacing={1.75}>
                        <Stack direction="row" spacing={1.5} flexWrap="wrap">
                          <Chip
                            icon={currentStatus.icon}
                            label={currentStatus.label}
                            sx={{
                              height: 38,
                              borderRadius: 999,
                              px: 2,
                              bgcolor: alpha(currentStatus.color, isDark ? 0.28 : 0.12),
                              border: `1px solid ${alpha(currentStatus.color, isDark ? 0.5 : 0.25)}`,
                              color: isDark ? '#f8fafc' : currentStatus.color,
                              fontWeight: 700,
                              '& .MuiChip-icon': {
                                color: isDark ? '#f8fafc' : currentStatus.color,
                                fontSize: 18,
                              },
                            }}
                          />
                          <Chip
                            icon={priorityConfig.icon}
                            label={priorityConfig.label || wp.priority || 'ไม่ระบุ'}
                            sx={{
                              height: 38,
                              borderRadius: 999,
                              px: 2,
                              bgcolor: alpha(priorityConfig.color, isDark ? 0.28 : 0.12),
                              border: `1px solid ${alpha(priorityConfig.color, isDark ? 0.5 : 0.25)}`,
                              color: isDark ? '#f8fafc' : priorityConfig.color,
                              fontWeight: 700,
                              '& .MuiChip-icon': {
                                color: isDark ? '#f8fafc' : priorityConfig.color,
                                fontSize: 18,
                              },
                            }}
                          />
                        </Stack>
                        <Typography
                          variant="h2"
                          fontWeight={800}
                          sx={{
                            lineHeight: 1.25,
                            fontSize: { xs: '1.9rem', sm: '2.3rem', md: '2.7rem' },
                            color: isDark ? '#f8fafc' : '#0f172a',
                            letterSpacing: '-0.01em',
                            wordBreak: 'break-word',
                          }}
                        >
                          {wp.subject}
                        </Typography>
                        {wp.project_name && (
                          <Typography variant="body1" fontWeight={600} color={textMuted}>
                            โครงการ {wp.project_name}
                          </Typography>
                        )}
                      </Stack>

                      {timelineCards.length > 0 && (
                        <Fade in timeout={450}>
                          <Box>
                            <Stack
                              direction={{ xs: 'column', md: 'row' }}
                              spacing={2}
                              alignItems={{ xs: 'flex-start', md: 'center' }}
                              justifyContent="space-between"
                              mb={2.5}
                            >
                              <Stack direction="row" alignItems="center" spacing={2}>
                                <Avatar
                                  variant="rounded"
                                  sx={{
                                    bgcolor: alpha(theme.palette.primary.main, isDark ? 0.2 : 0.12),
                                    color: theme.palette.primary.main,
                                    width: 48,
                                    height: 48,
                                  }}
                                >
                                  <HistoryToggleOff />
                                </Avatar>
                                <Box>
                                  <Typography variant="subtitle1" fontWeight={800} sx={{ color: isDark ? '#e2e8f0' : '#0f172a' }}>
                                    สถานะตามลำดับเวลา
                                  </Typography>
                                  <Typography variant="body2" color={textMuted} fontWeight={600}>
                                    เรียงเหตุการณ์ล่าสุดก่อน แล้วไล่ลงทีละช่วง
                                  </Typography>
                                </Box>
                              </Stack>
                              <Chip
                                size="small"
                                label={`${timelineCards.length} เหตุการณ์`}
                                sx={{
                                  borderRadius: 999,
                                  fontWeight: 700,
                                  bgcolor: alpha(theme.palette.primary.main, isDark ? 0.22 : 0.12),
                                  color: theme.palette.primary.main,
                                }}
                              />
                            </Stack>

                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', md: 'row' },
                                flexWrap: { xs: 'nowrap', md: 'wrap' },
                                gap: { xs: 2, md: 2.5 },
                              }}
                            >
                              {timelineCards.map((card) => (
                                <Paper
                                  key={card.id}
                                  elevation={0}
                                  sx={{
                                    flex: { xs: '1 1 auto', md: '1 1 240px' },
                                    minWidth: { md: 220 },
                                    borderRadius: 4,
                                    border: `1px solid ${alpha(card.accentColor, card.isCurrent ? (isDark ? 0.7 : 0.45) : (isDark ? 0.45 : 0.25))}`,
                                    bgcolor: alpha(card.accentColor, card.isCurrent ? (isDark ? 0.28 : 0.16) : (isDark ? 0.22 : 0.1)),
                                    backdropFilter: 'blur(8px)',
                                    boxShadow: card.isCurrent ? `0 18px 36px ${alpha(card.accentColor, 0.22)}` : 'none',
                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                    '&:hover': {
                                      transform: 'translateY(-4px)',
                                      boxShadow: `0 18px 36px ${alpha(card.accentColor, 0.25)}`,
                                    },
                                  }}
                                >
                                  <Box sx={{ p: 2.5 }}>
                                    <Stack spacing={1.5}>
                                      <Stack direction="row" spacing={1.5} alignItems="center">
                                        <Avatar
                                          sx={{
                                            bgcolor: card.accentColor,
                                            color: '#fff',
                                            width: 42,
                                            height: 42,
                                          }}
                                        >
                                          {React.cloneElement(card.icon, { sx: { fontSize: 22 } })}
                                        </Avatar>
                                        <Box>
                                          <Typography variant="subtitle1" fontWeight={800} sx={{ color: isDark ? '#f8fafc' : card.accentColor }}>
                                            {card.title}
                                          </Typography>
                                          {card.subtitle && (
                                            <Typography
                                              variant="caption"
                                              fontWeight={700}
                                              sx={{ color: isDark ? alpha('#f8fafc', 0.75) : alpha(card.accentColor, 0.75) }}
                                            >
                                              {card.subtitle}
                                            </Typography>
                                          )}
                                        </Box>
                                      </Stack>
                                      {card.duration && (
                                        <Typography variant="body2" fontWeight={600} sx={{ color: isDark ? alpha('#f8fafc', 0.88) : '#0f172a' }}>
                                          {card.duration}
                                        </Typography>
                                      )}
                                      {card.timestamp && (
                                        <Typography variant="caption" fontWeight={600} sx={{ color: isDark ? alpha('#f8fafc', 0.7) : textMuted }}>
                                          {card.timestamp}
                                        </Typography>
                                      )}
                                    </Stack>
                                  </Box>
                                </Paper>
                              ))}
                            </Box>
                          </Box>
                        </Fade>
                      )}

                      {infoCards.length > 0 && (
                        <Fade in timeout={550}>
                          <Grid container spacing={{ xs: 2, md: 3 }}>
                            {infoCards.map((card) => (
                              <Grid item xs={12} sm={6} md={4} key={card.id}>
                                <Paper
                                  elevation={0}
                                  sx={{
                                    borderRadius: 4,
                                    border: `1px solid ${alpha(card.accentColor, isDark ? 0.45 : 0.2)}`,
                                    bgcolor: alpha(card.accentColor, isDark ? 0.18 : 0.08),
                                    height: '100%',
                                  }}
                                >
                                  <Box sx={{ p: 3 }}>
                                    <Stack spacing={1.75}>
                                      <Stack direction="row" spacing={1.5} alignItems="center">
                                        <Avatar
                                          sx={{
                                            bgcolor: card.accentColor,
                                            color: '#fff',
                                            width: 42,
                                            height: 42,
                                          }}
                                        >
                                          {React.cloneElement(card.icon, { sx: { fontSize: 22 } })}
                                        </Avatar>
                                        <Typography
                                          variant="overline"
                                          fontWeight={700}
                                          sx={{ letterSpacing: 1, color: isDark ? alpha('#f8fafc', 0.85) : alpha('#0f172a', 0.6) }}
                                        >
                                          {card.label}
                                        </Typography>
                                      </Stack>
                                      <Typography variant="h6" fontWeight={800} sx={{ color: isDark ? '#f8fafc' : '#0f172a' }}>
                                        {card.value}
                                      </Typography>
                                      {card.helper && (
                                        <Typography variant="body2" color={textMuted} fontWeight={600}>
                                          {card.helper}
                                        </Typography>
                                      )}
                                    </Stack>
                                  </Box>
                                </Paper>
                              </Grid>
                            ))}
                          </Grid>
                        </Fade>
                      )}
                    </Stack>
                  </Stack>
                </Box>
              </Box>
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

                  {/* Information Table - Modern Redesign */}
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

                              {/* First Activity: Created Time - Elegant Display */}
                              {isFirstActivity && (
                                <Box
                                  sx={{
                                    p: 3.5,
                                    mb: 3,
                                    background: isDark
                                      ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(79, 70, 229, 0.05) 100%)'
                                      : 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(255, 255, 255, 0.5) 100%)',
                                    borderLeft: '3px solid #6366f1',
                                    borderRadius: 3,
                                    backdropFilter: 'blur(10px)',
                                  }}
                                >
                                  <Stack direction="row" alignItems="center" spacing={2}>
                                    <Avatar
                                      sx={{
                                        bgcolor: '#6366f1',
                                        width: 36,
                                        height: 36,
                                        boxShadow: `0 4px 12px ${alpha('#6366f1', 0.3)}`,
                                      }}
                                    >
                                      <PlayArrow sx={{ fontSize: 20 }} />
                                    </Avatar>
                                    <Box flex={1}>
                                      <Typography variant="caption" fontWeight={600} color="#6366f1" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5 }}>
                                        Created
                                      </Typography>
                                      <Typography
                                        variant="h6"
                                        fontWeight={900}
                                        sx={{
                                          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                          backgroundClip: 'text',
                                          WebkitBackgroundClip: 'text',
                                          WebkitTextFillColor: 'transparent',
                                        }}
                                      >
                                        {activityDate ? format(activityDate, 'dd/MM/yyyy HH:mm:ss', { locale: th }) : 'ไม่ระบุ'}
                                      </Typography>
                                    </Box>
                                  </Stack>
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
                                      
                                      // Show time in status for status changes
                                      const showDuration = isDetailStatusChange && !isFirstActivity && activity.timeInPrevStatusText;

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
                                              <Stack direction="row" alignItems="center" justifyContent="space-between">
                                                <Typography variant="subtitle2" fontWeight={900} sx={{ color: isDetailStatusChange ? '#6366f1' : 'text.primary' }}>
                                                  {detail.property}
                                                  {isDetailStatusChange && ' 🎯'}
                                                </Typography>
                                                {showDuration && (
                                                  <Chip
                                                    icon={<AccessTime sx={{ fontSize: 16 }} />}
                                                    label={activity.timeInPrevStatusText}
                                                    size="small"
                                                    sx={{
                                                      height: 32,
                                                      fontWeight: 900,
                                                      fontSize: '0.9rem',
                                                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                                      color: 'white',
                                                      '& .MuiChip-icon': { color: 'white' },
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
      )}
    </Box>
  );
};

export default WorkPackageDetailPro;
