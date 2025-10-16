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
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Share,
  MoreVert,
  Assignment,
  Person,
  Schedule,
  TrendingUp,
  Category,
  Description,
  Place,
  Phone,
  CalendarToday,
  Info,
  Timeline as TimelineIcon,
  History,
  AttachFile,
  CloudDownload,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { wpApi } from '../../api/client';
import WorkPackageTimeline from '../../components/WorkPackageTimeline';
import ActivityHistoryCard from '../../components/ActivityHistoryCard';
import DOMPurify from 'dompurify';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ mt: 3 }}>{children}</Box>}
    </div>
  );
}

const WorkPackageDetailModern: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = React.useState(0);

  const wpId = parseInt(id || '0');

  const { data: wpDetail, isLoading, error, refetch } = useQuery({
    queryKey: ['workpackage', wpId],
    queryFn: () => wpApi.get(wpId).then((res) => res.data),
    enabled: !!wpId,
  });

  const { data: journals } = useQuery({
    queryKey: ['workpackage-journals', wpId],
    queryFn: () => wpApi.getJournals(wpId).then((res) => res.data),
    enabled: !!wpId,
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 4, mb: 3 }} />
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 4 }} />
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

  const statusColors: Record<string, string> = {
    'New': '#2196F3',
    'รับเรื่อง': '#0288D1',
    'กำลังดำเนินการ': '#FF9800',
    'ดำเนินการเสร็จ': '#4CAF50',
    'ปิดงาน': '#607D8B',
  };

  const getPriorityColor = (priority: string) => {
    if (priority === 'High') return 'error';
    if (priority === 'Low') return 'success';
    return 'warning';
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', pb: 6 }}>
      {/* Hero Section */}
      <Paper
        elevation={0}
        sx={{
          background: `linear-gradient(135deg, ${statusColors[wp.status] || '#2196F3'} 0%, ${statusColors[wp.status] || '#2196F3'}dd 100%)`,
          color: 'white',
          pt: 4,
          pb: 6,
          mb: 4,
        }}
      >
        <Container maxWidth="xl">
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/workpackages')}
            sx={{
              color: 'white',
              mb: 3,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
            }}
          >
            กลับไปรายการ Work Packages
          </Button>

          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <Chip
                  label={`#${wp.id}`}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1rem',
                  }}
                />
                <Chip
                  label={wp.type}
                  icon={<Category />}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                  }}
                />
              </Stack>

              <Typography variant="h3" fontWeight={700} mb={2} sx={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
                {wp.subject}
              </Typography>

              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Chip
                  label={wp.status}
                  sx={{
                    bgcolor: 'white',
                    color: statusColors[wp.status] || '#2196F3',
                    fontWeight: 700,
                    fontSize: '1rem',
                    px: 2,
                    py: 3,
                  }}
                />
                <Chip
                  label={wp.priority}
                  color={getPriorityColor(wp.priority)}
                  icon={<TrendingUp />}
                  sx={{ fontSize: '1rem', px: 2, py: 3 }}
                />
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: 'rgba(255,255,255,0.95)',
                }}
              >
                <Stack spacing={2}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                      <Person />
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="caption" color="text.secondary">
                        ผู้รับผิดชอบ
                      </Typography>
                      <Typography variant="body1" fontWeight={700}>
                        {wp.assignee_name || 'ยังไม่ได้กำหนด'}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider />

                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: 'secondary.main', width: 48, height: 48 }}>
                      <Schedule />
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="caption" color="text.secondary">
                        สร้างเมื่อ
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {wp.created_at ? format(new Date(wp.created_at), 'dd MMM yyyy, HH:mm น.', { locale: th }) : '-'}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Paper>

      <Container maxWidth="xl">
        {/* Tabs */}
        <Paper elevation={0} sx={{ borderRadius: 3, mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                minHeight: 64,
              },
            }}
          >
            <Tab icon={<Info />} label="รายละเอียด" iconPosition="start" />
            <Tab icon={<TimelineIcon />} label="Timeline & Duration" iconPosition="start" />
            <Tab icon={<History />} label="Activity History" iconPosition="start" />
            <Tab icon={<AttachFile />} label="ไฟล์แนบ" iconPosition="start" />
          </Tabs>
        </Paper>

        {/* Tab 1: Overview */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              {/* Description Card */}
              <Card elevation={0} sx={{ borderRadius: 3, border: '2px solid', borderColor: 'divider', mb: 3 }}>
                <CardContent sx={{ p: 4 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                      <Description />
                    </Avatar>
                    <Typography variant="h6" fontWeight={700}>
                      คำอธิบาย
                    </Typography>
                  </Box>

                  {wp.description ? (
                    <Typography
                      variant="body1"
                      sx={{
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.8,
                        p: 3,
                        bgcolor: 'grey.50',
                        borderRadius: 2,
                      }}
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(wp.description),
                      }}
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary" fontStyle="italic">
                      ไม่มีคำอธิบาย
                    </Typography>
                  )}
                </CardContent>
              </Card>

              {/* Custom Fields */}
              {wp.custom_fields && Object.keys(wp.custom_fields).length > 0 && (
                <Card elevation={0} sx={{ borderRadius: 3, border: '2px solid', borderColor: 'divider' }}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" fontWeight={700} mb={3}>
                      ข้อมูลเพิ่มเติม
                    </Typography>
                    <Grid container spacing={2}>
                      {Object.entries(wp.custom_fields).map(([key, value]) => (
                        <Grid item xs={12} sm={6} key={key}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 2,
                              bgcolor: 'grey.50',
                              borderRadius: 2,
                              borderLeft: '4px solid',
                              borderColor: 'primary.main',
                            }}
                          >
                            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                              {key}
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {String(value) || '-'}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              )}
            </Grid>

            <Grid item xs={12} md={4}>
              {/* Info Card */}
              <Card elevation={0} sx={{ borderRadius: 3, border: '2px solid', borderColor: 'divider', mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={700} mb={3}>
                    ข้อมูลทั่วไป
                  </Typography>

                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <Assignment color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="รหัสงาน"
                        secondary={`#${wp.id}`}
                        primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                        secondaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />

                    <ListItem>
                      <ListItemIcon>
                        <Category color="secondary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="ประเภท"
                        secondary={wp.type || '-'}
                        primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                        secondaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />

                    <ListItem>
                      <ListItemIcon>
                        <TrendingUp color="warning" />
                      </ListItemIcon>
                      <ListItemText
                        primary="ลำดับความสำคัญ"
                        secondary={wp.priority || 'Normal'}
                        primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                        secondaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />

                    <ListItem>
                      <ListItemIcon>
                        <Person color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary="ผู้สร้าง"
                        secondary={wp.author_name || '-'}
                        primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                        secondaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>

              {/* Timeline Summary Card */}
              <Card elevation={3} sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={700} mb={3}>
                    สรุปเวลา
                  </Typography>

                  <Box mb={2}>
                    <Typography variant="caption" display="block" mb={0.5}>
                      สร้างเมื่อ
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {wp.created_at ? format(new Date(wp.created_at), 'dd MMM yyyy, HH:mm น.', { locale: th }) : '-'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" display="block" mb={0.5}>
                      อัพเดทล่าสุด
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {wp.updated_at ? format(new Date(wp.updated_at), 'dd MMM yyyy, HH:mm น.', { locale: th }) : '-'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 2: Timeline */}
        <TabPanel value={tabValue} index={1}>
          <WorkPackageTimeline
            activities={activities}
            createdAt={wp.created_at}
            currentStatus={wp.status}
          />
        </TabPanel>

        {/* Tab 3: Activity History */}
        <TabPanel value={tabValue} index={2}>
          <ActivityHistoryCard activities={activities} />
        </TabPanel>

        {/* Tab 4: Attachments */}
        <TabPanel value={tabValue} index={3}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '2px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight={700} mb={3}>
                ไฟล์แนบ
              </Typography>
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                ยังไม่มีไฟล์แนบในระบบ
              </Alert>
            </CardContent>
          </Card>
        </TabPanel>
      </Container>
    </Box>
  );
};

export default WorkPackageDetailModern;
