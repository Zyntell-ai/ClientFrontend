// src/components/layout/Sidebar.jsx
import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Avatar, Badge } from '../ui/index'
import { PLAN_CONFIG, CATEGORY_ICONS } from '../../utils/index'
import clsx from 'clsx'
import {
  LayoutDashboard, Calendar, Users, Briefcase, UserCheck,
  BarChart3, Receipt, DollarSign, Phone, Settings, Zap,
  LogOut, Clock, Target, Bot
} from 'lucide-react'

const NAV_ITEMS = [
  {
    section: 'Overview',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/analytics',  icon: BarChart3,       label: 'Analytics'  },
    ],
  },
  {
    section: 'Operations',
    items: [
      { to: '/bookings',  icon: Calendar, label: 'Bookings'              },
      { to: '/customers', icon: Users,    label: 'Customers'             },
      { to: '/leads',     icon: Target,   label: 'Leads',  badge: 'NEW'  },
    ],
  },
  {
    section: 'Business',
    items: [
      { to: '/services', icon: Briefcase, label: 'Services' },
      { to: '/staff',    icon: UserCheck, label: 'Staff'    },
    ],
  },
  {
    section: 'Finance',
    items: [
      { to: '/commissions', icon: DollarSign, label: 'Commissions' },
      { to: '/billing',     icon: Receipt,    label: 'Billing'     },
    ],
  },
  {
    section: 'Setup',
    items: [
      { to: '/numbers',  icon: Phone,    label: 'Phone Numbers'           },
      { to: '/bot-test', icon: Bot,      label: 'Test Bot', badge: 'LIVE' },
      { to: '/settings', icon: Settings, label: 'Settings'                },
    ],
  },
]

export default function Sidebar({ collapsed, onToggle }) {
  const { business, logout, getPlan } = useAuthStore()
  const navigate = useNavigate()
  const plan    = getPlan()
  const planCfg = PLAN_CONFIG[plan] || PLAN_CONFIG.trial

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <aside
      className={clsx(
        'flex flex-col h-screen bg-white border-r border-violet-100 transition-all duration-300 shrink-0',
        'shadow-[1px_0_12px_rgba(109,40,217,0.05)]',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-violet-100">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(124,58,237,0.35)]">
          <Zap className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div>
            {/* font-display now resolves to Lora via CSS */}
            <p className="font-display font-bold text-[#1E1B4B] text-sm tracking-wide">Zyntell</p>
            <p className="text-[10px] text-violet-400 uppercase tracking-widest">AI Bot Platform</p>
          </div>
        )}
      </div>

      {/* Business profile card */}
      {!collapsed && business && (
        <div className="mx-3 mt-3 p-3 rounded-xl bg-violet-50 border border-violet-100">
          <div className="flex items-center gap-2.5">
            <Avatar name={business.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#1E1B4B] truncate">{business.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px]">{CATEGORY_ICONS[business.category]}</span>
                <span className={clsx('text-[10px] px-1.5 py-0.5 rounded-full border font-medium', planCfg.badge)}>
                  {planCfg.label}
                </span>
              </div>
            </div>
          </div>
          {business.isTrialActive && (
            <div className="mt-2.5 bg-amber-50 rounded-lg px-2 py-1.5 border border-amber-200">
              <p className="text-[10px] text-amber-600 font-medium flex items-center gap-1">
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
                  {!collapsed && <span className="flex-1 text-sm">{label}</span>}
                  {!collapsed && badge && (
                    <span className="text-[9px] bg-violet-100 text-violet-600 border border-violet-200 px-1.5 py-0.5 rounded-full font-semibold">
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
        <div className="mx-3 mb-3 p-3 rounded-xl bg-violet-50 border border-violet-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] text-violet-500 uppercase tracking-wide font-semibold">Bot Score</p>
            <span className="text-xs font-bold text-violet-600">{business.botTrainingScore}%</span>
          </div>
          <div className="h-1.5 bg-violet-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${business.botTrainingScore}%` }}
            />
          </div>
          <p className="text-[10px] text-violet-400 mt-1.5">
            {business.botTrainingScore < 60 ? 'Add more services to improve' : 'Bot is well trained!'}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-violet-100 p-2">
        <button
          onClick={handleLogout}
          className={clsx(
            'sidebar-link w-full !text-rose-400 hover:!text-rose-600 hover:!bg-rose-50',
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