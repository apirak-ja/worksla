/**
 * Utility Functions for Work Package Processing
 * - HTML Sanitization
 * - Timeline Calculation
 * - Duration Formatting
 * - Date/Time Utilities
 */

import DOMPurify from 'dompurify';
import { Activity, ActivityDetail, ActivityType, StatusInterval, TimelineAnalysis } from '../types/workpackage';

// ============================================================
// HTML Sanitization
// ============================================================

/**
 * Strip all HTML tags and return plain text
 * @param html HTML string
 * @returns Plain text without any HTML tags
 */
export function stripHtmlTags(html: string | undefined | null): string {
  if (!html) return '';
  
  // Remove HTML tags
  const text = html.replace(/<[^>]*>/g, ' ');
  
  // Decode HTML entities
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  const decoded = textarea.value;
  
  // Clean up multiple spaces and trim
  return decoded.replace(/\s+/g, ' ').trim();
}

/**
 * Sanitize HTML allowing only safe tags (links)
 * @param html HTML string
 * @returns Sanitized HTML with only safe tags
 */
export function sanitizeHtml(html: string | undefined | null): string {
  if (!html) return '';
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['a', 'br', 'p', 'strong', 'em', 'u'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Extract links from HTML content
 * @param html HTML string
 * @returns Array of {text, url} objects
 */
export function extractLinks(html: string | undefined | null): Array<{ text: string; url: string }> {
  if (!html) return [];
  
  const linkRegex = /<a\s+(?:[^>]*?\s+)?href="([^"]*)">([^<]*)<\/a>/gi;
  const links: Array<{ text: string; url: string }> = [];
  let match;
  
  while ((match = linkRegex.exec(html)) !== null) {
    links.push({
      url: match[1],
      text: match[2] || match[1],
    });
  }
  
  return links;
}

// ============================================================
// Duration Formatting
// ============================================================

/**
 * Format duration in milliseconds to human-readable string
 * @param ms Duration in milliseconds
 * @returns Formatted string like "2d 3h 15m" or "3h 45m" or "45m 30s"
 */
export function formatDuration(ms: number): string {
  if (ms < 0) return '0s';
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  const parts: string[] = [];
  
  if (days > 0) {
    parts.push(`${days}d`);
    const remainingHours = hours % 24;
    if (remainingHours > 0) parts.push(`${remainingHours}h`);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes > 0 && days < 7) parts.push(`${remainingMinutes}m`);
  } else if (hours > 0) {
    parts.push(`${hours}h`);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes > 0) parts.push(`${remainingMinutes}m`);
  } else if (minutes > 0) {
    parts.push(`${minutes}m`);
    const remainingSeconds = seconds % 60;
    if (remainingSeconds > 0 && minutes < 5) parts.push(`${remainingSeconds}s`);
  } else {
    parts.push(`${seconds}s`);
  }
  
  return parts.join(' ') || '0s';
}

/**
 * Format duration in milliseconds to Thai readable string
 * @param ms Duration in milliseconds
 * @returns Thai formatted string like "2 วัน 3 ชั่วโมง 15 นาที"
 */
export function formatDurationThai(ms: number): string {
  if (ms < 0) return '0 วินาที';
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  const parts: string[] = [];
  
  if (days > 0) {
    parts.push(`${days} วัน`);
    const remainingHours = hours % 24;
    if (remainingHours > 0) parts.push(`${remainingHours} ชั่วโมง`);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes > 0 && days < 7) parts.push(`${remainingMinutes} นาที`);
  } else if (hours > 0) {
    parts.push(`${hours} ชั่วโมง`);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes > 0) parts.push(`${remainingMinutes} นาที`);
  } else if (minutes > 0) {
    parts.push(`${minutes} นาที`);
    const remainingSeconds = seconds % 60;
    if (remainingSeconds > 0 && minutes < 5) parts.push(`${remainingSeconds} วินาที`);
  } else {
    parts.push(`${seconds} วินาที`);
  }
  
  return parts.join(' ') || '0 วินาที';
}

/**
 * Convert milliseconds to hours with decimal
 * @param ms Duration in milliseconds
 * @returns Hours with 2 decimal places
 */
export function msToHours(ms: number): number {
  return Math.round((ms / (1000 * 60 * 60)) * 100) / 100;
}

// ============================================================
// Date/Time Utilities
// ============================================================

/**
 * Parse date string to Date object (Asia/Bangkok timezone aware)
 * @param dateStr ISO 8601 date string
 * @returns Date object
 */
export function parseDate(dateStr: string | undefined | null): Date | null {
  if (!dateStr) return null;
  
  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

/**
 * Format date to Thai locale string
 * @param date Date object or ISO string
 * @param includeTime Include time in output
 * @returns Formatted date string
 */
export function formatDateThai(
  date: Date | string | undefined | null,
  includeTime: boolean = true
): string {
  if (!date) return '-';
  
  const d = typeof date === 'string' ? parseDate(date) : date;
  if (!d) return '-';
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Bangkok',
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
    options.hour12 = false;
  }
  
  return d.toLocaleString('th-TH', options);
}

// ============================================================
// Activity Processing
// ============================================================

/**
 * Determine activity type based on changes
 * @param activity Raw activity data
 * @returns ActivityType
 */
export function determineActivityType(activity: any): ActivityType {
  const details = activity.details || [];
  
  // Check for status change
  const hasStatusChange = details.some((d: any) => 
    d.field?.toLowerCase() === 'status' || 
    d.property?.toLowerCase() === 'status'
  );
  if (hasStatusChange) return 'status-change';
  
  // Check for assignee change
  const hasAssigneeChange = details.some((d: any) => 
    d.field?.toLowerCase() === 'assignee' || 
    d.property?.toLowerCase() === 'assignee'
  );
  if (hasAssigneeChange) return 'assignee-change';
  
  // Check if it's creation (index = 1 or action = 'created')
  if (activity.index === 1 || activity.action === 'created') {
    return 'created';
  }
  
  // Check for comment
  if (activity.comment || activity.notes) {
    return 'comment';
  }
  
  // Default to field-change
  return 'field-change';
}

/**
 * Parse activity details to extract status change information
 * @param details Activity details array
 * @returns Status change info or null
 */
export function extractStatusChange(details: ActivityDetail[] | undefined): {
  from: string;
  to: string;
} | null {
  if (!details || details.length === 0) return null;
  
  const statusDetail = details.find(d => 
    d.field?.toLowerCase() === 'status' ||
    d.fieldLabel?.toLowerCase().includes('status')
  );
  
  if (!statusDetail) return null;
  
  return {
    from: statusDetail.fromLabel || statusDetail.from || 'Unknown',
    to: statusDetail.toLabel || statusDetail.to || 'Unknown',
  };
}

// ============================================================
// Timeline Calculation
// ============================================================

/**
 * Calculate timeline analysis from activities
 * @param activities Array of activities sorted by time
 * @param currentStatus Current status of work package
 * @param createdAt Work package creation time
 * @param updatedAt Work package last update time
 * @returns TimelineAnalysis object
 */
export function calculateTimeline(
  activities: Activity[],
  currentStatus: string,
  createdAt: string,
  updatedAt: string
): TimelineAnalysis {
  const intervals: StatusInterval[] = [];
  const statusSummary: Record<string, {
    totalMs: number;
    totalFormatted: string;
    percentage: number;
    occurrences: number;
  }> = {};
  
  // Sort activities by time
  const sortedActivities = [...activities].sort((a, b) => {
    const timeA = parseDate(a.createdAt || a.createdOn);
    const timeB = parseDate(b.createdAt || b.createdOn);
    if (!timeA || !timeB) return 0;
    return timeA.getTime() - timeB.getTime();
  });
  
  // Extract status change events
  const statusEvents: Array<{
    time: Date;
    from: string;
    to: string;
  }> = [];
  
  let initialStatus = 'New'; // Default initial status
  
  for (const activity of sortedActivities) {
    const statusChange = extractStatusChange(activity.details || activity.changes);
    if (statusChange) {
      const time = parseDate(activity.createdAt || activity.createdOn);
      if (time) {
        // Set initial status from first status change's "from" value
        if (statusEvents.length === 0 && statusChange.from) {
          initialStatus = statusChange.from;
        }
        statusEvents.push({
          time,
          from: statusChange.from,
          to: statusChange.to,
        });
      }
    }
  }
  
  // Build intervals
  const startTime = parseDate(createdAt) || new Date();
  const endTime = parseDate(updatedAt) || new Date();
  
  let currentIntervalStatus = initialStatus;
  let currentIntervalStart = startTime;
  
  for (const event of statusEvents) {
    // Close previous interval
    const interval: StatusInterval = {
      status: currentIntervalStatus,
      startTime: currentIntervalStart,
      endTime: event.time,
      durationMs: event.time.getTime() - currentIntervalStart.getTime(),
      durationFormatted: formatDuration(event.time.getTime() - currentIntervalStart.getTime()),
    };
    intervals.push(interval);
    
    // Start new interval
    currentIntervalStatus = event.to;
    currentIntervalStart = event.time;
  }
  
  // Close final interval
  const finalInterval: StatusInterval = {
    status: currentIntervalStatus,
    startTime: currentIntervalStart,
    endTime: endTime,
    durationMs: endTime.getTime() - currentIntervalStart.getTime(),
    durationFormatted: formatDuration(endTime.getTime() - currentIntervalStart.getTime()),
  };
  intervals.push(finalInterval);
  
  // Calculate totals and percentages
  const totalDurationMs = endTime.getTime() - startTime.getTime();
  
  for (const interval of intervals) {
    interval.percentage = totalDurationMs > 0 
      ? Math.round((interval.durationMs / totalDurationMs) * 1000) / 10 
      : 0;
    
    // Add to status summary
    if (!statusSummary[interval.status]) {
      statusSummary[interval.status] = {
        totalMs: 0,
        totalFormatted: '',
        percentage: 0,
        occurrences: 0,
      };
    }
    
    statusSummary[interval.status].totalMs += interval.durationMs;
    statusSummary[interval.status].occurrences += 1;
  }
  
  // Format status summary
  for (const status in statusSummary) {
    const summary = statusSummary[status];
    summary.totalFormatted = formatDuration(summary.totalMs);
    summary.percentage = totalDurationMs > 0
      ? Math.round((summary.totalMs / totalDurationMs) * 1000) / 10
      : 0;
  }
  
  return {
    intervals,
    totalDurationMs,
    totalDurationFormatted: formatDuration(totalDurationMs),
    statusSummary,
    startTime,
    endTime,
    currentStatus: currentIntervalStatus,
  };
}

// ============================================================
// Status Color Mapping
// ============================================================

export function getStatusColor(status: string): string {
  const statusLower = status.toLowerCase();
  
  if (statusLower.includes('new') || statusLower.includes('ใหม่')) {
    return '#2196F3'; // Blue
  }
  if (statusLower.includes('รับเรื่อง') || statusLower.includes('assigned')) {
    return '#FF9800'; // Orange
  }
  if (statusLower.includes('กำลังดำเนินการ') || statusLower.includes('progress') || statusLower.includes('in progress')) {
    return '#9C27B0'; // Purple
  }
  if (statusLower.includes('เสร็จ') || statusLower.includes('completed') || statusLower.includes('done') || statusLower.includes('ปิด') || statusLower.includes('closed')) {
    return '#4CAF50'; // Green
  }
  if (statusLower.includes('ระงับ') || statusLower.includes('suspended') || statusLower.includes('hold')) {
    return '#F44336'; // Red
  }
  
  return '#9E9E9E'; // Grey default
}

/**
 * Get priority color
 */
export function getPriorityColor(priority: string | undefined): string {
  if (!priority) return '#9E9E9E';
  
  const priorityLower = priority.toLowerCase();
  
  if (priorityLower.includes('high') || priorityLower.includes('สูง') || priorityLower.includes('urgent')) {
    return '#F44336'; // Red
  }
  if (priorityLower.includes('normal') || priorityLower.includes('ปกติ') || priorityLower.includes('medium')) {
    return '#FF9800'; // Orange
  }
  if (priorityLower.includes('low') || priorityLower.includes('ต่ำ')) {
    return '#4CAF50'; // Green
  }
  
  return '#9E9E9E'; // Grey
}
