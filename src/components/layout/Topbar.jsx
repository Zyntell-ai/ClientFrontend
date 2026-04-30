// src/components/layout/Topbar.jsx
import React from 'react'
import { useAuthStore } from '../../store/authStore'
import { getTheme } from '../../utils/categoryTheme'
import { PLAN_CONFIG } from '../../utils/index'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'

export function Topbar({ collapsed, onToggle, title, subtitle }) {
  const { business, getPlan } = useAuthStore()
  const plan    = getPlan()
  const planCfg = PLAN_CONFIG[plan] || PLAN_CONFIG.trial
  const initials = (business?.name || 'Z').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

  return (
    <header
      className="flex items-center justify-between px-6 shrink-0"
      style={{
        height: '52px',
        background: 'color-mix(in srgb, var(--mp-body) 80%, white)',
        borderBottom: '0.5px solid var(--mp-card-border)',
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          className="p-1 rounded"
          style={{ color: 'var(--mp-text)', opacity: 0.4 }}
          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0.4'}
        >
          {collapsed
            ? <ChevronRight className="w-4 h-4" />
            : <ChevronLeft  className="w-4 h-4" />
          }
        </button>

        {/* Newspaper-style title with ruled line */}
        {title && (
          <div className="flex items-baseline gap-3">
            <h1
              className="text-base font-medium leading-none"
              style={{ fontFamily: 'Lora, Georgia, serif', color: 'var(--mp-text)' }}
            >
              {title}
            </h1>
            {subtitle && (
              <span className="text-xs" style={{ color: 'var(--mp-text)', opacity: 0.45 }}>
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Date — newspaper style */}
        <span
          className="text-[10px] tracking-widest hidden md:block"
          style={{ color: 'var(--mp-text)', opacity: 0.35, fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em' }}
        >
          {format(new Date(), 'EEE dd MMM')}
        </span>

        {/* Plan badge */}
        <span
          className="text-[10px] px-2.5 py-1 rounded-full font-semibold"
          style={{
            background: 'var(--mp-a10)',
            color: 'var(--mp-accent)',
            border: '0.5px solid var(--mp-card-border)',
          }}
        >
          {planCfg.label}
        </span>

        {/* Avatar */}
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
          style={{ background: 'var(--mp-accent)', color: '#fff', fontSize: '11px' }}
        >
          {initials}
        </div>
      </div>
    </header>
  )
}