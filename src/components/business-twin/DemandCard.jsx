import React from 'react'
import { BarChart3 } from 'lucide-react'

function fmtHour(h) {
  if (h === 0)  return '12 AM'
  if (h < 12)   return `${h} AM`
  if (h === 12) return '12 PM'
  return `${h - 12} PM`
}

function RankedBar({ label, pct, color = 'var(--mp-accent)' }) {
  const displayPct = Math.round((pct ?? 0) * 100)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{
        fontSize: 11,
        color: 'var(--mp-text-muted)',
        width: 70,
        flexShrink: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 5, borderRadius: 99, background: 'var(--mp-a10)', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${displayPct}%`,
          background: color,
          borderRadius: 99,
          transition: 'width 0.6s cubic-bezier(0.22,1,0.36,1)',
        }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--mp-text)', minWidth: 30, textAlign: 'right' }}>
        {displayPct}%
      </span>
    </div>
  )
}

function KpiInline({ label, value }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--mp-text-muted)', marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--mp-text)' }}>{value ?? '—'}</p>
    </div>
  )
}

function RankedSection({ title, items, labelFn, color }) {
  if (!items || items.length === 0) return null
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--mp-text-muted)', marginBottom: 8 }}>{title}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {items.slice(0, 5).map((item, i) => (
          <RankedBar key={i} label={labelFn(item.key)} pct={item.pct} color={color} />
        ))}
      </div>
    </div>
  )
}

export default function DemandCard({ demand = {} }) {
  return (
    <div className="mp-card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <BarChart3 style={{ width: 14, height: 14, color: 'var(--mp-accent)' }} />
        <span className="mp-label">Demand</span>
      </div>

      {/* KPI row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
        gap: '10px',
        marginBottom: 16,
        padding: '10px 0',
        borderBottom: '0.5px solid var(--mp-card-border)',
      }}>
        <KpiInline label="All-Time Bookings"  value={demand.totalBookingsAllTime} />
        <KpiInline label="This Month"         value={demand.bookingsCurrentMonth} />
        <KpiInline label="Last Month"         value={demand.bookingsLastMonth} />
        <KpiInline
          label="Avg / Week"
          value={demand.averageBookingsPerWeek != null ? demand.averageBookingsPerWeek.toFixed(1) : null}
        />
      </div>

      <RankedSection
        title="Peak Hours"
        items={demand.peakHours}
        labelFn={fmtHour}
        color="var(--mp-accent)"
      />
      <RankedSection
        title="Peak Days"
        items={demand.peakDays}
        labelFn={(k) => k}
        color="#0284c7"
      />
      <RankedSection
        title="Busy Months"
        items={demand.busyMonths}
        labelFn={(k) => k}
        color="#059669"
      />
    </div>
  )
}
