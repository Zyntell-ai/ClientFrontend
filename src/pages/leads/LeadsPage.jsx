// src/pages/leads/LeadsPage.jsx
import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { leadsApi } from '../../api/index'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Button, Tabs, EmptyState, Spinner, Modal, Input, Alert, Badge } from '../../components/ui/index'
import TimeRiver from '../../components/ui/TimeRiver'
import { fmt, LEAD_QUALITY_CONFIG } from '../../utils/index'
import { Target, Clock, CheckCircle2, Lock, Zap, List } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const TYPE_TABS = [
  { value: 'exclusive', label: '⚡ Exclusive' },
  { value: 'broadcast', label: '📡 Broadcast' },
  { value: 'auction',   label: '🔨 Auction'   },
]

const VIEW_TABS = [
  { value: 'river', label: '〜 Expiry River' },
  { value: 'cards', label: '⬜ Cards'        },
]

// Countdown to expiry
function useCountdown(expiryDate) {
  const [left, setLeft] = useState(0)
  useEffect(() => {
    const calc = () => {
      const exp = expiryDate?.toDate ? expiryDate.toDate() : new Date(expiryDate)
      setLeft(Math.max(0, Math.floor((exp - Date.now()) / 60000)))
    }
    calc()
    const t = setInterval(calc, 30000)
    return () => clearInterval(t)
  }, [expiryDate])
  return left
}

function LeadCard({ lead, onClaim, onBid, claiming, bidding }) {
  const qCfg   = LEAD_QUALITY_CONFIG[lead.quality] || LEAD_QUALITY_CONFIG.COLD
  const [bid, setBid]       = useState('')
  const [showBid, setShowBid] = useState(false)
  const timeLeft = useCountdown(lead.exclusiveWindowExpiry || lead.auctionEndsAt)
  const urgent   = timeLeft < 30 && timeLeft > 0

  return (
    <div
      className="mp-card p-4 transition-all"
      style={{ borderColor: urgent ? 'rgba(220,38,38,0.30)' : undefined }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <span className={clsx('text-[10px] px-2 py-0.5 rounded-full border font-semibold', qCfg.color)}>{qCfg.label}</span>
        <div className="text-right">
          <p className="mp-serif text-lg font-semibold" style={{ color: 'var(--mp-accent)' }}>
            {fmt.currency(lead.commissionAmount)}
          </p>
          <p className="text-[10px]" style={{ color: 'var(--mp-text)', opacity: 0.4 }}>commission</p>
        </div>
      </div>

      {/* Problem */}
      <p className="text-sm mb-3 leading-relaxed" style={{ color: 'var(--mp-text)', opacity: 0.70 }}>
        {lead.problem || 'Customer inquiry'}
      </p>

      {/* Meta */}
      <div className="flex flex-wrap gap-2 mb-3 text-xs">
        {lead.urgency && (
          <span className="px-2 py-0.5 rounded" style={{ background: 'var(--mp-a05)', color: 'var(--mp-text)', opacity: 0.6 }}>
            {lead.urgency}
          </span>
        )}
        {lead.estimatedValue && (
          <span style={{ color: 'var(--mp-text)', opacity: 0.5 }}>
            Est: <strong style={{ color: 'var(--mp-accent)' }}>{fmt.currency(lead.estimatedValue)}</strong>
          </span>
        )}
        {timeLeft > 0 && (
          <span className={clsx('flex items-center gap-1 font-semibold', urgent ? 'text-red-500' : 'text-amber-500')}>
            <Clock className="w-3 h-3" />{timeLeft}m left
          </span>
        )}
      </div>

      {/* Unlocked contact */}
      {lead.isClaimed && lead.customerPhone && (
        <div className="mb-3 p-3 rounded-md" style={{ background: 'rgba(5,150,105,0.06)', border: '0.5px solid rgba(5,150,105,0.20)' }}>
          <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Contact Unlocked
          </p>
          <p className="text-sm font-medium" style={{ color: 'var(--mp-text)' }}>{lead.customerPhone}</p>
          {lead.customerName && <p className="text-xs mt-0.5" style={{ color: 'var(--mp-text)', opacity: 0.5 }}>{lead.customerName}</p>}
        </div>
      )}

      {/* Bid section (auction) */}
      {showBid && (
        <div className="flex gap-2 mb-3">
          <Input placeholder="Your bid amount ₹" type="number" value={bid} onChange={e => setBid(e.target.value)} className="flex-1" />
          <Button
            onClick={() => { onBid(lead.id, Number(bid)); setShowBid(false) }}
            loading={bidding}
            disabled={!bid}
            size="sm"
          >
            Place Bid
          </Button>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {!lead.isClaimed && (
          <Button onClick={() => onClaim(lead.id)} loading={claiming} className="flex-1" size="sm">
            <Zap className="w-3.5 h-3.5" /> Claim Lead
          </Button>
        )}
        {lead.isAuction && !lead.isClaimed && (
          <Button variant="secondary" onClick={() => setShowBid(s => !s)} size="sm">
            Bid →
          </Button>
        )}
        {lead.isClaimed && (
          <div className="flex-1 text-center text-xs py-1.5 rounded-md font-semibold" style={{ color: '#059669', background: 'rgba(5,150,105,0.08)' }}>
            ✓ Claimed by you
          </div>
        )}
      </div>
    </div>
  )
}

export default function LeadsPage() {
  const qc = useQueryClient()
  const [tab,      setTab]     = useState('exclusive')
  const [viewMode, setViewMode] = useState('river')

  const { data, isLoading } = useQuery({
    queryKey: ['leads', tab],
    queryFn:  () => leadsApi.list({ type: tab }),
    select:   r  => r.data.leads,
    refetchInterval: 30_000,
  })

  const claimMutation = useMutation({
    mutationFn: (id) => leadsApi.claim(id),
    onSuccess: () => { toast.success('Lead claimed! Contact unlocked.'); qc.invalidateQueries(['leads']) },
    onError:   e => toast.error(e.response?.data?.error || 'Could not claim lead'),
  })

  const bidMutation = useMutation({
    mutationFn: ({ id, amount }) => leadsApi.bid(id, { amount }),
    onSuccess: () => { toast.success('Bid placed!'); qc.invalidateQueries(['leads']) },
    onError:   e => toast.error(e.response?.data?.error || 'Bid failed'),
  })

  const leads = data || []

  // Convert leads to TimeRiver items — X axis = expiry time
  const riverItems = leads
    .filter(l => l.exclusiveWindowExpiry || l.auctionEndsAt)
    .map(l => {
      const expiry = l.exclusiveWindowExpiry || l.auctionEndsAt
      const exp    = expiry?.toDate ? expiry.toDate() : new Date(expiry)
      const minsLeft = Math.max(0, Math.floor((exp - Date.now()) / 60000))
      return {
        id:       l.id,
        title:    l.quality === 'HOT' ? '🔥 Hot Lead' : l.quality === 'WARM' ? '♨️ Warm Lead' : '❄️ Cold Lead',
        subtitle: l.problem?.slice(0, 40) + (l.problem?.length > 40 ? '…' : ''),
        time:     expiry,
        quality:  l.quality,
        badge:    minsLeft < 60 ? `Expires in ${minsLeft}m` : `${fmt.currency(l.commissionAmount)}`,
      }
    })
    .sort((a, b) => new Date(a.time?.toDate ? a.time.toDate() : a.time) - new Date(b.time?.toDate ? b.time.toDate() : b.time))

  return (
    <DashboardLayout title="Leads" subtitle="Exclusive leads & marketplace">
      <div className="space-y-5">

        {/* Info strip */}
        <Alert type="info">
          Exclusive leads are yours alone for a limited window. Claim fast — others can't see them yet.
          Auction leads go to the highest bidder when the timer ends.
        </Alert>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <Tabs tabs={TYPE_TABS} active={tab} onChange={setTab} />
          <Tabs tabs={VIEW_TABS} active={viewMode} onChange={setViewMode} />
        </div>

        {/* ── Expiry Time River ──────────────────────────── */}
        {viewMode === 'river' && (
          <div className="mp-card p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="mp-rule-bold" style={{ width: 16 }} />
              <p className="mp-label">Lead expiry river — bubbles move toward "now" as they expire</p>
            </div>
            <div className="text-xs mb-3 flex items-center gap-4" style={{ color: 'var(--mp-text)', opacity: 0.45 }}>
              <span className="flex items-center gap-1.5"><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#dc2626' }} />Hot</span>
              <span className="flex items-center gap-1.5"><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#d97706' }} />Warm</span>
              <span className="flex items-center gap-1.5"><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#0369a1' }} />Cold</span>
              <span className="flex items-center gap-1.5 ml-auto" style={{ color: 'var(--mp-pop)' }}>← Expired · NOW · Expiring →</span>
            </div>
            {isLoading ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : (
              <TimeRiver
                items={riverItems}
                mode="leads"
                emptyText="No leads with expiry times in this category"
              />
            )}
          </div>
        )}

        {/* ── Cards view ─────────────────────────────────── */}
        {viewMode === 'cards' && (
          <div>
            {isLoading ? (
              <div className="flex justify-center py-12"><Spinner size="lg" /></div>
            ) : !leads.length ? (
              <EmptyState icon="🎯" title="No leads" description="Leads from your bot conversations will appear here" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {leads.map(lead => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onClaim={(id)          => claimMutation.mutate(id)}
                    onBid={(id, amount)    => bidMutation.mutate({ id, amount })}
                    claiming={claimMutation.isPending}
                    bidding={bidMutation.isPending}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}