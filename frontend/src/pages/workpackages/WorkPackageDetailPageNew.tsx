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
  LinearProgress,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import {
  ArrowBack,
  Assignment,
  Person,
  Event,
  TrendingUp,
  Category,
  Schedule,
  Comment,
  ChangeCircle,
  Info,
  Edit,
  Share,
  Timeline,
  Description,
  AttachFile,
  Link as LinkIcon,
  OpenInNew,
  CloudDownload,
  Group,
  CheckCircleOutline,
  RadioButtonUnchecked,
  AccessTime,
  BarChart,
} from '@mui/icons-material'
import { wpApi } from '../../api/client'
import { format, formatDistanceToNow, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns'
import { th } from 'date-fns/locale'
import DOMPurify from 'dompurify'

// ============================================================
// TabPanel Component
// ============================================================

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// ============================================================
// Utility Functions
// ============================================================

const getPriorityColor = (priority: string) => {
  const priorityColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
    'High': 'error',
    'Normal': 'warning',
    'Low': 'success',
  }
  return priorityColors[priority] || 'default'
}

const statusAccentMap: Record<string, { label: string; color: string; bg: string }> = {
  new: { label: 'New', color: '#1976d2', bg: 'rgba(25, 118, 210, 0.12)' },
  open: { label: 'Open', color: '#0288d1', bg: 'rgba(2, 136, 209, 0.12)' },
  closed: { label: 'Closed', color: '#2e7d32', bg: 'rgba(46, 125, 50, 0.12)' },
  on_hold: { label: 'On Hold', color: '#ed6c02', bg: 'rgba(237, 108, 2, 0.12)' },
  resolved: { label: 'Resolved', color: '#2e7d32', bg: 'rgba(46, 125, 50, 0.12)' },
  in_progress: { label: 'In Progress', color: '#0288d1', bg: 'rgba(2, 136, 209, 0.12)' },
  รับเรื่อง: { label: 'รับเรื่อง', color: '#0288d1', bg: 'rgba(2, 136, 209, 0.12)' },
  กำลังดำเนินการ: { label: 'กำลังดำเนินการ', color: '#ed6c02', bg: 'rgba(237, 108, 2, 0.12)' },
  ดำเนินการเสร็จ: { label: 'ดำเนินการเสร็จ', color: '#2e7d32', bg: 'rgba(46, 125, 50, 0.12)' },
  ปิดงาน: { label: 'ปิดงาน', color: '#607d8b', bg: 'rgba(96, 125, 139, 0.12)' },
}

const getStatusAccent = (status?: string) => {
  if (!status) return statusAccentMap.new
  const normalized = status.toLowerCase()
  return statusAccentMap[normalized] ?? statusAccentMap[status] ?? statusAccentMap.new
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
  return 'น้อยกว่า 1 นาที'
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// ============================================================
// ErrorState Component
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
// Component Definitions
// ============================================================

const LoadingState: React.FC = () => (
  <Box sx={{ p: 6, textAlign: 'center' }}>
    <CircularProgress size={60} sx={{ mb: 3 }} />
    <Typography variant="h6" fontWeight={600} color="text.secondary">
      กำลังโหลดข้อมูล...
    </Typography>
  </Box>
)

const sanitizeHTML = (html: string) => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target'],
  })
}

// ============================================================
// Main Component
// ============================================================

const WorkPackageDetailPage: React.FC = () => {
  // ============================================================
  // ALL HOOKS DECLARED AT TOP (BEFORE ANY EARLY RETURNS)
  // ============================================================
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

  // Safely extract wp data with guard
  const wp: any = wpDetail || {}

  // PURE useMemo - activityList with guards
  const activityList = React.useMemo(() => {
    if (!journals?.journals) return []
    const list = [...journals.journals]
    const getTime = (entry: any) => {
      if (!entry?.created_at) return 0
      const date = new Date(entry.created_at)
      return Number.isNaN(date.getTime()) ? 0 : date.getTime()
    }
    return list.sort((a, b) => getTime(b) - getTime(a))
  }, [journals])

  // PURE useMemo - status accent with guards
  const statusAccent = React.useMemo(() => {
    if (!wpDetail) return statusAccentMap.new
    return getStatusAccent(wpDetail.status)
  }, [wpDetail])

  // PURE useMemo - done ratio with guards
  const doneRatio = React.useMemo(() => {
    if (!wpDetail) return 0
    if (typeof wpDetail.done_ratio === 'number') return wpDetail.done_ratio
    const parsed = Number(wpDetail.done_ratio)
    return Number.isFinite(parsed) ? parsed : 0
  }, [wpDetail])

  // Safe date extraction with guards
  const createdAt = wpDetail?.created_at ? new Date(wpDetail.created_at) : null
  const updatedAt = wpDetail?.updated_at ? new Date(wpDetail.updated_at) : null
  const dueDate = wpDetail?.due_date ? new Date(wpDetail.due_date) : null
  const startDate = wpDetail?.start_date ? new Date(wpDetail.start_date) : createdAt

  // PURE useMemo - timeline summary with guards
  const timelineSummary = React.useMemo(() => {
    if (!activityList || activityList.length === 0) {
      return {
        totalActivities: 0,
        statusChanges: 0,
        comments: 0,
        totalDurationText: null as string | null,
        firstDate: null as Date | null,
        lastDate: null as Date | null,
      }
    }

    const statusChanges = activityList.reduce((count: number, activity: any) => {
      const isStatusChange = activity.details?.some((detail: any) => detail.property?.toLowerCase().includes('status'))
      return isStatusChange ? count + 1 : count
    }, 0)

    const comments = activityList.reduce((count: number, activity: any) => {
      return activity.notes && activity.notes.trim() !== '' ? count + 1 : count
    }, 0)

    const lastActivity = activityList[0]
    const firstActivity = activityList[activityList.length - 1]

    const firstDate = firstActivity?.created_at ? new Date(firstActivity.created_at) : null
    const lastDate = lastActivity?.created_at ? new Date(lastActivity.created_at) : null

    const totalDurationText = firstDate && lastDate ? calculateDuration(firstDate, lastDate) : null

    return {
      totalActivities: activityList.length,
      statusChanges,
      comments,
      totalDurationText,
      firstDate,
      lastDate,
    }
  }, [activityList])

  // Extract totalDuration
  const totalDuration = timelineSummary.totalDurationText

  // PURE useMemo - timeline items with guards
  const timelineItems = React.useMemo(() => {
    if (!activityList || activityList.length === 0) return []

    return activityList.map((activity: any, index: number) => {
      const currentDate = activity?.created_at ? new Date(activity.created_at) : null
      const previousActivity = index < activityList.length - 1 ? activityList[index + 1] : undefined
      const previousDate = previousActivity?.created_at ? new Date(previousActivity.created_at) : null

      const statusChange = activity?.details?.find((detail: any) => detail.property?.toLowerCase().includes('status'))
      const priorityChange = activity?.details?.find((detail: any) => detail.property?.toLowerCase().includes('priority'))
      const hasComment = Boolean(activity?.notes && activity.notes.trim() !== '')

      const activityType: 'status' | 'comment' | 'update' = statusChange
        ? 'status'
        : hasComment
        ? 'comment'
        : 'update'

      const durationLabel = previousDate && currentDate
        ? calculateDuration(previousDate < currentDate ? previousDate : currentDate, previousDate < currentDate ? currentDate : previousDate)
        : null

      return {
        id: activity.id,
        userName: activity.user_name || 'Unknown',
        userInitial: activity.user_name?.charAt(0).toUpperCase() || '?',
        createdAt: currentDate,
        createdAtRaw: activity.created_at,
        relativeTime: currentDate ? formatDistanceToNow(currentDate, { addSuffix: true, locale: th }) : '',
        details: Array.isArray(activity.details) ? activity.details : [],
        notes: activity.notes,
        statusChange,
        priorityChange,
        hasComment,
        activityType,
        durationLabel,
      }
    })
  }, [activityList])

  // PURE useMemo - last updated distance with guards
  const lastUpdatedDistance = React.useMemo(() => {
    if (!updatedAt) return null
    return formatDistanceToNow(updatedAt, { addSuffix: true, locale: th })
  }, [updatedAt])

  // PURE useMemo - due date display with guards
  const dueDateDisplay = React.useMemo(() => {
    if (!dueDate) return null
    return format(dueDate, 'dd MMM yyyy', { locale: th })
  }, [dueDate])

  // PURE useMemo - start date display with guards
  const startDateDisplay = React.useMemo(() => {
    if (!startDate) return null
    return format(startDate, 'dd MMM yyyy', { locale: th })
  }, [startDate])

  // PURE useMemo - due distance with guards
  const dueDistance = React.useMemo(() => {
    if (!dueDate) return null
    return formatDistanceToNow(dueDate, { addSuffix: true, locale: th })
  }, [dueDate])

  // PURE useMemo - overdue check with guards
  const isOverdue = React.useMemo(() => {
    if (!dueDate) return false
    const endOfDay = new Date(dueDate)
    endOfDay.setHours(23, 59, 59, 999)
    return endOfDay.getTime() < Date.now()
  }, [dueDate])

  // PURE useMemo - normalized done ratio with guards
  const normalizedDoneRatio = React.useMemo(() => {
    if (!Number.isFinite(doneRatio)) return 0
    return Math.min(100, Math.max(0, Math.round(doneRatio)))
  }, [doneRatio])

  // PURE useMemo - openproject base with guards
  const openProjectBase = React.useMemo(() => {
    if (!wpDetail) return null
    const openProjectUrl = (wpDetail as any).openproject_url || wpDetail.raw?._links?.self?.href
    if (!openProjectUrl) return null
    try {
      const url = new URL(openProjectUrl)
      return url.origin
    } catch (error) {
      return null
    }
  }, [wpDetail])

  const resolveOpenProjectHref = React.useCallback(
    (href?: string | null) => {
      if (!href || typeof href !== 'string') return undefined
      if (href.startsWith('http')) return href
      if (openProjectBase) {
        return `${openProjectBase}${href}`
      }
      return href
    },
    [openProjectBase]
  )

  const toOpenProjectUiUrl = React.useCallback(
    (apiHref?: string | null) => {
      const resolved = resolveOpenProjectHref(apiHref)
      if (!resolved) return undefined
      try {
        const url = new URL(resolved)
        url.pathname = url.pathname.replace('/api/v3', '')
        return url.toString()
      } catch {
        return resolved.replace('/api/v3', '')
      }
    },
    [resolveOpenProjectHref]
  )

  // PURE useMemo - attachments with guards
  const attachments = React.useMemo(() => {
    if (!wpDetail?.raw?._embedded?.attachments) return []
    const rawAttachments = wpDetail.raw._embedded.attachments
    if (!Array.isArray(rawAttachments)) return []

    return rawAttachments
      .map((attachment: any) => {
        const author = attachment._embedded?.author || {}
        const downloadHref = attachment?._links?.downloadLocation?.href || attachment?._links?.content?.href
        return {
          id: attachment.id || attachment?._links?.self?.href,
          name: attachment.fileName || attachment.name || 'ไม่ทราบชื่อไฟล์',
          description: attachment.description || '',
          createdAt: attachment.createdAt || attachment.createdOn || null,
          size: attachment.fileSize,
          contentType: attachment.contentType,
          authorName: author.name || author.title || attachment?._links?.author?.title || 'ไม่ทราบผู้แนบ',
          authorAvatar: resolveOpenProjectHref(author?._links?.avatar?.href),
          downloadUrl: resolveOpenProjectHref(downloadHref),
          openInProjectUrl: toOpenProjectUiUrl(attachment?._links?.self?.href || downloadHref),
        }
      })
      .filter((item: any) => Boolean(item.id))
  }, [resolveOpenProjectHref, toOpenProjectUiUrl, wpDetail])

  // Extract attachments count
  const attachmentsCount = attachments.length

  // Extract self API href with guard
  const selfApiHref = wpDetail?.raw?._links?.self?.href

  // PURE useMemo - watchers with guards
  const watchers = React.useMemo(() => {
    if (!wpDetail?.raw) return []
    const embeddedWatchers = wpDetail.raw._embedded?.watchers
    const watcherArray: any[] = Array.isArray(embeddedWatchers) ? embeddedWatchers : []

    if (watcherArray.length) {
      return watcherArray.map((watcher: any) => ({
        id: watcher.id || watcher?._links?.self?.href,
        name: watcher.name || watcher.title || 'ไม่ทราบชื่อ',
        email: watcher.mail || watcher.email,
        avatar: resolveOpenProjectHref(watcher?._links?.avatar?.href),
      }))
    }

    const watcherLinks = wpDetail.raw._links?.watchers
    if (Array.isArray(watcherLinks)) {
      return watcherLinks.map((link: any) => ({
        id: link.href,
        name: link.title || 'ไม่ทราบชื่อ',
        avatar: resolveOpenProjectHref(link?.avatar?.href),
      }))
    }

    if (watcherLinks?.href && watcherLinks?.title) {
      return [{ id: watcherLinks.href, name: watcherLinks.title, avatar: resolveOpenProjectHref(watcherLinks?.avatar?.href) }]
    }

    return []
  }, [resolveOpenProjectHref, wpDetail])

  // PURE useMemo - watchers count with guards
  const watchersCount = React.useMemo(() => {
    if (!wpDetail?.raw) return 0
    const countFromArray = watchers.length
    if (countFromArray > 0) return countFromArray
    const watchersLink = wpDetail.raw._links?.watchers
    if (Array.isArray(watchersLink)) return watchersLink.length
    if (typeof watchersLink?.count === 'number') return watchersLink.count
    return 0
  }, [watchers, wpDetail])

  // PURE useMemo - relations with guards
  const relations = React.useMemo(() => {
    if (!wpDetail?.raw?._embedded?.relations) return []
    const rawRelations = wpDetail.raw._embedded.relations
    if (!Array.isArray(rawRelations)) return []

    return rawRelations.map((relation: any) => {
      const relationType = relation.relationType || relation.type || relation.name || 'สัมพันธ์'
      const fromLink = relation?._links?.from
      const toLink = relation?._links?.to
      const isOutgoing = fromLink?.href === selfApiHref
      const relatedLink = isOutgoing ? toLink : fromLink
      return {
        id: relation.id || `${relationType}-${relatedLink?.href}`,
        type: relationType,
        description: relation.description || relationType,
        direction: isOutgoing ? 'outgoing' : 'incoming',
        relatedId: relatedLink?.title || relatedLink?.href,
        relatedTitle: relatedLink?.title || 'ไม่ทราบรายการ',
        relatedUrl: toOpenProjectUiUrl(relatedLink?.href),
        raw: relation,
      }
    })
  }, [selfApiHref, toOpenProjectUiUrl, wpDetail])

  // Extract relations count
  const relationsCount = relations.length

  // PURE useMemo - status duration summary with guards
  const statusDurationSummary = React.useMemo(() => {
    if (!timelineItems || timelineItems.length === 0) return []

    const statusChanges = timelineItems.filter(item => item.activityType === 'status')
    if (statusChanges.length === 0) return []

    const durations: Array<{
      status: string
      startTime: Date
      endTime: Date | null
      duration: number // in minutes
      durationText: string
      percentage: number
      isCurrentStatus: boolean
      slaStatus: 'good' | 'warning' | 'overdue'
    }> = []

    const isValidDate = (date: Date | null | undefined) => {
      if (!date) return false
      return !isNaN(date.getTime())
    }

    // Add initial status if work package was created
    if (createdAt && isValidDate(createdAt) && statusChanges.length > 0) {
      const firstStatusChange = statusChanges[statusChanges.length - 1]
      const initialStatus = firstStatusChange.statusChange?.old_value
      const initialEndRaw = firstStatusChange.createdAtRaw

      if (initialStatus && initialEndRaw) {
        const initialEndTime = new Date(initialEndRaw)
        if (isValidDate(initialEndTime)) {
          const initialDuration = Math.max(differenceInMinutes(initialEndTime, createdAt), 0)

          durations.push({
            status: initialStatus,
            startTime: createdAt,
            endTime: initialEndTime,
            duration: initialDuration,
            durationText: calculateDuration(createdAt, initialEndTime),
            percentage: 0,
            isCurrentStatus: false,
            slaStatus: 'good',
          })
        }
      }
    }

    // Process status changes
    for (let i = statusChanges.length - 1; i >= 0; i--) {
      const change = statusChanges[i]
      const newStatus = change.statusChange?.new_value
      const startRaw = change.createdAtRaw
      if (!newStatus || !startRaw) continue

      const startTime = new Date(startRaw)
      if (!isValidDate(startTime)) continue

      const nextChange = i > 0 ? statusChanges[i - 1] : null
      const endTimeCandidate = nextChange?.createdAtRaw ? new Date(nextChange.createdAtRaw) : null
      const hasValidEndTime = isValidDate(endTimeCandidate)
      const endTime = hasValidEndTime ? endTimeCandidate : null
      const isCurrentStatus = !endTime

      const duration = endTime
        ? Math.max(differenceInMinutes(endTime, startTime), 0)
        : Math.max(differenceInMinutes(new Date(), startTime), 0)

      const durationText = endTime
        ? calculateDuration(startTime, endTime)
        : `${calculateDuration(startTime, new Date())} (ปัจจุบัน)`

      // Simple SLA calculation (can be enhanced)
      let slaStatus: 'good' | 'warning' | 'overdue' = 'good'
      const hoursInStatus = duration / 60
      if (hoursInStatus > 72) slaStatus = 'overdue'
      else if (hoursInStatus > 48) slaStatus = 'warning'

      durations.push({
        status: newStatus,
        startTime,
        endTime,
        duration,
        durationText,
        percentage: 0,
        isCurrentStatus,
        slaStatus,
      })
    }

    // Calculate percentages
    const totalDuration = durations.reduce((sum, d) => sum + d.duration, 0)
    if (totalDuration > 0) {
      durations.forEach(d => {
        d.percentage = Math.max(Math.round((d.duration / totalDuration) * 100), 0)
      })
    }

    return durations
      .filter(d => Number.isFinite(d.duration))
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
  }, [timelineItems, createdAt])

  // ============================================================
  // EVENT HANDLERS (after all hooks)
  // ============================================================

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  // ============================================================
  // EARLY RETURNS (after all hooks and handlers)
  // ============================================================

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

          {/* Project Card */}
          <Card 
            elevation={3}
            sx={{
              borderRadius: 3,
              border: '2px solid',
              borderColor: 'success.light',
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                <Info sx={{ fontSize: 28, color: 'success.main' }} />
                <Typography variant="subtitle1" fontWeight={700}>
                  ข้อมูลโครงการ
                </Typography>
              </Box>
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    โครงการ
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {wp.project_name || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    ผู้สร้างรายการ
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {wp.author_name || 'ไม่ทราบ'}
                  </Typography>
                </Box>
                {wp.category && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      หมวดหมู่
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {wp.category}
                    </Typography>
                  </Box>
                )}
              </Stack>
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

    if (!timelineItems.length) {
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
      <Stack spacing={4}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: '1px solid rgba(25, 118, 210, 0.24)',
                bgcolor: 'rgba(25, 118, 210, 0.08)',
              }}
            >
              <Typography variant="subtitle2" color="primary.dark">
                กิจกรรมทั้งหมด
              </Typography>
              <Typography variant="h4" fontWeight={700} color="primary.dark" sx={{ mt: 0.5 }}>
                {timelineSummary.totalActivities}
              </Typography>
              <Typography variant="body2" color="primary.dark">
                รวมเวลา {totalDuration || '-'}
              </Typography>
              {timelineSummary.firstDate && timelineSummary.lastDate && (
                <Typography variant="caption" color="primary.dark" sx={{ display: 'block', mt: 1 }}>
                  {formatDateThai(timelineSummary.firstDate.toISOString())} - {formatDateThai(timelineSummary.lastDate.toISOString())}
                </Typography>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: '1px solid rgba(237, 108, 2, 0.24)',
                bgcolor: 'rgba(237, 108, 2, 0.08)',
              }}
            >
              <Typography variant="subtitle2" color="warning.dark">
                เปลี่ยนสถานะ
              </Typography>
              <Typography variant="h4" fontWeight={700} color="warning.dark" sx={{ mt: 0.5 }}>
                {timelineSummary.statusChanges}
              </Typography>
              <Typography variant="body2" color="warning.dark">
                ครั้งตลอดไทม์ไลน์
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: '1px solid rgba(123, 31, 162, 0.24)',
                bgcolor: 'rgba(123, 31, 162, 0.08)',
              }}
            >
              <Typography variant="subtitle2" color="secondary.dark">
                หมายเหตุ
              </Typography>
              <Typography variant="h4" fontWeight={700} color="secondary.dark" sx={{ mt: 0.5 }}>
                {timelineSummary.comments}
              </Typography>
              <Typography variant="body2" color="secondary.dark">
                บันทึกการสื่อสาร
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ position: 'relative', pl: { xs: 4, md: 10 } }}>
          {/* Main Timeline Line */}
          <Box
            sx={{
              position: 'absolute',
              left: { xs: 22, md: 42 },
              top: 0,
              bottom: 0,
              width: 3,
              bgcolor: 'primary.light',
              borderRadius: 2,
            }}
          />
          
          {/* Status change emphasis lines */}
          {timelineItems.map((item, index) => {
            if (item.activityType !== 'status') return null
            const topOffset = index * 150 + 24 // Approximate position
            return (
              <Box
                key={`status-line-${item.id ?? index}`}
                sx={{
                  position: 'absolute',
                  left: { xs: 20, md: 40 },
                  top: topOffset,
                  width: 7,
                  height: 48,
                  bgcolor: 'primary.main',
                  borderRadius: 3,
                  opacity: 0.8,
                  zIndex: 0,
                }}
              />
            )
          })}

          <Stack spacing={4}>
            {timelineItems.map((item, index) => {
              const isLast = index === timelineItems.length - 1
              const paletteKey = item.activityType === 'status' ? 'primary' : item.activityType === 'comment' ? 'secondary' : 'info'
              const paletteBorder = `${paletteKey}.light`
              const paletteMain = `${paletteKey}.main`
              const statusAccentLocal = item.statusChange?.new_value ? getStatusAccent(item.statusChange.new_value) : null
              const detailList = item.details.filter((detail: any) => !detail.property?.toLowerCase().includes('status'))

              return (
                <Box key={`activity-${item.id ?? index}`} sx={{ position: 'relative' }}>
                  {item.durationLabel && !isLast && (
                    <Box
                      sx={{
                        position: 'absolute',
                        left: { xs: -40, md: -28 },
                        top: -12,
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
                      ⏱️ {item.durationLabel}
                    </Box>
                  )}

                  <Box
                    sx={{
                      position: 'absolute',
                      left: { xs: -2, md: 14 },
                      top: 24,
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      bgcolor: paletteMain,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      boxShadow: item.activityType === 'status' ? '0 0 20px rgba(25, 118, 210, 0.5)' : 4,
                      border: '4px solid',
                      borderColor: 'background.paper',
                      zIndex: 1,
                      animation: item.activityType === 'status' ? 'pulse 2s infinite' : 'none',
                      '@keyframes pulse': {
                        '0%': {
                          boxShadow: '0 0 0 0 rgba(25, 118, 210, 0.7)',
                        },
                        '70%': {
                          boxShadow: '0 0 0 10px rgba(25, 118, 210, 0)',
                        },
                        '100%': {
                          boxShadow: '0 0 0 0 rgba(25, 118, 210, 0)',
                        },
                      },
                    }}
                  >
                    {item.activityType === 'status' ? (
                      <ChangeCircle sx={{ fontSize: 28 }} />
                    ) : item.activityType === 'comment' ? (
                      <Comment />
                    ) : (
                      <Info />
                    )}
                  </Box>

                  <Paper
                    elevation={0}
                    sx={{
                      ml: { xs: 6, md: 12 },
                      p: { xs: 2.5, md: 3 },
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: paletteBorder,
                      boxShadow: '0 18px 32px rgba(15, 23, 42, 0.08)',
                    }}
                  >
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      justifyContent="space-between"
                      flexWrap="wrap"
                      gap={2}
                    >
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar
                          sx={{
                            bgcolor: paletteMain,
                            width: 44,
                            height: 44,
                            fontWeight: 700,
                          }}
                        >
                          {item.userInitial}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight={700}>
                            {item.userName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.createdAtRaw ? formatDateThai(item.createdAtRaw) : '-'}
                          </Typography>
                        </Box>
                      </Box>
                      <Box textAlign={{ xs: 'left', sm: 'right' }}>
                        {item.relativeTime && (
                          <Typography variant="body2" fontWeight={600}>
                            {item.relativeTime}
                          </Typography>
                        )}
                        {item.durationLabel && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            จากกิจกรรมก่อนหน้า {item.durationLabel}
                          </Typography>
                        )}
                      </Box>
                    </Stack>

                    {item.statusChange && (
                      <Box
                        sx={{
                          mt: 3,
                          p: 3,
                          borderRadius: 3,
                          bgcolor: statusAccentLocal?.bg || 'rgba(25, 118, 210, 0.1)',
                          border: '2px solid',
                          borderColor: statusAccentLocal?.color || 'primary.main',
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                      >
                        {/* Status change highlight background */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: 6,
                            height: '100%',
                            bgcolor: statusAccentLocal?.color || 'primary.main',
                          }}
                        />
                        
                        <Stack direction="row" spacing={2} alignItems="flex-start">
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              bgcolor: statusAccentLocal?.color || 'primary.main',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              flexShrink: 0,
                            }}
                          >
                            <ChangeCircle fontSize="small" />
                          </Box>
                          
                          <Box flex={1}>
                            <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                              🔄 เปลี่ยนสถานะ
                            </Typography>
                            
                            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                              {item.statusChange.old_value && (
                                <>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <RadioButtonUnchecked fontSize="small" sx={{ color: 'text.secondary' }} />
                                    <Chip 
                                      label={item.statusChange.old_value} 
                                      size="medium" 
                                      variant="outlined"
                                      sx={{ 
                                        bgcolor: 'background.paper',
                                        color: 'text.secondary',
                                      }} 
                                    />
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="h5" fontWeight={700} color="text.secondary">
                                      →
                                    </Typography>
                                  </Box>
                                </>
                              )}
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CheckCircleOutline fontSize="small" sx={{ color: statusAccentLocal?.color || 'primary.main' }} />
                                <Chip
                                  label={item.statusChange.new_value}
                                  size="medium"
                                  sx={{
                                    bgcolor: statusAccentLocal?.color || 'primary.main',
                                    color: 'white',
                                    fontWeight: 700,
                                    fontSize: '0.875rem',
                                  }}
                                />
                              </Box>
                            </Stack>
                            
                            {/* Status change duration indicator */}
                            {item.durationLabel && (
                              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AccessTime fontSize="small" sx={{ color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                  ใช้เวลา: {item.durationLabel}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Stack>
                      </Box>
                    )}

                    {detailList.length > 0 && (
                      <Box mt={item.statusChange ? 2 : 3}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          รายละเอียดเพิ่มเติม
                        </Typography>
                        <Stack spacing={1.5}>
                          {detailList.map((detail: any, detailIdx: number) => (
                            <Stack key={detailIdx} direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                              <Chip label={detail.property} size="small" color="info" variant="outlined" />
                              <Typography variant="body2" color="text.secondary">
                                {detail.old_value ? `${detail.old_value} → ` : ''}
                                {detail.new_value}
                              </Typography>
                            </Stack>
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {item.hasComment && item.notes && (
                      <Box mt={3}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          หมายเหตุ
                        </Typography>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2.5,
                            borderRadius: 2,
                            borderColor: paletteBorder,
                            bgcolor: 'grey.50',
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}
                            dangerouslySetInnerHTML={{
                              __html: sanitizeHTML(item.notes),
                            }}
                          />
                        </Paper>
                      </Box>
                    )}
                  </Paper>
                </Box>
              )
            })}
          </Stack>
        </Box>
      </Stack>
    )
  }

  const renderStatusSummaryTab = () => {
    if (statusDurationSummary.length === 0) {
      return (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 3 }}>
          <BarChart sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" fontWeight={600} color="text.secondary">
            ไม่พบข้อมูลสถานะ
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            เมื่อมีการเปลี่ยนแปลงสถานะ ข้อมูลสรุปจะแสดงที่นี่
          </Typography>
        </Paper>
      )
    }

    const getSLAChipColor = (slaStatus: 'good' | 'warning' | 'overdue') => {
      switch (slaStatus) {
        case 'good': return 'success'
        case 'warning': return 'warning'
        case 'overdue': return 'error'
        default: return 'default'
      }
    }

    const getSLAChipLabel = (slaStatus: 'good' | 'warning' | 'overdue') => {
      switch (slaStatus) {
        case 'good': return 'ปกติ'
        case 'warning': return 'เฝ้าระวัง'
        case 'overdue': return 'เกินกำหนด'
        default: return 'ไม่ทราบ'
      }
    }

    return (
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <BarChart color="primary" />
          <Typography variant="h6" fontWeight={600}>
            สรุประยะเวลาตามสถานะ
          </Typography>
        </Box>

        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>สถานะ</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>ระยะเวลา</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">%</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">SLA</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {statusDurationSummary.map((summary, index) => (
                <TableRow 
                  key={index}
                  sx={{ 
                    '&:hover': { bgcolor: 'grey.50' },
                    bgcolor: summary.isCurrentStatus ? 'primary.50' : 'inherit'
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: getStatusAccent(summary.status).color,
                        }}
                      />
                      <Typography variant="body2" fontWeight={summary.isCurrentStatus ? 600 : 400}>
                        {summary.status}
                        {summary.isCurrentStatus && (
                          <Chip 
                            label="ปัจจุบัน" 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                            sx={{ ml: 1, fontSize: '0.75rem' }}
                          />
                        )}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {summary.durationText}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {summary.percentage}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={summary.percentage}
                        sx={{
                          width: 60,
                          height: 6,
                          borderRadius: 3,
                          bgcolor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: getStatusAccent(summary.status).color,
                            borderRadius: 3,
                          },
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={getSLAChipLabel(summary.slaStatus)}
                      color={getSLAChipColor(summary.slaStatus)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            borderRadius: 2, 
            border: '1px solid', 
            borderColor: 'grey.200',
            bgcolor: 'grey.50' 
          }}
        >
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            หมายเหตุ
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            • ระยะเวลาคำนวณจากการเปลี่ยนแปลงสถานะจริง<br/>
            • เปอร์เซ็นต์แสดงสัดส่วนเวลาที่ใช้ในแต่ละสถานะ<br/>
            • SLA: ปกติ (&lt;48ชม.), เฝ้าระวัง (48-72ชม.), เกินกำหนด (&gt;72ชม.)
          </Typography>
        </Paper>
      </Stack>
    )
  }

  const renderAttachmentsTab = () => {
    if (attachmentsCount === 0) {
      return (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 3 }}>
          <AttachFile sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" fontWeight={600} color="text.secondary">
            ยังไม่มีไฟล์แนบ
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            ไฟล์ที่แนบใน OpenProject จะแสดงที่นี่โดยอัตโนมัติ
          </Typography>
        </Paper>
      )
    }

    return (
      <Grid container spacing={3}>
        {attachments.map((attachment) => (
          <Grid item xs={12} md={6} key={attachment.id}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'primary.light',
                bgcolor: 'background.paper',
                boxShadow: '0 18px 32px rgba(15, 23, 42, 0.05)',
              }}
            >
              <Stack spacing={2}>
                <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {attachment.name}
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {formatFileSize(attachment.size)}
                      </Typography>
                      {attachment.contentType && (
                        <Typography variant="caption" color="text.secondary">
                          {attachment.contentType}
                        </Typography>
                      )}
                      {attachment.createdAt && (
                        <Typography variant="caption" color="text.secondary">
                          แนบเมื่อ {formatDateThai(attachment.createdAt)}
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {attachment.openInProjectUrl && (
                      <Tooltip title="เปิดใน OpenProject">
                        <IconButton
                          size="small"
                          component="a"
                          href={attachment.openInProjectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <OpenInNew fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {attachment.downloadUrl && (
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        startIcon={<CloudDownload />}
                        component="a"
                        href={attachment.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        ดาวน์โหลด
                      </Button>
                    )}
                  </Stack>
                </Box>

                {attachment.description && (
                  <Typography variant="body2" color="text.secondary">
                    {attachment.description}
                  </Typography>
                )}

                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar
                    src={attachment.authorAvatar}
                    alt={attachment.authorName}
                    sx={{ width: 36, height: 36, fontWeight: 700 }}
                  >
                    {attachment.authorName?.charAt(0)?.toUpperCase() || '?'}
                  </Avatar>
                  <Typography variant="body2" color="text.secondary">
                    {attachment.authorName}
                  </Typography>
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>
    )
  }

  const renderRelationsTab = () => {
    if (relationsCount === 0) {
      return (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 3 }}>
          <LinkIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" fontWeight={600} color="text.secondary">
            ยังไม่มีการเชื่อมโยง
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            ความสัมพันธ์กับ Work Package อื่นจะแสดงในหน้านี้
          </Typography>
        </Paper>
      )
    }

    return (
      <Stack spacing={3}>
        {relations.map((relation) => (
          <Paper
            key={relation.id}
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'secondary.light',
              boxShadow: '0 18px 32px rgba(15, 23, 42, 0.05)',
            }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2}>
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <LinkIcon color="secondary" />
                  <Typography variant="subtitle2" color="secondary.dark">
                    {relation.type}
                  </Typography>
                </Stack>
                <Typography variant="h6" fontWeight={700}>
                  {relation.relatedTitle}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {relation.direction === 'outgoing' ? 'เชื่อมโยงไปยัง' : 'เชื่อมโยงมาจาก'} ข้อมูลนี้
                </Typography>
              </Box>
              {relation.relatedUrl && (
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<OpenInNew />}
                  component="a"
                  href={relation.relatedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
                >
                  เปิดรายการ
                </Button>
              )}
            </Stack>
          </Paper>
        ))}
      </Stack>
    )
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Hero Header */}
      <Box
        sx={{
          position: 'relative',
          mb: 4,
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 45%, #312e81 100%)',
          color: 'white',
          overflow: 'hidden',
          boxShadow: '0 20px 45px rgba(15, 23, 42, 0.45)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at top left, rgba(255, 255, 255, 0.45), transparent 55%), radial-gradient(circle at bottom right, rgba(59, 130, 246, 0.35), transparent 55%)',
            opacity: 0.35,
          }}
        />
        <Box position="relative" zIndex={1}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/workpackages')}
            sx={{
              color: 'white',
              px: 0,
              minWidth: 0,
              mb: 2,
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.12)',
              },
            }}
          >
            กลับ
          </Button>

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
            flexWrap="wrap"
            gap={3}
          >
            <Box flex={1} minWidth={260}>
              <Typography variant="overline" sx={{ letterSpacing: 2, opacity: 0.75 }}>
                Work Package
              </Typography>
              <Typography variant="h3" fontWeight={700} gutterBottom sx={{ wordBreak: 'break-word' }}>
                #{wp.id} - {wp.subject}
              </Typography>
              <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" mt={2}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 999,
                    bgcolor: statusAccent.bg,
                    color: statusAccent.color,
                    fontWeight: 700,
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: statusAccent.color }} />
                  <Typography variant="body2" fontWeight={700}>
                    {wp.status || 'N/A'}
                  </Typography>
                </Box>
                {wp.type && (
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 1,
                      px: 1.5,
                      py: 0.75,
                      borderRadius: 999,
                      border: '1px solid rgba(255, 255, 255, 0.35)',
                      bgcolor: 'rgba(255, 255, 255, 0.12)',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    <Category fontSize="small" />
                    <Typography variant="body2" fontWeight={600}>
                      {wp.type}
                    </Typography>
                  </Box>
                )}
                {wp.priority && (
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 1,
                      px: 1.5,
                      py: 0.75,
                      borderRadius: 999,
                      border: '1px solid rgba(255, 255, 255, 0.35)',
                      bgcolor: 'rgba(255, 255, 255, 0.18)',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    <TrendingUp fontSize="small" />
                    <Typography variant="body2" fontWeight={600}>
                      {wp.priority}
                    </Typography>
                  </Box>
                )}
              </Stack>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 1, sm: 2 }}
                mt={2}
                sx={{ opacity: 0.85 }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <Person fontSize="small" />
                  <Typography variant="body2">
                    {wp.assignee_name ? `ผู้รับผิดชอบ: ${wp.assignee_name}` : 'ยังไม่ระบุผู้รับผิดชอบ'}
                  </Typography>
                </Box>
                {startDateDisplay && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <Schedule fontSize="small" />
                    <Typography variant="body2">เริ่ม {startDateDisplay}</Typography>
                  </Box>
                )}
              </Stack>
            </Box>

            <Stack direction="row" spacing={1.5} alignItems="center">
              {wp.openproject_url && (
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<OpenInNew />}
                  component="a"
                  href={wp.openproject_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.35)',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.6)',
                      bgcolor: 'rgba(255, 255, 255, 0.12)',
                    },
                  }}
                >
                  OpenProject
                </Button>
              )}
              <Tooltip title="แก้ไข">
                <IconButton
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.14)',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.24)',
                    },
                  }}
                >
                  <Edit />
                </IconButton>
              </Tooltip>
              <Tooltip title="แชร์">
                <IconButton
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.14)',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.24)',
                    },
                  }}
                >
                  <Share />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>

          <Grid container spacing={2} sx={{ mt: { xs: 3, md: 4 } }}>
            <Grid item xs={12} md={3}>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: 'rgba(15, 23, 42, 0.38)',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>
                  ความคืบหน้า
                </Typography>
                <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5 }}>
                  {normalizedDoneRatio}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={normalizedDoneRatio}
                  sx={{
                    mt: 1.5,
                    height: 8,
                    borderRadius: 999,
                    bgcolor: 'rgba(255, 255, 255, 0.25)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: statusAccent.color,
                      borderRadius: 999,
                    },
                  }}
                />
                <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.75 }}>
                  อัปเดตล่าสุด {lastUpdatedDistance || '-'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: 'rgba(15, 23, 42, 0.32)',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>
                  ไทม์ไลน์
                </Typography>
                <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5 }}>
                  {timelineSummary.totalActivities}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.85 }}>
                  กิจกรรมทั้งหมด
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.75 }}>
                  รวมเวลา {totalDuration || '-'}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', opacity: 0.75 }}>
                  เปลี่ยนสถานะ {timelineSummary.statusChanges} ครั้ง
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: 'rgba(15, 23, 42, 0.32)',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>
                  กำหนดส่ง
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight={700}
                  sx={{ mt: 0.5 }}
                  color={isOverdue ? 'error.light' : 'inherit'}
                >
                  {dueDateDisplay || '-'}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.85 }}>
                  {dueDistance || 'ไม่ระบุ'}
                </Typography>
                {startDateDisplay && (
                  <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.75 }}>
                    เริ่ม {startDateDisplay}
                  </Typography>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: 'rgba(15, 23, 42, 0.32)',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>
                  การสื่อสาร
                </Typography>
                <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5 }}>
                  {timelineSummary.comments}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.85 }}>
                  หมายเหตุทั้งหมด
                </Typography>
                {timelineSummary.lastDate && (
                  <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.75 }}>
                    ล่าสุด {formatDateThai(timelineSummary.lastDate.toISOString())}
                  </Typography>
                )}
                {watchersCount > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Group fontSize="small" />
                      <Typography variant="body2" sx={{ opacity: 0.85 }}>
                        ผู้ติดตาม {watchersCount} คน
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={-1.2} sx={{ mt: 1 }}>
                      {watchers.slice(0, 6).map((watcher) => (
                        <Avatar
                          key={watcher.id}
                          src={watcher.avatar}
                          alt={watcher.name}
                          sx={{
                            width: 32,
                            height: 32,
                            border: '2px solid rgba(255, 255, 255, 0.6)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          {watcher.name?.charAt(0)?.toUpperCase() || '?'}
                        </Avatar>
                      ))}
                    </Stack>
                  </Box>
                )}
                {attachmentsCount > 0 && (
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
                    <AttachFile fontSize="small" />
                    <Typography variant="body2" sx={{ opacity: 0.85 }}>
                      ไฟล์แนบ {attachmentsCount} รายการ
                    </Typography>
                  </Stack>
                )}
              </Box>
            </Grid>
          </Grid>
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
          <Tab icon={<BarChart />} iconPosition="start" label="สรุปสถานะ" />
          <Tab
            icon={<AttachFile />}
            iconPosition="start"
            label={`ไฟล์แนบ${attachmentsCount ? ` (${attachmentsCount})` : ''}`}
          />
          <Tab
            icon={<LinkIcon />}
            iconPosition="start"
            label={`เชื่อมโยง${relationsCount ? ` (${relationsCount})` : ''}`}
          />
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
        {renderStatusSummaryTab()}
      </TabPanel>
      <TabPanel value={tabValue} index={3}>
        {renderAttachmentsTab()}
      </TabPanel>
      <TabPanel value={tabValue} index={4}>
        {renderRelationsTab()}
      </TabPanel>
    </Box>
  )
}

export default WorkPackageDetailPage