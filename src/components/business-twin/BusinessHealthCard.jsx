import React from 'react'
import { Activity } from 'lucide-react'

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

const HEALTH_STYLES = {
  excellent: { color: '#059669', bg: 'rgba(5,150,105,0.08)'   },
  good:      { color: '#0284c7', bg: 'rgba(2,132,199,0.08)'   },
  fair:      { color: '#d97706', bg: 'rgba(217,119,6,0.08)'   },
  poor:      { color: '#dc2626', bg: 'rgba(220,38,38,0.08)'   },
  growing:   { color: '#059669', bg: 'rgba(5,150,105,0.08)'   },
  stable:    { color: '#64748b', bg: 'rgba(100,116,139,0.08)' },
  declining: { color: '#dc2626', bg: 'rgba(220,38,38,0.08)'   },
  optimal:   { color: '#059669', bg: 'rgba(5,150,105,0.08)'   },
  normal:    { color: '#64748b', bg: 'rgba(100,116,139,0.08)' },
  stressed:  { color: '#dc2626', bg: 'rgba(220,38,38,0.08)'   },
  low:       { color: '#059669', bg: 'rgba(5,150,105,0.08)'   },
  medium:    { color: '#d97706', bg: 'rgba(217,119,6,0.08)'   },
  high:      { color: '#dc2626', bg: 'rgba(220,38,38,0.08)'   },
  critical:  { color: '#7c3aed', bg: 'rgba(124,58,237,0.08)'  },
}

// Render a simple string status badge
function StatusBadge({ value }) {
  if (value == null) return <AwaitingAI />
  const style = HEALTH_STYLES[value] || { color: '#64748b', bg: 'rgba(100,116,139,0.08)' }
  return (
    <span style={{
      fontSize: 10,
      fontWeight: 600,
      padding: '2px 9px',
      borderRadius: 20,
      color: style.color,
      background: style.bg,
      textTransform: 'capitalize',
    }}>
      {value}
    </span>
  )
}

// Render overallHealth — accepts null (→ AwaitingAI) or object {status, score, confidence}
function OverallHealthCell({ value }) {
  if (value == null) return <AwaitingAI />

  // String fallback (shouldn't happen in Phase C but guards against stale data)
  if (typeof value === 'string') return <StatusBadge value={value} />

  const { status, score, confidence } = value
  const style  = HEALTH_STYLES[status] || { color: '#64748b', bg: 'rgba(100,116,139,0.08)' }
  const scorePct = score != null ? Math.round(score * 100) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
      <StatusBadge value={status} />
      {scorePct != null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 60, height: 3, borderRadius: 99, background: 'var(--mp-a10)', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${scorePct}%`,
              background: style.color,
              borderRadius: 99,
              transition: 'width 0.6s cubic-bezier(0.22,1,0.36,1)',
            }} />
          </div>
          <span style={{ fontSize: 10, fontWeight: 600, color: style.color }}>{scorePct}</span>
          {confidence != null && (
            <span style={{ fontSize: 9, color: 'var(--mp-text-muted)' }}>
              {Math.round(confidence * 100)}% conf
            </span>
          )}
        </div>
      )}
    </div>
  )
}

function HealthRow({ label, value, isOverallHealth }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 0',
      borderBottom: '0.5px solid var(--mp-card-border)',
    }}>
      <span style={{ fontSize: 12, color: 'var(--mp-text-muted)' }}>{label}</span>
      {isOverallHealth
        ? <OverallHealthCell value={value} />
        : <StatusBadge value={value} />
      }
    </div>
  )
}

export default function BusinessHealthCard({ businessHealth = {} }) {
  const hasAiData = businessHealth.overallHealth != null

  return (
    <div className="mp-card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity style={{ width: 14, height: 14, color: 'var(--mp-accent)' }} />
          <span className="mp-label">Business Health</span>
        </div>
        {!hasAiData && (
          <span style={{
            fontSize: 9,
            fontWeight: 600,
            padding: '2px 7px',
            borderRadius: 20,
            background: 'var(--mp-a05)',
            color: 'var(--mp-accent)',
            letterSpacing: '0.08em',
          }}>
            AI
          </span>
        )}
      </div>

      <div>
        <HealthRow label="Overall Health"     value={businessHealth.overallHealth}     isOverallHealth />
        <HealthRow label="Growth Status"      value={businessHealth.growthStatus} />
        <HealthRow label="Operational Status" value={businessHealth.operationalStatus} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
          <span style={{ fontSize: 12, color: 'var(--mp-text-muted)' }}>Risk Level</span>
          <StatusBadge value={businessHealth.riskLevel} />
        </div>
      </div>

      {!hasAiData && (
        <p style={{ fontSize: 11, color: 'var(--mp-text-muted)', marginTop: 10, fontStyle: 'italic' }}>
          AI health analysis populates after the first pipeline run.
        </p>
      )}
    </div>
  )
}
