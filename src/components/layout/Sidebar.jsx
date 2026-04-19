// src/components/layout/Sidebar.jsx
import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Avatar, Badge } from '../ui/index'
import { PLAN_CONFIG, CATEGORY_ICONS } from '../../utils/index'
import clsx from 'clsx'
import {
  LayoutDashboard, Calendar, Users, Briefcase, UserCheck,
  BarChart3, Receipt, DollarSign, Phone, Settings, Zap,
  ChevronRight, LogOut, Star, Clock, MessageSquare, Target, Bot
} from 'lucide-react'

const NAV_ITEMS = [
  {
    section: 'Overview',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    ],
  },
  {
    section: 'Operations',
    items: [
      { to: '/bookings', icon: Calendar, label: 'Bookings' },
      { to: '/customers', icon: Users, label: 'Customers' },
      { to: '/leads', icon: Target, label: 'Leads', badge: 'NEW' },
    ],
  },
  {
    section: 'Business',
    items: [
      { to: '/services', icon: Briefcase, label: 'Services' },
      { to: '/staff', icon: UserCheck, label: 'Staff' },
    ],
  },
  {
    section: 'Finance',
    items: [
      { to: '/commissions', icon: DollarSign, label: 'Commissions' },
      { to: '/billing', icon: Receipt, label: 'Billing' },
    ],
  },
  {
    section: 'Setup',
    items: [
      { to: '/numbers', icon: Phone, label: 'Phone Numbers' },
      { to: '/bot-test', icon: Bot, label: 'Test Bot', badge: 'LIVE' }, // ← ADD THIS
      { to: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
]

export default function Sidebar({ collapsed, onToggle }) {
  const { business, logout, getPlan } = useAuthStore()
  const navigate = useNavigate()
  const plan = getPlan()
  const planCfg = PLAN_CONFIG[plan] || PLAN_CONFIG.trial

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside
      className={clsx(
        'flex flex-col h-screen bg-navy-900/95 backdrop-blur-xl border-r border-navy-400/20 transition-all duration-300 shrink-0',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-navy-400/20">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-glow">
          <Zap className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="font-display font-bold text-slate-100 text-sm tracking-wide">Zyntell</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">AI Bot Platform</p>
          </div>
        )}
      </div>

      {/* Business profile card */}
      {!collapsed && business && (
        <div className="mx-3 mt-3 p-3 rounded-lg bg-navy-600/50 border border-navy-400/30">
          <div className="flex items-center gap-2.5">
            <Avatar name={business.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">{business.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px]">{CATEGORY_ICONS[business.category]}</span>
                <span className={clsx('text-[10px] px-1.5 py-0.5 rounded-full border font-medium', planCfg.badge)}>
                  {planCfg.label}
                </span>
              </div>
            </div>
          </div>
          {business.isTrialActive && (
            <div className="mt-2.5 bg-amber-500/10 rounded px-2 py-1.5 border border-amber-500/20">
              <p className="text-[10px] text-amber-400 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" /> Trial active — 14 days
              </p>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
        {NAV_ITEMS.map(({ section, items }) => (
          <div key={section}>
            {!collapsed && (
              <p className="section-label px-2 mb-2">{section}</p>
            )}
            <div className="space-y-0.5">
              {items.map(({ to, icon: Icon, label, badge }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    clsx('sidebar-link', isActive && 'active', collapsed && 'justify-center px-0')
                  }
                  title={collapsed ? label : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && (
                    <span className="flex-1 text-sm">{label}</span>
                  )}
                  {!collapsed && badge && (
                    <span className="text-[9px] bg-brand-blue/20 text-brand-blue border border-brand-blue/30 px-1.5 py-0.5 rounded-full font-semibold">
                      {badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bot Score */}
      {!collapsed && business?.botTrainingScore !== undefined && (
        <div className="mx-3 mb-3 p-3 rounded-lg bg-navy-600/40 border border-navy-400/25">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide font-medium">Bot Score</p>
            <span className="text-xs font-semibold text-brand-blue">{business.botTrainingScore}%</span>
          </div>
          <div className="h-1.5 bg-navy-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${business.botTrainingScore}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-600 mt-1.5">
            {business.botTrainingScore < 60 ? 'Add more services to improve' : 'Bot is well trained!'}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-navy-400/20 p-2">
        <button
          onClick={handleLogout}
          className={clsx(
            'sidebar-link w-full text-red-400/70 hover:text-red-400 hover:bg-red-400/10',
            collapsed && 'justify-center px-0'
          )}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  )
}
