import React from 'react'
import { Users } from 'lucide-react'

const AwaitingAI = () => (
  <span style={{
    fontSize: 10,
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: 20,
    background: 'rgba(217,119,6,0.08)',
    color: '#d97706',
  }}>
    Awaiting AI
  </span>
)

function KpiTile({ label, value }) {
  return (
    <div style={{ padding: '10px 12px', background: 'var(--mp-a05)', borderRadius: 8 }}>
      <p style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--mp-text-muted)', marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--mp-text)' }}>{value ?? '—'}</p>
    </div>
  )
}

function InfoRow({ label, value, isAi = false }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '6px 0',
    }}>
      <span style={{ fontSize: 12, color: 'var(--mp-text-muted)' }}>{label}</span>
      {isAi ? <AwaitingAI /> : <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--mp-text)' }}>{value ?? '—'}</span>}
    </div>
  )
}

export default function StaffCard({ staff = {} }) {
  return (
    <div className="mp-card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Users style={{ width: 14, height: 14, color: 'var(--mp-accent)' }} />
        <span className="mp-label">Staff</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: 12 }}>
        <KpiTile label="Total Staff"  value={staff.totalStaff} />
        <KpiTile label="Active (30d)" value={staff.activeStaff} />
      </div>

      <div style={{ borderTop: '0.5px solid var(--mp-card-border)', paddingTop: 10 }}>
        <InfoRow
          label="Avg Appts / Staff"
          value={staff.averageAppointmentsPerStaff != null ? staff.averageAppointmentsPerStaff.toFixed(1) : null}
        />
        <InfoRow
          label="Top Performer"
          value={staff.topPerformerName}
        />
        <InfoRow label="Avg Utilization" isAi />
      </div>
    </div>
  )
}
