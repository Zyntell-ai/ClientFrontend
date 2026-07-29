import React from 'react'
import { Lightbulb } from 'lucide-react'

const PRIORITY_STYLES = {
  high:   { color: '#dc2626', bg: 'rgba(220,38,38,0.08)',   label: 'High'   },
  medium: { color: '#d97706', bg: 'rgba(217,119,6,0.08)',   label: 'Medium' },
  low:    { color: '#0284c7', bg: 'rgba(2,132,199,0.08)',   label: 'Low'    },
}

function RecommendationItem({ rec }) {
  const priorityStyle = PRIORITY_STYLES[rec.priority] || PRIORITY_STYLES.low
  return (
    <div style={{
      padding: '12px 14px',
      background: 'var(--mp-a05)',
      borderRadius: 8,
      borderLeft: `3px solid ${priorityStyle.color}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{
          fontSize: 9,
          fontWeight: 600,
          padding: '2px 7px',
          borderRadius: 20,
          color: priorityStyle.color,
          background: priorityStyle.bg,
          textTransform: 'capitalize',
        }}>
          {priorityStyle.label}
        </span>
        {rec.category && (
          <span style={{ fontSize: 10, color: 'var(--mp-text-muted)', textTransform: 'capitalize' }}>
            {rec.category}
          </span>
        )}
      </div>
      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--mp-text)', marginBottom: 4 }}>
        {rec.title}
      </p>
      {rec.description && (
        <p style={{ fontSize: 12, color: 'var(--mp-text-muted)', lineHeight: 1.5 }}>
          {rec.description}
        </p>
      )}
    </div>
  )
}

export default function RecommendationsCard({ recommendations = [] }) {
  const hasRecs = recommendations.length > 0

  return (
    <div className="mp-card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Lightbulb style={{ width: 14, height: 14, color: 'var(--mp-accent)' }} />
          <span className="mp-label">AI Recommendations</span>
        </div>
        {hasRecs && (
          <span style={{
            fontSize: 9,
            fontWeight: 600,
            padding: '2px 7px',
            borderRadius: 20,
            background: 'var(--mp-a05)',
            color: 'var(--mp-text-muted)',
          }}>
            {recommendations.slice(0, 5).length}
          </span>
        )}
      </div>

      {hasRecs ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {recommendations.slice(0, 5).map((rec, i) => (
            <RecommendationItem key={rec.id || i} rec={rec} />
          ))}
        </div>
      ) : (
        <div>
          <p style={{ fontSize: 12, color: 'var(--mp-text-muted)', marginBottom: 12 }}>
            No AI recommendations available yet. Action items will appear here once AI analysis completes.
          </p>
          {/* Placeholder slots to reserve space */}
          {[1, 2].map((i) => (
            <div key={i} style={{
              padding: '12px 14px',
              background: 'var(--mp-a05)',
              borderRadius: 8,
              borderLeft: '3px solid var(--mp-card-border)',
              marginBottom: 8,
              opacity: 0.4,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div className="mp-skeleton" style={{ width: 50, height: 16, borderRadius: 20 }} />
                <div className="mp-skeleton" style={{ width: 60, height: 10, borderRadius: 4 }} />
              </div>
              <div className="mp-skeleton" style={{ width: '65%', height: 11, borderRadius: 4, marginBottom: 6 }} />
              <div className="mp-skeleton" style={{ width: '85%', height: 9, borderRadius: 4 }} />
            </div>
          ))}
          <p style={{ fontSize: 11, color: 'var(--mp-text-muted)', fontStyle: 'italic', marginTop: 4 }}>
            AI action items — priority, category, title, description, and confidence — will appear once the briefing is ready.
          </p>
        </div>
      )}
    </div>
  )
}
