// src/pages/bookings/CalendarPage.jsx
// Maps to GET /api/bookings/view/calendar
import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { bookingsApi } from '../../api/index'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Button, Spinner, Badge } from '../../components/ui/index'
import { fmt, BOOKING_STATUS_COLORS } from '../../utils/index'
import { ChevronLeft, ChevronRight, List } from 'lucide-react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths
} from 'date-fns'

const STATUS_DOT = {
  PENDING: 'bg-amber-400',
  CONFIRMED: 'bg-blue-400',
  COMPLETED: 'bg-green-400',
  CANCELLED: 'bg-red-400',
  NO_SHOW: 'bg-slate-400',
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(new Date())

  const { data, isLoading } = useQuery({
    queryKey: ['calendar', format(currentMonth, 'yyyy-MM')],
    queryFn: () => bookingsApi.calendar({
      from: format(startOfMonth(currentMonth), 'yyyy-MM-dd'),
      to: format(endOfMonth(currentMonth), 'yyyy-MM-dd'),
    }),
    select: r => r.data.bookings || [],
  })

  const bookings = data || []

  // Group bookings by date
  const bookingsByDate = {}
  bookings.forEach(b => {
    const d = b.scheduledAt?.toDate ? b.scheduledAt.toDate() : new Date(b.scheduledAt)
    const key = format(d, 'yyyy-MM-dd')
    if (!bookingsByDate[key]) bookingsByDate[key] = []
    bookingsByDate[key].push(b)
  })

  // Calendar grid
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  // Selected day bookings
  const selectedKey = format(selectedDay, 'yyyy-MM-dd')
  const selectedBookings = bookingsByDate[selectedKey] || []

  const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <DashboardLayout title="Booking Calendar" subtitle="Month view">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentMonth(m => subMonths(m, 1))}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-navy-600/50 transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h2 className="font-display font-bold text-slate-100 text-lg w-40 text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <button onClick={() => setCurrentMonth(m => addMonths(m, 1))}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-navy-600/50 transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentMonth(new Date())}
            className="px-3 py-1.5 rounded-lg border border-navy-400/40 text-xs text-slate-400 hover:text-slate-200 transition-all">
            Today
          </button>
          <Link to="/bookings">
            <Button variant="secondary" size="sm"><List className="w-4 h-4" /> List View</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Calendar grid */}
        <div className="lg:col-span-2 glass-card p-4">
          {/* Week day headers */}
          <div className="grid grid-cols-7 mb-2">
            {WEEK_DAYS.map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-slate-600 uppercase tracking-wider py-2">{d}</div>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => {
                const key = format(day, 'yyyy-MM-dd')
                const dayBookings = bookingsByDate[key] || []
                const isCurrentMonth = isSameMonth(day, currentMonth)
                const isSelected = isSameDay(day, selectedDay)
                const isCurrentDay = isToday(day)

                return (
                  <button
                    key={key}
                    onClick={() => setSelectedDay(day)}
                    className={clsx(
                      'relative min-h-[70px] p-1.5 rounded-lg border transition-all text-left',
                      isSelected
                        ? 'border-brand-blue bg-brand-blue/10'
                        : 'border-transparent hover:border-navy-400/40 hover:bg-navy-600/30',
                      !isCurrentMonth && 'opacity-30'
                    )}
                  >
                    <span className={clsx(
                      'text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full',
                      isCurrentDay ? 'bg-brand-blue text-white' : isSelected ? 'text-brand-blue-light' : 'text-slate-400'
                    )}>
                      {format(day, 'd')}
                    </span>

                    {dayBookings.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {dayBookings.slice(0, 3).map((b, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <div className={clsx('w-1.5 h-1.5 rounded-full shrink-0', STATUS_DOT[b.status] || 'bg-slate-400')} />
                            <span className="text-[9px] text-slate-500 truncate">{b.customerName?.split(' ')[0]}</span>
                          </div>
                        ))}
                        {dayBookings.length > 3 && (
                          <p className="text-[9px] text-slate-600 pl-2.5">+{dayBookings.length - 3} more</p>
                        )}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {/* Legend */}
          <div className="flex gap-4 mt-3 pt-3 border-t border-navy-400/20">
            {Object.entries(STATUS_DOT).map(([status, dotClass]) => (
              <div key={status} className="flex items-center gap-1.5">
                <div className={clsx('w-2 h-2 rounded-full', dotClass)} />
                <span className="text-[10px] text-slate-600 capitalize">{status.toLowerCase().replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected day panel */}
        <div className="glass-card p-4">
          <div className="mb-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Selected Date</p>
            <p className="font-display font-bold text-slate-100 text-lg">{format(selectedDay, 'EEEE')}</p>
            <p className="text-sm text-slate-400">{format(selectedDay, 'dd MMMM yyyy')}</p>
          </div>

          {selectedBookings.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-2xl mb-2">📅</p>
              <p className="text-xs text-slate-600">No bookings on this day</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                {selectedBookings.length} booking{selectedBookings.length !== 1 ? 's' : ''}
              </p>
              {selectedBookings
                .sort((a, b) => {
                  const aTime = a.scheduledAt?.toDate ? a.scheduledAt.toDate() : new Date(a.scheduledAt)
                  const bTime = b.scheduledAt?.toDate ? b.scheduledAt.toDate() : new Date(b.scheduledAt)
                  return aTime - bTime
                })
                .map((b) => (
                  <div key={b.id} className={clsx('p-3 rounded-lg border transition-all', BOOKING_STATUS_COLORS[b.status]?.includes('blue') ? 'border-blue-500/20 bg-blue-500/5' : 'border-navy-400/20 bg-navy-700/30')}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-200">{b.customerName}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{b.serviceName}</p>
                      </div>
                      <p className="text-xs font-bold text-brand-blue">{fmt.time(b.scheduledAt?.toDate ? b.scheduledAt.toDate() : b.scheduledAt)}</p>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className={clsx('text-[10px] px-1.5 py-0.5 rounded-full border font-semibold', BOOKING_STATUS_COLORS[b.status])}>
                        {b.status}
                      </span>
                      {b.staffName && <span className="text-[10px] text-slate-600">{b.staffName}</span>}
                    </div>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
