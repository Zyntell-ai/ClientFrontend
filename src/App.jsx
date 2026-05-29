/**
 * @file        App.jsx
 * @module      App Root
 * @project     ClientFrontend
 * @layer       Component
 * @description Root application component that defines all client-side routes and authentication guard wrappers.
 *
 * @updated     2026-05-29
 * @version     1.0.0
 *
 * @dependencies
 *   - react
 *   - react-router-dom (BrowserRouter, Routes, Route, Navigate)
 *   - ./store/authStore (useAuthStore)
 *   - ./api/auth.api (authApi)
 *   - ./components/ui/index (PageLoader)
 *
 * @sideEffects
 *   - HTTP request to /api/auth/me on mount when a token exists to refresh business profile
 *   - Updates business state in authStore on successful profile refresh
 */

/*
 * ╔══════════════════════════════════════════╗
 * ║           SDLC LIFECYCLE STATUS          ║
 * ╠══════════════════════════════════════════╣
 * ║ Planning     : ✅ Complete               ║
 * ║ Design       : ✅ Complete               ║
 * ║ Development  : ✅ Complete               ║
 * ║ Testing      : ⚠️  Partial              ║
 * ║ Deployment   : ✅ Complete               ║
 * ║ Maintenance  : 🔄 Active                ║
 * ╚══════════════════════════════════════════╝
 */

// ─────────────────────────────────────────
// IMPORTS & DEPENDENCIES
// ─────────────────────────────────────────
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

// ─────────────────────────────────────────
// CORE LOGIC / HANDLER FUNCTIONS
// ─────────────────────────────────────────

/**
 * @function    RequireAuth
 * @purpose     Route guard that redirects unauthenticated users to /login and unsetup businesses to /onboarding
 * @param  {object} props.children - Child route element to render when authorized
 * @returns {JSX.Element} Children, or a Navigate redirect
 */
function RequireAuth({ children }) {
  const { isAuthenticated, business } = useAuthStore()
  // [GUARD]: Block unauthenticated access — redirect to login
  if (!isAuthenticated) return <Navigate to="/login" replace />
  // [GUARD]: If authenticated but not onboarded → redirect to onboarding
  if (business && !business.setupCompleted) return <Navigate to="/onboarding" replace />
  return children
}

/**
 * @function    RequireNoAuth
 * @purpose     Route guard for public pages — redirects already-authenticated users away from login/signup
 * @param  {object} props.children - Child route element to render when not authenticated
 * @returns {JSX.Element} Children, or a Navigate redirect
 */
function RequireNoAuth({ children }) {
  const { isAuthenticated, business } = useAuthStore()
  // [GUARD]: Allow unauthenticated users through
  if (!isAuthenticated) return children
  // [GUARD]: Redirect to onboarding if setup incomplete, otherwise to dashboard
  if (!business?.setupCompleted) return <Navigate to="/onboarding" replace />
  return <Navigate to="/dashboard" replace />
}

/**
 * @function    RequireOnboarding
 * @purpose     Route guard for the onboarding page — only accessible to authenticated but not-yet-setup businesses
 * @param  {object} props.children - Child route element to render when guard passes
 * @returns {JSX.Element} Children, or a Navigate redirect
 */
function RequireOnboarding({ children }) {
  const { isAuthenticated, business } = useAuthStore()
  // [GUARD]: Unauthenticated users cannot access onboarding
  if (!isAuthenticated) return <Navigate to="/login" replace />
  // [GUARD]: Already setup businesses go straight to dashboard
  if (business?.setupCompleted) return <Navigate to="/dashboard" replace />
  return children
}

// ─────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────

/**
 * @function    App
 * @purpose     Root component — bootstraps auth state, renders route tree with guards
 * @returns {JSX.Element} Full application router tree
 */
export default function App() {
  const { isAuthenticated, token, updateBusiness } = useAuthStore()
  const [loading, setLoading] = React.useState(true)

  // [AUTH]: Refresh business profile on app load to ensure state is current
  useEffect(() => {
    if (token) {
      // [API CALL]: Fetch the current user's business profile on mount
      authApi.me()
        .then((res) => updateBusiness(res.data.business))
        .catch(() => {})
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [token])

  // [GUARD]: Show full-page loader while auth state is being resolved
  if (loading) return <PageLoader />

  return (
    <BrowserRouter>
      <Routes>
        {/* [ROUTE]: Public */}
        <Route path="/login" element={<RequireNoAuth><LoginPage /></RequireNoAuth>} />
        <Route path="/signup" element={<RequireNoAuth><SignupPage /></RequireNoAuth>} />

        {/* [ROUTE]: Onboarding (auth'd but not setup) */}
        <Route path="/onboarding" element={<RequireOnboarding><OnboardingPage /></RequireOnboarding>} />

        {/* [ROUTE]: Protected dashboard */}
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
        {/* [ROUTE]: Fallback */}
        <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
