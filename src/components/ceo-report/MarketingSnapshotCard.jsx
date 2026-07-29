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
        width: 80,
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

function InfoRow({ label, value, isAi, last }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '6px 0',
      borderBottom: last ? 'none' : '0.5px solid var(--mp-card-border)',
    }}>
      <span style={{ fontSize: 12, color: 'var(--mp-text-muted)' }}>{label}</span>
      {isAi
        ? <AwaitingAI />
        : <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--mp-text)' }}>{value ?? '—'}</span>
      }
    </div>
  )
}

export default function MarketingSnapshotCard({ marketing = {} }) {
  const sources = marketing.leadSources || []
  const total   = sources.reduce((s, x) => s + x.count, 0)

  // Compute percentage for each source
  const sourcesWithPct = sources.map((s) => ({
    label: s.source,
    pct:   total > 0 ? s.count / total : 0,
  }))

  return (
    <div className="mp-card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Target style={{ width: 14, height: 14, color: 'var(--mp-accent)' }} />
        <span className="mp-label">Marketing</span>
      </div>

      {/* Lead Sources ranked bars */}
      {sourcesWithPct.length > 0 ? (
        <div style={{ marginBottom: 14 }}>
          <p style={{
            fontSize: 10,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: 'var(--mp-text-muted)',
            marginBottom: 10,
          }}>
            Lead Sources
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sourcesWithPct.slice(0, 5).map((item, i) => (
              <RankedBar key={i} label={item.label} pct={item.pct} />
            ))}
          </div>
        </div>
      ) : (
        <p style={{ fontSize: 12, color: 'var(--mp-text-muted)', marginBottom: 14, fontStyle: 'italic' }}>
          No lead source data yet.
        </p>
      )}

      {/* Summary row */}
      <div style={{ borderTop: '0.5px solid var(--mp-card-border)', paddingTop: 10 }}>
        <InfoRow label="Total Leads"     value={marketing.leadCount} />
        <InfoRow label="Referral Leads"  value={marketing.referralCount} />
        <InfoRow label="Conversion Rate" isAi={marketing.conversionRate == null} value={
          marketing.conversionRate != null
            ? `${(marketing.conversionRate * 100).toFixed(1)}%`
            : null
        } last />
      </div>
    </div>
  )
}
