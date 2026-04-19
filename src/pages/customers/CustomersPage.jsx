// src/pages/customers/CustomersPage.jsx
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customersApi } from '../../api/index'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Button, Modal, EmptyState, Spinner, Avatar, Table, Badge } from '../../components/ui/index'
import { fmt } from '../../utils/index'
import { MessageSquare, Phone } from 'lucide-react'
import toast from 'react-hot-toast'

function CustomerDetail({ customer, open, onClose }) {
  const qc = useQueryClient()
  const { data: detail } = useQuery({
    queryKey: ['customer', customer?.id],
    queryFn: () => customersApi.get(customer.id),
    select: r => r.data,
    enabled: !!customer?.id && open,
  })

  const reengageMutation = useMutation({
    mutationFn: (id) => customersApi.reengage(id),
    onSuccess: () => toast.success('Re-engagement message sent!'),
    onError: () => toast.error('Failed to send message'),
  })

  if (!customer) return null
  const cust = detail?.customer || customer

  return (
    <Modal open={open} onClose={onClose} title="Customer Details">
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-navy-400/30">
          <Avatar name={cust.name} size="lg" />
          <div>
            <p className="font-display font-semibold text-slate-100 text-lg">{cust.name}</p>
            <p className="text-sm text-slate-500">{cust.phone}</p>
          </div>
        </div>
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
        <Button className="w-full" onClick={() => reengageMutation.mutate(customer.id)} loading={reengageMutation.isPending}>
          <MessageSquare className="w-4 h-4" /> Send Re-engagement Message
        </Button>
      </div>
    </Modal>
  )
}

export default function CustomersPage() {
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersApi.list(),
    select: r => r.data.customers,
  })

  const customers = (data || []).filter(c =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search)
  )

  return (
    <DashboardLayout title="Customers" subtitle="All your bot's customers">
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
        {!isLoading && customers.length === 0 && (
          <EmptyState icon="👥" title="No customers yet" description="Customers appear here after they interact with your bot" />
        )}
      </div>

      <CustomerDetail customer={selected} open={!!selected} onClose={() => setSelected(null)} />
    </DashboardLayout>
  )
}
