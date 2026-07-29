import React from 'react'
import { TrendingUp } from 'lucide-react'
import { fmt } from '../../utils/index'

function DeltaChip({ value }) {
  if (value == null) return <span style={{ fontSize: 11, color: 'var(--mp-text-muted)' }}>—</span>
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
      {isPos ? '+' : ''}{value.toFixed(1)}%
    </span>
  )
}

function KpiTile({ label, value, sub }) {
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
      <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--mp-text)', marginBottom: sub ? 4 : 0 }}>
        {value ?? '—'}
      </p>
      {sub && <div>{sub}</div>}
    </div>
  )
}

export default function RevenueSnapshotCard({ revenue = {}, facts = {} }) {
  const delta = revenue.revenueDeltaVsYesterday ?? facts.revenueDeltaVsYesterday

  return (
    <div className="mp-card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <TrendingUp style={{ width: 14, height: 14, color: 'var(--mp-accent)' }} />
        <span className="mp-label">Revenue</span>
      </div>

      {/* Top row: Yesterday (highlight) + delta */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: 10 }}>
        <KpiTile
          label="Yesterday"
          value={fmt.currency(revenue.yesterdayRevenue)}
          sub={<DeltaChip value={delta} />}
        />
        <KpiTile label="This Week"  value={fmt.currency(revenue.weeklyRevenue)} />
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <KpiTile label="This Month" value={fmt.currency(revenue.monthlyRevenue)} />
        <KpiTile
          label="Avg Ticket"
          value={revenue.averageTicketSize != null ? fmt.currency(revenue.averageTicketSize) : null}
        />
      </div>

      {revenue.currency && (
        <p style={{ fontSize: 10, color: 'var(--mp-text-muted)', marginTop: 10 }}>
          All amounts in {revenue.currency}
        </p>
      )}
    </div>
  )
}
