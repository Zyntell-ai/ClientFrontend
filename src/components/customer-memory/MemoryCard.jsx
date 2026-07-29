import React from 'react'

const CATEGORY_STYLES = {
  preference: { background: 'rgba(124,58,237,0.08)', color: '#7C3AED' },
  condition:  { background: 'rgba(220,38,38,0.08)',  color: '#DC2626' },
  history:    { background: 'rgba(37,99,235,0.08)',  color: '#2563EB' },
  note:       { background: 'rgba(234,179,8,0.10)',  color: '#92400E' },
  insight:    { background: 'rgba(5,150,105,0.08)',  color: '#059669' },
}

const IMPORTANCE_STYLES = {
  high:   { background: 'rgba(220,38,38,0.08)',   color: '#DC2626' },
  medium: { background: 'rgba(234,179,8,0.08)',   color: '#92400E' },
  low:    { background: 'rgba(100,116,139,0.10)', color: '#64748B' },
}

function fmtDate(val) {
  if (!val) return null
  try {
    const d = new Date(val)
    if (isNaN(d.getTime())) return null
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return null
  }
}

function Chip({ label, style }) {
  return (
    <span style={{
      fontSize: '10px',
      fontWeight: 600,
      padding: '2px 8px',
      borderRadius: '20px',
      letterSpacing: '0.04em',
      textTransform: 'capitalize',
      ...style,
    }}>
      {label}
    </span>
  )
}

export default function MemoryCard({ item }) {
  const catStyle = CATEGORY_STYLES[item.category] || CATEGORY_STYLES.note
  const impStyle = IMPORTANCE_STYLES[item.importance] || IMPORTANCE_STYLES.medium
  const createdStr  = fmtDate(item.createdAt)
  const updatedStr  = fmtDate(item.updatedAt)
  const expiresStr  = fmtDate(item.expiresAt)
  const wasVerified = item.updatedAt && item.updatedAt !== item.createdAt

  return (
    <div className="mp-card" style={{ padding: '14px 16px' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <Chip label={item.category} style={catStyle} />
        <Chip label={item.importance} style={impStyle} />
        <span style={{ fontSize: '10px', color: 'var(--mp-text-muted)', marginLeft: 'auto' }}>
          {item.source}
          {item.confidence < 1 ? ` · ${Math.round(item.confidence * 100)}%` : ''}
        </span>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--mp-text)', lineHeight: 1.55 }}>{item.text}</p>
      {(createdStr || expiresStr) && (
        <p style={{ fontSize: '11px', color: 'var(--mp-text-muted)', marginTop: '8px' }}>
          {wasVerified ? `Last verified ${updatedStr}` : createdStr}
          {expiresStr ? ` · expires ${expiresStr}` : ''}
        </p>
      )}
    </div>
  )
}
