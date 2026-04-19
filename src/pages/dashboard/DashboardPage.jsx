// src/pages/dashboard/DashboardPage.jsx
// Maps to GET /api/business/dashboard
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { businessApi, onboardingApi } from '../../api/index'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { StatCard, Badge, Card, Spinner, EmptyState, Avatar } from '../../components/ui/index'
import { fmt, BOOKING_STATUS_COLORS, LEAD_QUALITY_CONFIG, CATEGORY_ICONS } from '../../utils/index'
import { Calendar, TrendingUp, Users, DollarSign, Clock, Target, ArrowRight, Zap, AlertCircle } from 'lucide-react'
import clsx from 'clsx'

function StatusBadge({ status }) {
  const cls = BOOKING_STATUS_COLORS[status] || 'text-slate-400 bg-slate-400/10 border-slate-400/20'
  return <span className={clsx('text-xs px-2 py-0.5 rounded-full border font-medium', cls)}>{status}</span>
}

function OnboardingChecklist({ businessId }) {
  const { data } = useQuery({
    queryKey: ['onboarding-status'],
    queryFn: () => onboardingApi.status(),
    select: r => r.data,
  })
  if (!data) return null

  const items = [
    { key: 'phoneNumberPurchased', label: 'Purchase a phone number', link: '/numbers' },
    { key: 'atLeastOneService', label: 'Add a service', link: '/services' },
    { key: 'workingHoursConfigured', label: 'Set working hours', link: '/settings' },
    { key: 'coordinatesSet', label: 'Set your location', link: '/settings' },
    { key: 'botPersonaSet', label: 'Configure bot persona', link: '/settings' },
    { key: 'languageSet', label: 'Set bot language', link: '/settings' },
  ]
  const completed = items.filter(i => data.checklist[i.key]).length
  if (completed === items.length) return null

  return (
    <Card className="mb-6 border border-amber-500/20 bg-amber-500/5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <p className="text-sm font-semibold text-amber-300">Complete your setup</p>
        </div>
        <span className="text-xs text-amber-400/70">{completed}/{items.length} done</span>
      </div>
      <div className="h-1.5 bg-navy-700 rounded-full mb-3 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all" style={{ width: `${(completed / items.length) * 100}%` }} />
      </div>
      <div className="space-y-1.5">
        {items.map(({ key, label, link }) => (
          <Link key={key} to={link} className="flex items-center gap-2.5 text-sm hover:text-slate-200 transition-colors group">
            <div className={clsx('w-4 h-4 rounded-full border flex items-center justify-center shrink-0',
              data.checklist[key] ? 'bg-green-500 border-green-500' : 'border-slate-600'
            )}>
              {data.checklist[key] && <span className="text-white text-[9px]">✓</span>}
            </div>
            <span className={clsx('text-xs', data.checklist[key] ? 'text-slate-500 line-through' : 'text-slate-400 group-hover:text-slate-300')}>{label}</span>
            {!data.checklist[key] && <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-slate-400 ml-auto" />}
          </Link>
        ))}
      </div>
    </Card>
  )
}

export default function DashboardPage() {
  const { business } = useAuthStore()
  const catIcon = CATEGORY_ICONS[business?.category] || '🏢'

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => businessApi.getDashboard(),
    select: r => r.data,
    refetchInterval: 60_000, // Auto-refresh every minute
  })

  const stats = data?.stats || {}
  const recentBookings = data?.recentBookings || []
  const hotLeads = data?.hotLeads || []
  const commission = data?.commissionSummary || {}

  return (
    <DashboardLayout title="Dashboard" subtitle={`${catIcon} ${business?.name || ''}`}>
      {/* Onboarding checklist (shown until complete) */}
      {business && !business.setupCompleted && <OnboardingChecklist />}

      {/* Trial Banner */}
      {business?.isTrialActive && (
        <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-300">Trial active — 14 days</p>
            <p className="text-xs text-amber-400/60">Upgrade to keep your bot running after trial ends</p>
          </div>
          <Link to="/billing" className="text-xs text-amber-400 border border-amber-400/40 px-3 py-1.5 rounded-lg hover:bg-amber-400/10 transition-colors">
            Upgrade →
          </Link>
        </div>
      )}

      {/* Stats grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => <div key={i} className="stat-card h-24 animate-pulse bg-navy-600/30" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<Calendar className="w-5 h-5" />}
            label="Today's Bookings"
            value={stats.todayBookings ?? 0}
            sub="scheduled today"
            color="blue"
          />
          <StatCard
            icon={<Clock className="w-5 h-5" />}
            label="Pending"
            value={stats.pendingBookings ?? 0}
            sub="awaiting confirmation"
            color="amber"
          />
          <StatCard
            icon={<Users className="w-5 h-5" />}
            label="Total Customers"
            value={stats.totalCustomers ?? 0}
            sub="all time"
            color="purple"
          />
          <StatCard
            icon={<DollarSign className="w-5 h-5" />}
            label="This Month"
            value={fmt.currency(stats.thisMonthCommission)}
            sub="in commissions"
            color="green"
          />
        </div>
      )}

      {/* Main content: Recent bookings + Hot leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Bookings */}
        <Card
          title="Recent Bookings"
          action={
            <Link to="/bookings" className="text-xs text-brand-blue hover:text-brand-blue-light flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          }
        >
          {isLoading ? (
            <div className="flex justify-center py-6"><Spinner /></div>
          ) : recentBookings.length === 0 ? (
            <EmptyState icon="📅" title="No bookings yet" description="Bookings will appear here once your bot receives them" />
          ) : (
            <div className="space-y-2.5">
              {recentBookings.map((b) => (
                <div key={b.id} className="flex items-center gap-3 p-3 rounded-lg bg-navy-700/40 border border-navy-400/20 hover:border-navy-400/40 transition-all">
                  <Avatar name={b.customerName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{b.customerName}</p>
                    <p className="text-xs text-slate-500 truncate">{b.serviceName} · {fmt.datetime(b.scheduledAt)}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Hot Leads */}
        <Card
          title="Hot Leads"
          action={
            <Link to="/leads" className="text-xs text-brand-blue hover:text-brand-blue-light flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          }
        >
          {isLoading ? (
            <div className="flex justify-center py-6"><Spinner /></div>
          ) : hotLeads.length === 0 ? (
            <EmptyState icon="🎯" title="No hot leads" description="Exclusive leads from your bot conversations appear here" />
          ) : (
            <div className="space-y-2.5">
              {hotLeads.map((lead) => {
                const qualCfg = LEAD_QUALITY_CONFIG[lead.quality] || LEAD_QUALITY_CONFIG.COLD
                return (
                  <div key={lead.id} className="flex items-start gap-3 p-3 rounded-lg bg-navy-700/40 border border-navy-400/20 hover:border-navy-400/40 transition-all">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={clsx('text-[10px] px-1.5 py-0.5 rounded-full border font-semibold', qualCfg.color)}>
                          {qualCfg.label}
                        </span>
                        {lead.urgency && <span className="text-[10px] text-slate-600">{lead.urgency}</span>}
                      </div>
                      <p className="text-xs text-slate-400 truncate">{lead.problem}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-semibold text-green-400">{fmt.currency(lead.commissionAmount)}</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">commission</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* Commission Summary */}
        <Card title="Commission Summary" className="lg:col-span-2">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Booking Commissions', value: fmt.currency(commission.bookingTotal), color: 'text-blue-400' },
              { label: 'Showup Commissions', value: fmt.currency(commission.showupTotal), color: 'text-green-400' },
              { label: 'Total Earned', value: fmt.currency(commission.grandTotal), color: 'text-amber-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="p-4 rounded-lg bg-navy-700/40 border border-navy-400/20 text-center">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">{label}</p>
                <p className={clsx('text-xl font-display font-bold', color)}>{value}</p>
              </div>
            ))}
          </div>
          {commission.confirmationRate !== undefined && (
            <div className="mt-4 flex items-center gap-3">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <p className="text-xs text-slate-500">
                <span className="text-green-400 font-semibold">{commission.confirmationRate}%</span> confirmation rate this month
              </p>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}
