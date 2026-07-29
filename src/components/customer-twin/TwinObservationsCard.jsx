import React from 'react'
import { Brain } from 'lucide-react'
import { fmt } from '../../utils/index'

const CATEGORY_STYLES = {
  preference:    { bg: 'rgba(124,58,237,0.08)', color: '#7C3AED' },
  behavior:      { bg: 'rgba(2,132,199,0.08)',   color: '#0284c7' },
  communication: { bg: 'rgba(5,150,105,0.08)',   color: '#059669' },
  value:         { bg: 'rgba(234,179,8,0.10)',   color: '#92400E' },
  risk:          { bg: 'rgba(220,38,38,0.08)',   color: '#dc2626' },
  opportunity:   { bg: 'rgba(124,58,237,0.08)', color: '#7C3AED' },
}

const IMPORTANCE_STYLES = {
  high:   { bg: 'rgba(220,38,38,0.08)',    color: '#dc2626' },
  medium: { bg: 'rgba(217,119,6,0.08)',    color: '#d97706' },
  low:    { bg: 'rgba(100,116,139,0.10)',  color: '#64748b' },
}

function ConfidenceBar({ value }) {
  if (value == null) return null
  const pct = Math.round(value * 100)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 48, height: 3, borderRadius: 99, background: 'var(--mp-a10)', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: 'var(--mp-accent)',
          borderRadius: 99,
        }} />
      </div>
      <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--mp-text-muted)' }}>{pct}%</span>
    </div>
  )
}

function ObservationChip({ label, styles }) {
  return (
    <span style={{
      fontSize: 10,
      fontWeight: 600,
      padding: '2px 8px',
      borderRadius: 20,
      letterSpacing: '0.03em',
      textTransform: 'capitalize',
      background: styles.bg,
      color: styles.color,
    }}>
      {label}
    </span>
  )
}

function ObservationCard({ obs }) {
  const catStyle = CATEGORY_STYLES[obs.category] || { bg: 'var(--mp-a05)', color: 'var(--mp-accent)' }
  const impStyle = IMPORTANCE_STYLES[obs.importance] || IMPORTANCE_STYLES.medium
  const expires  = fmt.date(obs.expiresAt)
  const created  = fmt.date(obs.createdAt)

  return (
    <div style={{
      padding: '12px 14px',
      background: 'var(--mp-a05)',
      borderRadius: 10,
      border: '0.5px solid var(--mp-card-border)',
    }}>
      <div style={{ display: 'flex', gap: 7, marginBottom: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <ObservationChip label={obs.category || 'insight'} styles={catStyle} />
        {obs.importance && <ObservationChip label={obs.importance} styles={impStyle} />}
        <ConfidenceBar value={obs.confidence} />
      </div>
      <p style={{ fontSize: 13, color: 'var(--mp-text)', lineHeight: 1.55 }}>{obs.summary}</p>
      {(created || expires) && (
        <p style={{ fontSize: 10, color: 'var(--mp-text-muted)', marginTop: 7 }}>
          {created && `Observed ${created}`}
          {expires && ` · expires ${expires}`}
        </p>
      )}
    </div>
  )
}

export default function TwinObservationsCard({ intelligence = {} }) {
  const observations = intelligence.observations || []
  const summary      = intelligence.summary

  return (
    <div className="mp-card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Brain style={{ width: 14, height: 14, color: 'var(--mp-accent)' }} />
          <span className="mp-label">AI Observations</span>
        </div>
        {observations.length > 0 && (
          <span style={{
            fontSize: 10,
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: 20,
            background: 'var(--mp-a10)',
            color: 'var(--mp-accent)',
          }}>
            {observations.length}
          </span>
        )}
      </div>

      {summary && (
        <div style={{
          padding: '12px 14px',
          background: 'var(--mp-gradient-soft)',
          borderRadius: 10,
          border: '0.5px solid var(--mp-card-border)',
          marginBottom: 12,
        }}>
          <p style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--mp-accent)', marginBottom: 6 }}>
            AI Summary
          </p>
          <p style={{ fontSize: 12, color: 'var(--mp-text)', lineHeight: 1.6 }}>{summary}</p>
        </div>
      )}

      {observations.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '24px 16px',
          color: 'var(--mp-text-muted)',
        }}>
          <Brain style={{ width: 24, height: 24, marginBottom: 8, opacity: 0.3, margin: '0 auto 8px' }} />
          <p style={{ fontSize: 12 }}>No AI observations yet.</p>
          <p style={{ fontSize: 11, marginTop: 4, opacity: 0.7 }}>
            Observations will appear as the AI analyses this customer's patterns.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {observations.map((obs, i) => (
            <ObservationCard key={obs.id || i} obs={obs} />
          ))}
        </div>
      )}
    </div>
  )
}
