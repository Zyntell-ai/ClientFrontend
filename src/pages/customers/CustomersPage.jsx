/**
 * @file        CustomersPage.jsx
 * @module      Customers
 * @project     ClientFrontend
 * @layer       Page
 * @description Lists all bot-acquired customers with name/phone search, and a detail modal showing booking history and a re-engagement message trigger.
 *
 * @updated     2026-05-29
 * @version     1.0.0
 *
 * @dependencies
 *   - React, useState
 *   - @tanstack/react-query (useQuery, useMutation, useQueryClient)
 *   - customersApi
 *   - DashboardLayout
 *   - UI components: Button, Modal, EmptyState, Spinner, Avatar, Table, Badge
 *   - utils: fmt
 *   - lucide-react icons (MessageSquare, Phone)
 *   - react-hot-toast
 *
 * @sideEffects
 *   - GET /api/customers — fetches the full customer list
 *   - GET /api/customers/:id — fetches a single customer's detail and booking history (triggered on modal open)
 *   - POST /api/customers/:id/reengage — sends a re-engagement WhatsApp message to the customer
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
// src/pages/customers/CustomersPage.jsx
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customersApi } from '../../api/index'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Button, Modal, EmptyState, Spinner, Avatar, Table, Badge } from '../../components/ui/index'
import { fmt } from '../../utils/index'
import { MessageSquare, Phone } from 'lucide-react'
import toast from 'react-hot-toast'

// ─────────────────────────────────────────
// CORE LOGIC / HANDLER FUNCTIONS
// ─────────────────────────────────────────

/**
 * @function    CustomerDetail
 * @purpose     Modal showing a customer's profile, stat grid, booking history, and a re-engagement send button
 * @param  {{ customer: object|null, open: boolean, onClose: Function }} props
 * @returns {JSX.Element|null}
 */
function CustomerDetail({ customer, open, onClose }) {
  const qc = useQueryClient()
  // [API CALL]: Lazily fetches full customer detail + booking history only when the modal is open
  const { data: detail } = useQuery({
    queryKey: ['customer', customer?.id],
    queryFn: () => customersApi.get(customer.id),
    select: r => r.data,
    enabled: !!customer?.id && open,
  })

  // [API CALL]: POST re-engagement message to the customer via WhatsApp
  const reengageMutation = useMutation({
    mutationFn: (id) => customersApi.reengage(id),
    onSuccess: () => toast.success('Re-engagement message sent!'),
    onError: () => toast.error('Failed to send message'),
  })

  // [GUARD]: Render nothing if no customer is selected
  if (!customer) return null
  // [DATA TRANSFORM]: Fall back to list-level customer data while detail is loading
  const cust = detail?.customer || customer

  return (
    <Modal open={open} onClose={onClose} title="Customer Details">
      <div className="space-y-4">
        {/* Customer identity header */}
        <div className="flex items-center gap-3 pb-4 border-b border-navy-400/30">
          <Avatar name={cust.name} size="lg" />
          <div>
            <p className="font-display font-semibold text-slate-100 text-lg">{cust.name}</p>
            <p className="text-sm text-slate-500">{cust.phone}</p>
          </div>
        </div>

        {/* Stat grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Total Bookings', value: detail?.bookings?.length || '—' },
            { label: 'Last Visit', value: fmt.ago(cust.lastBookingAt) },
            { label: 'Customer Since', value: fmt.date(cust.createdAt) },
            { label: 'Status', value: cust.isActive ? <Badge color="green">Active</Badge> : <Badge color="slate">Inactive</Badge> },
          ].map(({ label, value }) => (
            <div key={label} className="bg-navy-700/40 rounded-lg p-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">{label}</p>
              <div className="text-sm font-medium text-slate-200">{value}</div>
            </div>
          ))}
        </div>

        {/* Booking history — up to 5 most recent */}
        {detail?.bookings?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Booking History</p>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {detail.bookings.slice(0, 5).map(b => (
                <div key={b.id} className="flex items-center justify-between px-3 py-2 bg-navy-700/30 rounded-lg text-xs">
                  <span className="text-slate-400">{b.serviceName}</span>
                  <span className="text-slate-600">{fmt.date(b.scheduledAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* [API CALL]: Re-engagement action button */}
        <Button className="w-full" onClick={() => reengageMutation.mutate(customer.id)} loading={reengageMutation.isPending}>
          <MessageSquare className="w-4 h-4" /> Send Re-engagement Message
        </Button>
      </div>
    </Modal>
  )
}

// ─────────────────────────────────────────
// STATE & HOOKS
// ─────────────────────────────────────────

// ─────────────────────────────────────────
// RENDER
// ─────────────────────────────────────────

/**
 * @function    CustomersPage
 * @purpose     Main customers page — renders a searchable customer table and opens a detail modal on row click
 * @returns {JSX.Element}
 */
export default function CustomersPage() {
  // [STATE]: Currently selected customer for the detail modal
  const [selected, setSelected] = useState(null)
  // [STATE]: Search query string for filtering by name or phone
  const [search, setSearch] = useState('')

  // [API CALL]: Fetches the full customer list
  const { data, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersApi.list(),
    select: r => r.data.customers,
  })

  // [DATA TRANSFORM]: Client-side filter by name or phone substring
  const customers = (data || []).filter(c =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search)
  )

  return (
    <DashboardLayout title="Customers" subtitle="All your bot's customers">
      {/* [UI]: Search bar — filters the customer table client-side */}
      <div className="flex justify-end mb-5">
        <input className="input-field text-xs py-2 w-56" placeholder="Search by name or phone..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="glass-card overflow-hidden">
        <Table headers={['Customer', 'Phone', 'Bookings', 'Last Visit', 'Actions']} loading={isLoading} empty="No customers yet">
          {customers.map((c) => (
            <tr key={c.id} className="table-row cursor-pointer" onClick={() => setSelected(c)}>
              <td className="table-cell"><div className="flex items-center gap-2.5"><Avatar name={c.name} size="sm" /><span className="font-medium text-slate-200">{c.name}</span></div></td>
              <td className="table-cell text-slate-400">{c.phone || '—'}</td>
              <td className="table-cell text-slate-400">{c.totalBookings || 0}</td>
              <td className="table-cell text-slate-500">{fmt.ago(c.lastBookingAt)}</td>
              <td className="table-cell"><Button variant="ghost" size="sm">View</Button></td>
            </tr>
          ))}
        </Table>
        {/* [UI]: Empty state shown when no customers match the current search or the list is empty */}
        {!isLoading && customers.length === 0 && (
          <EmptyState icon="👥" title="No customers yet" description="Customers appear here after they interact with your bot" />
        )}
      </div>

      <CustomerDetail customer={selected} open={!!selected} onClose={() => setSelected(null)} />
    </DashboardLayout>
  )
}
