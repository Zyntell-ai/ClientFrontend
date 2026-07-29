import React from 'react'
import { AlertTriangle } from 'lucide-react'

const SEVERITY_STYLES = {
  low:      { color: '#0284c7', bg: 'rgba(2,132,199,0.08)',    border: '#0284c7', label: 'Low'      },
  medium:   { color: '#d97706', bg: 'rgba(217,119,6,0.08)',    border: '#d97706', label: 'Medium'   },
  high:     { color: '#dc2626', bg: 'rgba(220,38,38,0.08)',    border: '#dc2626', label: 'High'     },
  critical: { color: '#7c3aed', bg: 'rgba(124,58,237,0.08)',   border: '#7c3aed', label: 'Critical' },
}

function RiskItem({ risk }) {
  const style = SEVERITY_STYLES[risk.severity] || SEVERITY_STYLES.medium

  return (
    <div style={{
      padding: '12px 14px',
      background: style.bg,
      borderRadius: 8,
      borderLeft: `3px solid ${style.border}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{
          fontSize: 9,
          fontWeight: 600,
          padding: '2px 7px',
          borderRadius: 20,
          color: style.color,
          background: style.bg,
          border: `0.5px solid ${style.color}`,
          textTransform: 'capitalize',
        }}>
          {style.label}
        </span>
        {risk.confidence != null && (
          <span style={{ fontSize: 10, color: 'var(--mp-text-muted)' }}>
            {Math.round(risk.confidence * 100)}% confidence
          </span>
        )}
      </div>
      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--mp-text)', marginBottom: risk.description ? 4 : 0 }}>
        {risk.title}
      </p>
      {risk.description && (
        <p style={{ fontSize: 12, color: 'var(--mp-text-muted)', lineHeight: 1.55 }}>
          {risk.description}
        </p>
      )}
    </div>
  )
}

export default function RisksCard({ risks = [] }) {
  const hasRisks = risks.length > 0

  return (
    <div className="mp-card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <AlertTriangle style={{ width: 14, height: 14, color: '#d97706' }} />
        <span className="mp-label">Business Risks</span>
        {hasRisks && (
          <span style={{
            fontSize: 9,
            fontWeight: 600,
            padding: '2px 7px',
            borderRadius: 20,
            background: 'rgba(217,119,6,0.08)',
            color: '#d97706',
            marginLeft: 'auto',
          }}>
            {risks.length} {risks.length === 1 ? 'risk' : 'risks'}
          </span>
        )}
      </div>

      {hasRisks ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {risks.slice(0, 3).map((risk, i) => (
            <RiskItem key={risk.id || i} risk={risk} />
          ))}
        </div>
      ) : (
        <div>
          {/* Placeholder slots */}
          {[1, 2].map((i) => (
            <div key={i} style={{
              padding: '12px 14px',
              background: 'var(--mp-a05)',
              borderRadius: 8,
              borderLeft: '3px solid var(--mp-card-border)',
              marginBottom: 8,
              opacity: 0.45,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div className="mp-skeleton" style={{ width: 52, height: 16, borderRadius: 20 }} />
                <div className="mp-skeleton" style={{ width: 70, height: 10, borderRadius: 4 }} />
              </div>
              <div className="mp-skeleton" style={{ width: '65%', height: 11, borderRadius: 4, marginBottom: 6 }} />
              <div className="mp-skeleton" style={{ width: '82%', height: 9, borderRadius: 4 }} />
            </div>
          ))}
          <p style={{ fontSize: 11, color: 'var(--mp-text-muted)', fontStyle: 'italic', marginTop: 4 }}>
            AI-flagged business risks based on operational patterns. Awaiting AI generation.
          </p>
        </div>
      )}
    </div>
  )
}
