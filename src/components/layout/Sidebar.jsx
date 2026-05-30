/**
 * @file        Sidebar.jsx
 * @module      Sidebar Navigation
 * @project     ClientFrontend
 * @layer       Component
 * @description Collapsible sidebar with section-grouped navigation, business info pill, bot score indicator, and logout action.
 *
 * @updated     2026-05-29
 * @version     1.0.0
 *
 * @dependencies
 *   - react
 *   - react-router-dom (NavLink, useNavigate)
 *   - ../../store/authStore (useAuthStore)
 *   - ../../utils/categoryTheme (getTheme)
 *   - ../../utils/index (CATEGORY_ICONS, PLAN_CONFIG)
 *   - date-fns (format)
 *   - clsx
 *   - lucide-react (various icons)
 *
 * @sideEffects
 *   - Calls authStore.logout() and navigates to /login on logout button click
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
import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { getTheme } from '../../utils/categoryTheme'
import { CATEGORY_ICONS, PLAN_CONFIG } from '../../utils/index'
import { format } from 'date-fns'
import clsx from 'clsx'
import {
  LayoutDashboard, Calendar, Users, Briefcase, UserCheck,
  BarChart3, Receipt, DollarSign, Phone, Settings,
  LogOut, Target, Bot
} from 'lucide-react'

// ─────────────────────────────────────────
// CONSTANTS & CONFIG
// ─────────────────────────────────────────

/**
 * @constant    NAV
 * @purpose     Structured navigation definition — sections with route paths, icons, labels, and optional badges
 */
const NAV = [
  {
    section: 'OVERVIEW', items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    ]
  },
  {
    section: 'OPERATIONS', items: [
      { to: '/bookings', icon: Calendar, label: 'Bookings' },
      { to: '/customers', icon: Users, label: 'Customers' },
      { to: '/leads', icon: Target, label: 'Leads', badge: 'NEW' },
    ]
  },
  {
    section: 'BUSINESS', items: [
      { to: '/services', icon: Briefcase, label: 'Services' },
      { to: '/staff', icon: UserCheck, label: 'Staff' },
    ]
  },
  {
    section: 'FINANCE', items: [
      { to: '/commissions', icon: DollarSign, label: 'Commissions' },
      { to: '/billing', icon: Receipt, label: 'Billing' },
    ]
  },
  {
    section: 'SETUP', items: [
      { to: '/numbers', icon: Phone, label: 'Phone Numbers' },
      { to: '/bot-test', icon: Bot, label: 'Bot Test', badge: 'LIVE' },
      { to: '/settings', icon: Settings, label: 'Settings' },
    ]
  },
]

// ─────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────

/**
 * @function    Sidebar
 * @purpose     Renders the collapsible navigation sidebar with business branding, nav groups, and logout
 * @param  {boolean}  props.collapsed - Whether the sidebar is in collapsed (icon-only) mode
 * @param  {Function} props.onToggle  - Callback to toggle collapsed state
 * @returns {JSX.Element} Sidebar navigation element
 */
export default function Sidebar({ collapsed, onToggle }) {
  // ─────────────────────────────────────────
  // STATE & HOOKS
  // ─────────────────────────────────────────
  const { business, logout, getPlan } = useAuthStore()
  const navigate = useNavigate()

  // [DATA TRANSFORM]: Resolve plan config, category theme, and display values
  const plan = getPlan()
  const planCfg = PLAN_CONFIG[plan] || PLAN_CONFIG.trial
  const theme = getTheme(business?.category)
  const catIcon = CATEGORY_ICONS[business?.category] || '🏢'
  const today = format(new Date(), 'EEE dd MMM yyyy').toUpperCase()

  // ─────────────────────────────────────────
  // CORE LOGIC / HANDLER FUNCTIONS
  // ─────────────────────────────────────────

  /**
   * @function    handleLogout
   * @purpose     Clear auth state and redirect to login page
   */
  // [AUTH]: Clear session and redirect to login on user-initiated logout
  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <aside
      className={clsx(
        'flex flex-col h-screen shrink-0 transition-all duration-300 overflow-hidden',
        collapsed ? 'w-14' : 'w-56'
      )}
      style={{
        background: 'var(--mp-sidebar)',
        color: 'var(--mp-sidebar-text)',
        borderRight: '0.5px solid var(--mp-card-border)',
      }}
    >
      {/* ── Newspaper masthead ─────────────────────── */}
      <div
        className={clsx('px-4 pt-5 pb-4 shrink-0', collapsed && 'px-2')}
        style={{ borderBottom: '1.5px solid var(--mp-sidebar-text)', opacity: 1 }}
      >
        {collapsed ? (
          <div className="flex items-center justify-center">
            <img src="/logo.png" alt="Zyntell" className="w-7 h-7 object-contain" />
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Zyntell" className="w-7 h-7 object-contain flex-shrink-0" />
            <div>
              <p
                className="text-base font-medium leading-none tracking-wide"
                style={{ fontFamily: 'Lora, Georgia, serif', color: 'var(--mp-sidebar-text)', opacity: 1 }}
              >
                Zyntell
              </p>
              <p
                className="text-[8px] mt-1 tracking-widest"
                style={{ color: 'var(--mp-sidebar-text)', opacity: 0.45, letterSpacing: '0.16em' }}
              >
                {today}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Business info pill ─────────────────────── */}
      {!collapsed && business && (
        <div
          className="mx-3 mt-3 mb-1 px-3 py-2.5 rounded-md"
          style={{ background: 'var(--mp-nav-bg)' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">{catIcon}</span>
            <div className="flex-1 min-w-0">
              <p
                className="text-xs font-semibold truncate leading-tight"
                style={{ color: 'var(--mp-sidebar-text)', opacity: 0.9 }}
              >
                {business.name}
              </p>
              <p
                className="text-[10px] mt-0.5"
                style={{ color: 'var(--mp-sidebar-text)', opacity: 0.45 }}
              >
                {theme.name} · {planCfg.label}
              </p>
            </div>
          </div>
          {/* [UI]: Bot score bar */}
          {business.botTrainingScore !== undefined && (
            <div className="mt-2.5">
              <div className="flex justify-between mb-1">
                <span className="text-[9px]" style={{ color: 'var(--mp-sidebar-text)', opacity: 0.45 }}>Bot score</span>
                <span className="text-[9px] font-semibold" style={{ color: 'var(--mp-sidebar-text)', opacity: 0.7 }}>
                  {business.botTrainingScore}%
                </span>
              </div>
              <div className="h-1 rounded-full" style={{ background: 'var(--mp-a10)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${business.botTrainingScore}%`, background: 'var(--mp-sidebar-text)', opacity: 0.5 }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Navigation ─────────────────────────────── */}
      <nav className={clsx('flex-1 overflow-y-auto py-3', collapsed ? 'px-1.5' : 'px-2.5')}>
        {NAV.map(({ section, items }) => (
          <div key={section} className="mb-4">
            {!collapsed && (
              <p
                className="px-2 mb-1.5"
                style={{
                  fontSize: '8px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.18em',
                  color: 'var(--mp-sidebar-text)',
                  opacity: 0.40,
                }}
              >
                {section}
              </p>
            )}
            {items.map(({ to, icon: Icon, label, badge }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => clsx('mp-nav', isActive && 'active', collapsed && 'justify-center px-0')}
                title={collapsed ? label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" style={{ color: 'var(--mp-sidebar-text)' }} />
                {!collapsed && <span className="flex-1 text-xs">{label}</span>}
                {!collapsed && badge && (
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
                    style={{
                      background: 'var(--mp-a10)',
                      color: 'var(--mp-sidebar-text)',
                      opacity: 0.8,
                    }}
                  >
                    {badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* ── Footer ─────────────────────────────────── */}
      <div
        className={clsx('py-3 shrink-0', collapsed ? 'px-1.5' : 'px-2.5')}
        style={{ borderTop: '0.5px solid var(--mp-card-border)' }}
      >
        <button
          onClick={handleLogout}
          className={clsx(
            'mp-nav w-full',
            '!text-red-500 hover:!bg-red-50',
            collapsed && 'justify-center px-0'
          )}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0 text-red-400" />
          {!collapsed && <span className="text-xs text-red-400">Logout</span>}
        </button>
      </div>
    </aside>
  )
}
