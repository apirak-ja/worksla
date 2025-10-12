import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  Button,
  Tab,
  Tabs,
  Card,
  CardContent,
  Avatar,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import {
  OpenInNew,
  Comment as CommentIcon,
  Edit as EditIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material'
import { wpApi } from '../../api/client'
import { format } from 'date-fns'
import { api } from '../../api/client'

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
      id={`wp-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const WorkPackageDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const wpId = parseInt(id || '0')
  const [tabValue, setTabValue] = useState(0)
  const [activitiesPage, setActivitiesPage] = useState(1)
  const [activityFilter, setActivityFilter] = useState('')
  const activitiesPageSize = 10

  const { data: wp, isLoading, error } = useQuery({
    queryKey: ['workpackage', wpId],
    queryFn: () => wpApi.get(wpId).then((res) => res.data),
    enabled: !!wpId,
  })

  // Fetch activities
  const { data: activitiesData, isLoading: activitiesLoading } = useQuery({
    queryKey: ['workpackage-activities', wpId, activitiesPage, activityFilter],
    queryFn: async () => {
      const offset = (activitiesPage - 1) * activitiesPageSize;
      const response = await api.get(`/workpackages/${wpId}/activities`, {
        params: {
          offset,
          page_size: activitiesPageSize
        }
      });
      return response.data;
    },
    enabled: !!wpId && tabValue === 2, // Only fetch when Activities tab is active
  })

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  }

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'comment':
        return <CommentIcon />;
      case 'status_change':
        return <CheckCircleIcon />;
      case 'assignment_change':
        return <AssignmentIcon />;
      default:
        return <EditIcon />;
    }
  }

  const getActivityColor = (activityType: string) => {
    switch (activityType) {
      case 'comment':
        return 'primary';
      case 'status_change':
        return 'success';
      case 'assignment_change':
        return 'warning';
      default:
        return 'default';
    }
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    )
  }

  if (error || !wp) {
    return <Alert severity="error">Work package not found.</Alert>
  }

  const activities = activitiesData?.activities || [];
  const totalActivities = activitiesData?.total || 0;
  const totalPages = Math.ceil(totalActivities / activitiesPageSize);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={600}>
          Work Package #{wp.wp_id}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<OpenInNew />}
          href={`https://hosp.wu.ac.th/cmms/work_packages/${wp.wp_id}`}
          target="_blank"
        >
          Open in OpenProject
        </Button>
      </Box>

      {/* Header Info Card */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          {wp.subject}
        </Typography>

        <Box display="flex" gap={1} flexWrap="wrap" mt={2} mb={3}>
          {wp.status && <Chip label={wp.status} color="primary" />}
          {wp.priority && <Chip label={wp.priority} color={wp.priority === 'High' ? 'error' : 'default'} />}
          {wp.type && <Chip label={wp.type} variant="outlined" />}
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="caption" color="text.secondary">
              Assignee
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {wp.assignee_name || 'Unassigned'}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="caption" color="text.secondary">
              Project
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {wp.project_name || 'N/A'}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="caption" color="text.secondary">
              Due Date
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {wp.due_date ? format(new Date(wp.due_date), 'PPP') : 'N/A'}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="caption" color="text.secondary">
              Created
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {wp.created_at ? format(new Date(wp.created_at), 'PPP') : 'N/A'}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="caption" color="text.secondary">
              Updated
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {wp.updated_at ? format(new Date(wp.updated_at), 'PPP p') : 'N/A'}
            </Typography>
          </Grid>

          {wp.done_ratio !== undefined && (
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="caption" color="text.secondary">
                Progress
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {wp.done_ratio}%
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Overview" />
            <Tab label="Description" />
            <Tab label="Activities" />
          </Tabs>
        </Box>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Work Package Overview
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Key Information
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Type
                        </Typography>
                        <Typography variant="body1">
                          {wp.type || 'N/A'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Status
                        </Typography>
                        <Typography variant="body1">
                          {wp.status || 'N/A'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Priority
                        </Typography>
                        <Typography variant="body1">
                          {wp.priority || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Timeline
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Start Date
                        </Typography>
                        <Typography variant="body1">
                          {wp.start_date ? format(new Date(wp.start_date), 'PPP') : 'N/A'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Due Date
                        </Typography>
                        <Typography variant="body1">
                          {wp.due_date ? format(new Date(wp.due_date), 'PPP') : 'N/A'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Estimated Hours
                        </Typography>
                        <Typography variant="body1">
                          {wp.estimated_hours || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Description Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            {wp.description ? (
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'grey.50',
                  borderRadius: 1,
                  minHeight: 200
                }}
                dangerouslySetInnerHTML={{ __html: wp.description }}
              />
            ) : (
              <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                No description provided
              </Typography>
            )}
          </Box>
        </TabPanel>

        {/* Activities Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Activities ({totalActivities})
              </Typography>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Filter</InputLabel>
                <Select
                  value={activityFilter}
                  label="Filter"
                  onChange={(e) => setActivityFilter(e.target.value)}
                >
                  <MenuItem value="">All Activities</MenuItem>
                  <MenuItem value="comment">Comments</MenuItem>
                  <MenuItem value="status_change">Status Changes</MenuItem>
                  <MenuItem value="assignment_change">Assignment Changes</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {activitiesLoading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : activities.length === 0 ? (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No activities found
              </Typography>
            ) : (
              <>
                <Timeline>
                  {activities.map((activity: any, index: number) => (
                    <TimelineItem key={activity.id}>
                      <TimelineSeparator>
                        <TimelineDot color={getActivityColor(activity.type) as any}>
                          {getActivityIcon(activity.type)}
                        </TimelineDot>
                        {index < activities.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent>
                        <Card sx={{ mb: 2 }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                              <Avatar sx={{ width: 32, height: 32 }}>
                                {activity.user_name?.charAt(0) || '?'}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2">
                                  {activity.user_name || 'Unknown User'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {activity.created_at ? format(new Date(activity.created_at), 'PPP p') : ''}
                                </Typography>
                              </Box>
                            </Box>
                            {activity.notes && (
                              <Box
                                sx={{ mt: 1 }}
                                dangerouslySetInnerHTML={{ __html: activity.notes }}
                              />
                            )}
                            {activity.details && activity.details.length > 0 && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="caption" color="text.secondary">
                                  Changes:
                                </Typography>
                                {activity.details.map((detail: any, idx: number) => (
                                  <Typography key={idx} variant="body2" sx={{ ml: 1 }}>
                                    • {detail.format || detail.raw || 'Change recorded'}
                                  </Typography>
                                ))}
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>

                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination
                      count={totalPages}
                      page={activitiesPage}
                      onChange={(_, page) => setActivitiesPage(page)}
                      color="primary"
                    />
                  </Box>
                )}
              </>
            )}
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  )
}

export default WorkPackageDetailPage
