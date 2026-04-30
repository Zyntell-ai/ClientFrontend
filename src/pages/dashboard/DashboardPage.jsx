// src/pages/dashboard/DashboardPage.jsx
import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { businessApi, onboardingApi } from '../../api/index'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { StatCard, Card, Spinner, EmptyState, Avatar, Alert, Badge } from '../../components/ui/index'
import { fmt, BOOKING_STATUS_COLORS, LEAD_QUALITY_CONFIG, CATEGORY_ICONS } from '../../utils/index'
import { Calendar, Users, DollarSign, Clock, Target, TrendingUp, ArrowRight, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import clsx from 'clsx'

// ─── Focus Mode hook ──────────────────────────────────────────
function useFocusMode(count) {
  const [focused, setFocused] = useState(null)
  const toggle = (idx) => setFocused(focused === idx ? null : idx)
  const stateOf = (idx) => {
    if (focused === null) return 'normal'
    return focused === idx ? 'focused' : 'dimmed'
  }
  return { toggle, stateOf, hasFocus: focused !== null }
}

// ─── Onboarding checklist ─────────────────────────────────────
function OnboardingStrip() {
  const { data } = useQuery({
    queryKey: ['onboarding-status'],
    queryFn:  () => onboardingApi.status(),
    select:   r  => r.data,
  })
  if (!data) return null
  const items = [
    { key: 'phoneNumberPurchased',   label: 'Phone number',    link: '/numbers'  },
    { key: 'atLeastOneService',      label: 'Add service',     link: '/services' },
    { key: 'workingHoursConfigured', label: 'Set hours',       link: '/settings' },
    { key: 'coordinatesSet',         label: 'Set location',    link: '/settings' },
    { key: 'botPersonaSet',          label: 'Bot persona',     link: '/settings' },
    { key: 'languageSet',            label: 'Bot language',    link: '/settings' },
  ]
  const done = items.filter(i => data.checklist[i.key]).length
  if (done === items.length) return null
  return (
    <div className="mp-card mb-5 p-4" style={{ borderColor: 'rgba(217,119,6,0.25)', background: 'rgba(217,119,6,0.04)' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
          <p className="text-sm font-medium" style={{ fontFamily: 'Lora, Georgia, serif', color: 'var(--mp-text)' }}>
            Complete your setup
          </p>
        </div>
        <span className="text-xs font-semibold text-amber-600">{done}/{items.length}</span>
      </div>
      <div className="h-1 rounded-full mb-3" style={{ background: 'rgba(217,119,6,0.12)' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${(done / items.length) * 100}%`, background: '#d97706' }}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map(({ key, label, link }) => (
          <Link
            key={key}
            to={link}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full transition-all"
            style={
              data.checklist[key]
                ? { background: 'rgba(5,150,105,0.08)', color: '#059669', border: '0.5px solid rgba(5,150,105,0.20)', textDecoration: 'line-through', opacity: 0.6 }
                : { background: 'rgba(217,119,6,0.08)', color: '#d97706', border: '0.5px solid rgba(217,119,6,0.25)' }
            }
          >
            {data.checklist[key] ? '✓' : '→'} {label}
          </Link>
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { business } = useAuthStore()
  const catIcon = CATEGORY_ICONS[business?.category] || '🏢'
  const { toggle, stateOf } = useFocusMode(4)

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn:  () => businessApi.getDashboard(),
    select:   r  => r.data,
    refetchInterval: 60_000,
  })

  const stats          = data?.stats             || {}
  const recentBookings = data?.recentBookings    || []
  const hotLeads       = data?.hotLeads          || []
  const commission     = data?.commissionSummary || {}

  return (
    <DashboardLayout title="Dashboard" subtitle={`${catIcon} ${business?.name || ''}`}>

      {business && !business.setupCompleted && <OnboardingStrip />}

      {/* Trial banner */}
      {business?.isTrialActive && (
        <div className="flex items-center gap-3 mb-5 px-4 py-3 rounded-md" style={{ background: 'rgba(217,119,6,0.06)', border: '0.5px solid rgba(217,119,6,0.20)' }}>
          <Clock className="w-4 h-4 text-amber-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium" style={{ fontFamily: 'Lora, Georgia, serif', color: '#78350f' }}>Trial active — 14 days remaining</p>
            <p className="text-xs mt-0.5 text-amber-600">Upgrade to keep your bot running after trial ends</p>
          </div>
          <Link to="/billing" className="text-xs font-semibold text-amber-700 px-3 py-1.5 rounded-md hover:bg-amber-50 transition-colors" style={{ border: '0.5px solid rgba(217,119,6,0.30)' }}>
            Upgrade →
          </Link>
        </div>
      )}

      {/* ── Stat cards with Focus Mode ─────────────────── */}
      <div className="mb-2">
        <div className="flex items-center gap-3 mb-3">
          <div className="mp-rule-bold" style={{ width: 16 }} />
          <p className="mp-label">Today's overview — click any card to focus</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => <div key={i} className="mp-card h-28 animate-pulse" style={{ background: 'var(--mp-a05)' }} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<Calendar className="w-4 h-4" />}
            label="Today's bookings"
            value={stats.todayBookings ?? 0}
            sub="scheduled today"
            focusState={stateOf(0)}
            onClick={() => toggle(0)}
            detail={`${stats.pendingBookings ?? 0} pending confirmation · ${stats.todayBookings ?? 0} total scheduled`}
          />
          <StatCard
            icon={<Clock className="w-4 h-4" />}
            label="Pending"
            value={stats.pendingBookings ?? 0}
            sub="awaiting confirmation"
            focusState={stateOf(1)}
            onClick={() => toggle(1)}
            detail="These bookings need your confirmation before they're locked in"
          />
          <StatCard
            icon={<Users className="w-4 h-4" />}
            label="Total customers"
            value={stats.totalCustomers ?? 0}
            sub="all time"
            focusState={stateOf(2)}
            onClick={() => toggle(2)}
            detail="Unique customers who have booked through your bot"
          />
          <StatCard
            icon={<DollarSign className="w-4 h-4" />}
            label="This month"
            value={fmt.currency(stats.thisMonthCommission)}
            sub="in commissions"
            focusState={stateOf(3)}
            onClick={() => toggle(3)}
            detail={`Booking commissions + show-up bonuses. Invoice due on 1st of next month.`}
          />
        </div>
      )}

      {/* ── Main content ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Recent bookings */}
        <Card
          title="Recent Bookings"
          action={
            <Link to="/bookings" className="text-xs font-medium flex items-center gap-1" style={{ color: 'var(--mp-accent)' }}>
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          }
        >
          {isLoading ? (
            <div className="flex justify-center py-6"><Spinner /></div>
          ) : !recentBookings.length ? (
            <EmptyState icon="📅" title="No bookings yet" description="Bookings will appear here once your bot receives them" />
          ) : (
            <div>
              {recentBookings.map((b, i) => {
                const statusStyle = {
                  CONFIRMED: { bg: 'rgba(5,150,105,0.08)', text: '#059669', border: 'rgba(5,150,105,0.20)' },
                  PENDING:   { bg: 'rgba(217,119,6,0.08)',  text: '#d97706', border: 'rgba(217,119,6,0.20)'  },
                  COMPLETED: { bg: 'rgba(100,116,139,0.08)',text: '#64748b', border: 'rgba(100,116,139,0.20)' },
                  CANCELLED: { bg: 'rgba(220,38,38,0.08)',  text: '#dc2626', border: 'rgba(220,38,38,0.20)'  },
                }[b.status] || { bg: 'var(--mp-a05)', text: 'var(--mp-text)', border: 'var(--mp-card-border)' }
                return (
                  <div
                    key={b.id}
                    className="flex items-center gap-3 py-3"
                    style={{ borderBottom: i < recentBookings.length - 1 ? '0.5px solid var(--mp-card-border)' : 'none' }}
                  >
                    <Avatar name={b.customerName} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--mp-text)' }}>{b.customerName}</p>
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--mp-text)', opacity: 0.50 }}>
                        {b.serviceName} · {fmt.time(b.scheduledAt)}
                      </p>
                    </div>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: statusStyle.bg, color: statusStyle.text, border: `0.5px solid ${statusStyle.border}` }}
                    >
                      {b.status}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* Hot leads */}
        <Card
          title="Hot Leads"
          action={
            <Link to="/leads" className="text-xs font-medium flex items-center gap-1" style={{ color: 'var(--mp-accent)' }}>
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          }
        >
          {isLoading ? (
            <div className="flex justify-center py-6"><Spinner /></div>
          ) : !hotLeads.length ? (
            <EmptyState icon="🎯" title="No hot leads" description="Exclusive leads from your bot conversations appear here" />
          ) : (
            <div>
              {hotLeads.map((lead, i) => {
                const qCfg = LEAD_QUALITY_CONFIG[lead.quality] || LEAD_QUALITY_CONFIG.COLD
                return (
                  <div
                    key={lead.id}
                    className="flex items-start gap-3 py-3"
                    style={{ borderBottom: i < hotLeads.length - 1 ? '0.5px solid var(--mp-card-border)' : 'none' }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={clsx('text-[10px] px-1.5 py-0.5 rounded-full border font-semibold', qCfg.color)}>
                          {qCfg.label}
                        </span>
                        {lead.urgency && <span className="text-[10px]" style={{ color: 'var(--mp-text)', opacity: 0.4 }}>{lead.urgency}</span>}
                      </div>
                      <p className="text-xs truncate" style={{ color: 'var(--mp-text)', opacity: 0.60 }}>{lead.problem}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold mp-serif" style={{ color: 'var(--mp-accent)' }}>{fmt.currency(lead.commissionAmount)}</p>
                      <p className="text-[10px]" style={{ color: 'var(--mp-text)', opacity: 0.40 }}>commission</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* Commission summary */}
        <Card title="Commission Summary" className="lg:col-span-2">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Booking commissions', value: fmt.currency(commission.bookingTotal),  accent: false },
              { label: 'Showup commissions',  value: fmt.currency(commission.showupTotal),   accent: false },
              { label: 'Total earned',        value: fmt.currency(commission.grandTotal),    accent: true  },
            ].map(({ label, value, accent }) => (
              <div
                key={label}
                className="text-center py-4 rounded-md"
                style={{ background: accent ? 'var(--mp-a05)' : 'transparent', border: '0.5px solid var(--mp-card-border)' }}
              >
                <p className="mp-label mb-2">{label}</p>
                <p
                  className="mp-serif text-xl"
                  style={{ color: accent ? 'var(--mp-accent)' : 'var(--mp-text)' }}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
          {commission.confirmationRate !== undefined && (
            <div className="flex items-center gap-2 mt-4">
              <TrendingUp className="w-3.5 h-3.5" style={{ color: '#059669' }} />
              <p className="text-xs" style={{ color: 'var(--mp-text)', opacity: 0.50 }}>
                <span className="font-semibold text-emerald-500">{commission.confirmationRate}%</span> confirmation rate this month
              </p>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}