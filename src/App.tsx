
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import LoginPage from './pages/LoginPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import DashboardPage from './pages/DashboardPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import MemberDashboardPage from './pages/MemberDashboardPage'
import MemberManagementPage from './pages/MemberManagementPage'
import TrainerManagementPage from './pages/TrainerManagementPage'
import WorkoutPlanManagementPage from './pages/WorkoutPlanManagementPage'
import MembershipPlanManagementPage from './pages/MembershipPlanManagementPage'
import AttendanceManagementPage from './pages/AttendanceManagementPage'

import ProtectedRoute from './routes/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route
              path="/admin/dashboard"
              element={<AdminDashboardPage />}
            />
            <Route
              path="/admin/members"
              element={<MemberManagementPage />}
            />
            <Route
              path="/admin/trainers"
              element={<TrainerManagementPage />}
            />
            <Route
              path="/admin/workout-plans"
              element={<WorkoutPlanManagementPage />}
            />
            <Route
              path="/admin/membership-plans"
              element={<MembershipPlanManagementPage />}
            />
            <Route
              path="/admin/attendance"
              element={<AttendanceManagementPage />}
            />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['MEMBER']} />}>
            <Route
              path="/member/dashboard"
              element={<MemberDashboardPage />}
            />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
