// src/components/layout/Topbar.jsx
import React from 'react'
import { useAuthStore } from '../../store/authStore'
import { Avatar, Badge } from '../ui/index'
import { PLAN_CONFIG } from '../../utils/index'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function Topbar({ collapsed, onToggle, title, subtitle }) {
  const { business, getPlan } = useAuthStore()
  const plan    = getPlan()
  const planCfg = PLAN_CONFIG[plan] || PLAN_CONFIG.trial

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-violet-100 bg-white/80 backdrop-blur-sm shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg text-violet-400 hover:text-violet-700 hover:bg-violet-50 transition-all"
        >
          {collapsed
            ? <ChevronRight className="w-4 h-4" />
            : <ChevronLeft  className="w-4 h-4" />
          }
        </button>
        <div>
          {/* font-display now = Lora */}
          {title    && <h1 className="font-display font-bold text-[#1E1B4B] text-lg leading-none">{title}</h1>}
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge color={plan === 'trial' ? 'amber' : plan === 'pro' ? 'purple' : 'blue'}>
          {planCfg.label}
        </Badge>
        {business && <Avatar name={business.name} size="sm" />}
      </div>
    </header>
  )
}