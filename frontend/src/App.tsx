import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import MainLayout from './layouts/MainLayout'
import LoginPage from './pages/auth/LoginPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import UsersAdminPage from './pages/admin/UsersAdminPage'
import AssigneesAdminPage from './pages/admin/AssigneesAdminPage'
import SettingsPage from './pages/admin/SettingsPage'
import SLAReportsPage from './pages/reports/SLAReportsPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter basename="/worksla">
          <AuthProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/auth/login" element={<LoginPage />} />

              {/* Protected Routes with MainLayout */}
              <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                
                <Route path="reports" element={<Navigate to="/reports/sla" replace />} />
                <Route path="reports/sla" element={<SLAReportsPage />} />

              {/* Admin Routes */}
              <Route path="admin/users" element={<ProtectedRoute requiredRole="admin"><UsersAdminPage /></ProtectedRoute>} />
              <Route path="admin/assignees" element={<ProtectedRoute requiredRole="admin"><AssigneesAdminPage /></ProtectedRoute>} />
              <Route path="admin/settings" element={<ProtectedRoute requiredRole="admin"><SettingsPage /></ProtectedRoute>} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
  )
}

export default App
