import React from 'react'
import { Target } from 'lucide-react'

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

function RankedBar({ label, pct }) {
  const displayPct = Math.round((pct ?? 0) * 100)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{
        fontSize: 11,
        color: 'var(--mp-text-muted)',
        width: 90,
        flexShrink: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        textTransform: 'capitalize',
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 5, borderRadius: 99, background: 'var(--mp-a10)', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${displayPct}%`,
          background: 'var(--mp-accent)',
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

function AiRow({ label }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0' }}>
      <span style={{ fontSize: 12, color: 'var(--mp-text-muted)' }}>{label}</span>
      <AwaitingAI />
    </div>
  )
}

export default function MarketingCard({ marketing = {} }) {
  const sources = marketing.leadSources || []

  return (
    <div className="mp-card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Target style={{ width: 14, height: 14, color: 'var(--mp-accent)' }} />
        <span className="mp-label">Marketing</span>
      </div>

      {sources.length > 0 ? (
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--mp-text-muted)', marginBottom: 10 }}>
            Lead Sources
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sources.slice(0, 6).map((item, i) => (
              <RankedBar key={i} label={item.key} pct={item.pct} />
            ))}
          </div>
        </div>
      ) : (
        <p style={{ fontSize: 12, color: 'var(--mp-text-muted)', marginBottom: 14, fontStyle: 'italic' }}>
          No lead source data yet.
        </p>
      )}

      <div style={{ borderTop: '0.5px solid var(--mp-card-border)', paddingTop: 10 }}>
        <AiRow label="Conversion Rate" />
        <AiRow label="Referral Rate" />
        <AiRow label="Campaign Effectiveness" />
      </div>
    </div>
  )
}
