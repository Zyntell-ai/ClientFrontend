// src/pages/bookings/BookingsPage.jsx
// Maps to GET /api/bookings, PUT /api/bookings/:id/status
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { bookingsApi } from '../../api/index'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Button, Badge, Modal, Input, Select, Tabs, EmptyState, Spinner, Table, Avatar } from '../../components/ui/index'
import { fmt, BOOKING_STATUS_COLORS } from '../../utils/index'
import { Calendar, CheckCircle2, XCircle, KeyRound, LayoutGrid, List } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'NO_SHOW', label: 'No Show' },
]

function StatusBadge({ status }) {
  const cls = BOOKING_STATUS_COLORS[status] || 'text-slate-400 bg-slate-400/10 border-slate-400/20'
  return <span className={clsx('text-xs px-2.5 py-1 rounded-full border font-medium inline-block', cls)}>{status}</span>
}

function BookingDetailModal({ booking, open, onClose }) {
  const qc = useQueryClient()
  const [otpValue, setOtpValue] = useState('')
  const [cancelReason, setCancelReason] = useState('')

  const statusMutation = useMutation({
    mutationFn: ({ id, status, cancelReason }) => bookingsApi.updateStatus(id, { status, cancelReason }),
    onSuccess: () => {
      toast.success('Booking updated')
      qc.invalidateQueries(['bookings'])
      onClose()
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Update failed'),
  })

  const otpMutation = useMutation({
    mutationFn: ({ id, otp }) => bookingsApi.verifyOtp(id, { otp }),
    onSuccess: () => { toast.success('OTP verified! Contact unlocked.'); qc.invalidateQueries(['bookings']); onClose() },
    onError: () => toast.error('Invalid OTP'),
  })

  const attendedMutation = useMutation({
    mutationFn: (id) => bookingsApi.markAttended(id),
    onSuccess: () => { toast.success('Marked as attended'); qc.invalidateQueries(['bookings']); onClose() },
  })

  if (!booking) return null

  return (
    <Modal open={open} onClose={onClose} title="Booking Details" size="lg">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Customer', value: booking.customerName },
            { label: 'Phone', value: booking.contactUnlocked ? booking.customerPhone : '••• ••• ••••' },
            { label: 'Service', value: booking.serviceName },
            { label: 'Staff', value: booking.staffName || 'Any' },
            { label: 'Scheduled', value: fmt.datetime(booking.scheduledAt) },
            { label: 'Status', value: <StatusBadge status={booking.status} /> },
          ].map(({ label, value }) => (
            <div key={label} className="bg-navy-700/40 rounded-lg p-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">{label}</p>
              <div className="text-sm font-medium text-slate-200">{value}</div>
            </div>
          ))}
        </div>

        {/* OTP unlock */}
        {!booking.contactUnlocked && (
          <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
            <p className="text-xs text-blue-400 font-medium mb-2 flex items-center gap-1.5"><KeyRound className="w-3.5 h-3.5" />Unlock customer contact</p>
            <div className="flex gap-2">
              <Input placeholder="4-digit OTP" value={otpValue} onChange={e => setOtpValue(e.target.value)} className="flex-1" maxLength={4} />
              <Button onClick={() => otpMutation.mutate({ id: booking.id, otp: otpValue })} loading={otpMutation.isPending}>Verify</Button>
            </div>
          </div>
        )}

        {/* Actions */}
        {booking.status === 'PENDING' && (
          <div className="flex gap-2.5">
            <Button className="flex-1" onClick={() => statusMutation.mutate({ id: booking.id, status: 'CONFIRMED' })} loading={statusMutation.isPending}>
              <CheckCircle2 className="w-4 h-4" /> Confirm
            </Button>
            <div className="flex-1 space-y-2">
              <Input placeholder="Cancel reason..." value={cancelReason} onChange={e => setCancelReason(e.target.value)} />
              <Button variant="danger" className="w-full" onClick={() => statusMutation.mutate({ id: booking.id, status: 'CANCELLED', cancelReason })} loading={statusMutation.isPending}>
                <XCircle className="w-4 h-4" /> Cancel
              </Button>
            </div>
          </div>
        )}
        {booking.status === 'CONFIRMED' && (
          <div className="flex gap-2.5">
            <Button className="flex-1" onClick={() => attendedMutation.mutate(booking.id)} loading={attendedMutation.isPending}>
              <CheckCircle2 className="w-4 h-4" /> Mark Attended
            </Button>
            <Button variant="danger" onClick={() => statusMutation.mutate({ id: booking.id, status: 'NO_SHOW' })} loading={statusMutation.isPending}>
              No Show
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['bookings', activeTab],
    queryFn: () => bookingsApi.list(activeTab !== 'all' ? { status: activeTab } : {}),
    select: r => r.data,
  })

  const bookings = (data?.bookings || []).filter(b =>
    !search || b.customerName?.toLowerCase().includes(search.toLowerCase()) ||
    b.serviceName?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout title="Bookings" subtitle="Manage all appointments">
      <div className="flex items-center justify-between mb-5">
        <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />
        <div className="flex items-center gap-2">
          <input
            className="input-field text-xs py-2 w-48"
            placeholder="Search customer or service..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Link to="/bookings/calendar">
            <Button variant="secondary" size="sm"><Calendar className="w-4 h-4" /> Calendar</Button>
          </Link>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <Table
          headers={['Customer', 'Service', 'Scheduled', 'Status', 'Contact', 'Actions']}
          loading={isLoading}
          empty="No bookings found"
        >
          {bookings.map((b) => (
            <tr key={b.id} className="table-row cursor-pointer" onClick={() => setSelectedBooking(b)}>
              <td className="table-cell">
                <div className="flex items-center gap-2.5">
                  <Avatar name={b.customerName} size="sm" />
                  <span className="font-medium text-slate-200">{b.customerName}</span>
                </div>
              </td>
              <td className="table-cell text-slate-400">{b.serviceName}</td>
              <td className="table-cell text-slate-400 whitespace-nowrap">{fmt.datetime(b.scheduledAt)}</td>
              <td className="table-cell"><StatusBadge status={b.status} /></td>
              <td className="table-cell">
                {b.contactUnlocked
                  ? <span className="text-xs text-green-400 font-medium">✓ Unlocked</span>
                  : <span className="text-xs text-slate-600">Locked</span>
                }
              </td>
              <td className="table-cell">
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedBooking(b) }}>View</Button>
              </td>
            </tr>
          ))}
        </Table>

        {!isLoading && bookings.length === 0 && (
          <EmptyState icon="📅" title="No bookings" description="Bookings from your AI bot will appear here" />
        )}
      </div>

      <BookingDetailModal booking={selectedBooking} open={!!selectedBooking} onClose={() => setSelectedBooking(null)} />
    </DashboardLayout>
  )
}
