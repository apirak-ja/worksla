import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Stack,
  Paper,
  Divider,
  Collapse,
  IconButton,
  Badge,
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  Comment,
  Edit,
  Person,
  Schedule,
  TrendingUp,
  Category,
  Flag,
  Description,
  AttachFile,
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';
import DOMPurify from 'dompurify';

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

interface ActivityHistoryProps {
  activities: Activity[];
}

const getPropertyIcon = (property: string) => {
  const prop = property.toLowerCase();
  if (prop.includes('status')) return <Flag />;
  if (prop.includes('assignee')) return <Person />;
  if (prop.includes('priority')) return <TrendingUp />;
  if (prop.includes('category')) return <Category />;
  if (prop.includes('description')) return <Description />;
  if (prop.includes('attachment')) return <AttachFile />;
  return <Edit />;
};

const getPropertyColor = (property: string): string => {
  const prop = property.toLowerCase();
  if (prop.includes('status')) return '#2196F3';
  if (prop.includes('assignee')) return '#9C27B0';
  if (prop.includes('priority')) return '#FF9800';
  if (prop.includes('category')) return '#4CAF50';
  return '#607D8B';
};

const ActivityHistoryCard: React.FC<ActivityHistoryProps> = ({ activities }) => {
  const [expandedItems, setExpandedItems] = React.useState<Set<number>>(new Set());

  const toggleExpand = (id: number) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const sortedActivities = React.useMemo(() => {
    return [...activities].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [activities]);

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        border: '2px solid',
        borderColor: 'divider',
        overflow: 'visible',
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" gap={2} mb={4}>
          <Avatar
            sx={{
              bgcolor: 'secondary.main',
              width: 56,
              height: 56,
              boxShadow: 3,
            }}
          >
            <Schedule fontSize="large" />
          </Avatar>
          <Box flex={1}>
            <Typography variant="h5" fontWeight={700} color="secondary.main">
              Activity History
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ประวัติการเปลี่ยนแปลงทั้งหมด • {sortedActivities.length} รายการ
            </Typography>
          </Box>
          <Chip
            label={`${sortedActivities.length} Activities`}
            color="secondary"
            sx={{ fontWeight: 700 }}
          />
        </Box>

        <Divider sx={{ mb: 4 }} />

        <Box sx={{ position: 'relative' }}>
          {/* Vertical Timeline Line */}
          <Box
            sx={{
              position: 'absolute',
              left: 27,
              top: 0,
              bottom: 0,
              width: 3,
              bgcolor: 'divider',
              zIndex: 0,
            }}
          />

          {sortedActivities.map((activity, index) => {
            const isExpanded = expandedItems.has(activity.id);
            const hasChanges = activity.details && activity.details.length > 0;
            const hasNotes = activity.notes && activity.notes.trim() !== '';
            const createdDate = new Date(activity.created_at);

            return (
              <Box
                key={activity.id}
                sx={{
                  mb: 4,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <Paper
                  elevation={3}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    ml: 7,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: 6,
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  {/* Activity Header */}
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Avatar
                      sx={{
                        bgcolor: index === 0 ? 'primary.main' : 'grey.400',
                        width: 48,
                        height: 48,
                        fontWeight: 700,
                        fontSize: '1.2rem',
                        position: 'absolute',
                        left: -60,
                        top: 12,
                        border: '4px solid white',
                        boxShadow: 3,
                      }}
                    >
                      {activity.user_name?.charAt(0).toUpperCase() || '?'}
                    </Avatar>

                    <Box flex={1}>
                      <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                        <Typography variant="h6" fontWeight={700}>
                          {activity.user_name || 'Unknown User'}
                        </Typography>
                        {index === 0 && (
                          <Chip
                            label="ล่าสุด"
                            size="small"
                            color="primary"
                            sx={{ height: 24 }}
                          />
                        )}
                      </Stack>

                      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                        <Chip
                          icon={<Schedule />}
                          label={format(createdDate, 'dd MMM yyyy, HH:mm น.', { locale: th })}
                          size="small"
                          variant="outlined"
                        />
                        <Typography variant="caption" color="text.secondary">
                          {formatDistanceToNow(createdDate, { addSuffix: true, locale: th })}
                        </Typography>
                      </Stack>

                      {/* Comment Section */}
                      {hasNotes && (
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            mb: 2,
                            bgcolor: 'info.lighter',
                            borderRadius: 2,
                            borderLeft: '4px solid',
                            borderColor: 'info.main',
                          }}
                        >
                          <Stack direction="row" spacing={1} alignItems="flex-start">
                            <Comment sx={{ color: 'info.main', mt: 0.5 }} />
                            <Box flex={1}>
                              <Typography
                                variant="body2"
                                sx={{
                                  whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-word',
                                }}
                                dangerouslySetInnerHTML={{
                                  __html: DOMPurify.sanitize(activity.notes || ''),
                                }}
                              />
                            </Box>
                          </Stack>
                        </Paper>
                      )}

                      {/* Changes Summary */}
                      {hasChanges && (
                        <>
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={1}
                            mb={2}
                            sx={{ cursor: 'pointer' }}
                            onClick={() => toggleExpand(activity.id)}
                          >
                            <Badge
                              badgeContent={activity.details.length}
                              color="primary"
                              sx={{ mr: 1 }}
                            >
                              <Edit color="action" />
                            </Badge>
                            <Typography variant="body2" fontWeight={600} color="primary">
                              {activity.details.length} การเปลี่ยนแปลง
                            </Typography>
                            <IconButton size="small">
                              {isExpanded ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                          </Box>

                          <Collapse in={isExpanded}>
                            <Stack spacing={1.5} sx={{ pl: 2 }}>
                              {activity.details.map((detail, idx) => {
                                const propertyColor = getPropertyColor(detail.property);
                                const propertyIcon = getPropertyIcon(detail.property);

                                return (
                                  <Paper
                                    key={idx}
                                    elevation={0}
                                    sx={{
                                      p: 2,
                                      bgcolor: 'grey.50',
                                      borderRadius: 2,
                                      borderLeft: '3px solid',
                                      borderColor: propertyColor,
                                    }}
                                  >
                                    <Stack direction="row" spacing={2} alignItems="center">
                                      <Avatar
                                        sx={{
                                          bgcolor: propertyColor,
                                          width: 32,
                                          height: 32,
                                        }}
                                      >
                                        {React.cloneElement(propertyIcon, { fontSize: 'small' })}
                                      </Avatar>
                                      <Box flex={1}>
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                          display="block"
                                        >
                                          {detail.property}
                                        </Typography>
                                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                          {detail.old_value && (
                                            <>
                                              <Chip
                                                label={detail.old_value}
                                                size="small"
                                                sx={{
                                                  bgcolor: 'error.lighter',
                                                  color: 'error.dark',
                                                  textDecoration: 'line-through',
                                                }}
                                              />
                                              <Typography variant="body2">→</Typography>
                                            </>
                                          )}
                                          <Chip
                                            label={detail.new_value || 'ตั้งค่าใหม่'}
                                            size="small"
                                            sx={{
                                              bgcolor: 'success.lighter',
                                              color: 'success.dark',
                                              fontWeight: 600,
                                            }}
                                          />
                                        </Stack>
                                      </Box>
                                    </Stack>
                                  </Paper>
                                );
                              })}
                            </Stack>
                          </Collapse>
                        </>
                      )}
                    </Box>
                  </Stack>
                </Paper>
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ActivityHistoryCard;
