// src/pages/bookings/BookingsPage.jsx
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingsApi } from '../../api/index'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Button, Badge, Modal, Input, Select, Tabs, EmptyState, Spinner, Avatar, Alert } from '../../components/ui/index'
import TimeRiver from '../../components/ui/TimeRiver'
import { fmt, BOOKING_STATUS_COLORS, toDate } from '../../utils/index'
import { Calendar, CheckCircle2, XCircle, KeyRound, List, Waves } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const STATUS_TABS = [
  { value: 'all',       label: 'All'       },
  { value: 'PENDING',   label: 'Pending'   },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'NO_SHOW',   label: 'No Show'   },
]

const VIEW_TABS = [
  { value: 'river', label: '〜 Time River' },
  { value: 'list',  label: '≡ List'        },
]

function statusStyle(status) {
  return {
    CONFIRMED: { bg: 'rgba(5,150,105,0.08)',   text: '#059669', border: 'rgba(5,150,105,0.20)'   },
    PENDING:   { bg: 'rgba(217,119,6,0.08)',   text: '#d97706', border: 'rgba(217,119,6,0.20)'   },
    COMPLETED: { bg: 'rgba(100,116,139,0.08)', text: '#64748b', border: 'rgba(100,116,139,0.20)' },
    CANCELLED: { bg: 'rgba(220,38,38,0.08)',   text: '#dc2626', border: 'rgba(220,38,38,0.20)'   },
    NO_SHOW:   { bg: 'rgba(100,116,139,0.08)', text: '#64748b', border: 'rgba(100,116,139,0.20)' },
  }[status] || { bg: 'var(--mp-a05)', text: 'var(--mp-text)', border: 'var(--mp-card-border)' }
}

function BookingDetailModal({ booking, open, onClose }) {
  const qc = useQueryClient()
  const [otp, setOtp]           = useState('')
  const [cancelReason, setReason] = useState('')

  const statusMutation = useMutation({
    mutationFn: ({ id, status, cancelReason }) => bookingsApi.updateStatus(id, { status, cancelReason }),
    onSuccess: () => { toast.success('Booking updated'); qc.invalidateQueries(['bookings']); onClose() },
    onError:   e => toast.error(e.response?.data?.error || 'Update failed'),
  })
  const otpMutation = useMutation({
    mutationFn: ({ id, otp }) => bookingsApi.verifyOtp(id, { otp }),
    onSuccess: () => { toast.success('Contact unlocked!'); qc.invalidateQueries(['bookings']); onClose() },
    onError:   () => toast.error('Invalid OTP'),
  })

  if (!booking) return null
  const ss = statusStyle(booking.status)

  return (
    <Modal open={open} onClose={onClose} title="Booking Details" size="lg">
      <div className="space-y-4">
        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            ['Customer',  booking.customerName],
            ['Phone',     booking.contactUnlocked ? booking.customerPhone : '••• ••• ••••'],
            ['Service',   booking.serviceName],
            ['Staff',     booking.staffName || 'Any'],
            ['Scheduled', fmt.datetime(booking.scheduledAt)],
            ['Duration',  fmt.duration(booking.duration)],
          ].map(([label, value]) => (
            <div key={label} className="mp-card p-3">
              <p className="mp-label mb-1">{label}</p>
              <p className="text-sm font-medium" style={{ color: 'var(--mp-text)' }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Status */}
        <div className="flex items-center gap-3">
          <span
            className="text-xs px-3 py-1 rounded-full font-semibold"
            style={{ background: ss.bg, color: ss.text, border: `0.5px solid ${ss.border}` }}
          >
            {booking.status}
          </span>
          {booking.cancelReason && (
            <p className="text-xs" style={{ color: 'var(--mp-text)', opacity: 0.5 }}>Reason: {booking.cancelReason}</p>
          )}
        </div>

        {/* OTP unlock */}
        {!booking.contactUnlocked && (
          <Alert type="info">Enter the 4-digit OTP to unlock this customer's contact details</Alert>
        )}
        {!booking.contactUnlocked && (
          <div className="flex gap-2">
            <Input placeholder="4-digit OTP" value={otp} onChange={e => setOtp(e.target.value)} maxLength={4} className="flex-1" />
            <Button onClick={() => otpMutation.mutate({ id: booking.id, otp })} loading={otpMutation.isPending} disabled={otp.length !== 4}>
              <KeyRound className="w-4 h-4" /> Unlock
            </Button>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 pt-2" style={{ borderTop: '0.5px solid var(--mp-card-border)' }}>
          {booking.status === 'PENDING' && (
            <Button
              onClick={() => statusMutation.mutate({ id: booking.id, status: 'CONFIRMED' })}
              loading={statusMutation.isPending}
            >
              <CheckCircle2 className="w-4 h-4" /> Confirm
            </Button>
          )}
          {['PENDING', 'CONFIRMED'].includes(booking.status) && (
            <>
              <Button
                variant="secondary"
                onClick={() => statusMutation.mutate({ id: booking.id, status: 'COMPLETED' })}
                loading={statusMutation.isPending}
              >
                Mark Completed
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  const r = prompt('Cancellation reason (optional):') || ''
                  statusMutation.mutate({ id: booking.id, status: 'CANCELLED', cancelReason: r })
                }}
                loading={statusMutation.isPending}
              >
                <XCircle className="w-4 h-4" /> Cancel
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default function BookingsPage() {
  const [statusTab, setStatusTab] = useState('all')
  const [viewMode,  setViewMode]  = useState('river')
  const [selected,  setSelected]  = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['bookings', statusTab],
    queryFn:  () => bookingsApi.list({ status: statusTab === 'all' ? undefined : statusTab }),
    select:   r  => r.data.bookings,
    refetchInterval: 30_000,
  })

  const bookings = data || []

  // Convert bookings to TimeRiver items (today's bookings — all statuses including COMPLETED)
  const today = new Date()
  const todayY = today.getFullYear()
  const todayM = today.getMonth()
  const todayD = today.getDate()

  const todayBookings = bookings
    .filter(b => {
      const d = toDate(b.scheduledAt)
      return d && d.getFullYear() === todayY && d.getMonth() === todayM && d.getDate() === todayD
    })
    .map(b => ({
      id:       b.id,
      title:    b.customerName,
      subtitle: b.serviceName,
      time:     b.scheduledAt,
      status:   b.status,
      badge:    b.status,
    }))

  return (
    <DashboardLayout title="Bookings" subtitle="Appointments & scheduling">
      <div className="space-y-5">

        {/* View toggle */}
        <div className="flex items-center justify-between">
          <Tabs tabs={VIEW_TABS} active={viewMode} onChange={setViewMode} />
          <Tabs tabs={STATUS_TABS.slice(0, 4)} active={statusTab} onChange={setStatusTab} />
        </div>

        {/* ── Time River view ───────────────────────────── */}
        {viewMode === 'river' && (
          <div className="mp-card p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="mp-rule-bold" style={{ width: 16 }} />
              <p className="mp-label">Today's schedule — drag to scroll, click to expand</p>
              <p className="text-xs ml-auto" style={{ color: 'var(--mp-text)', opacity: 0.35 }}>
                {todayBookings.length} bookings
              </p>
            </div>
            {isLoading ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : (
              <TimeRiver
                items={todayBookings}
                mode="bookings"
                emptyText="No bookings scheduled for today"
              />
            )}
          </div>
        )}

        {/* ── List view ─────────────────────────────────── */}
        {viewMode === 'list' && (
          <div className="mp-card overflow-hidden">
            {/* Section header */}
            <div
              className="px-5 py-3 flex items-center justify-between"
              style={{ borderBottom: '1px solid var(--mp-card-border)' }}
            >
              <div className="flex items-center gap-3">
                <div className="mp-rule-bold" style={{ width: 16 }} />
                <p className="mp-label">All bookings</p>
              </div>
              <p className="text-xs" style={{ color: 'var(--mp-text)', opacity: 0.35 }}>{bookings.length} total</p>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12"><Spinner size="lg" /></div>
            ) : !bookings.length ? (
              <EmptyState icon="📅" title="No bookings" description="Bookings will appear here once your bot receives them" />
            ) : (
              <table className="w-full">
                <thead>
                  <tr>
                    {['Customer', 'Service', 'Date & Time', 'Staff', 'Status', ''].map(h => (
                      <th key={h} className="mp-th">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => {
                    const ss = statusStyle(b.status)
                    return (
                      <tr key={b.id} className="mp-tr">
                        <td className="mp-td">
                          <div className="flex items-center gap-2">
                            <Avatar name={b.customerName} size="sm" />
                            <span className="font-medium text-sm" style={{ color: 'var(--mp-text)' }}>{b.customerName}</span>
                          </div>
                        </td>
                        <td className="mp-td">{b.serviceName}</td>
                        <td className="mp-td">
                          <span className="mp-serif text-sm">{fmt.datetime(b.scheduledAt)}</span>
                        </td>
                        <td className="mp-td">{b.staffName || '—'}</td>
                        <td className="mp-td">
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: ss.bg, color: ss.text, border: `0.5px solid ${ss.border}` }}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="mp-td">
                          <button
                            className="text-xs px-3 py-1 rounded-md transition-all"
                            style={{ color: 'var(--mp-accent)', background: 'var(--mp-a05)', border: '0.5px solid var(--mp-card-border)' }}
                            onClick={() => setSelected(b)}
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      <BookingDetailModal booking={selected} open={!!selected} onClose={() => setSelected(null)} />
    </DashboardLayout>
  )
}