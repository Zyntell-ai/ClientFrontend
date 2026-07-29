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

function MetaRow({ label, value }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '7px 0',
      borderBottom: '0.5px solid var(--mp-card-border)',
    }}>
      <span style={{ fontSize: '12px', color: 'var(--mp-text-muted)' }}>{label}</span>
      <span style={{ fontSize: '12px', color: 'var(--mp-text)', fontWeight: 500 }}>{value}</span>
    </div>
  )
}

export default function MemoryMetadataCard({ memory }) {
  if (!memory) return null
  return (
    <div className="mp-card" style={{ padding: '16px' }}>
      <p className="mp-label" style={{ marginBottom: '10px' }}>Record Info</p>
      <MetaRow label="Customer Phone" value={memory.customerPhone || '—'} />
      <MetaRow label="Memory Created" value={fmtDate(memory.createdAt)} />
      <MetaRow label="Last Updated" value={fmtDate(memory.updatedAt)} />
      <MetaRow label="Schema Version" value={memory.metadata?.version || '1'} />
    </div>
  )
}
