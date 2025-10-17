import React from 'react';
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
  IconButton,
  Tooltip,
  Skeleton,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  alpha,
  Fade,
  Zoom,
  Slide,
  useTheme,
  Fab,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Share,
  Assignment,
  Person,
  Schedule,
  TrendingUp,
  Category,
  Description,
  CalendarToday,
  Info,
  AttachFile,
  CheckCircle,
  HourglassEmpty,
  Flag,
  Business,
  Comment,
  Update,
  PersonOutline,
  AccessTime,
  EventNote,
  Phone,
  Place,
  DateRange,
  Settings,
  Speed,
  Computer,
  PriorityHigh,
  Timeline,
  CheckCircleOutline,
  ErrorOutline,
  PlayCircleOutline,
  FiberManualRecord,
  MoreVert,
  Add,
  Refresh,
  Print,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { wpApi } from '../../api/client';
import DOMPurify from 'dompurify';

const WorkPackageDetailModern: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();

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

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3, mb: 3 }} />
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
      </Container>
    );
  }

  if (error || !wpDetail) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          ไม่สามารถโหลดข้อมูล Work Package ได้
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/workpackages')}
          sx={{ mt: 2 }}
        >
          กลับ
        </Button>
      </Container>
    );
  }

  const wp: any = wpDetail;
  const activities = journals?.journals || [];

  const statusConfig: Record<string, { 
    color: string; 
    bg: string; 
    icon: any;
    label: string;
  }> = {
    'New': { 
      color: '#2196F3', 
      bg: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
      icon: <FiberManualRecord />,
      label: 'งานใหม่'
    },
    'รับเรื่อง': { 
      color: '#0288D1', 
      bg: 'linear-gradient(135deg, #0288D1 0%, #0277BD 100%)',
      icon: <CheckCircleOutline />,
      label: 'รับเรื่องแล้ว'
    },
    'กำลังดำเนินการ': { 
      color: '#FF9800', 
      bg: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
      icon: <PlayCircleOutline />,
      label: 'กำลังดำเนินการ'
    },
    'ดำเนินการเสร็จ': { 
      color: '#4CAF50', 
      bg: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
      icon: <CheckCircle />,
      label: 'เสร็จสิ้น'
    },
    'ปิดงาน': { 
      color: '#607D8B', 
      bg: 'linear-gradient(135deg, #607D8B 0%, #455A64 100%)',
      icon: <CheckCircle />,
      label: 'ปิดงานแล้ว'
    },
  };

  const currentStatus = statusConfig[wp.status] || statusConfig['New'];

  const getPriorityColor = (priority: string): 'error' | 'warning' | 'success' => {
    if (priority === 'High') return 'error';
    if (priority === 'Low') return 'success';
    return 'warning';
  };

  // Extract custom fields
  const customFields: Record<string, any> = {};
  Object.keys(wp).forEach((key) => {
    if (key.startsWith('customField')) {
      customFields[key] = wp[key];
    }
  });

  // Custom field labels with enhanced info
  const customFieldInfo: Record<string, { 
    label: string; 
    icon: any; 
    color: string;
    format?: (value: any) => string;
    parseValue?: (value: any) => { main: string; sub?: string };
  }> = {
    customField5: { 
      label: 'สถานที่', 
      icon: <Place />, 
      color: '#FF9800',
      parseValue: (value: any) => {
        if (!value) return { main: '-' };
        // Parse "C|1|ห้อง Mammography" format
        const parts = value.split('|');
        if (parts.length >= 3) {
          return { main: parts[2], sub: `${parts[0]}|${parts[1]}` };
        }
        return { main: value };
      }
    },
    customField6: { 
      label: 'หน่วยงานที่ตั้ง', 
      icon: <Business />, 
      color: '#2196F3',
    },
    customField7: { 
      label: 'ผู้แจ้ง (เบอร์โทร)', 
      icon: <Phone />, 
      color: '#4CAF50',
      parseValue: (value: any) => {
        if (!value) return { main: '-' };
        // Parse "ศศิประภา โป๋ชัน|79446" format
        const parts = value.split('|');
        if (parts.length >= 2) {
          return { main: parts[0], sub: `โทร: ${parts[1]}` };
        }
        return { main: value };
      }
    },
    customField8: { 
      label: 'แจ้งโดย', 
      icon: <Person />, 
      color: '#9C27B0',
    },
    customField10: { 
      label: 'วันที่เริ่มต้น', 
      icon: <DateRange />, 
      color: '#00BCD4',
      format: (value: any) => {
        if (!value) return '-';
        try {
          return format(new Date(value), 'dd MMMM yyyy HH:mm น.', { locale: th });
        } catch {
          return value;
        }
      }
    },
    customField25: { 
      label: 'วันที่สิ้นสุด', 
      icon: <DateRange />, 
      color: '#F44336',
      format: (value: any) => {
        if (!value) return '-';
        try {
          return format(new Date(value), 'dd MMMM yyyy', { locale: th });
        } catch {
          return value;
        }
      }
    },
    customField2: { 
      label: 'ประเภทงานย่อย Network', 
      icon: <Settings />, 
      color: '#673AB7',
    },
    customField3: { 
      label: 'ประเภทงานย่อย Hardware', 
      icon: <Computer />, 
      color: '#E91E63',
    },
    customField9: { 
      label: 'ความเร่งด่วน', 
      icon: <PriorityHigh />, 
      color: '#FF5722',
    },
  };

  // Calculate duration between status changes
  const calculateDuration = (currentDate: string, previousDate: string): string => {
    const current = new Date(currentDate);
    const previous = new Date(previousDate);
    const diffMs = current.getTime() - previous.getTime();
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    const parts = [];
    if (days > 0) parts.push(`${days} วัน`);
    if (hours > 0) parts.push(`${hours} ชั่วโมง`);
    if (minutes > 0 || parts.length === 0) parts.push(`${minutes} นาที`);
    
    return parts.join(' ');
  };

  // Find status changes for duration calculation
  const statusChanges = activities
    .filter((a: any) => a.details?.some((d: any) => d.property === 'Status'))
    .map((a: any, index: number) => ({
      ...a,
      index,
    }));

  // Calculate progress
  const totalActivities = activities.length;
  const progressPercentage = wp.done_ratio || 0;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 6 }}>
      {/* Modern Hero Header */}
      <Box
        sx={{
          background: currentStatus.bg,
          color: 'white',
          py: 4,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          },
        }}
      >
        <Container maxWidth="xl">
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/workpackages')}
              sx={{
                color: 'white',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
              }}
            >
              กลับ
            </Button>
            
            <Stack direction="row" spacing={1}>
              <Tooltip title="แชร์">
                <IconButton sx={{ color: 'white' }}>
                  <Share />
                </IconButton>
              </Tooltip>
              <Tooltip title="แก้ไข">
                <IconButton sx={{ color: 'white' }}>
                  <Edit />
                </IconButton>
              </Tooltip>
              <Tooltip title="เพิ่มเติม">
                <IconButton sx={{ color: 'white' }}>
                  <MoreVert />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Stack direction="row" spacing={2} mb={2} flexWrap="wrap">
                <Chip
                  label={`#${wp.id || wp.wp_id}`}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.25)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1rem',
                  }}
                />
                <Chip
                  icon={currentStatus.icon}
                  label={currentStatus.label}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.25)',
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
                <Chip
                  label={wp.priority || 'Normal'}
                  icon={<Flag />}
                  color={getPriorityColor(wp.priority)}
                />
                <Chip
                  icon={<Category />}
                  label={wp.type || 'ไม่ระบุ'}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.25)',
                    color: 'white',
                  }}
                />
              </Stack>
              
              <Typography variant="h4" fontWeight={800} mb={1}>
                {wp.subject}
              </Typography>
              
              <Stack direction="row" spacing={2} alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <Person fontSize="small" />
                  <Typography variant="body2">{wp.assignee_name || 'ยังไม่ได้มอบหมาย'}</Typography>
                </Stack>
                <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
                <Stack direction="row" spacing={1} alignItems="center">
                  <Schedule fontSize="small" />
                  <Typography variant="body2">
                    {wp.updated_at ? format(new Date(wp.updated_at), 'dd MMM yyyy', { locale: th }) : '-'}
                  </Typography>
                </Stack>
              </Stack>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={12}>
                  <Card
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: 3,
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Stack spacing={1.5}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" color="white" sx={{ opacity: 0.9, fontWeight: 600 }}>
                            ความคืบหน้า
                          </Typography>
                          <Typography variant="h5" fontWeight={800} color="white">
                            {progressPercentage}%
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={progressPercentage}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: 'rgba(255,255,255,0.2)',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: 'white',
                              borderRadius: 4,
                            },
                          }}
                        />
                        <Stack direction="row" justifyContent="space-between" flexWrap="wrap" gap={1}>
                          <Chip
                            icon={<Timeline fontSize="small" />}
                            label={`${totalActivities} กิจกรรม`}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(255,255,255,0.2)',
                              color: 'white',
                              fontSize: '0.75rem',
                              height: 24,
                              fontWeight: 600,
                              '& .MuiChip-icon': { color: 'white' },
                            }}
                          />
                          <Chip
                            icon={<Comment fontSize="small" />}
                            label={`${activities.filter((a: any) => a.notes).length} ความคิดเห็น`}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(255,255,255,0.2)',
                              color: 'white',
                              fontSize: '0.75rem',
                              height: 24,
                              fontWeight: 600,
                              '& .MuiChip-icon': { color: 'white' },
                            }}
                          />
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={12}>
                  <Card
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: 3,
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Stack spacing={1.5}>
                        <Typography variant="body2" color="white" sx={{ opacity: 0.9, fontWeight: 600 }}>
                          สถิติการทำงาน
                        </Typography>
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <Box textAlign="center">
                              <Typography variant="h6" fontWeight={800} color="white">
                                {activities.reduce((sum: number, a: any) => sum + (a.details?.length || 0), 0)}
                              </Typography>
                              <Typography variant="caption" color="white" sx={{ opacity: 0.8 }}>
                                เปลี่ยนแปลง
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box textAlign="center">
                              <Typography variant="h6" fontWeight={800} color="white">
                                {wp.created_at ? Math.ceil((new Date().getTime() - new Date(wp.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0}
                              </Typography>
                              <Typography variant="caption" color="white" sx={{ opacity: 0.8 }}>
                                วันที่ผ่านมา
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: -4 }}>
        <Grid container spacing={3}>
          {/* Main Content */}
          <Grid item xs={12} lg={8}>
            {/* Description Card */}
            {wp.description && (
              <Zoom in timeout={300}>
                <Card elevation={3} sx={{ borderRadius: 3, mb: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                        <Description />
                      </Avatar>
                      <Typography variant="h6" fontWeight={700}>
                        📝 รายละเอียด
                      </Typography>
                    </Stack>
                    <Divider sx={{ mb: 2 }} />
                    <Box
                      sx={{
                        '& p': { mb: 1 },
                        '& ul, & ol': { pl: 3, mb: 1 },
                        color: 'text.primary',
                        lineHeight: 1.8,
                      }}
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(wp.description, {
                          ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'a', 'h1', 'h2', 'h3'],
                        }),
                      }}
                    />
                  </CardContent>
                </Card>
              </Zoom>
            )}

            {/* Custom Fields - Beautiful Grid */}
            <Zoom in timeout={400}>
              <Card elevation={3} sx={{ borderRadius: 3, mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
                    <Avatar sx={{ bgcolor: 'secondary.main', width: 40, height: 40 }}>
                      <Info />
                    </Avatar>
                    <Typography variant="h6" fontWeight={700}>
                      🏷️ ข้อมูลเพิ่มเติม
                    </Typography>
                  </Stack>
                  
                  <Grid container spacing={2}>
                    {Object.entries(customFields).map(([key, value]) => {
                      if (!value) return null;
                      const fieldInfo = customFieldInfo[key];
                      if (!fieldInfo) return null;

                      let displayValue = value;
                      let subValue: string | undefined;

                      // Apply custom parsing if available
                      if (fieldInfo.parseValue) {
                        const parsed = fieldInfo.parseValue(value);
                        displayValue = parsed.main;
                        subValue = parsed.sub;
                      } else if (fieldInfo.format) {
                        displayValue = fieldInfo.format(value);
                      }

                      return (
                        <Grid item xs={12} sm={6} lg={4} key={key}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 2.5,
                              borderRadius: 3,
                              border: '2px solid',
                              borderColor: alpha(fieldInfo.color, 0.2),
                              background: `linear-gradient(135deg, ${alpha(fieldInfo.color, 0.03)} 0%, ${alpha(fieldInfo.color, 0.08)} 100%)`,
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              position: 'relative',
                              overflow: 'hidden',
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: 4,
                                background: `linear-gradient(90deg, ${fieldInfo.color} 0%, ${alpha(fieldInfo.color, 0.7)} 100%)`,
                              },
                              '&:hover': {
                                borderColor: fieldInfo.color,
                                boxShadow: `0 8px 32px ${alpha(fieldInfo.color, 0.15)}`,
                                transform: 'translateY(-4px) scale(1.02)',
                                '& .field-icon': {
                                  transform: 'scale(1.1) rotate(5deg)',
                                },
                              },
                            }}
                          >
                            <Stack direction="row" spacing={1.5} alignItems="flex-start">
                              <Avatar
                                className="field-icon"
                                sx={{
                                  bgcolor: alpha(fieldInfo.color, 0.1),
                                  color: fieldInfo.color,
                                  width: 44,
                                  height: 44,
                                  border: `2px solid ${alpha(fieldInfo.color, 0.2)}`,
                                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                }}
                              >
                                {fieldInfo.icon}
                              </Avatar>
                              <Box flex={1} minWidth={0}>
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    color: fieldInfo.color,
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: 0.5,
                                    display: 'block',
                                    mb: 0.5,
                                  }}
                                >
                                  {fieldInfo.label}
                                </Typography>
                                <Typography 
                                  variant="body1" 
                                  sx={{ 
                                    fontWeight: 700, 
                                    color: 'text.primary',
                                    lineHeight: 1.3,
                                    wordBreak: 'break-word',
                                  }}
                                >
                                  {displayValue}
                                </Typography>
                                {subValue && (
                                  <Chip
                                    label={subValue}
                                    size="small"
                                    sx={{
                                      mt: 1,
                                      height: 24,
                                      fontSize: '0.75rem',
                                      bgcolor: alpha(fieldInfo.color, 0.1),
                                      color: fieldInfo.color,
                                      border: `1px solid ${alpha(fieldInfo.color, 0.3)}`,
                                      fontWeight: 600,
                                    }}
                                  />
                                )}
                              </Box>
                            </Stack>
                          </Paper>
                        </Grid>
                      );
                    })}
                  </Grid>
                </CardContent>
              </Card>
            </Zoom>

            {/* Custom Options - Special Display */}
            <Zoom in timeout={450}>
              <Card elevation={3} sx={{ borderRadius: 3, mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
                    <Avatar 
                      sx={{ 
                        bgcolor: 'linear-gradient(135deg, #E91E63 0%, #AD1457 100%)',
                        width: 40, 
                        height: 40 
                      }}
                    >
                      <Settings />
                    </Avatar>
                    <Typography variant="h6" fontWeight={700}>
                      ⚙️ ตัวเลือกพิเศษ
                    </Typography>
                  </Stack>
                  
                  <Grid container spacing={3}>
                    {/* Hardware Type */}
                    {wp.customField3 && (
                      <Grid item xs={12} md={6}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 3,
                            borderRadius: 3,
                            border: '2px solid',
                            borderColor: alpha('#E91E63', 0.2),
                            background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.03) 0%, rgba(233, 30, 99, 0.08) 100%)',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: 4,
                              background: 'linear-gradient(90deg, #E91E63 0%, #AD1457 100%)',
                            },
                          }}
                        >
                          <Stack spacing={2}>
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                              <Avatar
                                sx={{
                                  bgcolor: alpha('#E91E63', 0.1),
                                  color: '#E91E63',
                                  width: 48,
                                  height: 48,
                                }}
                              >
                                <Computer />
                              </Avatar>
                              <Box>
                                <Typography 
                                  variant="subtitle2" 
                                  sx={{ 
                                    color: '#E91E63',
                                    fontWeight: 800,
                                    textTransform: 'uppercase',
                                    letterSpacing: 0.5,
                                  }}
                                >
                                  ประเภทงานย่อย Hardware
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  หมวดหมู่อุปกรณ์
                                </Typography>
                              </Box>
                            </Stack>
                            <Chip
                              label={wp.customField3}
                              sx={{
                                bgcolor: alpha('#E91E63', 0.1),
                                color: '#E91E63',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                height: 36,
                                borderRadius: 2,
                                border: `2px solid ${alpha('#E91E63', 0.3)}`,
                                '& .MuiChip-label': { px: 2 },
                              }}
                            />
                          </Stack>
                        </Paper>
                      </Grid>
                    )}

                    {/* Urgency Level */}
                    {wp.customField9 && (
                      <Grid item xs={12} md={6}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 3,
                            borderRadius: 3,
                            border: '2px solid',
                            borderColor: alpha('#FF5722', 0.2),
                            background: 'linear-gradient(135deg, rgba(255, 87, 34, 0.03) 0%, rgba(255, 87, 34, 0.08) 100%)',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: 4,
                              background: 'linear-gradient(90deg, #FF5722 0%, #D84315 100%)',
                            },
                          }}
                        >
                          <Stack spacing={2}>
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                              <Avatar
                                sx={{
                                  bgcolor: alpha('#FF5722', 0.1),
                                  color: '#FF5722',
                                  width: 48,
                                  height: 48,
                                }}
                              >
                                <PriorityHigh />
                              </Avatar>
                              <Box>
                                <Typography 
                                  variant="subtitle2" 
                                  sx={{ 
                                    color: '#FF5722',
                                    fontWeight: 800,
                                    textTransform: 'uppercase',
                                    letterSpacing: 0.5,
                                  }}
                                >
                                  ความเร่งด่วน
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  ระดับความสำคัญ
                                </Typography>
                              </Box>
                            </Stack>
                            <Chip
                              label={wp.customField9}
                              sx={{
                                bgcolor: alpha('#FF5722', 0.1),
                                color: '#FF5722',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                height: 36,
                                borderRadius: 2,
                                border: `2px solid ${alpha('#FF5722', 0.3)}`,
                                '& .MuiChip-label': { px: 2 },
                              }}
                            />
                          </Stack>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Zoom>

            {/* Activity Timeline */}
            <Zoom in timeout={500}>
              <Card elevation={3} sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
                    <Avatar sx={{ bgcolor: 'success.main', width: 40, height: 40 }}>
                      <Timeline />
                    </Avatar>
                    <Typography variant="h6" fontWeight={700}>
                      📜 ประวัติกิจกรรม ({activities.length})
                    </Typography>
                  </Stack>

                  {activities.length > 0 ? (
                    <Box sx={{ position: 'relative' }}>
                      {/* Timeline Line */}
                      <Box
                        sx={{
                          position: 'absolute',
                          left: 24,
                          top: 0,
                          bottom: 0,
                          width: 2,
                          bgcolor: 'divider',
                        }}
                      />

                      <List sx={{ width: '100%', pt: 0 }}>
                        {activities.map((activity: any, index: number) => {
                          const activityDate = activity.created_at ? new Date(activity.created_at) : null;
                          const hasComment = activity.notes && activity.notes.trim().length > 0;
                          const hasChanges = activity.details && activity.details.length > 0;

                          return (
                            <Fade in timeout={600 + index * 150} key={activity.id || index}>
                              <ListItem
                                alignItems="flex-start"
                                sx={{
                                  mb: 4,
                                  pl: 0,
                                  position: 'relative',
                                }}
                              >
                                <ListItemAvatar sx={{ minWidth: 64 }}>
                                  <Box sx={{ position: 'relative' }}>
                                    <Avatar
                                      sx={{
                                        bgcolor: hasComment ? 
                                          'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)' : 
                                          'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                                        width: 56,
                                        height: 56,
                                        border: '4px solid',
                                        borderColor: 'background.paper',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                                        zIndex: 2,
                                      }}
                                    >
                                      {hasComment ? <Comment fontSize="large" /> : <Update fontSize="large" />}
                                    </Avatar>
                                    <Box
                                      sx={{
                                        position: 'absolute',
                                        top: -4,
                                        right: -4,
                                        bgcolor: 'success.main',
                                        color: 'white',
                                        borderRadius: '50%',
                                        width: 24,
                                        height: 24,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        zIndex: 3,
                                        border: '2px solid white',
                                      }}
                                    >
                                      {index + 1}
                                    </Box>
                                  </Box>
                                </ListItemAvatar>
                                
                                <ListItemText
                                  sx={{ m: 0 }}
                                  primary={
                                    <Paper
                                      elevation={3}
                                      sx={{
                                        p: 3,
                                        borderRadius: 3,
                                        background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
                                        border: '1px solid',
                                        borderColor: alpha(theme.palette.primary.main, 0.1),
                                        position: 'relative',
                                        '&::before': {
                                          content: '""',
                                          position: 'absolute',
                                          top: 0,
                                          left: 0,
                                          right: 0,
                                          height: 4,
                                          background: hasComment ? 
                                            'linear-gradient(90deg, #FF9800 0%, #F57C00 100%)' :
                                            'linear-gradient(90deg, #2196F3 0%, #1976D2 100%)',
                                          borderRadius: '12px 12px 0 0',
                                        },
                                      }}
                                    >
                                      {/* Activity Header */}
                                      <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5} flexWrap="wrap">
                                        <Chip
                                          label={`กิจกรรม #${index + 1}`}
                                          sx={{
                                            fontWeight: 800,
                                            fontSize: '0.9rem',
                                            height: 32,
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            color: 'white',
                                            border: 'none',
                                            '& .MuiChip-label': { px: 1.5 },
                                          }}
                                        />
                                        <Chip
                                          icon={<PersonOutline />}
                                          label={activity.user_name || 'ไม่ระบุ'}
                                          variant="outlined"
                                          sx={{
                                            fontWeight: 600,
                                            borderColor: alpha(theme.palette.primary.main, 0.3),
                                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                                            color: 'primary.main',
                                          }}
                                        />
                                        {activityDate && (
                                          <Stack direction="row" spacing={0.5} alignItems="center">
                                            <AccessTime fontSize="small" sx={{ color: 'text.secondary' }} />
                                            <Typography 
                                              variant="body2" 
                                              sx={{ 
                                                color: 'text.secondary',
                                                fontWeight: 600,
                                                fontSize: '0.875rem',
                                              }}
                                            >
                                              {format(activityDate, 'dd/MM/yyyy HH:mm น.', { locale: th })}
                                            </Typography>
                                          </Stack>
                                        )}
                                        {/* Duration Chip for Status Changes */}
                                        {index > 0 && activity.details?.some((d: any) => d.property === 'Status') && (
                                          <Chip
                                            icon={<Schedule />}
                                            label={`⏱️ ${calculateDuration(activity.created_at, activities[index - 1].created_at)}`}
                                            size="small"
                                            sx={{
                                              height: 28,
                                              bgcolor: alpha(theme.palette.success.main, 0.1),
                                              color: 'success.main',
                                              fontWeight: 700,
                                              border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                                              '& .MuiChip-label': { px: 1.5 },
                                            }}
                                          />
                                        )}
                                      </Stack>

                                      {/* Comment Section */}
                                      {hasComment && (
                                        <Box
                                          sx={{
                                            p: 2.5,
                                            mb: 3,
                                            background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.08) 0%, rgba(245, 124, 0, 0.12) 100%)',
                                            borderLeft: '6px solid',
                                            borderColor: 'warning.main',
                                            borderRadius: 2,
                                            position: 'relative',
                                            '&::before': {
                                              content: '"💬"',
                                              position: 'absolute',
                                              top: -8,
                                              left: 16,
                                              bgcolor: 'warning.main',
                                              color: 'white',
                                              borderRadius: '50%',
                                              width: 32,
                                              height: 32,
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              fontSize: '1rem',
                                            },
                                          }}
                                        >
                                          <Typography 
                                            variant="subtitle2" 
                                            sx={{ 
                                              fontWeight: 800,
                                              color: 'warning.dark',
                                              mb: 1.5,
                                              textTransform: 'uppercase',
                                              letterSpacing: 0.5,
                                            }}
                                          >
                                            ความคิดเห็น
                                          </Typography>
                                          <Typography 
                                            variant="body1" 
                                            sx={{ 
                                              color: 'text.primary',
                                              whiteSpace: 'pre-wrap',
                                              lineHeight: 1.6,
                                              fontWeight: 500,
                                            }}
                                          >
                                            {activity.notes}
                                          </Typography>
                                        </Box>
                                      )}

                                      {/* Changes Section */}
                                      {hasChanges && (
                                        <Box>
                                          <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                                            <Box
                                              sx={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: '50%',
                                                bgcolor: 'primary.main',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: '1rem',
                                              }}
                                            >
                                              🔄
                                            </Box>
                                            <Typography 
                                              variant="subtitle2" 
                                              sx={{ 
                                                fontWeight: 800,
                                                color: 'primary.main',
                                                textTransform: 'uppercase',
                                                letterSpacing: 0.5,
                                              }}
                                            >
                                              การเปลี่ยนแปลง ({activity.details.length} รายการ)
                                            </Typography>
                                          </Stack>
                                          <Grid container spacing={1.5}>
                                            {activity.details.map((detail: any, i: number) => (
                                              <Grid item xs={12} key={i}>
                                                <Paper
                                                  elevation={1}
                                                  sx={{
                                                    p: 2,
                                                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                                                    border: '1px solid',
                                                    borderColor: alpha(theme.palette.primary.main, 0.1),
                                                    borderRadius: 2,
                                                    transition: 'all 0.3s',
                                                    '&:hover': {
                                                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                                                      borderColor: alpha(theme.palette.primary.main, 0.2),
                                                    },
                                                  }}
                                                >
                                                  <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                                                    <Typography 
                                                      variant="body2" 
                                                      sx={{ 
                                                        fontWeight: 700, 
                                                        color: 'text.primary',
                                                        minWidth: 'fit-content',
                                                      }}
                                                    >
                                                      • {detail.property}:
                                                    </Typography>
                                                    {detail.old_value && (
                                                      <>
                                                        <Chip
                                                          label={detail.old_value}
                                                          size="small"
                                                          sx={{ 
                                                            height: 28,
                                                            bgcolor: alpha(theme.palette.error.main, 0.1),
                                                            color: 'error.main',
                                                            fontWeight: 600,
                                                            border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                                                            '& .MuiChip-label': { px: 1.5 },
                                                          }}
                                                        />
                                                        <Typography 
                                                          variant="h6" 
                                                          sx={{ 
                                                            color: 'text.secondary',
                                                            fontWeight: 800,
                                                            mx: 0.5,
                                                          }}
                                                        >
                                                          →
                                                        </Typography>
                                                      </>
                                                    )}
                                                    <Chip
                                                      label={detail.new_value || 'ไม่มี'}
                                                      size="small"
                                                      sx={{ 
                                                        height: 28,
                                                        bgcolor: alpha(theme.palette.success.main, 0.1),
                                                        color: 'success.main',
                                                        fontWeight: 700,
                                                        border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                                                        '& .MuiChip-label': { px: 1.5 },
                                                      }}
                                                    />
                                                    {/* Duration for Status changes */}
                                                    {detail.property === 'Status' && index > 0 && (
                                                      <Chip
                                                        icon={<Schedule />}
                                                        label={`⏱️ ระยะเวลา: ${calculateDuration(activity.created_at, activities[index - 1].created_at)}`}
                                                        size="small"
                                                        sx={{
                                                          height: 28,
                                                          bgcolor: alpha(theme.palette.info.main, 0.1),
                                                          color: 'info.main',
                                                          fontWeight: 600,
                                                          border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                                                          '& .MuiChip-label': { px: 1.5 },
                                                        }}
                                                      />
                                                    )}
                                                  </Stack>
                                                </Paper>
                                              </Grid>
                                            ))}
                                          </Grid>
                                        </Box>
                                      )}

                                      {!hasComment && !hasChanges && (
                                        <Alert 
                                          severity="info" 
                                          sx={{ 
                                            borderRadius: 2,
                                            bgcolor: alpha(theme.palette.info.main, 0.05),
                                            border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                                          }}
                                        >
                                          ไม่มีข้อมูลกิจกรรม
                                        </Alert>
                                      )}
                                    </Paper>
                                  }
                                />
                              </ListItem>
                            </Fade>
                          );
                        })}
                      </List>
                    </Box>
                  ) : (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                      ยังไม่มีประวัติกิจกรรม
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Zoom>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              {/* Info Card */}
              <Slide direction="left" in timeout={400}>
                <Card elevation={3} sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={700} mb={2}>
                      📊 ข้อมูลทั่วไป
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          หมวดหมู่
                        </Typography>
                        <Chip
                          icon={<Category />}
                          label={wp.category || 'ไม่ระบุ'}
                          size="small"
                          color="secondary"
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                      
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          โครงการ
                        </Typography>
                        <Typography variant="body2" fontWeight={700} sx={{ mt: 0.5 }}>
                          {wp.project_name || '-'}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Slide>

              {/* Assignee Card */}
              <Slide direction="left" in timeout={500}>
                <Card elevation={3} sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={700} mb={2}>
                      👤 ผู้รับผิดชอบ
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar
                        sx={{
                          width: 56,
                          height: 56,
                          bgcolor: 'primary.main',
                          fontSize: '1.5rem',
                          fontWeight: 700,
                        }}
                      >
                        {wp.assignee_name?.charAt(0) || '?'}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight={700}>
                          {wp.assignee_name || 'ยังไม่ได้มอบหมาย'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ผู้รับผิดชอบหลัก
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Slide>

              {/* Timeline Card */}
              <Slide direction="left" in timeout={600}>
                <Card elevation={3} sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={700} mb={2}>
                      📅 ไทม์ไลน์
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Stack spacing={2}>
                      <Box>
                        <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                          <EventNote fontSize="small" color="action" />
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            สร้างเมื่อ:
                          </Typography>
                        </Stack>
                        <Typography variant="body2" pl={3.5}>
                          {wp.created_at
                            ? format(new Date(wp.created_at), 'dd MMMM yyyy HH:mm น.', { locale: th })
                            : '-'}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                          <Update fontSize="small" color="action" />
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            อัปเดตล่าสุด:
                          </Typography>
                        </Stack>
                        <Typography variant="body2" pl={3.5}>
                          {wp.updated_at
                            ? format(new Date(wp.updated_at), 'dd MMMM yyyy HH:mm น.', { locale: th })
                            : '-'}
                        </Typography>
                      </Box>
                      
                      {wp.due_date && (
                        <Box>
                          <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                            <Schedule fontSize="small" color="error" />
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                              กำหนดเสร็จ:
                            </Typography>
                          </Stack>
                          <Typography variant="body2" color="error.main" fontWeight={600} pl={3.5}>
                            {format(new Date(wp.due_date), 'dd MMMM yyyy', { locale: th })}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Slide>

              {/* Stats Card */}
              <Slide direction="left" in timeout={700}>
                <Card
                  elevation={3}
                  sx={{
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: 100,
                      height: 100,
                      background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                      borderRadius: '50%',
                      transform: 'translate(30px, -30px)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={700} mb={3} sx={{ position: 'relative', zIndex: 1 }}>
                      📈 สถิติและความคืบหน้า
                    </Typography>
                    
                    {/* Progress Circle */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3, position: 'relative', zIndex: 1 }}>
                      <Box sx={{ position: 'relative', width: 120, height: 120 }}>
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            background: `conic-gradient(#4CAF50 0deg ${progressPercentage * 3.6}deg, rgba(255,255,255,0.2) ${progressPercentage * 3.6}deg 360deg)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Box
                            sx={{
                              width: 80,
                              height: 80,
                              borderRadius: '50%',
                              bgcolor: 'rgba(255,255,255,0.9)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexDirection: 'column',
                            }}
                          >
                            <Typography variant="h5" fontWeight={800} color="primary.main">
                              {progressPercentage}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                              เสร็จแล้ว
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>

                    <Stack spacing={2.5} sx={{ position: 'relative', zIndex: 1 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Timeline fontSize="small" />
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            จำนวนกิจกรรม
                          </Typography>
                        </Stack>
                        <Chip
                          label={activities.length}
                          size="small"
                          sx={{ 
                            bgcolor: 'rgba(255,255,255,0.25)', 
                            color: 'white', 
                            fontWeight: 700,
                            borderRadius: 2,
                          }}
                        />
                      </Stack>
                      
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Comment fontSize="small" />
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            ความคิดเห็น
                          </Typography>
                        </Stack>
                        <Chip
                          label={activities.filter((a: any) => a.notes).length}
                          size="small"
                          sx={{ 
                            bgcolor: 'rgba(255,255,255,0.25)', 
                            color: 'white', 
                            fontWeight: 700,
                            borderRadius: 2,
                          }}
                        />
                      </Stack>
                      
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Update fontSize="small" />
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            การเปลี่ยนแปลง
                          </Typography>
                        </Stack>
                        <Chip
                          label={activities.reduce((sum: number, a: any) => sum + (a.details?.length || 0), 0)}
                          size="small"
                          sx={{ 
                            bgcolor: 'rgba(255,255,255,0.25)', 
                            color: 'white', 
                            fontWeight: 700,
                            borderRadius: 2,
                          }}
                        />
                      </Stack>

                      {/* Mini Chart */}
                      <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                        <Typography variant="caption" sx={{ opacity: 0.8, mb: 1, display: 'block' }}>
                          กิจกรรมตามเวลา
                        </Typography>
                        <Stack direction="row" spacing={0.5} alignItems="end" height={40}>
                          {activities.slice(0, 7).map((_: any, i: number) => (
                            <Box
                              key={i}
                              sx={{
                                flex: 1,
                                bgcolor: 'rgba(255,255,255,0.4)',
                                height: `${20 + Math.random() * 20}px`,
                                borderRadius: '2px 2px 0 0',
                                transition: 'all 0.3s',
                                '&:hover': {
                                  bgcolor: 'rgba(255,255,255,0.7)',
                                },
                              }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Slide>
            </Stack>
          </Grid>
        </Grid>
      </Container>

      {/* Floating Action Buttons */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
        }}
      >
        <Stack spacing={2}>
          <Tooltip title="เพิ่มความคิดเห็น" placement="left">
            <Fab
              color="secondary"
              sx={{
                background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #F57C00 0%, #E65100 100%)',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.3s',
              }}
            >
              <Add />
            </Fab>
          </Tooltip>
          
          <Tooltip title="รีเฟรชข้อมูล" placement="left">
            <Fab
              color="primary"
              size="medium"
              sx={{
                background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.3s',
              }}
            >
              <Refresh />
            </Fab>
          </Tooltip>
          
          <Tooltip title="พิมพ์" placement="left">
            <Fab
              size="small"
              sx={{
                bgcolor: 'grey.600',
                color: 'white',
                '&:hover': {
                  bgcolor: 'grey.800',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.3s',
              }}
            >
              <Print />
            </Fab>
          </Tooltip>
        </Stack>
      </Box>
    </Box>
  );
};

export default WorkPackageDetailModern;
