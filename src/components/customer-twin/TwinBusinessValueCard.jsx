import React from 'react'
import { TrendingUp } from 'lucide-react'
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
    }}>
      Awaiting AI
    </span>
  )
}

function ScoreBar({ value }) {
  if (value == null) return <PendingAI />
  const pct = Math.round(value * 100)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
      <div style={{ flex: 1, height: 5, borderRadius: 99, background: 'var(--mp-a10)', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: 'var(--mp-gradient)',
          borderRadius: 99,
          transition: 'width 0.6s cubic-bezier(0.22,1,0.36,1)',
        }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--mp-text)', minWidth: 28, textAlign: 'right' }}>
        {pct}%
      </span>
    </div>
  )
}

function InfoRow({ label, value, valueEl }) {
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
      {valueEl || <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--mp-text)', textAlign: 'right' }}>{value ?? '—'}</span>}
    </div>
  )
}

function ScoreRow({ label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '0.5px solid var(--mp-card-border)' }}>
      <span style={{ fontSize: 12, color: 'var(--mp-text-muted)', width: 160, flexShrink: 0 }}>{label}</span>
      <ScoreBar value={value} />
    </div>
  )
}

const TIER_STYLES = {
  high:   { color: '#7c3aed', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.20)', label: '★ High Value' },
  medium: { color: '#0284c7', bg: 'rgba(2,132,199,0.08)',  border: 'rgba(2,132,199,0.20)',  label: '◆ Mid Value'  },
  low:    { color: '#64748b', bg: 'rgba(100,116,139,0.08)',border: 'rgba(100,116,139,0.20)',label: '· Entry'       },
}

export default function TwinBusinessValueCard({ businessValue = {} }) {
  const tier       = businessValue.revenueTier
  const tierStyle  = TIER_STYLES[tier]

  return (
    <div className="mp-card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <TrendingUp style={{ width: 14, height: 14, color: 'var(--mp-accent)' }} />
        <span className="mp-label">Business Value</span>
        {tierStyle && (
          <span style={{
            marginLeft: 'auto',
            fontSize: 10,
            fontWeight: 600,
            padding: '2px 9px',
            borderRadius: 20,
            color: tierStyle.color,
            background: tierStyle.bg,
            border: `0.5px solid ${tierStyle.border}`,
          }}>
            {tierStyle.label}
          </span>
        )}
      </div>

      {/* Hero stat */}
      <div style={{
        padding: '14px 16px',
        background: 'var(--mp-gradient-soft)',
        borderRadius: 10,
        border: '0.5px solid var(--mp-card-border)',
        marginBottom: 14,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <p style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--mp-accent)', marginBottom: 4 }}>
            Lifetime Value
          </p>
          <p style={{ fontSize: 22, fontWeight: 600, color: 'var(--mp-text)', fontFamily: 'Lora, Georgia, serif' }}>
            {fmt.currency(businessValue.lifetimeValue || 0)}
          </p>
        </div>
        {businessValue.averageTransactionValue != null && (
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--mp-text-muted)', marginBottom: 4 }}>
              Avg. Transaction
            </p>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--mp-text)' }}>
              {fmt.currency(businessValue.averageTransactionValue)}
            </p>
          </div>
        )}
      </div>

      {businessValue.lastServiceName && (
        <InfoRow label="Last Service" value={businessValue.lastServiceName} />
      )}

      <ScoreRow label="Upsell Score"          value={businessValue.upsellScore} />
      <ScoreRow label="Cross-sell Score"       value={businessValue.crossSellScore} />
      <ScoreRow label="Discount Sensitivity"   value={businessValue.discountSensitivity} />
    </div>
  )
}
