import React from 'react'

function fmtDate(val) {
  if (!val) return '—'
  try {
    const d = val._seconds ? new Date(val._seconds * 1000) : new Date(val)
    if (isNaN(d.getTime())) return '—'
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return '—'
  }
}

export default function VisitStatisticsCard({ metadata = {} }) {
  const stats = [
    { label: 'Total Visits', value: (metadata.totalVisits > 0) ? metadata.totalVisits : '—' },
    { label: 'Last Visit', value: fmtDate(metadata.lastVisitDate) },
    { label: 'Last Service', value: metadata.lastServiceName || '—' },
    { label: 'Last Staff', value: metadata.lastStaffName || '—' },
  ]

  return (
    <div className="mp-card" style={{ padding: '16px' }}>
      <p className="mp-label" style={{ marginBottom: '12px' }}>Visit History</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {stats.map(({ label, value }) => (
          <div
            key={label}
            style={{ background: 'var(--mp-a05)', borderRadius: '8px', padding: '10px 12px' }}
          >
            <p style={{
              fontSize: '10px',
              color: 'var(--mp-text-muted)',
              marginBottom: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              fontWeight: 600,
            }}>
              {label}
            </p>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--mp-text)' }}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
