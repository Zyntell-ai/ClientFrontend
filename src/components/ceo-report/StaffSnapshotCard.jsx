import React from 'react'
import { Users } from 'lucide-react'

function KpiTile({ label, value }) {
  return (
    <div style={{ padding: '10px 12px', background: 'var(--mp-a05)', borderRadius: 8 }}>
      <p style={{
        fontSize: 9,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        color: 'var(--mp-text-muted)',
        marginBottom: 4,
      }}>
        {label}
      </p>
      <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--mp-text)' }}>{value ?? '—'}</p>
    </div>
  )
}

function InfoRow({ label, value, last }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '6px 0',
      borderBottom: last ? 'none' : '0.5px solid var(--mp-card-border)',
    }}>
      <span style={{ fontSize: 12, color: 'var(--mp-text-muted)' }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--mp-text)' }}>{value ?? '—'}</span>
    </div>
  )
}

export default function StaffSnapshotCard({ staff = {} }) {
  return (
    <div className="mp-card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Users style={{ width: 14, height: 14, color: 'var(--mp-accent)' }} />
        <span className="mp-label">Staff</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: 12 }}>
        <KpiTile label="Active Staff" value={staff.activeStaff} />
        <KpiTile label="Total Staff"  value={staff.totalStaff} />
      </div>

      <div style={{ borderTop: '0.5px solid var(--mp-card-border)', paddingTop: 10 }}>
        <InfoRow label="Top Performer (Yesterday)" value={staff.topPerformerName} />
        <InfoRow label="Appointments Handled"      value={staff.appointmentsHandled} last />
      </div>
    </div>
  )
}
