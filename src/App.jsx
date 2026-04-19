// src/App.jsx
import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { authApi } from './api/auth.api'
import { PageLoader } from './components/ui/index'

// Auth pages
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'

// Onboarding wizard
import OnboardingPage from './pages/onboarding/OnboardingPage'

// Dashboard pages
import DashboardPage from './pages/dashboard/DashboardPage'
import BookingsPage from './pages/bookings/BookingsPage'
import CalendarPage from './pages/bookings/CalendarPage'
import ServicesPage from './pages/services/ServicesPage'
import StaffPage from './pages/staff/StaffPage'
import CustomersPage from './pages/customers/CustomersPage'
import LeadsPage from './pages/leads/LeadsPage'
import AnalyticsPage from './pages/analytics/AnalyticsPage'
import BillingPage from './pages/billing/BillingPage'
import CommissionsPage from './pages/commissions/CommissionsPage'
import NumbersPage from './pages/numbers/NumbersPage'
import SettingsPage from './pages/settings/SettingsPage'
import BotTestPage from './pages/bot-test/BotTestPage'
// ─── Guards ──────────────────────────────────────────────────
function RequireAuth({ children }) {
  const { isAuthenticated, business } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  // If authenticated but not onboarded → redirect to onboarding
  if (business && !business.setupCompleted) return <Navigate to="/onboarding" replace />
  return children
}

function RequireNoAuth({ children }) {
  const { isAuthenticated, business } = useAuthStore()
  if (!isAuthenticated) return children
  if (!business?.setupCompleted) return <Navigate to="/onboarding" replace />
  return <Navigate to="/dashboard" replace />
}

function RequireOnboarding({ children }) {
  const { isAuthenticated, business } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (business?.setupCompleted) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  const { isAuthenticated, token, updateBusiness } = useAuthStore()
  const [loading, setLoading] = React.useState(true)

  // Refresh business profile on app load
  useEffect(() => {
    if (token) {
      authApi.me()
        .then((res) => updateBusiness(res.data.business))
        .catch(() => {})
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [token])

  if (loading) return <PageLoader />

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<RequireNoAuth><LoginPage /></RequireNoAuth>} />
        <Route path="/signup" element={<RequireNoAuth><SignupPage /></RequireNoAuth>} />

        {/* Onboarding (auth'd but not setup) */}
        <Route path="/onboarding" element={<RequireOnboarding><OnboardingPage /></RequireOnboarding>} />

        {/* Protected dashboard */}
        <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
        <Route path="/bookings" element={<RequireAuth><BookingsPage /></RequireAuth>} />
        <Route path="/bookings/calendar" element={<RequireAuth><CalendarPage /></RequireAuth>} />
        <Route path="/services" element={<RequireAuth><ServicesPage /></RequireAuth>} />
        <Route path="/staff" element={<RequireAuth><StaffPage /></RequireAuth>} />
        <Route path="/customers" element={<RequireAuth><CustomersPage /></RequireAuth>} />
        <Route path="/leads" element={<RequireAuth><LeadsPage /></RequireAuth>} />
        <Route path="/analytics" element={<RequireAuth><AnalyticsPage /></RequireAuth>} />
        <Route path="/billing" element={<RequireAuth><BillingPage /></RequireAuth>} />
        <Route path="/commissions" element={<RequireAuth><CommissionsPage /></RequireAuth>} />
        <Route path="/numbers" element={<RequireAuth><NumbersPage /></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
        <Route path="/bot-test" element={<RequireAuth><BotTestPage /></RequireAuth>} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
