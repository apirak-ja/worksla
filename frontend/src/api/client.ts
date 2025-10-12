import axios from 'axios'

export const api = axios.create({
  baseURL: '/worksla/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // Avoid infinite loop
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If this is already the /auth/me or /auth/refresh endpoint, don't retry
      if (originalRequest.url?.includes('/auth/me') || originalRequest.url?.includes('/auth/refresh')) {
        return Promise.reject(error)
      }
      
      originalRequest._retry = true
      
      // Try to refresh token
      try {
        await api.post('/auth/refresh')
        // Retry original request
        return api.request(originalRequest)
      } catch (refreshError) {
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/auth/login')) {
          window.location.href = '/worksla/auth/login'
        }
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  }
)

// API Types
export interface User {
  id: number
  username: string
  role: string
  is_active: boolean
  created_at: string
}

export interface LoginResponse {
  user: User
  message: string
}

export interface WorkPackage {
  wp_id: number
  subject: string
  status?: string
  priority?: string
  type?: string
  assignee_id?: number
  assignee_name?: string
  project_id?: number
  project_name?: string
  start_date?: string
  due_date?: string
  done_ratio?: number
  estimated_hours?: number
  description?: string
  created_at?: string
  updated_at?: string
  cached_at: string
  raw?: any
}

export interface WPListResponse {
  items: WorkPackage[]
  total: number
  page: number
  page_size: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export interface DashboardStats {
  total: number
  by_status: Record<string, number>
  by_priority: Record<string, number>
  overdue_count: number
  due_soon_count: number
}

export interface DashboardResponse {
  stats: DashboardStats
  overdue: WorkPackage[]
  due_soon: WorkPackage[]
  recent_updates: WorkPackage[]
}

// Auth API
export const authApi = {
  login: (username: string, password: string) =>
    api.post<LoginResponse>('/auth/login', { username, password }),
  
  logout: () => api.post('/auth/logout'),
  
  me: () => api.get<User>('/auth/me'),
  
  refresh: () => api.post('/auth/refresh'),
}

// Work Packages API
export const wpApi = {
  list: (params: any) => api.get<WPListResponse>('/workpackages/', { params }),
  
  get: (id: number) => api.get<WorkPackage>(`/workpackages/${id}`),
  
  getActivities: (id: number) => api.get(`/workpackages/${id}/activities`),
  
  dashboard: () => api.get<DashboardResponse>('/workpackages/dashboard'),
  
  refresh: () => api.post('/workpackages/refresh'),
}

// Admin API
export const adminApi = {
  // Users
  listUsers: () => api.get('/admin/users'),
  createUser: (data: any) => api.post('/admin/users', data),
  updateUser: (id: number, data: any) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),
  
  // Assignees
  listAssignees: (activeOnly?: boolean) =>
    api.get('/admin/assignees', { params: { active_only: activeOnly } }),
  createAssignee: (data: any) => api.post('/admin/assignees', data),
  updateAssignee: (id: number, data: any) => api.put(`/admin/assignees/${id}`, data),
  deleteAssignee: (id: number) => api.delete(`/admin/assignees/${id}`),
  
  // Settings
  listSettings: () => api.get('/admin/settings'),
  getSetting: (key: string) => api.get(`/admin/settings/${key}`),
  createSetting: (data: any) => api.post('/admin/settings', data),
  updateSetting: (key: string, data: any) => api.put(`/admin/settings/${key}`, data),
  deleteSetting: (key: string) => api.delete(`/admin/settings/${key}`),
}

// Reports API
export const reportsApi = {
  sla: (params: any) => api.get('/reports/sla', { params }),
  productivity: (params: any) => api.get('/reports/productivity', { params }),
}

// Search API
export const searchApi = {
  search: (query: string, limit?: number) =>
    api.get<WorkPackage[]>('/search', { params: { q: query, limit } }),
}
