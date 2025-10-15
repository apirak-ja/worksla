import * as React from 'react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  Paper,
  Divider,
  Stack,
  IconButton,
  Tab,
  Tabs,
  Tooltip,
  Skeleton,
} from '@mui/material'
import {
  ArrowBack,
  Assignment,
  Person,
  Event,
  TrendingUp,
  Category,
  Schedule,
  CheckCircle,
  Comment,
  ChangeCircle,
  Info,
  Edit,
  Share,
  Delete,
  Timeline,
  Description,
  AttachFile,
  Link as LinkIcon,
} from '@mui/icons-material'
import { wpApi } from '../../api/client'
import { format, formatDistanceToNow, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns'
import { th } from 'date-fns/locale'
import DOMPurify from 'dompurify'

// ============================================================
// Utility Functions
// ============================================================

const getStatusColor = (status: string) => {
  const statusColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
    'New': 'info',
    'รับเรื่อง': 'primary', 
    'กำลังดำเนินการ': 'warning',
    'ดำเนินการเสร็จ': 'success',
    'ปิดงาน': 'default',
  }
  return statusColors[status] || 'default'
}

const getPriorityColor = (priority: string) => {
  const priorityColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
    'High': 'error',
    'Normal': 'warning', 
    'Low': 'success',
  }
  return priorityColors[priority] || 'default'
}

const formatDateThai = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    return format(date, 'dd/MM/yyyy HH:mm', { locale: th })
  } catch {
    return dateString
  }
}

const calculateDuration = (startDate: Date, endDate: Date) => {
  const minutes = differenceInMinutes(endDate, startDate)
  const hours = differenceInHours(endDate, startDate)
  const days = differenceInDays(endDate, startDate)

  if (days > 0) {
    const remainingHours = hours % 24
    if (remainingHours > 0) {
      return `${days} วัน ${remainingHours} ชม.`
    }
    return `${days} วัน`
  }
  if (hours > 0) {
    const remainingMinutes = minutes % 60
    if (remainingMinutes > 0) {
      return `${hours} ชม. ${remainingMinutes} นาที`
    }
    return `${hours} ชม.`
  }
  if (minutes > 0) {
    return `${minutes} นาที`
  }
  return 'เพิ่งเกิดขึ้น'
}

const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'a'],
    ALLOWED_ATTR: ['href', 'target'],
  })
}

// ============================================================
// Tab Panel Component
// ============================================================

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

// ============================================================
// Loading State Component
// ============================================================

const LoadingState: React.FC = () => (
  <Box sx={{ p: 3 }}>
    <Skeleton variant="rectangular" height={200} sx={{ mb: 3, borderRadius: 2 }} />
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
      </Grid>
      <Grid item xs={12} md={4}>
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
      </Grid>
    </Grid>
  </Box>
)

// ============================================================
// Error State Component
// ============================================================

const ErrorState: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <Paper
    elevation={0}
    sx={{
      p: 6,
      textAlign: 'center',
      border: '2px dashed',
      borderColor: 'error.light',
      borderRadius: 3,
      bgcolor: 'error.lighter',
    }}
  >
    <Assignment sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
    <Typography variant="h5" fontWeight={700} gutterBottom color="error">
      เกิดข้อผิดพลาด
    </Typography>
    <Typography variant="body2" color="text.secondary" mb={3}>
      {message}
    </Typography>
    <Button variant="contained" onClick={onRetry} color="error">
      ลองอีกครั้ง
    </Button>
  </Paper>
)

// ============================================================
// Status Chip Component  
// ============================================================

interface StatusChipProps {
  status: string
  size?: 'small' | 'medium'
}

const StatusChip: React.FC<StatusChipProps> = ({ status, size = 'medium' }) => {
  return (
    <Chip
      label={status}
      size={size}
      color={getStatusColor(status)}
      variant="filled"
      sx={{ 
        fontWeight: 700,
        fontSize: size === 'small' ? '0.75rem' : '0.875rem',
      }}
    />
  )
}

// ============================================================
// Main Component
// ============================================================

const WorkPackageDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [tabValue, setTabValue] = useState(0)

  const wpId = parseInt(id || '0')

  const { data: wpDetail, isLoading, error, refetch } = useQuery({
    queryKey: ['workpackage', wpId],
    queryFn: () => wpApi.get(wpId).then((res) => res.data),
    enabled: !!wpId,
  })

  const { data: journals, isLoading: isJournalsLoading } = useQuery({
    queryKey: ['workpackage-journals', wpId],
    queryFn: () => wpApi.getJournals(wpId).then((res) => res.data),
    enabled: !!wpId,
  })

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  if (isLoading) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <LoadingState />
      </Box>
    )
  }

  if (error || !wpDetail) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate('/workpackages')}
          sx={{ mb: 3 }}
        >
          กลับ
        </Button>
        <ErrorState
          message="ไม่สามารถโหลดข้อมูล Work Package ได้"
          onRetry={() => refetch()}
        />
      </Box>
    )
  }

  const wp: any = wpDetail

  // Calculate total duration from activities
  const getTotalDuration = () => {
    const activityList = journals?.journals || []
    if (activityList.length < 2) return null
    
    const firstActivity = activityList[activityList.length - 1]
    const lastActivity = activityList[0]
    
    return calculateDuration(
      new Date(firstActivity.created_at),
      new Date(lastActivity.created_at)
    )
  }

  const totalDuration = getTotalDuration()

  // ============================================================
  // Render Functions for Tabs
  // ============================================================

  const renderOverviewTab = () => (
    <Grid container spacing={3}>
      {/* Left Column - Main Info */}
      <Grid item xs={12} md={8}>
        <Card 
          elevation={3}
          sx={{
            borderRadius: 3,
            border: '2px solid',
            borderColor: 'primary.light',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Description sx={{ fontSize: 32, color: 'primary.main' }} />
              <Typography variant="h5" fontWeight={700}>
                รายละเอียด
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} color="text.secondary" gutterBottom>
                คำอธิบาย
              </Typography>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 3, 
                  bgcolor: 'grey.50',
                  borderRadius: 2,
                  minHeight: 100,
                }}
              >
                {wp.description ? (
                  <Typography 
                    variant="body1" 
                    sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHTML(wp.description)
                    }}
                  />
                ) : (
                  <Typography variant="body1" color="text.secondary" fontStyle="italic">
                    ไม่มีคำอธิบาย
                  </Typography>
                )}
              </Paper>
            </Box>

            {wp.custom_fields && Object.keys(wp.custom_fields).length > 0 && (
              <Box>
                <Typography variant="subtitle1" fontWeight={600} color="text.secondary" gutterBottom>
                  ข้อมูลเพิ่มเติม
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(wp.custom_fields).map(([key, value]) => (
                    <Grid item xs={12} sm={6} key={key}>
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 2,
                          borderRadius: 2,
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: 'primary.lighter',
                          }
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
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Right Column - Metadata */}
      <Grid item xs={12} md={4}>
        <Stack spacing={3}>
          {/* Assignee Card */}
          <Card 
            elevation={3}
            sx={{
              borderRadius: 3,
              border: '2px solid',
              borderColor: 'info.light',
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                <Person sx={{ fontSize: 28, color: 'info.main' }} />
                <Typography variant="subtitle1" fontWeight={700}>
                  ผู้รับผิดชอบ
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar 
                  sx={{ 
                    bgcolor: 'info.main',
                    width: 48,
                    height: 48,
                    fontSize: '1.25rem',
                    fontWeight: 700,
                  }}
                >
                  {wp.assignee_name?.charAt(0).toUpperCase() || '?'}
                </Avatar>
                <Typography variant="body1" fontWeight={600}>
                  {wp.assignee_name || 'ยังไม่ได้กำหนด'}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Dates Card */}
          <Card 
            elevation={3}
            sx={{
              borderRadius: 3,
              border: '2px solid',
              borderColor: 'warning.light',
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                <Event sx={{ fontSize: 28, color: 'warning.main' }} />
                <Typography variant="subtitle1" fontWeight={700}>
                  วันที่
                </Typography>
              </Box>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                    สร้างเมื่อ
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {wp.created_at ? formatDateThai(wp.created_at) : '-'}
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                    อัปเดตล่าสุด
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {wp.updated_at ? formatDateThai(wp.updated_at) : '-'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {wp.updated_at && formatDistanceToNow(new Date(wp.updated_at), { 
                      addSuffix: true, 
                      locale: th 
                    })}
                  </Typography>
                </Box>
                {wp.due_date && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                        กำหนดส่ง
                      </Typography>
                      <Typography variant="body1" color="error.main" fontWeight={700}>
                        {format(new Date(wp.due_date), 'dd MMM yyyy', { locale: th })}
                      </Typography>
                    </Box>
                  </>
                )}
                {totalDuration && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                        ระยะเวลาทั้งหมด
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Schedule color="primary" />
                        <Typography variant="body1" color="primary" fontWeight={700}>
                          {totalDuration}
                        </Typography>
                      </Box>
                    </Box>
                  </>
                )}
              </Stack>
            </CardContent>
          </Card>

          {/* Priority Card */}
          <Card 
            elevation={3}
            sx={{
              borderRadius: 3,
              border: '2px solid',
              borderColor: getPriorityColor(wp.priority) + '.light',
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                <TrendingUp sx={{ fontSize: 28, color: getPriorityColor(wp.priority) + '.main' }} />
                <Typography variant="subtitle1" fontWeight={700}>
                  ลำดับความสำคัญ
                </Typography>
              </Box>
              <Chip
                label={wp.priority || 'Normal'}
                color={getPriorityColor(wp.priority)}
                sx={{ 
                  width: '100%', 
                  fontWeight: 700,
                  fontSize: '1rem',
                  py: 2.5,
                }}
              />
            </CardContent>
          </Card>

          {/* Type Card */}
          <Card 
            elevation={3}
            sx={{
              borderRadius: 3,
              border: '2px solid',
              borderColor: 'secondary.light',
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                <Category sx={{ fontSize: 28, color: 'secondary.main' }} />
                <Typography variant="subtitle1" fontWeight={700}>
                  ประเภท
                </Typography>
              </Box>
              <Typography variant="body1" fontWeight={600}>
                {wp.type || '-'}
              </Typography>
            </CardContent>
          </Card>
        </Stack>
      </Grid>
    </Grid>
  )

  const renderTimelineTab = () => {
    if (isJournalsLoading) {
      return (
        <Box display="flex" justifyContent="center" py={6}>
          <Stack spacing={2} alignItems="center">
            <Skeleton variant="circular" width={60} height={60} />
            <Skeleton variant="rectangular" width={300} height={20} />
          </Stack>
        </Box>
      )
    }

    const activityList = journals?.journals || []

    if (activityList.length === 0) {
      return (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 3 }}>
          <Timeline sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" fontWeight={600} color="text.secondary">
            ไม่มีประวัติการทำงาน
          </Typography>
        </Paper>
      )
    }

    return (
      <Box>
        {/* Summary Header */}
        {totalDuration && (
          <Paper
            elevation={4}
            sx={{
              p: 3,
              mb: 4,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 3,
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={4}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Schedule sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      ระยะเวลาทั้งหมด
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {totalDuration}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box display="flex" alignItems="center" gap={2}>
                  <ChangeCircle sx={{ fontSize: 36 }} />
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      จำนวนกิจกรรม
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {activityList.length} รายการ
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box display="flex" alignItems="center" gap={2}>
                  <CheckCircle sx={{ fontSize: 36 }} />
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      สถานะปัจจุบัน
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {wp.status || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Timeline Activities */}
        <Box sx={{ position: 'relative', pl: { xs: 2, md: 4 } }}>
          {/* Timeline Line */}
          <Box
            sx={{
              position: 'absolute',
              left: { xs: 15, md: 30 },
              top: 20,
              bottom: 20,
              width: 3,
              bgcolor: 'primary.light',
              borderRadius: 2,
            }}
          />

          {activityList.map((activity: any, index: number) => {
            const activityDate = new Date(activity.created_at)
            const activityNumber = activityList.length - index
            const previousActivity = index > 0 ? activityList[index - 1] : undefined

            // Calculate duration between activities
            let duration = null
            if (previousActivity) {
              const prevDate = new Date(previousActivity.created_at)
              duration = calculateDuration(prevDate, activityDate)
            }

            // Get activity type
            const hasStatusChange = activity.details?.some((d: any) => 
              d.property?.toLowerCase().includes('status')
            )
            const hasComment = activity.notes && activity.notes.trim() !== ''

            let activityIcon = <Info />
            let activityColor = 'grey.500'

            if (hasStatusChange) {
              activityIcon = <ChangeCircle />
              activityColor = 'primary.main'
            } else if (hasComment) {
              activityIcon = <Comment />
              activityColor = 'secondary.main'
            }

            return (
              <Box
                key={activity.id}
                sx={{
                  mb: 4,
                  position: 'relative',
                }}
              >
                {/* Duration Badge */}
                {duration && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: { xs: -45, md: -15 },
                      top: -15,
                      bgcolor: 'warning.light',
                      color: 'warning.dark',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 2,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      boxShadow: 2,
                    }}
                  >
                    ⏱️ {duration}
                  </Box>
                )}

                {/* Timeline Node */}
                <Box
                  sx={{
                    position: 'absolute',
                    left: { xs: -3, md: 12 },
                    top: 20,
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    bgcolor: activityColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    boxShadow: 3,
                    border: '4px solid',
                    borderColor: 'background.paper',
                    zIndex: 1,
                  }}
                >
                  {activityIcon}
                </Box>

                {/* Activity Card */}
                <Paper
                  elevation={3}
                  sx={{
                    ml: { xs: 6, md: 10 },
                    p: 3,
                    borderRadius: 3,
                    border: '2px solid',
                    borderColor: activityColor,
                    transition: 'all 0.3s',
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'translateX(8px)',
                    },
                  }}
                >
                  {/* Activity Header */}
                  <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2} mb={2}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar
                        sx={{
                          bgcolor: activityColor,
                          width: 40,
                          height: 40,
                          fontWeight: 700,
                        }}
                      >
                        {activity.user_name?.charAt(0).toUpperCase() || '?'}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight={700}>
                          {activity.user_name || 'Unknown'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Activity #{activityNumber}
                        </Typography>
                      </Box>
                    </Box>
                    <Box textAlign="right">
                      <Typography variant="body2" fontWeight={600}>
                        {formatDateThai(activity.created_at)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDistanceToNow(activityDate, { addSuffix: true, locale: th })}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {/* Activity Details */}
                  {activity.details && activity.details.length > 0 && (
                    <Box mb={2}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        การเปลี่ยนแปลง:
                      </Typography>
                      <Stack spacing={1}>
                        {activity.details.map((detail: any, idx: number) => (
                          <Paper
                            key={idx}
                            variant="outlined"
                            sx={{
                              p: 2,
                              bgcolor: 'grey.50',
                              borderRadius: 2,
                            }}
                          >
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <Chip
                                label={detail.property}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            </Box>
                            <Box display="flex" alignItems="center" gap={2}>
                              {detail.old_value && (
                                <>
                                  <Chip
                                    label={detail.old_value}
                                    size="small"
                                    sx={{ bgcolor: 'error.lighter' }}
                                  />
                                  <Typography variant="body2" color="text.secondary">
                                    →
                                  </Typography>
                                </>
                              )}
                              <Chip
                                label={detail.new_value}
                                size="small"
                                color="success"
                              />
                            </Box>
                          </Paper>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {/* Activity Comment */}
                  {hasComment && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        หมายเหตุ:
                      </Typography>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          bgcolor: 'info.lighter',
                          borderRadius: 2,
                          borderColor: 'info.light',
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ 
                            whiteSpace: 'pre-wrap',
                            lineHeight: 1.6,
                          }}
                          dangerouslySetInnerHTML={{
                            __html: sanitizeHTML(activity.notes)
                          }}
                        />
                      </Paper>
                    </Box>
                  )}
                </Paper>
              </Box>
            )
          })}
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Hero Header */}
      <Box
        sx={{
          mb: 4,
          p: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.37)',
        }}
      >
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/workpackages')}
          sx={{
            color: 'white',
            mb: 2,
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          กลับ
        </Button>
        
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={3}>
          <Box flex={1}>
            <Typography variant="h3" fontWeight={700} gutterBottom>
              #{wp.id} - {wp.subject}
            </Typography>
            <Box display="flex" alignItems="center" gap={2} flexWrap="wrap" mt={2}>
              <StatusChip status={wp.status} size="medium" />
              <Chip
                label={wp.type || 'Task'}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontWeight: 600,
                }}
              />
            </Box>
          </Box>
          
          <Box display="flex" gap={1}>
            <Tooltip title="แก้ไข">
              <IconButton
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                  },
                }}
              >
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip title="แชร์">
              <IconButton
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                  },
                }}
              >
                <Share />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper elevation={2} sx={{ borderRadius: 3, mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              py: 2,
              fontSize: '1rem',
              fontWeight: 600,
            },
          }}
        >
          <Tab icon={<Description />} iconPosition="start" label="รายละเอียด" />
          <Tab icon={<Timeline />} iconPosition="start" label="ประวัติการทำงาน" />
          <Tab icon={<AttachFile />} iconPosition="start" label="ไฟล์แนบ" disabled />
          <Tab icon={<LinkIcon />} iconPosition="start" label="เชื่อมโยง" disabled />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        {renderOverviewTab()}
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        {renderTimelineTab()}
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        <Typography>ไฟล์แนบ (Coming Soon)</Typography>
      </TabPanel>
      <TabPanel value={tabValue} index={3}>
        <Typography>เชื่อมโยง (Coming Soon)</Typography>
      </TabPanel>
    </Box>
  )
}

export default WorkPackageDetailPage