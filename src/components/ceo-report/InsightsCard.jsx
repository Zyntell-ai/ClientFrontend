import React from 'react'
import { Zap } from 'lucide-react'

const CATEGORY_LABELS = {
  revenue:    'Revenue',
  demand:     'Demand',
  operations: 'Operations',
  staff:      'Staff',
  customers:  'Customers',
  marketing:  'Marketing',
  risk:       'Risk',
  general:    'General',
}

function InsightItem({ insight }) {
  const categoryLabel = CATEGORY_LABELS[insight.category] || insight.category

  return (
    <div style={{
      padding: '12px 14px',
      background: 'var(--mp-a05)',
      borderRadius: 8,
      borderLeft: '3px solid var(--mp-accent)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        {insight.category && (
          <span style={{
            fontSize: 9,
            fontWeight: 600,
            padding: '2px 7px',
            borderRadius: 20,
            background: 'var(--mp-a10)',
            color: 'var(--mp-accent)',
            textTransform: 'capitalize',
            letterSpacing: '0.04em',
          }}>
            {categoryLabel}
          </span>
        )}
        {insight.confidence != null && (
          <span style={{ fontSize: 10, color: 'var(--mp-text-muted)' }}>
            {Math.round(insight.confidence * 100)}% confidence
          </span>
        )}
      </div>
      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--mp-text)', marginBottom: insight.description ? 4 : 0 }}>
        {insight.title}
      </p>
      {insight.description && (
        <p style={{ fontSize: 12, color: 'var(--mp-text-muted)', lineHeight: 1.55 }}>
          {insight.description}
        </p>
      )}
    </div>
  )
}

export default function InsightsCard({ insights = [] }) {
  const hasInsights = insights.length > 0

  return (
    <div className="mp-card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Zap style={{ width: 14, height: 14, color: 'var(--mp-accent)' }} />
        <span className="mp-label">AI Insights</span>
        {hasInsights && (
          <span style={{
            fontSize: 9,
            fontWeight: 600,
            padding: '2px 7px',
            borderRadius: 20,
            background: 'var(--mp-a05)',
            color: 'var(--mp-text-muted)',
            marginLeft: 'auto',
          }}>
            {insights.length} {insights.length === 1 ? 'insight' : 'insights'}
          </span>
        )}
      </div>

      {hasInsights ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {insights.slice(0, 5).map((insight, i) => (
            <InsightItem key={insight.id || i} insight={insight} />
          ))}
        </div>
      ) : (
        <div>
          {/* Placeholder slots to reserve space while AI is pending */}
          {[1, 2, 3].map((i) => (
            <div key={i} style={{
              padding: '12px 14px',
              background: 'var(--mp-a05)',
              borderRadius: 8,
              borderLeft: '3px solid var(--mp-a10)',
              marginBottom: 8,
              opacity: 0.45,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div className="mp-skeleton" style={{ width: 60, height: 16, borderRadius: 20 }} />
                <div className="mp-skeleton" style={{ width: 80, height: 10, borderRadius: 4 }} />
              </div>
              <div className="mp-skeleton" style={{ width: '70%', height: 11, borderRadius: 4, marginBottom: 6 }} />
              <div className="mp-skeleton" style={{ width: '88%', height: 9, borderRadius: 4 }} />
            </div>
          ))}
          <p style={{ fontSize: 11, color: 'var(--mp-text-muted)', fontStyle: 'italic', marginTop: 4 }}>
            AI insights explain why yesterday's metrics moved. Awaiting AI generation.
          </p>
        </div>
      )}
    </div>
  )
}
