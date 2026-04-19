// src/pages/leads/LeadsPage.jsx
// Maps to GET /api/leads, POST /api/leads/:id/claim, POST /api/leads/:id/bid
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { leadsApi } from '../../api/index'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Button, Tabs, EmptyState, Spinner, Modal, Input, Alert, Badge } from '../../components/ui/index'
import { fmt, LEAD_QUALITY_CONFIG } from '../../utils/index'
import { Target, Gavel, Zap, Clock, Lock, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const LEAD_TABS = [
  { value: 'exclusive', label: '⚡ Exclusive' },
  { value: 'broadcast', label: '📡 Broadcast' },
  { value: 'auction', label: '🔨 Auction' },
]

function LeadCard({ lead, onClaim, onBid, claiming, bidding }) {
  const qCfg = LEAD_QUALITY_CONFIG[lead.quality] || LEAD_QUALITY_CONFIG.COLD
  const [bidAmount, setBidAmount] = useState('')
  const [showBid, setShowBid] = useState(false)

  const timeLeft = lead.exclusiveWindowExpiry
    ? Math.max(0, Math.floor((new Date(lead.exclusiveWindowExpiry?.toDate?.() || lead.exclusiveWindowExpiry) - Date.now()) / 60000))
    : null

  const auctionLeft = lead.auctionEndsAt
    ? Math.max(0, Math.floor((new Date(lead.auctionEndsAt?.toDate?.() || lead.auctionEndsAt) - Date.now()) / 60000))
    : null

  return (
    <div className={clsx('glass-card gradient-border p-5 transition-all hover:border-brand-blue/20', lead.isClaimed && 'opacity-70')}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <span className={clsx('text-xs px-2 py-0.5 rounded-full border font-semibold', qCfg.color)}>{qCfg.label}</span>
        <div className="text-right">
          <p className="text-lg font-display font-bold text-green-400">{fmt.currency(lead.commissionAmount)}</p>
          <p className="text-[10px] text-slate-600">commission</p>
        </div>
      </div>

      {/* Problem */}
      <p className="text-sm text-slate-300 mb-3 leading-relaxed">{lead.problem || 'Customer inquiry'}</p>

      {/* Meta */}
      <div className="flex flex-wrap gap-2 mb-4 text-xs">
        {lead.urgency && <span className="text-slate-500 bg-navy-700/50 px-2 py-1 rounded">{lead.urgency}</span>}
        {lead.estimatedValue && <span className="text-slate-500">Est. value: <span className="text-amber-400 font-semibold">{fmt.currency(lead.estimatedValue)}</span></span>}
        {timeLeft !== null && (
          <span className={clsx('flex items-center gap-1', timeLeft < 30 ? 'text-red-400' : 'text-amber-400')}>
            <Clock className="w-3 h-3" />{timeLeft}m left
          </span>
        )}
      </div>

      {/* Customer info (if claimed) */}
      {lead.isClaimed && lead.customerPhone && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-3">
          <p className="text-xs text-green-400 font-semibold flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" />Contact Unlocked</p>
          <p className="text-sm font-semibold text-slate-200 mt-1">{lead.customerName} · {lead.customerPhone}</p>
        </div>
      )}

      {/* Auction info */}
      {lead.isAuction && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-amber-400 flex items-center gap-1"><Gavel className="w-3 h-3" />Auction</span>
            <span className="text-amber-400">{auctionLeft}m left</span>
          </div>
          <div className="flex justify-between mt-1 text-xs">
            <span className="text-slate-500">Min bid: <span className="text-slate-300">{fmt.currency(lead.minimumBid)}</span></span>
            <span className="text-slate-500">Highest: <span className="text-green-400 font-semibold">{fmt.currency(lead.currentHighestBid)}</span></span>
          </div>
        </div>
      )}

      {/* Actions */}
      {!lead.isClaimed && !lead.isOwnLead && (
        <div className="flex gap-2">
          {lead.isAuction ? (
            showBid ? (
              <div className="flex-1 flex gap-2">
                <Input placeholder={`Min: ${fmt.currency(lead.minimumBid)}`} value={bidAmount} onChange={e => setBidAmount(e.target.value)} className="flex-1" type="number" />
                <Button onClick={() => onBid(lead.id, Number(bidAmount))} loading={bidding} size="sm"><Gavel className="w-3.5 h-3.5" />Bid</Button>
              </div>
            ) : (
              <Button className="flex-1" onClick={() => setShowBid(true)} variant="secondary"><Gavel className="w-4 h-4" /> Place Bid</Button>
            )
          ) : (
            <Button className="flex-1" onClick={() => onClaim(lead.id)} loading={claiming}>
              <Zap className="w-4 h-4" /> Claim Lead
            </Button>
          )}
        </div>
      )}
      {lead.isOwnLead && !lead.isClaimed && (
        <p className="text-xs text-slate-600 flex items-center gap-1"><Lock className="w-3 h-3" /> Your exclusive lead</p>
      )}
      {lead.isClaimed && <p className="text-xs text-green-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Claimed by you</p>}
    </div>
  )
}

export default function LeadsPage() {
  const qc = useQueryClient()
  const [tab, setTab] = useState('exclusive')
  const [qualityFilter, setQualityFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['leads', tab, qualityFilter],
    queryFn: () => leadsApi.list({ tab, quality: qualityFilter || undefined }),
    select: r => r.data.leads,
    refetchInterval: 30_000,
  })

  const claimMutation = useMutation({
    mutationFn: (id) => leadsApi.claim(id),
    onSuccess: () => { toast.success('Lead claimed! Customer contact unlocked.'); qc.invalidateQueries(['leads']) },
    onError: e => toast.error(e.response?.data?.error || 'Claim failed'),
  })

  const bidMutation = useMutation({
    mutationFn: ({ id, amount }) => leadsApi.bid(id, { bidAmount: amount }),
    onSuccess: () => { toast.success('Bid placed!'); qc.invalidateQueries(['leads']) },
    onError: e => toast.error(e.response?.data?.error || 'Bid failed'),
  })

  const leads = data || []

  return (
    <DashboardLayout title="Leads" subtitle="Manage your AI-captured leads">
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <Tabs tabs={LEAD_TABS} active={tab} onChange={setTab} />
        <select value={qualityFilter} onChange={e => setQualityFilter(e.target.value)} className="input-field text-xs py-2 w-36 ml-auto">
          <option value="">All Quality</option>
          <option value="HOT">🔥 Hot</option>
          <option value="WARM">♨️ Warm</option>
          <option value="MILD_OKAY">🌊 Mild OK</option>
          <option value="COLD">❄️ Cold</option>
        </select>
      </div>

      {tab === 'exclusive' && (
        <Alert type="info" className="mb-4">
          Exclusive leads are from YOUR bot's conversations. Claim them to unlock customer contact details.
        </Alert>
      )}
      {tab === 'broadcast' && (
        <Alert type="info" className="mb-4">
          Broadcast leads are shared within your category. First business to claim wins the contact.
        </Alert>
      )}
      {tab === 'auction' && (
        <Alert type="warning" className="mb-4">
          Auction leads go to the highest bidder. The commission amount is what you pay, not what you earn.
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : leads.length === 0 ? (
        <EmptyState icon="🎯" title="No leads found" description={`No ${tab} leads available right now. They'll appear when your bot captures them.`} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onClaim={claimMutation.mutate}
              onBid={(id, amount) => bidMutation.mutate({ id, amount })}
              claiming={claimMutation.isPending}
              bidding={bidMutation.isPending}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
