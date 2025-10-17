import React from 'react';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
} from '@mui/lab';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Comment as CommentIcon,
  History,
  ArrowForward,
  MoreVert,
  CheckCircle,
  Close,
  Assignment,
  Person,
  PriorityHigh,
  Event,
  Label,
  Settings,
  Info,
  ChangeHistory,
  Schedule,
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { th as thLocale } from 'date-fns/locale';

interface ActivityChange {
  field: string;
  old_value?: string;
  new_value?: string;
}

interface Activity {
  id?: number;
  user: string;
  created: string;
  comment?: string;
  changes?: ActivityChange[];
}

interface CategorizedChanges {
  status?: ActivityChange[];
  assignment?: ActivityChange[];
  priority?: ActivityChange[];
  dates?: ActivityChange[];
  customFields?: ActivityChange[];
  general?: ActivityChange[];
}

interface ActivityTimelineImprovedProps {
  activities: Activity[];
}

const ActivityTimelineImproved: React.FC<ActivityTimelineImprovedProps> = ({ activities }) => {
  const theme = useTheme();

  const categorizeChanges = (changes?: ActivityChange[]): CategorizedChanges => {
    if (!changes) return {};

    return changes.reduce((acc: CategorizedChanges, change) => {
      const field = change.field?.toLowerCase() || '';

      if (field.includes('status') || field.includes('สถานะ') || field.includes('category')) {
        if (!acc.status) acc.status = [];
        acc.status.push(change);
      } else if (field.includes('assignee') || field.includes('ผู้รับผิดชอบ') || field.includes('assigned')) {
        if (!acc.assignment) acc.assignment = [];
        acc.assignment.push(change);
      } else if (
        field.includes('priority') ||
        field.includes('ความสำคัญ') ||
        field.includes('ความเร่งด่วน') ||
        field.includes('urgent')
      ) {
        if (!acc.priority) acc.priority = [];
        acc.priority.push(change);
      } else if (
        field.includes('date') ||
        field.includes('วันที่') ||
        field.includes('start') ||
        field.includes('finish') ||
        field.includes('duration')
      ) {
        if (!acc.dates) acc.dates = [];
        acc.dates.push(change);
      } else if (
        field.includes('custom') ||
        field.includes('สถานที่') ||
        field.includes('แจ้งโดย') ||
        field.includes('ประเภทงาน') ||
        field.includes('location') ||
        field.includes('contact')
      ) {
        if (!acc.customFields) acc.customFields = [];
        acc.customFields.push(change);
      } else {
        if (!acc.general) acc.general = [];
        acc.general.push(change);
      }
      return acc;
    }, {});
  };

  const renderCategoryBox = (
    title: string,
    icon: React.ReactNode,
    changes: ActivityChange[],
    color: string,
    bgColor: string
  ) => (
    <Box
      className="p-4 rounded-xl"
      sx={{
        background: bgColor,
        border: `2px dashed ${alpha(color, 0.3)}`,
      }}
    >
      <Stack spacing={1.5}>
        <Typography
          variant="caption"
          className="font-bold flex items-center gap-1"
          sx={{
            color,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          {icon} {title}
        </Typography>
        {changes.map((change, i) => (
          <Stack key={i} direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
            <Typography
              variant="caption"
              sx={{
                minWidth: '140px',
                color: 'text.secondary',
                fontWeight: 600,
              }}
            >
              {change.field}:
            </Typography>
            {change.old_value && (
              <Chip
                label={change.old_value}
                size="small"
                icon={<Close fontSize="small" />}
                sx={{
                  bgcolor: alpha(theme.palette.error.main, 0.15),
                  color: 'error.main',
                  fontWeight: 700,
                  border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                }}
              />
            )}
            {change.old_value && change.new_value && (
              <ArrowForward sx={{ color: 'text.disabled', fontSize: 18 }} />
            )}
            {change.new_value && (
              <Chip
                label={change.new_value}
                size="small"
                icon={<CheckCircle fontSize="small" />}
                sx={{
                  bgcolor: alpha(theme.palette.success.main, 0.15),
                  color: 'success.main',
                  fontWeight: 700,
                  border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                }}
              />
            )}
            {!change.old_value && !change.new_value && (
              <Chip
                label="ไม่มีข้อมูล"
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.grey[500], 0.1),
                  color: 'text.secondary',
                }}
              />
            )}
          </Stack>
        ))}
      </Stack>
    </Box>
  );

  if (activities.length === 0) {
    return (
      <Box className="text-center py-16">
        <History className="mx-auto mb-4 text-gray-400" sx={{ fontSize: 64 }} />
        <Typography variant="h6" color="textSecondary" className="font-semibold mb-2">
          ไม่มีกิจกรรมในขณะนี้
        </Typography>
        <Typography variant="body2" color="textSecondary">
          เริ่มเขียนความคิดเห็นของคุณเพื่อสร้างประวัติกิจกรรม
        </Typography>
      </Box>
    );
  }

  return (
    <Timeline position="right">
      {activities.map((activity, idx) => {
        const categorizedChanges = categorizeChanges(activity.changes);
        const hasChanges = Object.keys(categorizedChanges).length > 0;

        return (
          <TimelineItem key={activity.id || idx}>
            <TimelineSeparator>
              <TimelineDot
                sx={{
                  background: activity.comment
                    ? `linear-gradient(135deg, #10b981 0%, #059669 100%)`
                    : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  boxShadow: `0 4px 12px ${alpha(
                    activity.comment ? '#10b981' : theme.palette.primary.main,
                    0.3
                  )}`,
                  width: 48,
                  height: 48,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {activity.comment ? (
                  <CommentIcon sx={{ color: '#fff', fontSize: 24 }} />
                ) : (
                  <History sx={{ color: '#fff', fontSize: 24 }} />
                )}
              </TimelineDot>
              {idx < activities.length - 1 && <TimelineConnector sx={{ minHeight: 40 }} />}
            </TimelineSeparator>
            <TimelineContent>
              <Paper
                className="p-5 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 mb-4"
                sx={{
                  background:
                    theme.palette.mode === 'dark'
                      ? alpha('#1e293b', 0.6)
                      : alpha('#ffffff', 0.95),
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Stack spacing={2.5} flex={1}>
                    {/* Header: User & Date */}
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                          fontWeight: 'bold',
                          fontSize: '1.2rem',
                          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`,
                        }}
                      >
                        {activity.user?.charAt(0)?.toUpperCase() || 'U'}
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="subtitle1" className="font-bold" sx={{ fontSize: '1.05rem' }}>
                          {activity.user || 'ไม่ระบุผู้ใช้'}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                        >
                          <Schedule fontSize="inherit" />
                          {activity.created
                            ? format(new Date(activity.created), 'dd/MM/yyyy HH:mm', { locale: thLocale })
                            : 'ไม่ระบุ'}
                          <span className="mx-1">•</span>
                          {activity.created
                            ? formatDistanceToNow(new Date(activity.created), {
                                addSuffix: true,
                                locale: thLocale,
                              })
                            : '-'}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Comment Section */}
                    {activity.comment && (
                      <Box
                        className="p-4 rounded-xl"
                        sx={{
                          background: `linear-gradient(135deg, ${alpha('#10b981', 0.08)} 0%, ${alpha('#059669', 0.05)} 100%)`,
                          borderLeft: `4px solid #10b981`,
                          boxShadow: `0 2px 8px ${alpha('#10b981', 0.1)}`,
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="flex-start">
                          <CommentIcon sx={{ color: '#10b981', fontSize: 20, mt: 0.3 }} />
                          <Box flex={1}>
                            <Typography
                              variant="caption"
                              className="font-semibold"
                              sx={{ color: '#10b981', display: 'block', mb: 0.5 }}
                            >
                              ความคิดเห็น
                            </Typography>
                            <Typography
                              variant="body2"
                              className="leading-relaxed whitespace-pre-wrap"
                              sx={{ color: 'text.primary' }}
                            >
                              {activity.comment}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                    )}

                    {/* Changes Section - Categorized */}
                    {hasChanges && (
                      <Box>
                        <Typography
                          variant="body2"
                          className="font-semibold mb-3 flex items-center"
                          sx={{ color: 'primary.main' }}
                        >
                          <ChangeHistory fontSize="small" className="mr-2" />
                          การเปลี่ยนแปลง ({activity.changes?.length || 0} รายการ)
                        </Typography>
                        <Stack spacing={2.5}>
                          {/* Status Changes */}
                          {categorizedChanges.status &&
                            renderCategoryBox(
                              'สถานะงาน',
                              <Assignment fontSize="small" />,
                              categorizedChanges.status,
                              theme.palette.info.main,
                              alpha(theme.palette.info.main, 0.05)
                            )}

                          {/* Assignment Changes */}
                          {categorizedChanges.assignment &&
                            renderCategoryBox(
                              'ผู้รับผิดชอบ',
                              <Person fontSize="small" />,
                              categorizedChanges.assignment,
                              '#8b5cf6',
                              alpha('#8b5cf6', 0.05)
                            )}

                          {/* Priority Changes */}
                          {categorizedChanges.priority &&
                            renderCategoryBox(
                              'ความสำคัญ/เร่งด่วน',
                              <PriorityHigh fontSize="small" />,
                              categorizedChanges.priority,
                              '#f59e0b',
                              alpha('#f59e0b', 0.05)
                            )}

                          {/* Date Changes */}
                          {categorizedChanges.dates &&
                            renderCategoryBox(
                              'วันที่',
                              <Event fontSize="small" />,
                              categorizedChanges.dates,
                              '#06b6d4',
                              alpha('#06b6d4', 0.05)
                            )}

                          {/* Custom Fields Changes */}
                          {categorizedChanges.customFields &&
                            renderCategoryBox(
                              'ข้อมูลเพิ่มเติม',
                              <Label fontSize="small" />,
                              categorizedChanges.customFields,
                              '#ec4899',
                              alpha('#ec4899', 0.05)
                            )}

                          {/* General Changes */}
                          {categorizedChanges.general &&
                            renderCategoryBox(
                              'ทั่วไป',
                              <Settings fontSize="small" />,
                              categorizedChanges.general,
                              theme.palette.grey[600],
                              alpha(theme.palette.grey[500], 0.05)
                            )}
                        </Stack>
                      </Box>
                    )}

                    {/* Empty State */}
                    {!activity.comment && !hasChanges && (
                      <Box className="text-center py-4">
                        <Chip
                          icon={<Info />}
                          label="ไม่มีข้อมูลการเปลี่ยนแปลง"
                          size="small"
                          sx={{
                            bgcolor: alpha(theme.palette.grey[500], 0.1),
                            color: 'text.secondary',
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    )}
                  </Stack>

                  <Box>
                    <Tooltip title="เพิ่มเติม">
                      <IconButton size="small" sx={{ mt: -1 }}>
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Stack>
              </Paper>
            </TimelineContent>
          </TimelineItem>
        );
      })}
    </Timeline>
  );
};

export default ActivityTimelineImproved;
