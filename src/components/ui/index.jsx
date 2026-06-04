/**
 * @file        index.jsx
 * @module      UI Components
 * @project     ClientFrontend
 * @layer       Component
 * @description Shared primitive UI components — Spinner, PageLoader, Button, Input, Select, Textarea, Toggle, Card, Badge, StatCard, Modal, Alert, EmptyState, Skeleton, Table, Tabs, and Avatar.
 *
 * @updated     2026-05-29
 * @version     1.0.0
 *
 * @dependencies
 *   - react
 *   - lucide-react (Loader2, AlertCircle, CheckCircle2, Info, X)
 *   - clsx
 *
 * @sideEffects
 *   - None
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
import React, { useState } from 'react'
import { Loader2, AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import clsx from 'clsx'

// ─────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────

/**
 * @function    Spinner
 * @purpose     Animated loading spinner with configurable size
 * @param  {string} props.size      - Size variant: "sm" | "md" | "lg" | "xl"
 * @param  {string} props.className - Additional CSS classes
 * @returns {JSX.Element} Spinning Loader2 icon
 */
// ─── Spinner ──────────────────────────────────────────────────
export function Spinner({ size = 'md', className = '' }) {
  const s = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-7 h-7', xl: 'w-10 h-10' }
  return <Loader2 className={clsx('animate-spin', s[size], className)} style={{ color: 'var(--mp-accent)' }} />
}

/**
 * @function    PageLoader
 * @purpose     Full-page centered loading state shown during async route bootstrapping
 * @returns {JSX.Element} Centered spinner with "Loading…" text
 */
// ─── Page Loader ──────────────────────────────────────────────
export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--mp-body)' }}>
      <div className="text-center">
        <Spinner size="xl" />
        <p className="mt-3 text-sm" style={{ color: 'var(--mp-text)', opacity: 0.45 }}>Loading…</p>
      </div>
    </div>
  )
}

/**
 * @function    Button
 * @purpose     Styled button with variant, size, and loading spinner support
 * @param  {ReactNode} props.children  - Button label content
 * @param  {string}    props.variant   - Visual variant: "primary" | "secondary" | "ghost" | "danger"
 * @param  {string}    props.size      - Size variant: "sm" | "md" | "lg"
 * @param  {boolean}   props.loading   - Shows spinner and disables button when true
 * @param  {string}    props.className - Additional CSS classes
 * @returns {JSX.Element} Button element
 */
// ─── Button ───────────────────────────────────────────────────
export function Button({ children, variant = 'primary', size = 'md', loading = false, className = '', ...props }) {
  const v = {
    primary:   'mp-btn mp-btn-primary',
    secondary: 'mp-btn mp-btn-secondary',
    ghost:     'mp-btn mp-btn-ghost',
    danger:    'mp-btn mp-btn-danger',
  }
  const s = { sm: 'text-xs px-3 py-1.5', md: '', lg: 'text-sm px-5 py-2.5' }
  return (
    <button className={clsx(v[variant], s[size], className)} disabled={loading || props.disabled} {...props}>
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  )
}

/**
 * @function    Input
 * @purpose     Labeled text input with optional prefix icon and inline error display
 * @param  {string}    props.label     - Input field label
 * @param  {string}    props.error     - Validation error message
 * @param  {string}    props.className - Additional CSS classes
 * @param  {ReactNode} props.prefix    - Optional prefix element inside the input
 * @returns {JSX.Element} Input field with label and error
 */
// ─── Input ────────────────────────────────────────────────────
export const Input = React.forwardRef(function Input({ label, error, className = '', prefix, ...props }, ref) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="mp-label" style={{ color: 'var(--mp-accent)' }}>{label}</label>
      )}
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--mp-accent)', opacity: 0.6 }}>
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          className={clsx('mp-input', prefix && 'pl-7', error && '!border-red-400', className)}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />{error}
        </p>
      )}
    </div>
  )
})

/**
 * @function    Select
 * @purpose     Labeled select dropdown with error state support
 * @param  {string}    props.label     - Select field label
 * @param  {string}    props.error     - Validation error message
 * @param  {ReactNode} props.children  - Option elements
 * @param  {string}    props.className - Additional CSS classes
 * @returns {JSX.Element} Select element with label and error
 */
// ─── Select ───────────────────────────────────────────────────
export const Select = React.forwardRef(function Select({ label, error, children, className = '', ...props }, ref) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="mp-label">{label}</label>}
      <select ref={ref} className={clsx('mp-input appearance-none cursor-pointer', error && '!border-red-400', className)} {...props}>
        {children}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
})

/**
 * @function    Textarea
 * @purpose     Labeled multi-line textarea with error state support
 * @param  {string} props.label     - Textarea field label
 * @param  {string} props.error     - Validation error message
 * @param  {string} props.className - Additional CSS classes
 * @returns {JSX.Element} Textarea element with label and error
 */
// ─── Textarea ─────────────────────────────────────────────────
export const Textarea = React.forwardRef(function Textarea({ label, error, className = '', ...props }, ref) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="mp-label">{label}</label>}
      <textarea ref={ref} className={clsx('mp-input resize-none', error && '!border-red-400', className)} rows={3} {...props} />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
})

/**
 * @function    Toggle
 * @purpose     Accessible toggle switch with optional label and description
 * @param  {boolean}  props.checked     - Current toggle state
 * @param  {Function} props.onChange    - Callback invoked with new boolean value
 * @param  {string}   props.label       - Primary label text
 * @param  {string}   props.description - Secondary description text
 * @returns {JSX.Element} Toggle switch element
 */
// ─── Toggle ───────────────────────────────────────────────────
export function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="mp-toggle-track mt-0.5"
        style={{ background: checked ? 'var(--mp-accent)' : 'var(--mp-card-border)' }}
      >
        <span
          className="mp-toggle-thumb"
          style={{ transform: checked ? 'translateX(16px)' : 'translateX(0)' }}
        />
      </button>
      {(label || description) && (
        <div>
          {label       && <p className="text-sm font-medium" style={{ color: 'var(--mp-text)' }}>{label}</p>}
          {description && <p className="text-xs mt-0.5" style={{ color: 'var(--mp-text)', opacity: 0.5 }}>{description}</p>}
        </div>
      )}
    </div>
  )
}

/**
 * @function    Card
 * @purpose     Content card container with optional serif title header and action slot
 * @param  {ReactNode} props.children  - Card body content
 * @param  {string}    props.className - Additional CSS classes
 * @param  {string}    props.title     - Optional card title in serif typeface
 * @param  {ReactNode} props.action    - Optional action element rendered in header
 * @param  {boolean}   props.white     - Uses white card variant when true
 * @returns {JSX.Element} Styled card container
 */
// ─── Card ─────────────────────────────────────────────────────
export function Card({ children, className = '', title, action, white = false }) {
  return (
    <div className={clsx(white ? 'mp-card-white' : 'mp-card', 'p-5', className)}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && (
            <div>
              <div className="mp-rule-bold mb-2" style={{ width: 24 }} />
              <h3
                className="text-sm font-medium leading-none"
                style={{ fontFamily: 'Lora, Georgia, serif', color: 'var(--mp-text)' }}
              >
                {title}
              </h3>
            </div>
          )}
          {action}
        </div>
      )}
      {children}
    </div>
  )
}

/**
 * @function    Badge
 * @purpose     Inline status/label badge with color variants
 * @param  {ReactNode} props.children  - Badge text content
 * @param  {string}    props.color     - Color variant: "accent" | "green" | "red" | "amber" | "blue" | "slate" | "purple"
 * @param  {string}    props.className - Additional CSS classes
 * @returns {JSX.Element} Badge span element
 */
// ─── Badge ────────────────────────────────────────────────────
export function Badge({ children, color = 'accent', className = '' }) {
  const styles = {
    accent:  { background: 'var(--mp-a10)',             color: 'var(--mp-accent)',  borderColor: 'var(--mp-card-border)' },
    green:   { background: 'rgba(5,150,105,0.08)',       color: '#059669',          borderColor: 'rgba(5,150,105,0.20)'  },
    red:     { background: 'rgba(220,38,38,0.08)',       color: '#dc2626',          borderColor: 'rgba(220,38,38,0.20)'  },
    amber:   { background: 'rgba(217,119,6,0.08)',       color: '#d97706',          borderColor: 'rgba(217,119,6,0.20)'  },
    blue:    { background: 'rgba(2,132,199,0.08)',        color: '#0284c7',          borderColor: 'rgba(2,132,199,0.20)'  },
    slate:   { background: 'rgba(100,116,139,0.08)',     color: '#64748b',          borderColor: 'rgba(100,116,139,0.20)' },
    purple:  { background: 'rgba(124,58,237,0.08)',      color: '#7c3aed',          borderColor: 'rgba(124,58,237,0.20)' },
  }
  const s = styles[color] || styles.accent
  return (
    <span className={clsx('mp-badge', className)} style={s}>{children}</span>
  )
}

/**
 * @function    StatCard
 * @purpose     Metric display card with focus/dim state, trend indicator, and expandable detail panel
 * @param  {ReactNode} props.icon       - Icon element or emoji
 * @param  {string}    props.label      - Metric label
 * @param  {string}    props.value      - Primary metric value
 * @param  {string}    props.sub        - Secondary sub-label text
 * @param  {number}    props.trend      - Percentage trend vs last month (positive or negative)
 * @param  {Function}  props.onClick    - Click handler for focus mode
 * @param  {string}    props.focusState - Focus state: "focused" | "dimmed" | undefined
 * @param  {ReactNode} props.detail     - Detail content shown when focused
 * @returns {JSX.Element} Stat card element
 */
// ─── Stat Card — supports Focus Mode externally ───────────────
export function StatCard({ icon, label, value, sub, trend, onClick, focusState, detail }) {
  return (
    <div
      className={clsx('mp-stat', focusState === 'focused' && 'focused', focusState === 'dimmed' && 'dimmed')}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <p className="mp-label">{label}</p>
        <span style={{ color: 'var(--mp-accent)', opacity: 0.5, fontSize: 16 }}>{icon}</span>
      </div>
      <p className="mp-serif text-2xl leading-none mt-2" style={{ color: 'var(--mp-text)' }}>
        {value ?? '—'}
      </p>
      {sub && (
        <p className="text-xs mt-2" style={{ color: 'var(--mp-text)', opacity: 0.45 }}>{sub}</p>
      )}
      {trend !== undefined && (
        <p className={clsx('text-xs font-semibold mt-2', trend >= 0 ? 'text-emerald-500' : 'text-red-500')}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last month
        </p>
      )}
      {/* [UI]: Detail panel — shown only when focused */}
      {focusState === 'focused' && detail && (
        <div
          className="mt-3 pt-3 text-xs leading-relaxed"
          style={{ borderTop: '0.5px solid var(--mp-card-border)', color: 'var(--mp-text)', opacity: 0.65 }}
        >
          {detail}
        </div>
      )}
    </div>
  )
}

/**
 * @function    Modal
 * @purpose     Overlay modal dialog with backdrop, title, close button, and size variants
 * @param  {boolean}   props.open     - Controls modal visibility
 * @param  {Function}  props.onClose  - Callback invoked when backdrop or close button is clicked
 * @param  {string}    props.title    - Modal dialog title
 * @param  {ReactNode} props.children - Modal body content
 * @param  {string}    props.size     - Size variant: "sm" | "md" | "lg" | "xl"
 * @returns {JSX.Element|null} Modal overlay or null when closed
 */
// ─── Modal ────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md' }) {
  // [GUARD]: Do not render the modal when not open
  if (!open) return null
  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-content-center p-4"
      style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(2px)' }} onClick={onClose} />
      <div className={clsx('relative w-full mp-card-white', sizes[size])} style={{ maxHeight: '90vh', overflow: 'auto' }}>
        <div className="flex items-center justify-between p-5" style={{ borderBottom: '0.5px solid var(--mp-card-border)' }}>
          <div>
            <div className="mp-rule-bold mb-2" style={{ width: 20 }} />
            <h3 className="mp-serif text-sm" style={{ color: 'var(--mp-text)' }}>{title}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded" style={{ color: 'var(--mp-text)', opacity: 0.4 }}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

/**
 * @function    Alert
 * @purpose     Contextual inline alert banner with type-specific icon and color scheme
 * @param  {string}    props.type      - Alert type: "info" | "success" | "error" | "warning"
 * @param  {ReactNode} props.children  - Alert message content
 * @param  {string}    props.className - Additional CSS classes
 * @returns {JSX.Element} Alert banner element
 */
// ─── Alert ────────────────────────────────────────────────────
export function Alert({ type = 'info', children, className = '' }) {
  const cfg = {
    info:    { bg: 'rgba(2,132,199,0.06)',   border: 'rgba(2,132,199,0.18)',   text: '#0369a1', Icon: Info         },
    success: { bg: 'rgba(5,150,105,0.06)',   border: 'rgba(5,150,105,0.18)',   text: '#059669', Icon: CheckCircle2 },
    error:   { bg: 'rgba(220,38,38,0.06)',   border: 'rgba(220,38,38,0.18)',   text: '#dc2626', Icon: AlertCircle  },
    warning: { bg: 'rgba(217,119,6,0.06)',   border: 'rgba(217,119,6,0.18)',   text: '#d97706', Icon: AlertCircle  },
  }
  const { bg, border, text, Icon } = cfg[type] || cfg.info
  return (
    <div
      className={clsx('flex items-start gap-2.5 p-3.5 rounded-md text-xs leading-relaxed', className)}
      style={{ background: bg, border: `0.5px solid ${border}`, color: text }}
    >
      <Icon className="w-4 h-4 mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  )
}

/**
 * @function    EmptyState
 * @purpose     Centered empty state placeholder with icon, title, description, and optional action
 * @param  {ReactNode} props.icon        - Emoji or icon for visual context
 * @param  {string}    props.title       - Primary empty state heading
 * @param  {string}    props.description - Supporting description text
 * @param  {ReactNode} props.action      - Optional call-to-action element
 * @returns {JSX.Element} Empty state display block
 */
// ─── Empty State ──────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-4xl mb-4">{icon}</div>
      <p className="mp-serif text-base" style={{ color: 'var(--mp-text)' }}>{title}</p>
      <p className="text-sm mt-2 max-w-xs" style={{ color: 'var(--mp-text)', opacity: 0.50 }}>{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/**
 * @function    Skeleton
 * @purpose     Animated placeholder skeleton block for loading state UI
 * @param  {string} props.className - Additional CSS classes (controls size/shape)
 * @returns {JSX.Element} Pulsing skeleton placeholder
 */
// ─── Skeleton ─────────────────────────────────────────────────
export function Skeleton({ className = '' }) {
  return (
    <div
      className={clsx('animate-pulse rounded-md', className)}
      style={{ background: 'var(--mp-a10)' }}
    />
  )
}

/**
 * @function    Table
 * @purpose     Responsive data table with configurable headers and loading state
 * @param  {string[]}  props.headers  - Array of column header labels
 * @param  {ReactNode} props.children - Table row (tr) elements for tbody
 * @param  {boolean}   props.loading  - Shows spinner in place of rows when true
 * @returns {JSX.Element} Table element with scrollable wrapper
 */
// ─── Table ────────────────────────────────────────────────────
export function Table({ headers, children, loading }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            {headers.map(h => <th key={h} className="mp-th">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {loading
            ? <tr><td colSpan={headers.length} className="py-12 text-center"><Spinner className="mx-auto" /></td></tr>
            : children
          }
        </tbody>
      </table>
    </div>
  )
}

/**
 * @function    Tabs
 * @purpose     Pill-style tab switcher with active state highlighting and optional count badges
 * @param  {Array}    props.tabs     - Tab definitions: [{ value, label, count? }]
 * @param  {string}   props.active   - Currently active tab value
 * @param  {Function} props.onChange - Callback invoked with the selected tab value
 * @returns {JSX.Element} Tab switcher element
 */
// ─── Tabs ─────────────────────────────────────────────────────
export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 p-1 rounded-md" style={{ background: 'var(--mp-a05)', border: '0.5px solid var(--mp-card-border)' }}>
      {tabs.map(tab => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className="px-3.5 py-1.5 rounded text-xs font-medium transition-all"
          style={
            active === tab.value
              ? { background: 'white', color: 'var(--mp-accent)', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '0.5px solid var(--mp-card-border)' }
              : { background: 'transparent', color: 'var(--mp-text)', opacity: 0.55 }
          }
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="ml-1.5" style={{ opacity: 0.6 }}>{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  )
}

/**
 * @function    Avatar
 * @purpose     Circular avatar with initials derived from a name string
 * @param  {string} props.name - Full name to derive initials from
 * @param  {string} props.size - Size variant: "sm" | "md" | "lg"
 * @returns {JSX.Element} Circular avatar element
 */
// ─── Avatar ───────────────────────────────────────────────────
export function Avatar({ name, size = 'md' }) {
  const sizes = { sm: { w: 28, h: 28, font: 11 }, md: { w: 36, h: 36, font: 13 }, lg: { w: 44, h: 44, font: 15 } }
  const s = sizes[size] || sizes.md
  // [DATA TRANSFORM]: Extract initials from name for avatar display
  const initials = (name || 'U').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  return (
    <div
      className="rounded-full flex items-center justify-center font-semibold text-white shrink-0"
      style={{ width: s.w, height: s.h, fontSize: s.font, background: 'var(--mp-accent)' }}
    >
      {initials}
    </div>
  )
}

// ─── FeatureGate (re-exported for convenience) ────────────────
export { default as FeatureGate } from './FeatureGate'
