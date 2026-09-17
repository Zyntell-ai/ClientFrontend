import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { customersApi } from '../../api/index'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { EmptyState, Avatar, Table } from '../../components/ui/index'
import { fmt } from '../../utils/index'

export default function CustomersPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  // [API CALL]: Fetch the full customer list
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
      <div className="flex justify-end mb-5">
        <input
          className="input-field text-xs py-2 w-56"
          placeholder="Search by name or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="mp-card overflow-hidden">
        <Table headers={['Customer', 'Phone', 'Bookings', 'Last Visit', '']} loading={isLoading} empty="No customers yet">
          {customers.map((c) => (
            <tr
              key={c.id}
              className="mp-tr"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/customers/${c.id}`)}
            >
              <td className="mp-td">
                <div className="flex items-center gap-2.5">
                  <Avatar name={c.name} size="sm" />
                  <span className="font-medium" style={{ color: 'var(--mp-text)' }}>{c.name}</span>
                </div>
              </td>
              <td className="mp-td" style={{ opacity: 0.65 }}>{c.phone || '—'}</td>
              <td className="mp-td" style={{ opacity: 0.65 }}>{c.totalBookings || 0}</td>
              <td className="mp-td" style={{ opacity: 0.5 }}>{fmt.ago(c.lastBookingAt)}</td>
              <td className="mp-td">
                <button
                  className="text-xs px-3 py-1 rounded-md transition-all"
                  style={{ color: 'var(--mp-accent)', background: 'var(--mp-a05)', border: '0.5px solid var(--mp-card-border)' }}
                  onClick={(e) => { e.stopPropagation(); navigate(`/customers/${c.id}`) }}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </Table>
        {!isLoading && customers.length === 0 && (
          <EmptyState icon="👥" title="No customers yet" description="Customers appear here after they interact with your bot" />
        )}
      </div>
    </DashboardLayout>
  )
}
