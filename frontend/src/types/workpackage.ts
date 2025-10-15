/**
 * Work Package Types and Interfaces
 * Based on OpenProject API v3 and work_improved.py analysis
 */

// ============================================================
// Basic Types
// ============================================================

export interface User {
  id: string | number;
  name: string;
  email?: string;
  avatar?: string;
}

export interface Project {
  id: string | number;
  name: string;
  identifier?: string;
}

export interface Status {
  id: string | number;
  name: string;
  color?: string;
  isClosed?: boolean;
}

export interface Priority {
  id: string | number;
  name: string;
  position?: number;
}

export interface Type {
  id: string | number;
  name: string;
  color?: string;
}

export interface Category {
  id: string | number;
  name: string;
}

export interface CustomField {
  id: string | number;
  name: string;
  value: any;
  fieldType?: string;
}

export interface CustomOption {
  id: string | number;
  value: string;
  position?: number;
}

// ============================================================
// Work Package
// ============================================================

export interface WorkPackage {
  id: number;
  subject: string;
  description?: string;
  descriptionHtml?: string; // HTML version
  
  // Status and Type
  status: Status;
  type: Type;
  priority?: Priority;
  category?: Category;
  
  // People
  assignee?: User;
  author?: User;
  responsible?: User;
  
  // Dates
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  startDate?: string; // YYYY-MM-DD
  dueDate?: string; // YYYY-MM-DD
  finishDate?: string;
  
  // Duration
  estimatedTime?: string; // ISO 8601 duration
  spentTime?: string;
  duration?: number; // days
  
  // Project
  project: Project;
  
  // Custom Fields
  customFields?: Record<string, any>;
  customOptions?: Record<string, CustomOption>;
  
  // Metadata
  version?: number;
  lockVersion?: number;
  
  // Links
  _links?: any;
}

// ============================================================
// Activity / Journal Entry
// ============================================================

export type ActivityType = 
  | 'created' 
  | 'updated' 
  | 'status-change' 
  | 'assignee-change'
  | 'field-change' 
  | 'comment'
  | 'attachment-added'
  | 'relation-added';

export interface ActivityDetail {
  field: string;
  fieldLabel?: string;
  from?: string;
  fromLabel?: string;
  to?: string;
  toLabel?: string;
  oldValue?: any;
  newValue?: any;
}

export interface Activity {
  id: number | string;
  index: number; // ลำดับเหตุการณ์ (1, 2, 3, ...)
  version: number;
  
  // Type
  type: ActivityType;
  action: string; // 'created', 'updated'
  
  // User and Time
  author?: User;
  authorName?: string;
  createdAt: string; // ISO 8601
  createdOn: string; // Alias for createdAt
  
  // Content
  comment?: string; // Plain text (sanitized)
  commentHtml?: string; // Original HTML
  notes?: string;
  
  // Changes
  changes?: ActivityDetail[];
  details?: ActivityDetail[]; // Alias for changes
  
  // Status Change specific
  statusChange?: {
    from: string;
    to: string;
    fromId?: string | number;
    toId?: string | number;
  };
  
  // Metadata
  _links?: any;
}

// ============================================================
// Timeline Analysis
// ============================================================

export interface StatusInterval {
  status: string;
  statusId?: string | number;
  startTime: Date;
  endTime: Date;
  durationMs: number;
  durationFormatted: string; // "2d 3h 15m"
  percentage?: number;
}

export interface TimelineAnalysis {
  intervals: StatusInterval[];
  totalDurationMs: number;
  totalDurationFormatted: string;
  statusSummary: Record<string, {
    totalMs: number;
    totalFormatted: string;
    percentage: number;
    occurrences: number;
  }>;
  startTime: Date;
  endTime: Date;
  currentStatus: string;
}

// ============================================================
// API Response Types
// ============================================================

export interface WorkPackageListResponse {
  items: WorkPackage[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface WorkPackageDetailResponse {
  workPackage: WorkPackage;
  activities: Activity[];
  timeline?: TimelineAnalysis;
}

// ============================================================
// Filter and Query Types
// ============================================================

export interface WorkPackageFilters {
  search?: string;
  status?: string[];
  assignee?: string[];
  author?: string[];
  priority?: string[];
  type?: string[];
  project?: string[];
  createdFrom?: string; // ISO date
  createdTo?: string;
  updatedFrom?: string;
  updatedTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
}

export interface WorkPackageQuery {
  page?: number;
  pageSize?: number;
  filters?: WorkPackageFilters;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================================
// UI State Types
// ============================================================

export interface WorkPackageListState {
  workPackages: WorkPackage[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error?: string;
  filters: WorkPackageFilters;
}

export interface WorkPackageDetailState {
  workPackage?: WorkPackage;
  activities: Activity[];
  timeline?: TimelineAnalysis;
  loading: boolean;
  error?: string;
  activeTab: 'overview' | 'timeline' | 'comments' | 'history' | 'sla';
}

// ============================================================
// Export Options
// ============================================================

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  includeActivities?: boolean;
  includeCustomFields?: boolean;
  dateRange?: {
    from: string;
    to: string;
  };
}

// ============================================================
// SLA Configuration
// ============================================================

export interface SLAThreshold {
  status: string;
  maxDurationHours: number;
  warningPercentage: number; // 80% = warning, 100% = critical
}

export interface SLAStatus {
  status: string;
  actualDurationHours: number;
  thresholdHours?: number;
  percentage?: number;
  state: 'ok' | 'warning' | 'critical' | 'unknown';
}
