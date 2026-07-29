import React from 'react'
import { UserCheck } from 'lucide-react'

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

const fmtRate = (r) => r != null ? (r * 100).toFixed(1) + '%' : null

export default function CustomerSnapshotCard({ customers = {}, facts = {} }) {
  const uniqueYday = customers.uniqueCustomersYesterday ?? facts.uniqueCustomersYesterday

  return (
    <div className="mp-card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <UserCheck style={{ width: 14, height: 14, color: 'var(--mp-accent)' }} />
        <span className="mp-label">Customers</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: 12 }}>
        <KpiTile label="Yesterday"   value={uniqueYday} />
        <KpiTile label="Returning"   value={customers.returningCustomers} />
        <KpiTile label="Active (90d)" value={customers.activeCustomers} />
      </div>

      <div style={{ borderTop: '0.5px solid var(--mp-card-border)', paddingTop: 10 }}>
        <InfoRow label="New This Month" value={customers.newCustomersThisMonth} />
        <InfoRow label="Retention Rate" value={fmtRate(customers.retentionRate)} last />
      </div>
    </div>
  )
}
