import React from 'react'
import { Lightbulb } from 'lucide-react'

export default function RecommendationsCard({ recommendations = [] }) {
  return (
    <div className="mp-card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Lightbulb style={{ width: 14, height: 14, color: 'var(--mp-accent)' }} />
          <span className="mp-label">Recommendations</span>
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
          AI — PHASE C
        </span>
      </div>

      {recommendations.length === 0 ? (
        <div style={{
          padding: '24px 16px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'var(--mp-a05)',
            border: '0.5px solid var(--mp-card-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Lightbulb style={{ width: 18, height: 18, color: 'var(--mp-accent)', opacity: 0.4 }} />
          </div>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--mp-text)' }}>
            No recommendations yet
          </p>
          <p style={{ fontSize: 11, color: 'var(--mp-text-muted)', maxWidth: 260, lineHeight: 1.6 }}>
            AI-powered business recommendations will be generated automatically in Phase C.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {recommendations.map((rec, i) => (
            <div key={rec.id || i} style={{
              padding: '10px 12px',
              background: 'var(--mp-a05)',
              borderRadius: 8,
              borderLeft: '3px solid var(--mp-accent)',
            }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--mp-text)', marginBottom: 2 }}>{rec.title}</p>
              {rec.description && (
                <p style={{ fontSize: 11, color: 'var(--mp-text-muted)', lineHeight: 1.5 }}>{rec.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
