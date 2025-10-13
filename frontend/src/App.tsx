import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import { theme } from './theme'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import MainLayout from './layouts/MainLayout'
import LoginPage from './pages/auth/LoginPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import WorkPackagesPageNew from './pages/workpackages/WorkPackagesPageNew'
import WorkPackageDetailPageNew from './pages/workpackages/WorkPackageDetailPageNew'
import UsersAdminPage from './pages/admin/UsersAdminPage'
import AssigneesAdminPage from './pages/admin/AssigneesAdminPage'
import SettingsAdminPage from './pages/admin/SettingsAdminPage'
import SLAReportsPage from './pages/reports/SLAReportsPage'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter basename="/worksla">
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/auth/login" element={<LoginPage />} />
            
            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="workpackages" element={<WorkPackagesPageNew />} />
              <Route path="workpackages/:id" element={<WorkPackageDetailPageNew />} />
              <Route path="reports/sla" element={<SLAReportsPage />} />
              
              {/* Admin Routes */}
              <Route path="admin/users" element={<ProtectedRoute requiredRole="admin"><UsersAdminPage /></ProtectedRoute>} />
              <Route path="admin/assignees" element={<ProtectedRoute requiredRole="admin"><AssigneesAdminPage /></ProtectedRoute>} />
              <Route path="admin/settings" element={<ProtectedRoute requiredRole="admin"><SettingsAdminPage /></ProtectedRoute>} />
            </Route>
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
