import React from 'react'
import { Activity } from 'lucide-react'
import { fmt } from '../../utils/index'

function PendingAI() {
  return (
    <span style={{
      fontSize: 10,
      fontWeight: 600,
      padding: '2px 8px',
      borderRadius: 20,
      background: 'rgba(217,119,6,0.08)',
      color: '#d97706',
      letterSpacing: '0.03em',
    }}>
      Awaiting AI
    </span>
  )
}

function InfoRow({ label, value, valueEl, placeholder }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 0',
      borderBottom: '0.5px solid var(--mp-card-border)',
      gap: 12,
    }}>
      <span style={{ fontSize: 12, color: 'var(--mp-text-muted)', flexShrink: 0 }}>{label}</span>
      <span style={{
        fontSize: 12,
        fontWeight: 600,
        color: value != null ? 'var(--mp-text)' : 'var(--mp-text-muted)',
        textAlign: 'right',
      }}>
        {valueEl || (value != null ? value : (placeholder || <PendingAI />))}
      </span>
    </div>
  )
}

function RateChip({ rate }) {
  if (rate == null) return <PendingAI />
  const pct   = Math.round(rate * 100)
  const color = pct > 30 ? '#dc2626' : pct > 15 ? '#d97706' : '#059669'
  const bg    = pct > 30 ? 'rgba(220,38,38,0.08)' : pct > 15 ? 'rgba(217,119,6,0.08)' : 'rgba(5,150,105,0.08)'
  return (
    <span style={{ fontSize: 12, fontWeight: 600, color, background: bg, padding: '2px 8px', borderRadius: 20 }}>
      {pct}%
    </span>
  )
}

export default function TwinBehaviorCard({ behavior = {} }) {
  const freqLabel = behavior.visitFrequencyDays != null
    ? `Every ${behavior.visitFrequencyDays} days`
    : null

  const PATTERN_LABELS = {
    regular: 'Regular',
    irregular: 'Irregular',
    seasonal: 'Seasonal',
  }

  return (
    <div className="mp-card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Activity style={{ width: 14, height: 14, color: 'var(--mp-accent)' }} />
        <span className="mp-label">Behavior</span>
      </div>

      {/* Visit overview — stat chips */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 8,
        marginBottom: 14,
      }}>
        {[
          { label: 'Total Visits',  value: behavior.totalVisits ?? 0 },
          { label: 'Last Visit',    value: fmt.date(behavior.lastVisitDate) },
          { label: 'No-Shows',      value: behavior.noShowCount ?? 0 },
        ].map(({ label, value }) => (
          <div key={label} style={{
            padding: '10px 12px',
            background: 'var(--mp-a05)',
            borderRadius: 8,
            textAlign: 'center',
          }}>
            <p style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--mp-accent)', marginBottom: 5 }}>
              {label}
            </p>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--mp-text)', fontFamily: 'Lora, Georgia, serif' }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      <InfoRow label="Visit Frequency"   value={freqLabel} />
      <InfoRow label="Preferred Day"     value={behavior.preferredDayOfWeek} />
      <InfoRow label="Preferred Time"    value={behavior.preferredTimeOfDay ? capitalize(behavior.preferredTimeOfDay) : null} />
      <InfoRow label="Cancellation Rate" valueEl={<RateChip rate={behavior.cancellationRate} />} />
      <InfoRow label="No-Show Rate"      valueEl={<RateChip rate={behavior.noShowRate} />} />
      <InfoRow
        label="Booking Pattern"
        value={PATTERN_LABELS[behavior.appointmentPattern] || behavior.appointmentPattern}
      />
    </div>
  )
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}
