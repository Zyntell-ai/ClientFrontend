import React from 'react'
import { Settings2 } from 'lucide-react'
import { fmt } from '../../utils/index'
import { format, parseISO } from 'date-fns'

const STATUS_STYLES = {
  ready:      { color: '#059669', bg: 'rgba(5,150,105,0.08)',  border: 'rgba(5,150,105,0.20)',  label: '● Ready'      },
  pending:    { color: '#d97706', bg: 'rgba(217,119,6,0.08)',  border: 'rgba(217,119,6,0.20)',  label: '◌ Pending'    },
  generating: { color: '#0284c7', bg: 'rgba(2,132,199,0.08)',  border: 'rgba(2,132,199,0.20)',  label: '⟳ Generating' },
  error:      { color: '#dc2626', bg: 'rgba(220,38,38,0.08)',  border: 'rgba(220,38,38,0.20)',  label: '✕ Error'      },
}

const SOURCE_LABELS = {
  businessTwin:  '🧠 Business Twin',
  bookings:      '📅 Bookings',
  customers:     '👥 Customers',
  leads:         '🎯 Leads',
  conversations: '💬 Conversations',
}

function fmtDate(dateStr) {
  if (!dateStr) return '—'
  try {
    return format(parseISO(dateStr), 'dd MMM yyyy')
  } catch {
    return dateStr
  }
}

export default function ReportMetadataCard({ metadata = {}, reportDate, reportVersion }) {
  const status      = metadata.generationStatus || 'pending'
  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.pending
  const sources     = metadata.dataSourcesUsed || []

  return (
    <div className="mp-card" style={{ padding: '12px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <Settings2 style={{ width: 13, height: 13, color: 'var(--mp-text-muted)' }} />
        <span className="mp-label" style={{ color: 'var(--mp-text-muted)' }}>Report Metadata</span>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Status badge */}
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

        {/* Report date */}
        {reportDate && (
          <span style={{ fontSize: 11, color: 'var(--mp-text-muted)' }}>
            Report date: <strong style={{ color: 'var(--mp-text)' }}>{fmtDate(reportDate)}</strong>
          </span>
        )}

        {/* Version */}
        {(metadata.reportVersion || reportVersion) && (
          <span style={{ fontSize: 11, color: 'var(--mp-text-muted)' }}>
            · v{metadata.reportVersion ?? reportVersion}
          </span>
        )}

        {/* Source */}
        {metadata.generationSource && (
          <span style={{ fontSize: 11, color: 'var(--mp-text-muted)' }}>
            · via {metadata.generationSource}
          </span>
        )}

        {/* Last generated */}
        {metadata.lastGeneratedAt && (
          <span style={{ fontSize: 11, color: 'var(--mp-text-muted)' }}>
            · generated {fmt.ago(metadata.lastGeneratedAt)}
          </span>
        )}

        {/* Last refresh */}
        {metadata.lastRefreshAt && metadata.lastRefreshAt !== metadata.lastGeneratedAt && (
          <span style={{ fontSize: 11, color: 'var(--mp-text-muted)' }}>
            · refreshed {fmt.ago(metadata.lastRefreshAt)}
          </span>
        )}

        {/* Data sources */}
        {sources.length > 0 && (
          <span style={{ fontSize: 11, color: 'var(--mp-text-muted)' }}>
            · {sources.map((s) => SOURCE_LABELS[s] || s).join(', ')}
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
