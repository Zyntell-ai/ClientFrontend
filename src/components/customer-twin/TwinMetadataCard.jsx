import React from 'react'
import { Settings2 } from 'lucide-react'
import { fmt } from '../../utils/index'

const STATUS_STYLES = {
  ready:      { color: '#059669', bg: 'rgba(5,150,105,0.08)',  border: 'rgba(5,150,105,0.20)',  label: '● Ready'      },
  pending:    { color: '#d97706', bg: 'rgba(217,119,6,0.08)',  border: 'rgba(217,119,6,0.20)',  label: '◌ Pending'    },
  generating: { color: '#0284c7', bg: 'rgba(2,132,199,0.08)',  border: 'rgba(2,132,199,0.20)',  label: '⟳ Generating' },
  error:      { color: '#dc2626', bg: 'rgba(220,38,38,0.08)',  border: 'rgba(220,38,38,0.20)',  label: '✕ Error'      },
}

const SOURCE_LABELS = {
  bookings:      '📅 Bookings',
  memory:        '🧠 Memory',
  conversations: '💬 Conversations',
  profile:       '👤 Profile',
}

export default function TwinMetadataCard({ metadata = {} }) {
  const status      = metadata.generationStatus || 'pending'
  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.pending
  const sources     = metadata.dataSourcesUsed || []

  return (
    <div className="mp-card" style={{ padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Settings2 style={{ width: 13, height: 13, color: 'var(--mp-text-muted)' }} />
        <span className="mp-label" style={{ color: 'var(--mp-text-muted)' }}>Pipeline Metadata</span>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{
          fontSize: 10,
          fontWeight: 600,
          padding: '2px 9px',
          borderRadius: 20,
          color: statusStyle.color,
          background: statusStyle.bg,
          border: `0.5px solid ${statusStyle.border}`,
        }}>
          {statusStyle.label}
        </span>

        {metadata.lastGeneratedAt && (
          <span style={{ fontSize: 11, color: 'var(--mp-text-muted)' }}>
            Generated {fmt.ago(metadata.lastGeneratedAt)}
          </span>
        )}

        {sources.length > 0 && (
          <span style={{ fontSize: 11, color: 'var(--mp-text-muted)' }}>
            · Sources: {sources.map(s => SOURCE_LABELS[s] || s).join(', ')}
          </span>
        )}
      </div>

      {metadata.generationError && (
        <p style={{ fontSize: 11, color: '#dc2626', marginTop: 8 }}>
          Error: {metadata.generationError}
        </p>
      )}
    </div>
  )
}
