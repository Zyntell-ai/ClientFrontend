/**
 * @file        FeatureGate.jsx
 * @module      Feature Gate UI
 * @project     ClientFrontend
 * @layer       Component
 * @description Wraps any content with a plan-aware gate. If the current business plan
 *              does not include the feature (after checking featureOverrides), renders
 *              a locked overlay in the same DOM position — content stays where it is.
 *
 *              Usage:
 *                <FeatureGate feature="analyticsDashboard">
 *                  <AnalyticsContent />
 *                </FeatureGate>
 *
 * @updated     2026-05-30
 * @version     1.0.0
 *
 * @sideEffects
 *   - None (reads from Zustand authStore — no API calls)
 */

// ─────────────────────────────────────────
// IMPORTS & DEPENDENCIES
// ─────────────────────────────────────────
import React from 'react'
import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { hasFeature, getPlanThatUnlocks } from '../../config/plans'
import clsx from 'clsx'

// ─────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────

/**
 * @function    FeatureGate
 * @purpose     Conditionally renders children or a locked overlay based on plan features.
 *
 * @param  {string}         feature      - Feature key from plans.js (e.g. 'analyticsDashboard')
 * @param  {React.ReactNode} children    - Content to render when feature is available
 * @param  {string}         [className]  - Extra class names on the wrapper div
 * @param  {string}         [message]    - Override the lock message (optional)
 * @param  {boolean}        [overlay]    - If true, children render underneath a translucent overlay (default: false — children are hidden)
 * @returns {JSX.Element}
 */
export default function FeatureGate({ feature, children, className, message, overlay = false }) {
  const { business } = useAuthStore()
  const planId    = business?.plan || 'trial'
  const overrides = business?.featureOverrides || {}

  // [BUSINESS RULE]: Check plan config + admin overrides — always reference plans.js, never inline
  const isAvailable = hasFeature(planId, feature, overrides)

  if (isAvailable) return <>{children}</>

  const unlockPlan = getPlanThatUnlocks(feature)
  const lockMessage = message || `This feature is available on the ${unlockPlan} plan.`

  // [UI]: Overlay mode — renders children with a blur + lock on top (useful for charts/tables)
  if (overlay) {
    return (
      <div className={clsx('relative', className)}>
        {/* [UI]: Underlying content is visible but blurred and non-interactive */}
        <div className="pointer-events-none select-none blur-sm opacity-40">{children}</div>
        {/* [UI]: Locked overlay centred over the content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm rounded-xl z-10">
          <div className="text-center px-6 py-8 max-w-xs">
            <div className="w-12 h-12 rounded-full bg-violet-100 border border-violet-200 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-5 h-5 text-violet-600" />
            </div>
            <p className="text-sm font-semibold text-[#1E1B4B] mb-1">{lockMessage}</p>
            <p className="text-xs text-slate-500 mb-4">Upgrade your plan to unlock this feature.</p>
            <Link
              to="/billing"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-lg transition-colors"
            >
              View Plans →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // [UI]: Block mode — children are replaced entirely by a compact locked card
  return (
    <div className={clsx('flex flex-col items-center justify-center py-10 px-4 rounded-xl border border-violet-100 bg-violet-50/40', className)}>
      <div className="w-10 h-10 rounded-full bg-violet-100 border border-violet-200 flex items-center justify-center mb-3">
        <Lock className="w-4 h-4 text-violet-600" />
      </div>
      <p className="text-sm font-semibold text-[#1E1B4B] mb-1 text-center">{lockMessage}</p>
      <p className="text-xs text-slate-500 mb-4 text-center">Go to Billing to upgrade your plan.</p>
      <Link
        to="/billing"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-lg transition-colors"
      >
        View Plans →
      </Link>
    </div>
  )
}
