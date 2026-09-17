/**
 * @file        CommissionsPage.jsx
 * @module      Commissions
 * @project     ClientFrontend
 * @layer       Page
 * @description Displays a summary of Zyntell-earned commissions (booking, show-up, lead, base fee) with a
 *              booking-confirmation snapshot, a monthly commission trend chart, and a paginated ledger table.
 *
 * @updated     2026-09-17
 * @version     2.0.0
 *
 * @dependencies
 *   - React
 *   - @tanstack/react-query (useQuery)
 *   - commissionsApi
 *   - DashboardLayout
 *   - UI components: StatCard, Badge, Table, EmptyState
 *   - chart.js / react-chartjs-2 — monthly commission trend bar chart
 *   - utils: fmt, toDate
 *   - lucide-react icons
 *
 * @sideEffects
 *   - GET /api/commissions/summary — fetches aggregated commission totals for the current month
 *   - GET /api/commissions — fetches the full commission ledger list (used for both the table and the trend chart)
 */

// ─────────────────────────────────────────
// IMPORTS & DEPENDENCIES
// ─────────────────────────────────────────
import React, { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { commissionsApi } from '../../api/index'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { StatCard, Badge, Table, EmptyState } from '../../components/ui/index'
import { fmt, toDate } from '../../utils/index'
import { DollarSign, TrendingUp, CalendarCheck, Wallet } from 'lucide-react'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

// ─────────────────────────────────────────
// CONSTANTS & CONFIG
// ─────────────────────────────────────────

// [UI]: Status badge color keyed by commission status — matches the palette used across Bookings/Leads
const STATUS_BADGE = {
  CONFIRMED: 'green',
  PENDING:   'amber',
  CANCELLED: 'red',
}

// [UI]: Type badge color keyed by commission type
const TYPE_BADGE = {
  BOOKING: 'blue',
  SHOWUP:  'green',
  LEAD:    'purple',
}

// ─────────────────────────────────────────
// CORE LOGIC / HANDLER FUNCTIONS
// ─────────────────────────────────────────

/**
 * @function    buildMonthlyTrend
 * @purpose     Groups the commission ledger into the last 6 calendar months and sums CONFIRMED/PENDING
 *              amounts per month, producing the data series for the trend chart.
 * @param  {Array} commissions - Raw commission records from GET /api/commissions
 * @returns {{ labels: string[], values: number[] }}
 */
function buildMonthlyTrend(commissions) {
  const now = new Date()
  const buckets = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    buckets.push({ key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: d.toLocaleDateString('en-IN', { month: 'short' }), total: 0 })
  }
  const byKey = Object.fromEntries(buckets.map(b => [b.key, b]))
  for (const c of commissions) {
    if (c.status !== 'CONFIRMED' && c.status !== 'PENDING') continue
    const created = toDate(c.createdAt)
    if (!created) continue
    const key = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, '0')}`
    if (byKey[key]) byKey[key].total += c.amount || 0
  }
  return { labels: buckets.map(b => b.label), values: buckets.map(b => b.total) }
}

// ─────────────────────────────────────────
// RENDER
// ─────────────────────────────────────────

/**
 * @function    CommissionsPage
 * @purpose     Main commissions page — renders stat cards for this month's earnings, a 6-month trend chart,
 *              and the full commission ledger table
 * @returns {JSX.Element}
 */
export default function CommissionsPage() {
  // [API CALL]: Fetches aggregated commission summary (this month's totals + booking confirmation rate)
  const { data: summary } = useQuery({ queryKey: ['commission-summary'], queryFn: commissionsApi.summary, select: r => r.data })
  // [API CALL]: Fetches the full list of individual commission records
  const { data: list, isLoading } = useQuery({ queryKey: ['commissions'], queryFn: commissionsApi.list, select: r => r.data.commissions })

  const commissions = list || []
  const trend = useMemo(() => buildMonthlyTrend(commissions), [commissions])

  const chartData = {
    labels: trend.labels,
    datasets: [{
      label: 'Commission earned',
      data: trend.values,
      backgroundColor: '#7C3AED',
      borderRadius: 6,
      maxBarThickness: 36,
    }],
  }
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: { callbacks: { label: (ctx) => fmt.currency(ctx.parsed.y) } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: 'var(--mp-text)', font: { size: 11 } } },
      y: { grid: { color: 'rgba(124,58,237,0.08)' }, ticks: { color: 'var(--mp-text)', font: { size: 10 }, callback: (v) => `₹${v}` } },
    },
  }

  return (
    <DashboardLayout title="Commissions" subtitle="Track your earnings from Zyntell">
      {/* [UI]: Summary stat cards row — field names match the real /api/commissions/summary response shape */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <StatCard
          icon={<Wallet className="w-5 h-5" />}
          label="Total This Month"
          value={fmt.currency(summary?.total)}
          sub={summary?.month}
        />
        <StatCard
          icon={<DollarSign className="w-5 h-5" />}
          label="Booking Commissions"
          value={fmt.currency(summary?.bookingCommissions)}
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Showup Commissions"
          value={fmt.currency(summary?.showupCommissions)}
        />
        <StatCard
          icon={<CalendarCheck className="w-5 h-5" />}
          label="Bookings Confirmed"
          value={summary?.totalBookings != null ? `${summary.confirmedBookings}/${summary.totalBookings}` : '—'}
          sub={summary?.confirmationRate != null ? `${summary.confirmationRate}% confirmation rate` : undefined}
        />
      </div>

      {/* [UI]: 6-month commission trend chart */}
      <div className="mp-card p-5 mb-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="mp-rule-bold" style={{ width: 16 }} />
          <p className="mp-label">Commission trend — last 6 months</p>
        </div>
        <div style={{ height: 220 }}>
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* [UI]: Commission ledger table */}
      <div className="mp-card overflow-hidden">
        <Table headers={['Type', 'Amount', 'Booking', 'Status', 'Date']} loading={isLoading} empty="No commissions yet">
          {commissions.map((c) => (
            <tr key={c.id} className="mp-tr">
              <td className="mp-td">
                <Badge color={TYPE_BADGE[c.type] || 'slate'}>{c.type}</Badge>
              </td>
              <td className="mp-td font-semibold" style={{ color: '#059669' }}>{fmt.currency(c.amount)}</td>
              <td className="mp-td text-xs" style={{ opacity: 0.55 }}>{c.bookingId || '—'}</td>
              <td className="mp-td">
                <Badge color={STATUS_BADGE[c.status] || 'slate'}>{c.status}</Badge>
              </td>
              <td className="mp-td" style={{ opacity: 0.5 }}>{fmt.date(c.createdAt)}</td>
            </tr>
          ))}
        </Table>
        {/* [UI]: Empty state rendered below the table shell when the list is empty */}
        {!isLoading && commissions.length === 0 && (
          <EmptyState icon="💰" title="No commissions yet" description="Commissions are earned when customers book and show up" />
        )}
      </div>
    </DashboardLayout>
  )
}
