import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Divider,
  Stack,
  Avatar,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  CheckCircle,
  RadioButtonUnchecked,
  Schedule,
  TrendingUp,
  Flag,
  AccessTime,
  PlayArrow,
  Done,
  Close,
} from '@mui/icons-material';
import { format, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';
import { th } from 'date-fns/locale';

interface Activity {
  id: number;
  user_name: string;
  created_at: string;
  details: Array<{
    property: string;
    old_value?: string;
    new_value?: string;
  }>;
  notes?: string;
}

interface TimelineSegment {
  status: string;
  startTime: Date;
  endTime: Date | null;
  duration: number; // in minutes
  durationText: string;
  percentage: number;
  user: string;
  isCurrentStatus: boolean;
  color: string;
  icon: React.ReactNode;
}

interface WorkPackageTimelineProps {
  activities: Activity[];
  createdAt: string;
  currentStatus: string;
}

// Status color mapping
const statusColorMap: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
  'New': { color: '#2196F3', bg: 'rgba(33, 150, 243, 0.1)', icon: <RadioButtonUnchecked /> },
  'รับเรื่อง': { color: '#0288D1', bg: 'rgba(2, 136, 209, 0.1)', icon: <Flag /> },
  'กำลังดำเนินการ': { color: '#FF9800', bg: 'rgba(255, 152, 0, 0.1)', icon: <PlayArrow /> },
  'ดำเนินการเสร็จ': { color: '#4CAF50', bg: 'rgba(76, 175, 80, 0.1)', icon: <Done /> },
  'ปิดงาน': { color: '#607D8B', bg: 'rgba(96, 125, 139, 0.1)', icon: <CheckCircle /> },
};

const getStatusConfig = (status: string) => {
  return statusColorMap[status] || { color: '#9E9E9E', bg: 'rgba(158, 158, 158, 0.1)', icon: <RadioButtonUnchecked /> };
};

const calculateDuration = (startDate: Date, endDate: Date): string => {
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
  return 'น้อยกว่า 1 นาที';
};

const WorkPackageTimeline: React.FC<WorkPackageTimelineProps> = ({
  activities,
  createdAt,
  currentStatus,
}) => {
  const timelineSegments = React.useMemo(() => {
    const segments: TimelineSegment[] = [];
    const statusChanges = activities
      .filter(
        (activity) =>
          activity.details?.some((detail) =>
            detail.property?.toLowerCase().includes('status')
          )
      )
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const startDate = new Date(createdAt);
    let previousDate = startDate;
    let previousStatus = 'New';

    statusChanges.forEach((activity, index) => {
      const statusChange = activity.details.find((d) =>
        d.property?.toLowerCase().includes('status')
      );
      if (!statusChange) return;

      const currentDate = new Date(activity.created_at);
      const duration = differenceInMinutes(currentDate, previousDate);
      const config = getStatusConfig(previousStatus);

      segments.push({
        status: previousStatus,
        startTime: previousDate,
        endTime: currentDate,
        duration,
        durationText: calculateDuration(previousDate, currentDate),
        percentage: 0,
        user: activity.user_name,
        isCurrentStatus: false,
        color: config.color,
        icon: config.icon,
      });

      previousDate = currentDate;
      previousStatus = statusChange.new_value || previousStatus;
    });

    // Add current status
    const now = new Date();
    const duration = differenceInMinutes(now, previousDate);
    const config = getStatusConfig(currentStatus);

    segments.push({
      status: currentStatus,
      startTime: previousDate,
      endTime: null,
      duration,
      durationText: `${calculateDuration(previousDate, now)} (ปัจจุบัน)`,
      percentage: 0,
      user: statusChanges[statusChanges.length - 1]?.user_name || 'System',
      isCurrentStatus: true,
      color: config.color,
      icon: config.icon,
    });

    // Calculate percentages
    const totalDuration = segments.reduce((sum, seg) => sum + seg.duration, 0);
    segments.forEach((seg) => {
      seg.percentage = totalDuration > 0 ? Math.round((seg.duration / totalDuration) * 100) : 0;
    });

    return segments;
  }, [activities, createdAt, currentStatus]);

  const totalDuration = React.useMemo(() => {
    if (timelineSegments.length === 0) return 'N/A';
    const first = timelineSegments[0].startTime;
    const last = new Date();
    return calculateDuration(first, last);
  }, [timelineSegments]);

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        border: '2px solid',
        borderColor: 'divider',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              width: 56,
              height: 56,
              boxShadow: 3,
            }}
          >
            <Schedule fontSize="large" />
          </Avatar>
          <Box flex={1}>
            <Typography variant="h5" fontWeight={700} color="primary.main">
              Timeline & Duration Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary">
              วิเคราะห์ระยะเวลาในแต่ละสถานะ • รวมทั้งหมด {totalDuration}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Timeline Visualization */}
        <Box sx={{ position: 'relative' }}>
          {timelineSegments.map((segment, index) => (
            <Box key={index} sx={{ mb: 4, position: 'relative' }}>
              {/* Connecting Line */}
              {index < timelineSegments.length - 1 && (
                <Box
                  sx={{
                    position: 'absolute',
                    left: 27,
                    top: 56,
                    bottom: -32,
                    width: 3,
                    bgcolor: segment.color,
                    opacity: 0.3,
                    zIndex: 0,
                  }}
                />
              )}

              <Paper
                elevation={segment.isCurrentStatus ? 8 : 2}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: segment.isCurrentStatus ? '3px solid' : '1px solid',
                  borderColor: segment.isCurrentStatus ? segment.color : 'divider',
                  bgcolor: 'background.paper',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  zIndex: 1,
                  '&:hover': {
                    transform: 'translateX(8px)',
                    boxShadow: 6,
                  },
                }}
              >
                <Stack direction="row" spacing={3} alignItems="center">
                  {/* Icon */}
                  <Avatar
                    sx={{
                      bgcolor: segment.color,
                      width: 56,
                      height: 56,
                      boxShadow: segment.isCurrentStatus ? 4 : 2,
                      animation: segment.isCurrentStatus ? 'pulse 2s infinite' : 'none',
                      '@keyframes pulse': {
                        '0%, 100%': { transform: 'scale(1)' },
                        '50%': { transform: 'scale(1.05)' },
                      },
                    }}
                  >
                    {segment.icon}
                  </Avatar>

                  {/* Content */}
                  <Box flex={1}>
                    <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                      <Chip
                        label={segment.status}
                        sx={{
                          bgcolor: segment.color,
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          px: 1,
                        }}
                      />
                      {segment.isCurrentStatus && (
                        <Chip
                          label="ปัจจุบัน"
                          size="small"
                          color="success"
                          icon={<AccessTime />}
                          sx={{ animation: 'blink 1.5s infinite' }}
                        />
                      )}
                    </Stack>

                    <Stack direction="row" spacing={4} alignItems="center" mb={2}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          เริ่มต้น
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {format(segment.startTime, 'dd/MM/yyyy HH:mm', { locale: th })}
                        </Typography>
                      </Box>

                      {segment.endTime && (
                        <>
                          <Typography variant="h6" color="text.secondary">
                            →
                          </Typography>
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              สิ้นสุด
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {format(segment.endTime, 'dd/MM/yyyy HH:mm', { locale: th })}
                            </Typography>
                          </Box>
                        </>
                      )}

                      <Box flex={1} textAlign="right">
                        <Typography variant="caption" color="text.secondary" display="block">
                          ระยะเวลา
                        </Typography>
                        <Typography variant="h6" fontWeight={700} color={segment.color}>
                          {segment.durationText}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Duration Bar */}
                    <Box>
                      <Stack direction="row" justifyContent="space-between" mb={1}>
                        <Typography variant="caption" color="text.secondary">
                          สัดส่วนของเวลาทั้งหมด
                        </Typography>
                        <Typography variant="caption" fontWeight={700} color={segment.color}>
                          {segment.percentage}%
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={segment.percentage}
                        sx={{
                          height: 12,
                          borderRadius: 6,
                          bgcolor: 'rgba(0,0,0,0.05)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: segment.color,
                            borderRadius: 6,
                          },
                        }}
                      />
                    </Box>

                    <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                      โดย: {segment.user}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Box>
          ))}
        </Box>

        {/* Summary Stats */}
        <Paper
          elevation={3}
          sx={{
            p: 3,
            mt: 4,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}
        >
          <Stack direction="row" justifyContent="space-around" alignItems="center">
            <Box textAlign="center">
              <Typography variant="h4" fontWeight={700}>
                {timelineSegments.length}
              </Typography>
              <Typography variant="caption">สถานะทั้งหมด</Typography>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
            <Box textAlign="center">
              <Typography variant="h4" fontWeight={700}>
                {totalDuration}
              </Typography>
              <Typography variant="caption">เวลาทั้งหมด</Typography>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
            <Box textAlign="center">
              <Typography variant="h4" fontWeight={700}>
                {timelineSegments[0] ? format(timelineSegments[0].startTime, 'dd MMM', { locale: th }) : 'N/A'}
              </Typography>
              <Typography variant="caption">เริ่มต้น</Typography>
            </Box>
          </Stack>
        </Paper>
      </CardContent>
    </Card>
  );
};

export default WorkPackageTimeline;
