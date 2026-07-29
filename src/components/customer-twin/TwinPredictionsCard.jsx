import React from 'react'
import { Zap } from 'lucide-react'
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

function RiskBar({ value, label }) {
  if (value == null) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 0',
        borderBottom: '0.5px solid var(--mp-card-border)',
        gap: 12,
      }}>
        <span style={{ fontSize: 12, color: 'var(--mp-text-muted)' }}>{label}</span>
        <PendingAI />
      </div>
    )
  }

  const pct  = Math.round(value * 100)
  // High risk = red, medium = amber, low = green
  const color = pct > 60 ? '#dc2626' : pct > 30 ? '#d97706' : '#059669'
  const bg    = pct > 60 ? 'rgba(220,38,38,0.08)' : pct > 30 ? 'rgba(217,119,6,0.08)' : 'rgba(5,150,105,0.08)'
  const trackColor = pct > 60 ? 'rgba(220,38,38,0.15)' : pct > 30 ? 'rgba(217,119,6,0.15)' : 'rgba(5,150,105,0.15)'

  return (
    <div style={{
      padding: '8px 0',
      borderBottom: '0.5px solid var(--mp-card-border)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: 'var(--mp-text-muted)' }}>{label}</span>
        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, color, background: bg }}>
          {pct}%
        </span>
      </div>
      <div style={{ height: 4, borderRadius: 99, background: trackColor, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: color,
          borderRadius: 99,
          transition: 'width 0.6s cubic-bezier(0.22,1,0.36,1)',
        }} />
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
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
      {value != null
        ? <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--mp-text)', textAlign: 'right' }}>{value}</span>
        : <PendingAI />
      }
    </div>
  )
}

export default function TwinPredictionsCard({ predictions = {} }) {
  return (
    <div className="mp-card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Zap style={{ width: 14, height: 14, color: 'var(--mp-accent)' }} />
          <span className="mp-label">Predictions</span>
        </div>
        <span style={{
          fontSize: 9,
          fontWeight: 600,
          padding: '2px 7px',
          borderRadius: 20,
          background: 'var(--mp-a05)',
          color: 'var(--mp-accent)',
          letterSpacing: '0.08em',
        }}>
          AI-PREDICTED
        </span>
      </div>

      <InfoRow
        label="Next Visit Estimate"
        value={predictions.nextVisitEstimate ? fmt.date(predictions.nextVisitEstimate) : null}
      />
      <InfoRow
        label="Predicted Next Service"
        value={predictions.predictedNextService || null}
      />

      <div style={{ marginTop: 4 }}>
        <RiskBar label="Cancellation Risk" value={predictions.cancellationRisk} />
        <RiskBar label="No-Show Risk"      value={predictions.noShowRisk} />
        <RiskBar label="Churn Risk"        value={predictions.churnRisk} />
        <RiskBar label="Review Probability" value={predictions.reviewProbability} />
      </div>

      {predictions.predictedAt && (
        <p style={{ fontSize: 10, color: 'var(--mp-text-muted)', marginTop: 10, textAlign: 'right' }}>
          Predicted {fmt.ago(predictions.predictedAt)}
        </p>
      )}
    </div>
  )
}
