import React from 'react'
import { TrendingUp } from 'lucide-react'
import { fmt } from '../../utils/index'

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

function GrowthChip({ value }) {
  if (value == null) return <AwaitingAI />
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
      {isPos ? '+' : ''}{pct}% MoM
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

export default function RevenueCard({ revenue = {} }) {
  return (
    <div className="mp-card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp style={{ width: 14, height: 14, color: 'var(--mp-accent)' }} />
          <span className="mp-label">Revenue</span>
        </div>
        <GrowthChip value={revenue.revenueGrowthMoM} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: 10 }}>
        <KpiTile label="Lifetime"    value={fmt.currency(revenue.lifetimeRevenue)} />
        <KpiTile label="This Month"  value={fmt.currency(revenue.currentMonthRevenue)} />
        <KpiTile label="Last Month"  value={fmt.currency(revenue.lastMonthRevenue)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
        <KpiTile
          label="This Week"
          value={fmt.currency(revenue.currentWeekRevenue)}
        />
        <KpiTile
          label="Avg Ticket"
          value={revenue.averageTicketSize != null ? fmt.currency(revenue.averageTicketSize) : null}
        />
        <KpiTile
          label="Per Customer"
          value={revenue.averageRevenuePerCustomer != null ? fmt.currency(revenue.averageRevenuePerCustomer) : null}
        />
      </div>

      {revenue.peakRevenueMonth && (
        <div style={{
          marginTop: 12,
          paddingTop: 12,
          borderTop: '0.5px solid var(--mp-card-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: 12, color: 'var(--mp-text-muted)' }}>Peak Revenue Month</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--mp-text)' }}>{revenue.peakRevenueMonth}</span>
        </div>
      )}
    </div>
  )
}
