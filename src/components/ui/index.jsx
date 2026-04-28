// src/components/ui/index.jsx
import React from 'react'
import { Loader2, AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import clsx from 'clsx'

// ─── Spinner ──────────────────────────────────────────────────
export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8', xl: 'w-12 h-12' }
  return <Loader2 className={clsx('animate-spin text-violet-500', sizes[size], className)} />
}

// ─── Loading Page ─────────────────────────────────────────────
export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FAFAF8]">
      <div className="text-center">
        <Spinner size="xl" />
        <p className="mt-3 text-slate-400 text-sm">Loading...</p>
      </div>
    </div>
  )
}

// ─── Button ───────────────────────────────────────────────────
export function Button({ children, variant = 'primary', size = 'md', loading = false, className = '', ...props }) {
  const variants = {
    primary:   'btn-primary',
    secondary: 'btn-secondary',
    danger:    'btn-danger',
    ghost:     'inline-flex items-center gap-2 px-3 py-2 rounded-lg text-slate-500 hover:text-violet-600 hover:bg-violet-50 text-sm transition-all',
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
export const Input = React.forwardRef(function Input({ label, error, className = '', prefix, ...props }, ref) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold text-violet-600 uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400 text-sm">{prefix}</span>
        )}
        <input
          ref={ref}
          className={clsx('input-field', prefix && 'pl-8', error && 'border-rose-300 focus:border-rose-400', className)}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-rose-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />{error}
        </p>
      )}
    </div>
  )
})

// ─── Select ───────────────────────────────────────────────────
export const Select = React.forwardRef(function Select({ label, error, children, className = '', ...props }, ref) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold text-violet-600 uppercase tracking-wide">{label}</label>
      )}
      <select
        ref={ref}
        className={clsx('input-field appearance-none cursor-pointer', error && 'border-rose-300', className)}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="text-xs text-rose-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />{error}
        </p>
      )}
    </div>
  )
})

// ─── Textarea ─────────────────────────────────────────────────
export const Textarea = React.forwardRef(function Textarea({ label, error, className = '', ...props }, ref) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold text-violet-600 uppercase tracking-wide">{label}</label>
      )}
      <textarea
        ref={ref}
        className={clsx('input-field resize-none', error && 'border-rose-300', className)}
        rows={3}
        {...props}
      />
      {error && (
        <p className="text-xs text-rose-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />{error}
        </p>
      )}
    </div>
  )
})

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
          'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-violet-400/40 mt-0.5',
          checked ? 'bg-violet-500' : 'bg-violet-100'
        )}
      >
        <span className={clsx(
          'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200',
          checked ? 'translate-x-4' : 'translate-x-0'
        )} />
      </button>
      {(label || description) && (
        <div>
          {label       && <p className="text-sm font-medium text-[#1E1B4B]">{label}</p>}
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
          {title && (
            <h3 className="font-display font-semibold text-[#1E1B4B] text-sm uppercase tracking-wide">
              {title}
            </h3>
          )}
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
    blue:   { bg: 'bg-sky-50',     icon: 'text-sky-500',     border: 'border-sky-200'     },
    amber:  { bg: 'bg-amber-50',   icon: 'text-amber-500',   border: 'border-amber-200'   },
    green:  { bg: 'bg-emerald-50', icon: 'text-emerald-500', border: 'border-emerald-200' },
    purple: { bg: 'bg-violet-50',  icon: 'text-violet-500',  border: 'border-violet-200'  },
    red:    { bg: 'bg-rose-50',    icon: 'text-rose-500',    border: 'border-rose-200'    },
  }
  const c = colors[color] || colors.blue
  return (
    <div className={clsx('stat-card border', c.border)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{label}</p>
          <p className="font-display text-2xl font-bold text-[#1E1B4B] mt-1">{value ?? '—'}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className={clsx('p-2.5 rounded-xl', c.bg)}>
          <span className={clsx('w-5 h-5', c.icon)}>{icon}</span>
        </div>
      </div>
      {trend !== undefined && (
        <div className={clsx('mt-3 text-xs font-semibold', trend >= 0 ? 'text-emerald-500' : 'text-rose-500')}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last month
        </div>
      )}
    </div>
  )
}

// ─── Badge ────────────────────────────────────────────────────
export function Badge({ children, color = 'blue', className = '' }) {
  const colors = {
    blue:   'bg-sky-50 text-sky-700 border-sky-200',
    green:  'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber:  'bg-amber-50 text-amber-700 border-amber-200',
    red:    'bg-rose-50 text-rose-700 border-rose-200',
    purple: 'bg-violet-50 text-violet-700 border-violet-200',
    slate:  'bg-slate-50 text-slate-600 border-slate-200',
    cyan:   'bg-cyan-50 text-cyan-700 border-cyan-200',
  }
  return (
    <span className={clsx(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border',
      colors[color] || colors.blue, className
    )}>
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
      <div className="absolute inset-0 bg-[#1E1B4B]/20 backdrop-blur-sm" onClick={onClose} />
      <div className={clsx('relative w-full glass-card border border-violet-200 shadow-2xl', sizes[size])}>
        <div className="flex items-center justify-between p-5 border-b border-violet-100">
          <h3 className="font-display font-semibold text-[#1E1B4B]">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 text-violet-400 hover:text-violet-700 transition-colors rounded-lg hover:bg-violet-50"
          >
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
      <p className="font-display font-semibold text-[#1E1B4B] text-lg">{title}</p>
      <p className="text-slate-500 text-sm mt-2 max-w-xs">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

// ─── Alert ────────────────────────────────────────────────────
export function Alert({ type = 'info', children }) {
  const cfg = {
    info:    { cls: 'bg-sky-50 border-sky-200 text-sky-800',         Icon: Info         },
    success: { cls: 'bg-emerald-50 border-emerald-200 text-emerald-800', Icon: CheckCircle2 },
    error:   { cls: 'bg-rose-50 border-rose-200 text-rose-700',      Icon: AlertCircle  },
    warning: { cls: 'bg-amber-50 border-amber-200 text-amber-700',   Icon: AlertCircle  },
  }
  const { cls, Icon } = cfg[type] || cfg.info
  return (
    <div className={clsx('flex items-start gap-2.5 p-3.5 rounded-xl border text-sm', cls)}>
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
          <tr className="border-b border-violet-100">
            {headers.map((h) => (
              <th key={h} className="table-header">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={headers.length} className="py-12 text-center">
                <Spinner className="mx-auto" />
              </td>
            </tr>
          ) : children}
        </tbody>
      </table>
      {!loading && !children && empty && (
        <div className="py-8 text-center text-slate-500 text-sm">{empty}</div>
      )}
    </div>
  )
}

// ─── Avatar ───────────────────────────────────────────────────
export function Avatar({ name, size = 'md' }) {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-11 h-11 text-base' }
  const initials = (name || 'U').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  const colors = [
    'from-violet-500 to-purple-600',
    'from-pink-500 to-rose-500',
    'from-emerald-400 to-teal-500',
    'from-amber-400 to-orange-500',
  ]
  const colorIdx = (name || '').charCodeAt(0) % colors.length
  return (
    <div className={clsx(
      'rounded-full bg-gradient-to-br flex items-center justify-center font-display font-bold text-white shrink-0',
      sizes[size], colors[colorIdx]
    )}>
      {initials}
    </div>
  )
}

// ─── Tabs ─────────────────────────────────────────────────────
export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 bg-violet-50 p-1 rounded-xl border border-violet-100">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={clsx(
            'px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
            active === tab.value
              ? 'bg-white text-violet-700 shadow-sm border border-violet-100'
              : 'text-slate-500 hover:text-violet-600'
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={clsx('ml-1.5 text-xs', active === tab.value ? 'text-violet-400' : 'text-slate-400')}>
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
  return <div className={clsx('animate-pulse bg-violet-50 rounded-xl', className)} />
}