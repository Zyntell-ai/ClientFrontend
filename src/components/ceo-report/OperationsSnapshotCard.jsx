import React from 'react'
import { Settings2 } from 'lucide-react'

const AwaitingAI = () => (
  <span style={{
    fontSize: 10,
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: 20,
    background: 'rgba(217,119,6,0.08)',
    color: '#d97706',
  }}>
    Awaiting AI
  </span>
)

function RateBar({ label, value, color }) {
  if (value == null) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
        <span style={{ fontSize: 12, color: 'var(--mp-text-muted)' }}>{label}</span>
        <span style={{ fontSize: 12, color: 'var(--mp-text-muted)' }}>—</span>
      </div>
    )
  }
  const pct = Math.round(value * 100)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 12, color: 'var(--mp-text-muted)', width: 130, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 5, borderRadius: 99, background: 'var(--mp-a10)', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: color,
          borderRadius: 99,
          transition: 'width 0.6s cubic-bezier(0.22,1,0.36,1)',
        }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--mp-text)', minWidth: 32, textAlign: 'right' }}>
        {pct}%
      </span>
    </div>
  )
}

function AiScoreRow({ label, value }) {
  if (value == null) {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
        <span style={{ fontSize: 12, color: 'var(--mp-text-muted)' }}>{label}</span>
        <AwaitingAI />
      </div>
    )
  }
  const pct   = Math.round(value * 100)
  const color = pct >= 70 ? '#059669' : pct >= 45 ? '#0284c7' : '#dc2626'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
      <span style={{ fontSize: 12, color: 'var(--mp-text-muted)', width: 130, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 4, borderRadius: 99, background: 'var(--mp-a10)', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: color,
          borderRadius: 99,
          transition: 'width 0.6s cubic-bezier(0.22,1,0.36,1)',
        }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color, minWidth: 32, textAlign: 'right' }}>
        {pct}%
      </span>
    </div>
  )
}

function InfoRow({ label, value, last }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '5px 0',
      borderBottom: last ? 'none' : '0.5px solid var(--mp-card-border)',
    }}>
      <span style={{ fontSize: 12, color: 'var(--mp-text-muted)' }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--mp-text)' }}>{value ?? '—'}</span>
    </div>
  )
}

const fmtHour = (h) => {
  if (h == null) return '—'
  const period = h < 12 ? 'AM' : 'PM'
  const h12    = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${h12} ${period}`
}

export default function OperationsSnapshotCard({ operations = {} }) {
  return (
    <div className="mp-card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Settings2 style={{ width: 14, height: 14, color: 'var(--mp-accent)' }} />
        <span className="mp-label">Operations</span>
      </div>

      {/* Yesterday rates */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
        <RateBar label="Confirmation Rate" value={operations.confirmationRate} color="var(--mp-accent)" />
        <RateBar label="Cancellation Rate" value={operations.cancellationRate} color="#dc2626" />
        <RateBar label="No-Show Rate"      value={operations.noShowRate}       color="#d97706" />
      </div>

      {/* Divider */}
      <div style={{ borderTop: '0.5px solid var(--mp-card-border)', paddingTop: 10 }}>
        {/* AI score from Business Twin snapshot */}
        <AiScoreRow label="Booking Utilization" value={operations.bookingUtilization} />

        {/* Demand pattern */}
        <InfoRow label="Peak Hour Yesterday"  value={fmtHour(operations.peakHour)} />
        <InfoRow label="Peak Day (overall)"   value={operations.peakDay} last />
      </div>
    </div>
  )
}
