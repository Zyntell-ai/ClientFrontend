// src/components/ui/index.jsx
import React, { useState } from 'react'
import { Loader2, AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import clsx from 'clsx'

// ─── Spinner ──────────────────────────────────────────────────
export function Spinner({ size = 'md', className = '' }) {
  const s = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-7 h-7', xl: 'w-10 h-10' }
  return <Loader2 className={clsx('animate-spin', s[size], className)} style={{ color: 'var(--mp-accent)' }} />
}

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
      {/* Detail panel — shown only when focused */}
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

// ─── Modal ────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md' }) {
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

// ─── Skeleton ─────────────────────────────────────────────────
export function Skeleton({ className = '' }) {
  return (
    <div
      className={clsx('animate-pulse rounded-md', className)}
      style={{ background: 'var(--mp-a10)' }}
    />
  )
}

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

// ─── Avatar ───────────────────────────────────────────────────
export function Avatar({ name, size = 'md' }) {
  const sizes = { sm: { w: 28, h: 28, font: 11 }, md: { w: 36, h: 36, font: 13 }, lg: { w: 44, h: 44, font: 15 } }
  const s = sizes[size] || sizes.md
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