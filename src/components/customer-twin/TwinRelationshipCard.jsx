import React from 'react'
import { Heart } from 'lucide-react'

function ScoreBar({ value, color = 'var(--mp-accent)' }) {
  if (value == null) return (
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

  const pct = Math.round(value * 100)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
      <div style={{
        flex: 1,
        height: 5,
        borderRadius: 99,
        background: 'var(--mp-a10)',
        overflow: 'hidden',
        minWidth: 0,
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: color,
          borderRadius: 99,
          transition: 'width 0.6s cubic-bezier(0.22,1,0.36,1)',
        }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--mp-text)', minWidth: 30, textAlign: 'right' }}>
        {pct}%
      </span>
    </div>
  )
}

function ScoreRow({ label, value, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 12, color: 'var(--mp-text-muted)', width: 150, flexShrink: 0 }}>{label}</span>
      <ScoreBar value={value} color={color} />
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '6px 0',
      gap: 12,
    }}>
      <span style={{ fontSize: 12, color: 'var(--mp-text-muted)' }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--mp-text)' }}>{value ?? '—'}</span>
    </div>
  )
}

const SENTIMENT_STYLES = {
  positive:  { color: '#059669', bg: 'rgba(5,150,105,0.08)'  },
  improving: { color: '#059669', bg: 'rgba(5,150,105,0.08)'  },
  neutral:   { color: '#64748b', bg: 'rgba(100,116,139,0.08)' },
  negative:  { color: '#dc2626', bg: 'rgba(220,38,38,0.08)'  },
  declining: { color: '#dc2626', bg: 'rgba(220,38,38,0.08)'  },
}

export default function TwinRelationshipCard({ relationship = {} }) {
  const sentiment      = relationship.sentimentTrend
  const sentimentStyle = SENTIMENT_STYLES[sentiment] || { color: '#64748b', bg: 'rgba(100,116,139,0.08)' }

  return (
    <div className="mp-card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Heart style={{ width: 14, height: 14, color: 'var(--mp-accent)' }} />
          <span className="mp-label">Relationship</span>
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
          AI-SCORED
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <ScoreRow label="Trust Score"          value={relationship.trustScore}          color="var(--mp-accent)" />
        <ScoreRow label="Loyalty Score"        value={relationship.loyaltyScore}        color="#0284c7" />
        <ScoreRow label="Retention Score"      value={relationship.retentionScore}      color="#059669" />
        <ScoreRow label="Referral Probability" value={relationship.referralProbability} color="#7c3aed" />
      </div>

      {(sentiment || relationship.complaintCount > 0) && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '0.5px solid var(--mp-card-border)' }}>
          {sentiment && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--mp-text-muted)' }}>Sentiment Trend</span>
              <span style={{
                fontSize: 10,
                fontWeight: 600,
                padding: '2px 9px',
                borderRadius: 20,
                color: sentimentStyle.color,
                background: sentimentStyle.bg,
                textTransform: 'capitalize',
              }}>
                {sentiment}
              </span>
            </div>
          )}
          <InfoRow label="Complaints"    value={relationship.complaintCount ?? 0} />
          <InfoRow label="Satisfied Events" value={relationship.satisfactionEvents ?? 0} />
        </div>
      )}
    </div>
  )
}
