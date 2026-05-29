/**
 * @file        DashboardLayout.jsx
 * @module      Dashboard Layout
 * @project     ClientFrontend
 * @layer       Component
 * @description Root layout shell for all authenticated dashboard pages — composes Sidebar, Topbar, and main content area with dynamic category theming.
 *
 * @updated     2026-05-29
 * @version     1.0.0
 *
 * @dependencies
 *   - react
 *   - ./Sidebar
 *   - ./Topbar
 *   - react-hot-toast (Toaster)
 *   - ../../store/authStore (useAuthStore)
 *   - ../../utils/categoryTheme (applyTheme)
 *
 * @sideEffects
 *   - Applies CSS custom property theme to document root via applyTheme() on category change
 *   - Renders global Toaster notification container
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
import React, { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import { Topbar } from './Topbar'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'
import { applyTheme } from '../../utils/categoryTheme'

// ─────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────

/**
 * @function    DashboardLayout
 * @purpose     Wraps all protected dashboard pages with the collapsible sidebar, topbar, and dynamic theme
 * @param  {ReactNode} props.children - Page content to render in the main area
 * @param  {string}    props.title    - Page title displayed in the topbar
 * @param  {string}    props.subtitle - Optional subtitle displayed below the title
 * @returns {JSX.Element} Full dashboard layout shell
 */
export default function DashboardLayout({ children, title, subtitle }) {
  // ─────────────────────────────────────────
  // STATE & HOOKS
  // ─────────────────────────────────────────
  // [STATE]: Track sidebar collapse state locally within the layout
  const [collapsed, setCollapsed] = useState(false)
  const { business } = useAuthStore()

  // [DATA TRANSFORM]: Apply category theme to CSS variables on every category change
  useEffect(() => {
    applyTheme(business?.category)
  }, [business?.category])

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--mp-body)' }}>
      {/* [UI]: Global toast notification container */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#ffffff',
            color: 'var(--mp-text)',
            border: '0.5px solid var(--mp-card-border)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            fontSize: '13px',
            fontFamily: 'DM Sans, sans-serif',
            borderRadius: '8px',
          },
          success: { iconTheme: { primary: '#059669', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
        }}
      />

      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar
          collapsed={collapsed}
          onToggle={() => setCollapsed(c => !c)}
          title={title}
          subtitle={subtitle}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
