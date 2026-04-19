// src/components/layout/Topbar.jsx
import React from 'react'
import { useAuthStore } from '../../store/authStore'
import { Avatar, Badge } from '../ui/index'
import { PLAN_CONFIG } from '../../utils/index'
import { Bell, Menu, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function Topbar({ collapsed, onToggle, title, subtitle }) {
  const { business, getPlan } = useAuthStore()
  const plan = getPlan()
  const planCfg = PLAN_CONFIG[plan] || PLAN_CONFIG.trial

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-navy-400/20 bg-navy-900/50 backdrop-blur-sm shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-navy-500/50 transition-all"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
        <div>
          {title && <h1 className="font-display font-bold text-slate-100 text-lg leading-none">{title}</h1>}
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
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
