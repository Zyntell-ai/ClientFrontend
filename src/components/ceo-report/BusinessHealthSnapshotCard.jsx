import React from 'react'
import { Activity } from 'lucide-react'
import { fmt } from '../../utils/index'

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
  excellent: { color: '#059669', bg: 'rgba(5,150,105,0.08)'    },
  good:      { color: '#0284c7', bg: 'rgba(2,132,199,0.08)'    },
  fair:      { color: '#d97706', bg: 'rgba(217,119,6,0.08)'    },
  poor:      { color: '#dc2626', bg: 'rgba(220,38,38,0.08)'    },
  growing:   { color: '#059669', bg: 'rgba(5,150,105,0.08)'    },
  stable:    { color: '#64748b', bg: 'rgba(100,116,139,0.08)'  },
  declining: { color: '#dc2626', bg: 'rgba(220,38,38,0.08)'    },
  optimal:   { color: '#059669', bg: 'rgba(5,150,105,0.08)'    },
  normal:    { color: '#64748b', bg: 'rgba(100,116,139,0.08)'  },
  stressed:  { color: '#dc2626', bg: 'rgba(220,38,38,0.08)'    },
  low:       { color: '#059669', bg: 'rgba(5,150,105,0.08)'    },
  medium:    { color: '#d97706', bg: 'rgba(217,119,6,0.08)'    },
  high:      { color: '#dc2626', bg: 'rgba(220,38,38,0.08)'    },
  critical:  { color: '#7c3aed', bg: 'rgba(124,58,237,0.08)'   },
}

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

function OverallHealthCell({ value }) {
  if (value == null) return <AwaitingAI />
  if (typeof value === 'string') return <StatusBadge value={value} />

  const { status, score, confidence } = value
  const style    = HEALTH_STYLES[status] || { color: '#64748b', bg: 'rgba(100,116,139,0.08)' }
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

function HealthRow({ label, value, isOverall, last }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '7px 0',
      borderBottom: last ? 'none' : '0.5px solid var(--mp-card-border)',
    }}>
      <span style={{ fontSize: 12, color: 'var(--mp-text-muted)' }}>{label}</span>
      {isOverall ? <OverallHealthCell value={value} /> : <StatusBadge value={value} />}
    </div>
  )
}

export default function BusinessHealthSnapshotCard({ businessHealth = {} }) {
  const hasData = businessHealth.overallHealth != null

  return (
    <div className="mp-card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity style={{ width: 14, height: 14, color: 'var(--mp-accent)' }} />
          <span className="mp-label">Business Health</span>
        </div>
        <span style={{
          fontSize: 9,
          fontWeight: 600,
          padding: '2px 7px',
          borderRadius: 20,
          background: 'var(--mp-a05)',
          color: 'var(--mp-text-muted)',
          letterSpacing: '0.06em',
        }}>
          SNAPSHOT
        </span>
      </div>

      <HealthRow label="Overall Health"     value={businessHealth.overallHealth}     isOverall />
      <HealthRow label="Growth Status"      value={businessHealth.growthStatus} />
      <HealthRow label="Operational Status" value={businessHealth.operationalStatus} />
      <HealthRow label="Risk Level"         value={businessHealth.riskLevel}         last />

      {!hasData && (
        <p style={{ fontSize: 11, color: 'var(--mp-text-muted)', marginTop: 10, fontStyle: 'italic' }}>
          Health snapshot populates after the Business Twin AI has run at least once.
        </p>
      )}

      {businessHealth.twinSnapshotAt && (
        <p style={{ fontSize: 10, color: 'var(--mp-text-muted)', marginTop: 10 }}>
          Snapshot taken {fmt.ago(businessHealth.twinSnapshotAt)}
        </p>
      )}
    </div>
  )
}
