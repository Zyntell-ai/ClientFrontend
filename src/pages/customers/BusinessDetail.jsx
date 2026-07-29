import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customersApi } from '../../api/index'
import { useAuthStore } from '../../store/authStore'
import { hasFeature } from '../../config/plans'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { FeatureGate, Avatar, Badge, Spinner, Tabs } from '../../components/ui/index'
import { CustomerMemoryPanel } from '../../components/customer-memory/index'
import { CustomerTwinPanel } from '../../components/customer-twin/index'
import { fmt } from '../../utils/index'
import { ArrowLeft, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'

const TABS = [
  { value: 'memory', label: 'Customer Memory' },
  { value: 'twin',   label: 'Digital Twin'    },
]

export default function BusinessDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { business } = useAuthStore()
  const [activeTab, setActiveTab] = useState('memory')

  const canUseMemory = hasFeature(
    business?.plan || 'trial',
    'customerMemory',
    business?.featureOverrides || {}
  )

  const canUseTwin = hasFeature(
    business?.plan || 'trial',
    'customerDigitalTwin',
    business?.featureOverrides || {}
  )

  // [API CALL]: Load customer profile + booking history
  const { data: customerData, isLoading: customerLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => customersApi.get(id),
    select: r => r.data,
    enabled: !!id,
  })

  const customer = customerData?.customer
  const phone    = customer?.phone

  // [API CALL]: Load customer memory — enabled only when plan permits
  const { data: memory, isLoading: memoryLoading } = useQuery({
    queryKey: ['customerMemory', phone],
    queryFn: () => customersApi.getMemory(phone),
    select: r => r.data.memory,
    enabled: !!phone && canUseMemory,
    retry: false,
  })

  // [API CALL]: Load Customer Digital Twin — enabled only when plan permits
  const { data: twin, isLoading: twinLoading } = useQuery({
    queryKey: ['customerTwin', phone],
    queryFn: () => customersApi.getTwin(phone),
    select: r => r.data.twin,
    enabled: !!phone && canUseTwin,
    retry: false,
    // Refresh every 30s when status is pending/generating so the UI self-heals
    refetchInterval: (query) => {
      const status = query.state.data?.metadata?.generationStatus
      return (status === 'pending' || status === 'generating') ? 30000 : false
    },
  })

  // [API CALL]: Persist manual notes
  const notesMutation = useMutation({
    mutationFn: (manualNotes) => customersApi.updateMemory(phone, { manualNotes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customerMemory', phone] })
      toast.success('Notes saved')
    },
    onError: () => toast.error('Failed to save notes'),
  })

  // [API CALL]: Persist preference changes
  const prefsMutation = useMutation({
    mutationFn: (preferences) => customersApi.updateMemory(phone, { preferences }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customerMemory', phone] })
      toast.success('Preferences saved')
    },
    onError: () => toast.error('Failed to save preferences'),
  })

  // [API CALL]: Persist twin identity overrides + trigger background pipeline refresh
  const twinIdentityMutation = useMutation({
    mutationFn: (identity) => customersApi.updateTwin(phone, { identity }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customerTwin', phone] })
      toast.success('Identity updated — profile is refreshing')
    },
    onError: () => toast.error('Failed to update identity'),
  })

  // [API CALL]: Send re-engagement WhatsApp message
  const reengageMutation = useMutation({
    mutationFn: () => customersApi.reengage(id),
    onSuccess: () => toast.success('Re-engagement message sent!'),
    onError: () => toast.error('Failed to send message'),
  })

  const name     = customer?.name || 'Customer'
  const bookings = customerData?.bookings || []

  return (
    <DashboardLayout title={customerLoading ? 'Customer' : name} subtitle="Profile & Intelligence">

      {/* Back navigation */}
      <button
        className="mp-btn mp-btn-ghost"
        onClick={() => navigate('/customers')}
        style={{ marginBottom: '20px', paddingLeft: 0 }}
      >
        <ArrowLeft style={{ width: 14, height: 14 }} />
        Back to Customers
      </button>

      {customerLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <Spinner />
        </div>
      ) : !customer ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--mp-text-muted)', fontSize: '14px' }}>
          Customer not found.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          gap: '20px',
          alignItems: 'start',
        }}>

          {/* ── Left column: identity, stats, actions ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Identity card */}
            <div className="mp-card" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                <Avatar name={name} size="lg" />
              </div>
              <p style={{ fontWeight: 600, fontSize: '15px', color: 'var(--mp-text)', marginBottom: '4px' }}>
                {name}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--mp-text-muted)', marginBottom: '12px' }}>
                {customer.phone || '—'}
              </p>
              <Badge color={customer.isActive ? 'green' : 'slate'}>
                {customer.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            {/* Stats */}
            <div className="mp-card" style={{ padding: '16px' }}>
              <p className="mp-label" style={{ marginBottom: '10px' }}>Summary</p>
              {[
                { label: 'Total Bookings', value: bookings.length || customer.totalBookings || 0 },
                { label: 'Last Visit',     value: fmt.ago(customer.lastBookingAt) },
                { label: 'Customer Since', value: fmt.date(customer.createdAt) },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: '0.5px solid var(--mp-card-border)',
                  }}
                >
                  <span style={{ fontSize: '12px', color: 'var(--mp-text-muted)' }}>{label}</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--mp-text)' }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Recent bookings */}
            {bookings.length > 0 && (
              <div className="mp-card" style={{ padding: '16px' }}>
                <p className="mp-label" style={{ marginBottom: '10px' }}>Recent Bookings</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                  {bookings.slice(0, 5).map(b => (
                    <div
                      key={b.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '7px 10px',
                        background: 'var(--mp-a05)',
                        borderRadius: '7px',
                        fontSize: '12px',
                      }}
                    >
                      <span style={{ color: 'var(--mp-text)' }}>{b.serviceName}</span>
                      <span style={{ color: 'var(--mp-text-muted)' }}>{fmt.date(b.scheduledAt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Re-engagement */}
            <button
              className="mp-btn mp-btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => reengageMutation.mutate()}
              disabled={reengageMutation.isPending}
            >
              <MessageSquare style={{ width: 14, height: 14 }} />
              {reengageMutation.isPending ? 'Sending…' : 'Send Re-engagement'}
            </button>
          </div>

          {/* ── Right column: tabbed intelligence panels ── */}
          <div>
            {/* Tab switcher */}
            <div style={{ marginBottom: '16px' }}>
              <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />
            </div>

            {/* Customer Memory tab */}
            {activeTab === 'memory' && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--mp-text)', marginBottom: '2px' }}>
                    Customer Memory
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--mp-text-muted)' }}>
                    AI-powered customer intelligence — the bot uses this to personalise every conversation.
                  </p>
                </div>
                <FeatureGate feature="customerMemory">
                  <CustomerMemoryPanel
                    memory={memory}
                    isLoading={memoryLoading}
                    onSaveNotes={(notes) => notesMutation.mutate(notes)}
                    onSavePreferences={(prefs) => prefsMutation.mutate(prefs)}
                    notesSaving={notesMutation.isPending}
                    prefsSaving={prefsMutation.isPending}
                  />
                </FeatureGate>
              </div>
            )}

            {/* Digital Twin tab */}
            {activeTab === 'twin' && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--mp-text)', marginBottom: '2px' }}>
                    Customer Digital Twin
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--mp-text-muted)' }}>
                    AI-derived behavioural profile — scores, patterns, and predictions built from every interaction.
                  </p>
                </div>
                <FeatureGate feature="customerDigitalTwin">
                  <CustomerTwinPanel
                    twin={twin}
                    isLoading={twinLoading}
                    onSaveIdentity={(identity) => twinIdentityMutation.mutate(identity)}
                    identitySaving={twinIdentityMutation.isPending}
                  />
                </FeatureGate>
              </div>
            )}

          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
