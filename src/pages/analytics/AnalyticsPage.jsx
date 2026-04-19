// src/pages/analytics/AnalyticsPage.jsx
// Maps to GET /api/analytics/bookings, /customers, /revenue
import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '../../api/index'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Card, StatCard, Spinner } from '../../components/ui/index'
import { fmt, RANGE_OPTIONS } from '../../utils/index'
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend
} from 'recharts'

const CHART_COLORS = { blue: '#3b82f6', green: '#10b981', amber: '#f59e0b', purple: '#8b5cf6', red: '#ef4444' }

function CustomTooltip({ active, payload, label, prefix = '' }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-navy-600 border border-navy-400/40 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="font-semibold" style={{ color: p.color }}>{p.name}: {prefix}{p.value?.toLocaleString()}</p>
      ))}
    </div>
  )
}

const STATUS_COLORS = { PENDING: '#f59e0b', CONFIRMED: '#3b82f6', COMPLETED: '#10b981', CANCELLED: '#ef4444', NO_SHOW: '#64748b' }

export default function AnalyticsPage() {
  const [range, setRange] = useState('30d')

  const { data: bookingData, isLoading: bl } = useQuery({
    queryKey: ['analytics-bookings', range],
    queryFn: () => analyticsApi.bookings({ range }),
    select: r => r.data,
  })
  const { data: customerData, isLoading: cl } = useQuery({
    queryKey: ['analytics-customers', range],
    queryFn: () => analyticsApi.customers({ range }),
    select: r => r.data,
  })
  const { data: revenueData, isLoading: rl } = useQuery({
    queryKey: ['analytics-revenue'],
    queryFn: () => analyticsApi.revenue(),
    select: r => r.data,
  })

  const loading = bl || cl || rl

  const statusPieData = bookingData
    ? Object.entries(bookingData.byStatus || {}).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }))
    : []

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const dayData = (bookingData?.byDayOfWeek || []).map((count, i) => ({ day: dayLabels[i], count }))

  return (
    <DashboardLayout title="Analytics" subtitle="Business insights">
      {/* Range selector */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-slate-500">Showing data for selected period</p>
        <div className="flex gap-1.5">
          {RANGE_OPTIONS.map(({ value, label }) => (
            <button key={value} onClick={() => setRange(value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${range === value ? 'bg-brand-blue border-brand-blue text-white' : 'border-navy-400/40 text-slate-500 hover:text-slate-300'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<BarChart3 className="w-5 h-5" />} label="Total Bookings" value={bookingData?.total ?? '—'} color="blue" />
        <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Showup Rate" value={bookingData ? fmt.percent(bookingData.showupRate) : '—'} color="green" />
        <StatCard icon={<Users className="w-5 h-5" />} label="Return Rate" value={customerData ? fmt.percent(customerData.returnRate) : '—'} sub={`Avg ${customerData?.avgVisitsPerCustomer ?? '—'} visits/customer`} color="purple" />
        <StatCard icon={<DollarSign className="w-5 h-5" />} label="ROI Multiple" value={revenueData ? `${revenueData.roiData.roiMultiple}x` : '—'} sub="revenue vs cost" color="amber" />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="xl" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Bookings over time */}
          <Card title="Bookings Over Time">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={bookingData?.byWeek || []}>
                <defs>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
                <XAxis dataKey="week" stroke="#475569" tick={{ fontSize: 10, fill: '#475569' }} />
                <YAxis stroke="#475569" tick={{ fontSize: 10, fill: '#475569' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" name="Bookings" stroke="#3b82f6" fill="url(#blueGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Booking status breakdown */}
          <Card title="Status Breakdown">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                  {statusPieData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#64748b'} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(v) => <span className="text-xs text-slate-400">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Bookings by day of week */}
          <Card title="Busiest Days">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
                <XAxis dataKey="day" stroke="#475569" tick={{ fontSize: 10, fill: '#475569' }} />
                <YAxis stroke="#475569" tick={{ fontSize: 10, fill: '#475569' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Bookings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* New vs Returning customers */}
          <Card title="New vs Returning Customers">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={customerData?.newVsReturning || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
                <XAxis dataKey="week" stroke="#475569" tick={{ fontSize: 10, fill: '#475569' }} />
                <YAxis stroke="#475569" tick={{ fontSize: 10, fill: '#475569' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="new" name="New" fill="#10b981" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="returning" name="Returning" fill="#8b5cf6" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Monthly Commission Revenue */}
          <Card title="Monthly Commissions" className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={revenueData?.monthlyRevenue || []}>
                <defs>
                  <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
                <XAxis dataKey="month" stroke="#475569" tick={{ fontSize: 10, fill: '#475569' }} />
                <YAxis stroke="#475569" tick={{ fontSize: 10, fill: '#475569' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip prefix="₹" />} />
                <Area type="monotone" dataKey="total" name="Total" stroke="#10b981" fill="url(#greenGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="booking" name="Booking" stroke="#3b82f6" fill="none" strokeWidth={1.5} strokeDasharray="4 2" />
                <Area type="monotone" dataKey="showup" name="Showup" stroke="#8b5cf6" fill="none" strokeWidth={1.5} strokeDasharray="4 2" />
              </AreaChart>
            </ResponsiveContainer>

            {revenueData?.roiData && (
              <div className="grid grid-cols-3 gap-3 mt-4">
                {[
                  { label: 'Zyntell Cost', value: fmt.currency(revenueData.roiData.zyntellCost), color: 'text-red-400' },
                  { label: 'Revenue Generated', value: fmt.currency(revenueData.roiData.revenueGenerated), color: 'text-green-400' },
                  { label: 'ROI Multiple', value: `${revenueData.roiData.roiMultiple}x`, color: 'text-amber-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="text-center bg-navy-700/30 rounded-lg p-3">
                    <p className="text-[10px] text-slate-600 uppercase tracking-wide">{label}</p>
                    <p className={`text-lg font-display font-bold mt-0.5 ${color}`}>{value}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </DashboardLayout>
  )
}
