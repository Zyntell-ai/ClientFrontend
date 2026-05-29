/**
 * @file        CommissionsPage.jsx
 * @module      Commissions
 * @project     ClientFrontend
 * @layer       Page
 * @description Displays a summary of Zyntell-earned commissions (booking, show-up, total) with a paginated commission ledger table.
 *
 * @updated     2026-05-29
 * @version     1.0.0
 *
 * @dependencies
 *   - React
 *   - @tanstack/react-query (useQuery)
 *   - commissionsApi
 *   - DashboardLayout
 *   - UI components: Card, StatCard, Badge, Table, EmptyState
 *   - utils: fmt
 *   - lucide-react icons
 *   - clsx
 *
 * @sideEffects
 *   - GET /api/commissions/summary — fetches aggregated commission totals
 *   - GET /api/commissions — fetches the full commission ledger list
 */

/*
 * ╔══════════════════════════════════════════╗
 * ║           SDLC LIFECYCLE STATUS          ║
 * ╠══════════════════════════════════════════╣
 * ║ Planning     : ✅ Complete               ║
 * ║ Design       : ✅ Complete               ║
 * ║ Development  : ✅ Complete               ║
 * ║ Testing      : ⚠️  Partial              ║
 * ║ Deployment   : ✅ Complete               ║
 * ║ Maintenance  : 🔄 Active                ║
 * ╚══════════════════════════════════════════╝
 */

// ─────────────────────────────────────────
// IMPORTS & DEPENDENCIES
// ─────────────────────────────────────────
// src/pages/commissions/CommissionsPage.jsx
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { commissionsApi } from '../../api/index'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Card, StatCard, Badge, Table, EmptyState } from '../../components/ui/index'
import { fmt } from '../../utils/index'
import { DollarSign, TrendingUp, CheckCircle2 } from 'lucide-react'
import clsx from 'clsx'

// ─────────────────────────────────────────
// CONSTANTS & CONFIG
// ─────────────────────────────────────────

// [UI]: Tailwind colour classes keyed by commission type
const TYPE_COLORS = {
  BOOKING: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  SHOWUP: 'bg-green-500/15 text-green-400 border-green-500/25',
  LEAD: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
}

// [UI]: Tailwind colour classes keyed by commission status
const STATUS_COLORS = {
  CONFIRMED: 'bg-green-500/15 text-green-400 border-green-500/25',
  PENDING: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  CANCELLED: 'bg-red-500/15 text-red-400 border-red-500/25',
}

// ─────────────────────────────────────────
// STATE & HOOKS
// ─────────────────────────────────────────

// ─────────────────────────────────────────
// CORE LOGIC / HANDLER FUNCTIONS
// ─────────────────────────────────────────

// ─────────────────────────────────────────
// RENDER
// ─────────────────────────────────────────

/**
 * @function    CommissionsPage
 * @purpose     Main commissions page — renders stat cards for booking/show-up/total earnings and a full commission ledger table
 * @returns {JSX.Element}
 */
export default function CommissionsPage() {
  // [API CALL]: Fetches aggregated commission summary (booking total, show-up total, grand total)
  const { data: summary } = useQuery({ queryKey: ['commission-summary'], queryFn: commissionsApi.summary, select: r => r.data })
  // [API CALL]: Fetches the full list of individual commission records
  const { data: list, isLoading } = useQuery({ queryKey: ['commissions'], queryFn: commissionsApi.list, select: r => r.data.commissions })

  return (
    <DashboardLayout title="Commissions" subtitle="Track your earnings from Zyntell">
      {/* [UI]: Summary stat cards row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard icon={<DollarSign className="w-5 h-5" />} label="Booking Commissions" value={fmt.currency(summary?.bookingTotal)} color="blue" />
        <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Showup Commissions" value={fmt.currency(summary?.showupTotal)} color="green" />
        <StatCard icon={<CheckCircle2 className="w-5 h-5" />} label="Total Confirmed" value={fmt.currency(summary?.grandTotal)} color="amber" />
      </div>

      {/* [UI]: Commission ledger table */}
      <div className="glass-card overflow-hidden">
        <Table headers={['Type', 'Amount', 'Booking', 'Status', 'Date']} loading={isLoading} empty="No commissions yet">
          {(list || []).map((c) => (
            <tr key={c.id} className="table-row">
              <td className="table-cell">
                {/* [DATA TRANSFORM]: Map commission type to colour badge */}
                <span className={clsx('text-xs px-2 py-0.5 rounded-full border font-medium', TYPE_COLORS[c.type] || '')}>{c.type}</span>
              </td>
              <td className="table-cell font-semibold text-green-400">{fmt.currency(c.amount)}</td>
              <td className="table-cell text-slate-400 text-xs">{c.bookingId || '—'}</td>
              <td className="table-cell">
                {/* [DATA TRANSFORM]: Map commission status to colour badge */}
                <span className={clsx('text-xs px-2 py-0.5 rounded-full border font-medium', STATUS_COLORS[c.status] || '')}>{c.status}</span>
              </td>
              <td className="table-cell text-slate-500">{fmt.date(c.createdAt)}</td>
            </tr>
          ))}
        </Table>
        {/* [UI]: Empty state rendered below the table shell when the list is empty */}
        {!isLoading && (!list || list.length === 0) && (
          <EmptyState icon="💰" title="No commissions yet" description="Commissions are earned when customers book and show up" />
        )}
      </div>
    </DashboardLayout>
  )
}
