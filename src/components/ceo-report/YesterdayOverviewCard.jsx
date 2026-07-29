import React from 'react'
import { Newspaper } from 'lucide-react'
import { fmt } from '../../utils/index'
import { format, parseISO, subDays } from 'date-fns'

function fmtReportDate(dateStr) {
  if (!dateStr) return '—'
  try {
    // reportDate is today's date; yesterday = reportDate - 1 day
    const reportDt  = parseISO(dateStr)
    const yesterday = subDays(reportDt, 1)
    return format(yesterday, 'EEEE, dd MMMM yyyy')
  } catch {
    return dateStr
  }
}

function DeltaChip({ value }) {
  if (value == null) return <span style={{ fontSize: 11, color: 'var(--mp-text-muted)' }}>—</span>
  const isPos = value >= 0
  return (
    <span style={{
      fontSize: 10,
      fontWeight: 600,
      padding: '2px 8px',
      borderRadius: 20,
      background: isPos ? 'rgba(5,150,105,0.08)' : 'rgba(220,38,38,0.08)',
      color:      isPos ? '#059669'               : '#dc2626',
    }}>
      {isPos ? '▲' : '▼'} {isPos ? '+' : ''}{value.toFixed(1)}% vs prev day
    </span>
  )
}

function HeroKpi({ label, value, highlight }) {
  return (
    <div style={{
      padding: '14px 16px',
      background: highlight ? 'var(--mp-gradient-soft)' : 'var(--mp-a05)',
      borderRadius: 10,
      border: highlight ? '0.5px solid var(--mp-card-border)' : '0.5px solid transparent',
    }}>
      <p style={{
        fontSize: 9,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.14em',
        color: 'var(--mp-text-muted)',
        marginBottom: 6,
      }}>
        {label}
      </p>
      <p style={{
        fontSize: highlight ? 22 : 18,
        fontWeight: 700,
        color: 'var(--mp-text)',
        lineHeight: 1,
      }}>
        {value ?? '—'}
      </p>
    </div>
  )
}

function SmallKpi({ label, value, color }) {
  return (
    <div style={{ padding: '10px 12px', background: 'var(--mp-a05)', borderRadius: 8 }}>
      <p style={{
        fontSize: 9,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        color: color || 'var(--mp-text-muted)',
        marginBottom: 4,
        opacity: color ? 0.85 : 1,
      }}>
        {label}
      </p>
      <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--mp-text)' }}>
        {value ?? '—'}
      </p>
    </div>
  )
}

export default function YesterdayOverviewCard({ report = {} }) {
  const facts  = report.facts      || {}
  const revenue = report.revenue   || {}

  return (
    <div className="mp-card" style={{ padding: '18px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Newspaper style={{ width: 14, height: 14, color: 'var(--mp-accent)' }} />
          <span className="mp-label">Yesterday's Performance</span>
        </div>
        <span style={{
          fontFamily: 'Lora, Georgia, serif',
          fontSize: 12,
          fontWeight: 500,
          color: 'var(--mp-text-muted)',
        }}>
          {fmtReportDate(report.reportDate)}
        </span>
      </div>

      {/* Hero KPIs — top 3 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px', marginBottom: 10 }}>
        <div>
          <HeroKpi
            label="Revenue"
            value={fmt.currency(facts.yesterdayRevenue ?? revenue.yesterdayRevenue)}
            highlight
          />
          {/* Revenue delta below the hero tile */}
          <div style={{ marginTop: 8 }}>
            <DeltaChip value={facts.revenueDeltaVsYesterday ?? revenue.revenueDeltaVsYesterday} />
          </div>
        </div>
        <HeroKpi label="Total Bookings"     value={facts.totalBookings} />
        <HeroKpi label="Unique Customers"   value={facts.uniqueCustomersYesterday} />
      </div>

      {/* Secondary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
        <SmallKpi label="Confirmed"     value={facts.confirmedBookings} color="#059669" />
        <SmallKpi label="Cancelled"     value={facts.cancelledBookings} color="#dc2626" />
        <SmallKpi label="No-Shows"      value={facts.noShowBookings}    color="#d97706" />
        <SmallKpi label="Leads"         value={facts.leadCount} />
        <SmallKpi label="Conversations" value={facts.conversationCount} />
      </div>

      {/* Top performer note (if available) */}
      {facts.topServiceName && (
        <div style={{
          marginTop: 14,
          paddingTop: 12,
          borderTop: '0.5px solid var(--mp-card-border)',
          display: 'flex',
          gap: 20,
          flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: 12, color: 'var(--mp-text-muted)' }}>
            Top service: <span style={{ fontWeight: 600, color: 'var(--mp-text)' }}>{facts.topServiceName}</span>
            {facts.topServiceCount != null && (
              <span style={{ color: 'var(--mp-text-muted)' }}> ({facts.topServiceCount} booking{facts.topServiceCount !== 1 ? 's' : ''})</span>
            )}
          </span>
          {facts.peakHour != null && (
            <span style={{ fontSize: 12, color: 'var(--mp-text-muted)' }}>
              Peak hour: <span style={{ fontWeight: 600, color: 'var(--mp-text)' }}>
                {facts.peakHour === 0 ? '12 AM' : facts.peakHour < 12 ? `${facts.peakHour} AM` : facts.peakHour === 12 ? '12 PM' : `${facts.peakHour - 12} PM`}
              </span>
            </span>
          )}
        </div>
      )}
    </div>
  )
}
