// src/components/ui/index.jsx
// All reusable UI primitives

import React from 'react'
import { Loader2, AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import clsx from 'clsx'

// ─── Spinner ──────────────────────────────────────────────────
export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8', xl: 'w-12 h-12' }
  return (
    <Loader2 className={clsx('animate-spin text-brand-blue', sizes[size], className)} />
  )
}

// ─── Loading Page ─────────────────────────────────────────────
export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Spinner size="xl" />
        <p className="mt-3 text-slate-500 text-sm">Loading...</p>
      </div>
    </div>
  )
}

// ─── Button ───────────────────────────────────────────────────
export function Button({ children, variant = 'primary', size = 'md', loading = false, className = '', ...props }) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    ghost: 'inline-flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-navy-500/40 text-sm transition-all',
  }
  const sizes = { sm: 'text-xs px-3 py-1.5', md: '', lg: 'text-base px-6 py-3' }
  return (
    <button
      className={clsx(variants[variant], sizes[size], className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  )
}

// ─── Input ────────────────────────────────────────────────────
export function Input({ label, error, className = '', prefix, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</label>}
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">{prefix}</span>}
        <input
          className={clsx('input-field', prefix && 'pl-8', error && 'border-red-500/50 focus:border-red-500/70', className)}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  )
}

// ─── Select ───────────────────────────────────────────────────
export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</label>}
      <select
        className={clsx('input-field appearance-none cursor-pointer', error && 'border-red-500/50', className)}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  )
}

// ─── Textarea ─────────────────────────────────────────────────
export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</label>}
      <textarea
        className={clsx('input-field resize-none', error && 'border-red-500/50', className)}
        rows={3}
        {...props}
      />
      {error && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  )
}

// ─── Toggle ───────────────────────────────────────────────────
export function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={clsx(
          'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 mt-0.5',
          checked ? 'bg-brand-blue' : 'bg-navy-400/60'
        )}
      >
        <span
          className={clsx(
            'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg transition-transform duration-200',
            checked ? 'translate-x-4' : 'translate-x-0'
          )}
        />
      </button>
      {(label || description) && (
        <div>
          {label && <p className="text-sm font-medium text-slate-200">{label}</p>}
          {description && <p className="text-xs text-slate-500">{description}</p>}
        </div>
      )}
    </div>
  )
}

// ─── Card ─────────────────────────────────────────────────────
export function Card({ children, className = '', title, action }) {
  return (
    <div className={clsx('glass-card p-5', className)}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="font-display font-semibold text-slate-200 text-sm uppercase tracking-wide">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────
export function StatCard({ icon, label, value, sub, color = 'blue', trend }) {
  const colors = {
    blue: { bg: 'bg-blue-500/10', icon: 'text-blue-400', border: 'border-blue-500/20' },
    amber: { bg: 'bg-amber-500/10', icon: 'text-amber-400', border: 'border-amber-500/20' },
    green: { bg: 'bg-green-500/10', icon: 'text-green-400', border: 'border-green-500/20' },
    purple: { bg: 'bg-purple-500/10', icon: 'text-purple-400', border: 'border-purple-500/20' },
    red: { bg: 'bg-red-500/10', icon: 'text-red-400', border: 'border-red-500/20' },
  }
  const c = colors[color] || colors.blue
  return (
    <div className={clsx('stat-card border', c.border)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">{label}</p>
          <p className="text-2xl font-display font-bold text-slate-100 mt-1">{value ?? '—'}</p>
          {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        </div>
        <div className={clsx('p-2.5 rounded-lg', c.bg)}>
          <span className={clsx('w-5 h-5', c.icon)}>{icon}</span>
        </div>
      </div>
      {trend !== undefined && (
        <div className={clsx('mt-3 text-xs font-medium', trend >= 0 ? 'text-green-400' : 'text-red-400')}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last month
        </div>
      )}
    </div>
  )
}

// ─── Badge ────────────────────────────────────────────────────
export function Badge({ children, color = 'blue', className = '' }) {
  const colors = {
    blue: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
    green: 'bg-green-500/15 text-green-400 border-green-500/25',
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    red: 'bg-red-500/15 text-red-400 border-red-500/25',
    purple: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
    slate: 'bg-slate-500/15 text-slate-400 border-slate-500/25',
    cyan: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
  }
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border', colors[color] || colors.blue, className)}>
      {children}
    </span>
  )
}

// ─── Modal ────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null
  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={clsx('relative w-full glass-card border border-navy-400/40 shadow-2xl animate-slide-up', sizes[size])}>
        <div className="flex items-center justify-between p-5 border-b border-navy-400/30">
          <h3 className="font-display font-semibold text-slate-100">{title}</h3>
          <button onClick={onClose} className="p-1 text-slate-500 hover:text-slate-300 transition-colors rounded-lg hover:bg-navy-500/50">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-4xl mb-4">{icon}</div>
      <p className="font-display font-semibold text-slate-300 text-lg">{title}</p>
      <p className="text-slate-500 text-sm mt-2 max-w-xs">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

// ─── Alert ────────────────────────────────────────────────────
export function Alert({ type = 'info', children }) {
  const cfg = {
    info: { cls: 'bg-blue-500/10 border-blue-500/20 text-blue-300', Icon: Info },
    success: { cls: 'bg-green-500/10 border-green-500/20 text-green-300', Icon: CheckCircle2 },
    error: { cls: 'bg-red-500/10 border-red-500/20 text-red-300', Icon: AlertCircle },
    warning: { cls: 'bg-amber-500/10 border-amber-500/20 text-amber-300', Icon: AlertCircle },
  }
  const { cls, Icon } = cfg[type] || cfg.info
  return (
    <div className={clsx('flex items-start gap-2.5 p-3.5 rounded-lg border text-sm', cls)}>
      <Icon className="w-4 h-4 mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  )
}

// ─── Table ────────────────────────────────────────────────────
export function Table({ headers, children, loading, empty }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-navy-400/30">
            {headers.map((h) => <th key={h} className="table-header">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={headers.length} className="py-12 text-center"><Spinner className="mx-auto" /></td></tr>
          ) : children}
        </tbody>
      </table>
      {!loading && !children && empty && <div className="py-8 text-center text-slate-500 text-sm">{empty}</div>}
    </div>
  )
}

// ─── Avatar ───────────────────────────────────────────────────
export function Avatar({ name, size = 'md' }) {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-11 h-11 text-base' }
  const initials = (name || 'U').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  const colors = ['from-blue-500 to-indigo-600', 'from-purple-500 to-pink-600', 'from-green-500 to-teal-600', 'from-amber-500 to-orange-600']
  const colorIdx = (name || '').charCodeAt(0) % colors.length
  return (
    <div className={clsx('rounded-full bg-gradient-to-br flex items-center justify-center font-display font-bold text-white shrink-0', sizes[size], colors[colorIdx])}>
      {initials}
    </div>
  )
}

// ─── Tabs ─────────────────────────────────────────────────────
export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 bg-navy-700/60 p-1 rounded-lg border border-navy-400/30">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={clsx(
            'px-3.5 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
            active === tab.value
              ? 'bg-navy-500 text-slate-200 shadow-sm'
              : 'text-slate-500 hover:text-slate-300'
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={clsx('ml-1.5 text-xs', active === tab.value ? 'text-slate-400' : 'text-slate-600')}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────
export function Skeleton({ className = '' }) {
  return <div className={clsx('animate-pulse bg-navy-500/50 rounded-md', className)} />
}
