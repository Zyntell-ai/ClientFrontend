import React from 'react'
import { UserCheck } from 'lucide-react'

function GrowthChip({ value }) {
  if (value == null) return <span style={{ fontSize: 12, color: 'var(--mp-text-muted)' }}>—</span>
  const pct   = (value * 100).toFixed(1)
  const isPos = value >= 0
  return (
    <span style={{
      fontSize: 10,
      fontWeight: 600,
      padding: '2px 8px',
      borderRadius: 20,
      background: isPos ? 'rgba(5,150,105,0.08)' : 'rgba(220,38,38,0.08)',
      color:      isPos ? '#059669'               : '#dc2626',
    }}>
      {isPos ? '+' : ''}{pct}%
    </span>
  )
}

function KpiTile({ label, value }) {
  return (
    <div style={{ padding: '10px 12px', background: 'var(--mp-a05)', borderRadius: 8 }}>
      <p style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--mp-text-muted)', marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--mp-text)' }}>{value ?? '—'}</p>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '6px 0',
    }}>
      <span style={{ fontSize: 12, color: 'var(--mp-text-muted)' }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--mp-text)' }}>{value ?? '—'}</span>
    </div>
  )
}

const fmtRate = (r) => r != null ? (r * 100).toFixed(1) + '%' : null

export default function CustomersCard({ customers = {} }) {
  return (
    <div className="mp-card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <UserCheck style={{ width: 14, height: 14, color: 'var(--mp-accent)' }} />
        <span className="mp-label">Customers</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', marginBottom: 12 }}>
        <KpiTile label="Total"     value={customers.totalCustomers} />
        <KpiTile label="Active"    value={customers.activeCustomers} />
        <KpiTile label="Returning" value={customers.returningCustomers} />
        <KpiTile label="Retention" value={fmtRate(customers.retentionRate)} />
      </div>

      <div style={{ borderTop: '0.5px solid var(--mp-card-border)', paddingTop: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
          <span style={{ fontSize: 12, color: 'var(--mp-text-muted)' }}>New This Month</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--mp-text)' }}>
              {customers.newCustomersCurrentMonth ?? '—'}
            </span>
            <GrowthChip value={customers.customerGrowthMoM} />
          </div>
        </div>
        <InfoRow label="New Last Month"       value={customers.newCustomersLastMonth} />
        <InfoRow label="Avg Visits / Customer" value={customers.averageVisitsPerCustomer != null ? customers.averageVisitsPerCustomer.toFixed(1) : null} />
      </div>
    </div>
  )
}
