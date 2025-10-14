import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Grid,
  Chip,
  Avatar,
  Paper,
  Divider,
  Stack,
  Breadcrumbs,
  Link,
  IconButton,
  Tab,
  Tabs,
  List,
  ListItem,
  Container,
} from '@mui/material';
import {
  ArrowBack,
  Assignment,
  Person,
  Event,
  TrendingUp,
  Category,
  FiberManualRecord,
  AccessTime,
  Comment,
  ChangeCircle,
  Info,
  Schedule,
  CheckCircle,
} from '@mui/icons-material';
import { wpApi } from '../../api/client';
import { format, formatDistanceToNow, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';
import { th } from 'date-fns/locale';

interface Activity {
  id: number;
  notes: string;
  created_at: string;
  user_id: number;
  user_name: string;
  version: number;
  details: any[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const WorkPackageDetailPageNew: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);

  const wpId = parseInt(id || '0');

  const { data: wpDetail, isLoading, error } = useQuery({
    queryKey: ['workpackage', wpId],
    queryFn: () => wpApi.get(wpId).then((res) => res.data),
    enabled: !!wpId,
  });

  const { data: journals, isLoading: isJournalsLoading } = useQuery({
    queryKey: ['workpackage-journals', wpId],
    queryFn: () => wpApi.getJournals(wpId).then((res) => res.data),
  });

  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('ดำเนินการเสร็จ') || statusLower.includes('completed') || statusLower.includes('ปิด')) return 'success';
    if (statusLower.includes('กำลังดำเนินการ') || statusLower.includes('progress')) return 'primary';
    if (statusLower.includes('รับเรื่อง') || statusLower.includes('assigned')) return 'warning';
    if (statusLower.includes('new') || statusLower.includes('ใหม่')) return 'info';
    return 'default';
  };

  const getStatusBgColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('ดำเนินการเสร็จ') || statusLower.includes('completed') || statusLower.includes('ปิด')) return '#E8F5E9';
    if (statusLower.includes('กำลังดำเนินการ') || statusLower.includes('progress')) return '#E3F2FD';
    if (statusLower.includes('รับเรื่อง') || statusLower.includes('assigned')) return '#FFF3E0';
    if (statusLower.includes('new') || statusLower.includes('ใหม่')) return '#E1F5FE';
    return '#F5F5F5';
  };

  const getPriorityColor = (priority: string): 'default' | 'error' | 'warning' | 'success' => {
    const priorityLower = priority?.toLowerCase() || '';
    if (priorityLower.includes('high') || priorityLower.includes('สูง')) return 'error';
    if (priorityLower.includes('normal') || priorityLower.includes('ปกติ')) return 'warning';
    if (priorityLower.includes('low') || priorityLower.includes('ต่ำ')) return 'success';
    return 'default';
  };

  const getActivityIcon = (activity: Activity) => {
    if (!activity.details || activity.details.length === 0) {
      if (activity.notes) return <Comment />;
      return <Info />;
    }

    const hasStatusChange = activity.details.some((d: any) => 
      d.property?.toLowerCase().includes('status')
    );
    const hasAssigneeChange = activity.details.some((d: any) => 
      d.property?.toLowerCase().includes('assignee')
    );
    const hasPriorityChange = activity.details.some((d: any) => 
      d.property?.toLowerCase().includes('priority')
    );

    if (hasStatusChange) return <ChangeCircle />;
    if (hasAssigneeChange) return <Person />;
    if (hasPriorityChange) return <TrendingUp />;
    if (activity.notes) return <Comment />;
    return <Info />;
  };

  const getActivityColorCode = (activity: Activity) => {
    if (!activity.details || activity.details.length === 0) {
      if (activity.notes) return '#9C27B0'; // Purple for comments
      return '#757575'; // Grey for info
    }

    const statusChange = activity.details.find((d: any) => 
      d.property?.toLowerCase().includes('status')
    );

    if (statusChange) {
      const newValue = statusChange.new_value?.toLowerCase() || '';
      if (newValue.includes('ดำเนินการเสร็จ') || newValue.includes('completed') || newValue.includes('ปิด')) return '#4CAF50';
      if (newValue.includes('กำลังดำเนินการ') || newValue.includes('progress')) return '#2196F3';
      if (newValue.includes('รับเรื่อง') || newValue.includes('assigned')) return '#FF9800';
      return '#03A9F4';
    }

    if (activity.notes) return '#9C27B0';
    return '#757575';
  };

  const calculateDuration = (startDate: Date, endDate: Date) => {
    const minutes = differenceInMinutes(endDate, startDate);
    const hours = differenceInHours(endDate, startDate);
    const days = differenceInDays(endDate, startDate);

    if (days > 0) {
      const remainingHours = hours % 24;
      if (remainingHours > 0) {
        return `${days} วัน ${remainingHours} ชม.`;
      }
      return `${days} วัน`;
    }
    if (hours > 0) {
      const remainingMinutes = minutes % 60;
      if (remainingMinutes > 0) {
        return `${hours} ชม. ${remainingMinutes} นาที`;
      }
      return `${hours} ชม.`;
    }
    if (minutes > 0) {
      return `${minutes} นาที`;
    }
    return 'เพิ่งเกิดขึ้น';
  };

  const getTotalDuration = () => {
    const activityList = journals?.journals || [];
    if (activityList.length < 2) return null;
    
    const firstActivity = activityList[activityList.length - 1];
    const lastActivity = activityList[0];
    
    return calculateDuration(
      new Date(firstActivity.created_at),
      new Date(lastActivity.created_at)
    );
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error || !wpDetail) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">ไม่สามารถโหลดข้อมูล Work Package ได้</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/worksla/workpackages')} sx={{ mt: 2 }}>
          กลับ
        </Button>
      </Container>
    );
  }

  const wp: any = wpDetail;

  // Overview Tab Content
  const renderOverviewTab = () => (
    <Grid container spacing={3}>
      {/* Left Column - Main Info */}
      <Grid item xs={12} md={8}>
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Assignment color="primary" />
              รายละเอียด
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                คำอธิบาย
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {wp.description ? wp.description.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() : 'ไม่มีคำอธิบาย'}
                </Typography>
              </Paper>
            </Box>

            {wp.custom_fields && Object.keys(wp.custom_fields).length > 0 && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  ข้อมูลเพิ่มเติม
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(wp.custom_fields).map(([key, value]) => (
                    <Grid item xs={12} sm={6} key={key}>
                      <Paper variant="outlined" sx={{ p: 1.5 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {key}
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {String(value) || '-'}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Right Column - Metadata */}
      <Grid item xs={12} md={4}>
        <Stack spacing={2}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Person color="primary" />
                <Typography variant="subtitle2">ผู้รับผิดชอบ</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {wp.assignee_name?.charAt(0).toUpperCase() || '?'}
                </Avatar>
                <Typography variant="body2" fontWeight={500}>
                  {wp.assignee_name || 'ยังไม่ได้กำหนด'}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Event color="primary" />
                <Typography variant="subtitle2">วันที่</Typography>
              </Box>
              <Stack spacing={1}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    สร้างเมื่อ
                  </Typography>
                  <Typography variant="body2">
                    {wp.created_at ? format(new Date(wp.created_at), 'dd MMM yyyy HH:mm', { locale: th }) : '-'}
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    อัปเดตล่าสุด
                  </Typography>
                  <Typography variant="body2">
                    {wp.updated_at ? format(new Date(wp.updated_at), 'dd MMM yyyy HH:mm', { locale: th }) : '-'}
                  </Typography>
                </Box>
                {wp.due_date && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        กำหนดส่ง
                      </Typography>
                      <Typography variant="body2" color="error.main" fontWeight={600}>
                        {format(new Date(wp.due_date), 'dd MMM yyyy', { locale: th })}
                      </Typography>
                    </Box>
                  </>
                )}
              </Stack>
            </CardContent>
          </Card>

          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <TrendingUp color="primary" />
                <Typography variant="subtitle2">ลำดับความสำคัญ</Typography>
              </Box>
              <Chip
                label={wp.priority || 'Normal'}
                color={getPriorityColor(wp.priority)}
                sx={{ width: '100%', fontWeight: 600 }}
              />
            </CardContent>
          </Card>

          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Category color="primary" />
                <Typography variant="subtitle2">ประเภท</Typography>
              </Box>
              <Typography variant="body2">{wp.type || '-'}</Typography>
            </CardContent>
          </Card>
        </Stack>
      </Grid>
    </Grid>
  );

  // Timeline Tab Content - Redesigned to match ID34909 structure
  const renderTimelineTab = () => {
    if (isJournalsLoading) {
      return (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      );
    }

    const activityList = journals?.journals || [];

    if (activityList.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          ไม่มีประวัติการทำงาน
        </Alert>
      );
    }

    // Calculate duration between status changes
    const getStatusChangeDuration = (currentActivity: Activity, previousActivity?: Activity) => {
      if (!previousActivity) return null;
      
      const currentStatusChange = currentActivity.details?.find((d: any) => 
        d.property?.toLowerCase().includes('status')
      );
      const prevStatusChange = previousActivity.details?.find((d: any) => 
        d.property?.toLowerCase().includes('status')
      );
      
      if (currentStatusChange && prevStatusChange) {
        const currentDate = new Date(currentActivity.created_at);
        const prevDate = new Date(previousActivity.created_at);
        return calculateDuration(currentDate, prevDate);
      }
      
      return null;
    };

    const totalDuration = getTotalDuration();

    return (
      <Box sx={{ mt: 2 }}>
        {/* Summary Header */}
        {totalDuration && (
          <Paper
            elevation={3}
            sx={{
              p: 2.5,
              mb: 4,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 2,
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Schedule sx={{ fontSize: 32 }} />
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      ระยะเวลาทั้งหมด
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {totalDuration}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box display="flex" alignItems="center" gap={1}>
                  <ChangeCircle sx={{ fontSize: 28 }} />
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      จำนวนกิจกรรม
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {activityList.length} รายการ
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box display="flex" alignItems="center" gap={1}>
                  <CheckCircle sx={{ fontSize: 28 }} />
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      สถานะปัจจุบัน
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {wp.status || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Timeline Activities */}
        <Box sx={{ position: 'relative' }}>
          {activityList.map((activity: Activity, index: number) => {
            const activityDate = new Date(activity.created_at);
            const activityNumber = activityList.length - index;
            const previousActivity = index > 0 ? activityList[index - 1] : undefined;
            const statusDuration = getStatusChangeDuration(activity, previousActivity);

            // Check if this is a creation or update activity
            const isCreation = activity.details?.some((d: any) => 
              d.property?.toLowerCase().includes('type') || 
              d.property?.toLowerCase().includes('project')
            ) && index === activityList.length - 1;

            return (
              <Box
                key={activity.id}
                sx={{
                  mb: 4,
                  position: 'relative',
                }}
              >
                {/* Activity Card */}
                <Paper
                  elevation={3}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: '2px solid',
                    borderColor: isCreation ? 'success.light' : 'primary.light',
                    bgcolor: 'background.paper',
                    transition: 'all 0.3s',
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  {/* Activity Header */}
                  <Box sx={{ mb: 2 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2} mb={1}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar
                          sx={{
                            width: 48,
                            height: 48,
                            bgcolor: isCreation ? 'success.main' : 'primary.main',
                            fontSize: '1.2rem',
                            fontWeight: 700,
                            boxShadow: 2,
                          }}
                        >
                          {activity.user_name?.charAt(0).toUpperCase() || 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight={700} color="primary.main">
                            Activity #{activityNumber} - {activity.user_name || 'Unknown User'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {isCreation ? 'created on' : 'updated on'} {format(activityDate, 'dd/MM/yyyy HH:mm a', { locale: th })}
                          </Typography>
                        </Box>
                      </Box>
                      {statusDuration && (
                        <Chip
                          icon={<AccessTime />}
                          label={`ระยะเวลา: ${statusDuration}`}
                          color="success"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            height: 36,
                            boxShadow: 2,
                          }}
                        />
                      )}
                    </Box>
                    <Divider />
                  </Box>

                  {/* Comment Section */}
                  {activity.notes && activity.notes.trim() !== '' && (
                    <Box sx={{ mb: 3 }}>
                      <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                        <Comment sx={{ fontSize: 22, color: '#9C27B0' }} />
                        <Typography variant="subtitle1" color="#9C27B0" fontWeight={700}>
                          💬 Comment:
                        </Typography>
                      </Box>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2.5,
                          bgcolor: '#F3E5F5',
                          borderRadius: 2,
                          borderLeft: 5,
                          borderColor: '#9C27B0',
                        }}
                      >
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            color: '#4A148C',
                            fontWeight: 500,
                            lineHeight: 1.8,
                            whiteSpace: 'pre-wrap',
                          }}
                        >
                          {activity.notes.replace(/<[^>]*>/g, '').trim()}
                        </Typography>
                      </Paper>
                    </Box>
                  )}

                  {/* Changes Section */}
                  {activity.details && activity.details.length > 0 && (
                    <Box>
                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <ChangeCircle sx={{ fontSize: 22, color: 'info.main' }} />
                        <Typography variant="subtitle1" color="info.main" fontWeight={700}>
                          🔄 Changes ({activity.details.length}):
                        </Typography>
                      </Box>
                      
                      <Stack spacing={2}>
                        {activity.details.map((detail: any, idx: number) => {
                          const isStatusChange = detail.property?.toLowerCase().includes('status');
                          const isAssigneeChange = detail.property?.toLowerCase().includes('assignee');
                          
                          return (
                            <Paper
                              key={idx}
                              variant="outlined"
                              sx={{
                                p: 2,
                                bgcolor: isStatusChange 
                                  ? 'success.50' 
                                  : isAssigneeChange 
                                  ? 'info.50' 
                                  : 'grey.50',
                                borderLeft: 5,
                                borderColor: isStatusChange 
                                  ? 'success.main' 
                                  : isAssigneeChange 
                                  ? 'info.main' 
                                  : 'grey.400',
                                borderRadius: 1,
                              }}
                            >
                              <Typography 
                                variant="body2" 
                                fontWeight={700} 
                                color="text.primary"
                                sx={{ mb: 1 }}
                              >
                                • {detail.property || 'Property'}
                                {detail.old_value && detail.new_value && ' changed'}
                                {!detail.old_value && detail.new_value && ' set'}
                              </Typography>
                              
                              <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                                {detail.old_value && (
                                  <>
                                    <Typography variant="body2" color="text.secondary">
                                      from
                                    </Typography>
                                    <Chip
                                      label={detail.old_value}
                                      size="medium"
                                      sx={{
                                        bgcolor: 'grey.300',
                                        fontWeight: 600,
                                        textDecoration: 'line-through',
                                        opacity: 0.8,
                                      }}
                                    />
                                  </>
                                )}
                                {detail.new_value && (
                                  <>
                                    <Typography variant="body2" color="text.secondary" fontWeight={700}>
                                      {detail.old_value ? 'to' : ''}
                                    </Typography>
                                    <Chip
                                      label={detail.new_value}
                                      size="medium"
                                      color={isStatusChange ? 'success' : isAssigneeChange ? 'info' : 'default'}
                                      sx={{
                                        fontWeight: 700,
                                        fontSize: '0.875rem',
                                        boxShadow: 1,
                                      }}
                                    />
                                  </>
                                )}
                              </Box>
                            </Paper>
                          );
                        })}
                      </Stack>
                    </Box>
                  )}
                </Paper>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh', pb: 4 }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          py: 2,
          px: 3,
          mb: 3,
        }}
      >
        <Box maxWidth="lg" mx="auto">
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link
              component="button"
              onClick={() => navigate('/worksla/workpackages')}
              sx={{ textDecoration: 'none', color: 'text.primary' }}
            >
              Work Packages
            </Link>
            <Typography color="text.primary">#{wp.id}</Typography>
          </Breadcrumbs>

          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            <IconButton onClick={() => navigate('/worksla/workpackages')} size="small">
              <ArrowBack />
            </IconButton>
            <Typography variant="h5" fontWeight={600} flex={1}>
              #{wp.id} - {wp.subject}
            </Typography>
            <Chip
              label={wp.status}
              sx={{
                bgcolor: getStatusBgColor(wp.status),
                color: 'text.primary',
                fontWeight: 600,
                px: 1,
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Content */}
      <Box maxWidth="lg" mx="auto" px={3}>
        <Paper elevation={0} sx={{ borderRadius: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              px: 2,
            }}
          >
            <Tab
              icon={<Assignment />}
              iconPosition="start"
              label="ภาพรวม"
              sx={{ fontWeight: 600 }}
            />
            <Tab
              icon={<Schedule />}
              iconPosition="start"
              label="Timeline"
              sx={{ fontWeight: 600 }}
            />
          </Tabs>

          <Box sx={{ p: 3 }}>
            <TabPanel value={tabValue} index={0}>
              {renderOverviewTab()}
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              {renderTimelineTab()}
            </TabPanel>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default WorkPackageDetailPageNew;
