import React from 'react'
import { Sparkles } from 'lucide-react'

export default function ExecutiveSummaryCard({ executiveSummary = {} }) {
  const { headline, summary, confidence } = executiveSummary
  const hasContent = headline != null || summary != null

  return (
    <div className="mp-card" style={{ padding: '18px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles style={{ width: 14, height: 14, color: 'var(--mp-accent)' }} />
          <span className="mp-label">AI Executive Summary</span>
        </div>
        {!hasContent && (
          <span style={{
            fontSize: 9,
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: 20,
            background: 'var(--mp-a05)',
            color: 'var(--mp-text-muted)',
            letterSpacing: '0.08em',
            opacity: 0.6,
          }}>
            AWAITING AI
          </span>
        )}
      </div>

      {hasContent ? (
        /* Phase C+: AI-generated narrative */
        <div>
          {headline && (
            <p style={{
              fontFamily: 'Lora, Georgia, serif',
              fontSize: 18,
              fontWeight: 600,
              color: 'var(--mp-text)',
              lineHeight: 1.4,
              marginBottom: 10,
            }}>
              {headline}
            </p>
          )}
          {summary && (
            <p style={{
              fontSize: 13,
              color: 'var(--mp-text-muted)',
              lineHeight: 1.7,
              maxWidth: 680,
            }}>
              {summary}
            </p>
          )}
          {confidence != null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
              <span style={{ fontSize: 10, color: 'var(--mp-text-muted)' }}>Confidence</span>
              <div style={{ width: 80, height: 3, borderRadius: 99, background: 'var(--mp-a10)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.round(confidence * 100)}%`,
                  background: 'var(--mp-accent)',
                  borderRadius: 99,
                  transition: 'width 0.6s cubic-bezier(0.22,1,0.36,1)',
                }} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--mp-accent)' }}>
                {Math.round(confidence * 100)}%
              </span>
            </div>
          )}
        </div>
      ) : (
        /* Phase B: Reserved placeholder */
        <div>
          {/* Headline placeholder */}
          <div style={{
            padding: '16px',
            borderRadius: 8,
            border: '1.5px dashed var(--mp-card-border)',
            marginBottom: 12,
          }}>
            <p style={{
              fontFamily: 'Lora, Georgia, serif',
              fontSize: 16,
              color: 'var(--mp-text-muted)',
              opacity: 0.4,
              fontStyle: 'italic',
            }}>
              AI headline will appear here — e.g. "Strong Monday: revenue up 40%, 6 bookings confirmed"
            </p>
          </div>

          {/* Summary placeholder */}
          <div style={{
            padding: '14px 16px',
            borderRadius: 8,
            background: 'var(--mp-a05)',
            marginBottom: 14,
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {[90, 75, 60].map((w, i) => (
                <div
                  key={i}
                  className="mp-skeleton"
                  style={{ height: 8, width: `${w}%`, borderRadius: 4 }}
                />
              ))}
            </div>
          </div>

          <p style={{ fontSize: 11, color: 'var(--mp-text-muted)', fontStyle: 'italic' }}>
            AI is generating your executive briefing. Refresh in a moment or it will appear automatically.
          </p>
        </div>
      )}
    </div>
  )
}
