// src/pages/numbers/NumbersPage.jsx
// Maps to GET /api/numbers, POST /api/numbers/purchase, DELETE /api/numbers/:id
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { numbersApi } from '../../api/index'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Button, Modal, Input, Select, EmptyState, Spinner, Alert, Badge, Card } from '../../components/ui/index'
import { Phone, Plus, Trash2, CheckCircle2, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

function PurchaseForm({ onSubmit, loading }) {
  const [form, setForm] = useState({ areaCode: '040', country: 'IN', type: 'local' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  return (
    <div className="space-y-4">
      <Alert type="info">
        A virtual phone number allows customers to call and WhatsApp your business. The AI bot will handle all interactions.
      </Alert>
      <div className="grid grid-cols-2 gap-3">
        <Select label="Country" value={form.country} onChange={e => set('country', e.target.value)}>
          <option value="IN">🇮🇳 India</option>
        </Select>
        <Select label="Number Type" value={form.type} onChange={e => set('type', e.target.value)}>
          <option value="local">Local</option>
          <option value="mobile">Mobile</option>
          <option value="tollfree">Toll-Free</option>
        </Select>
      </div>
      <Input
        label="Area Code (optional)"
        placeholder="e.g., 040 for Hyderabad"
        value={form.areaCode}
        onChange={e => set('areaCode', e.target.value)}
      />
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
        <p className="text-xs text-amber-400 font-semibold">📞 Number cost is included in your plan</p>
        <p className="text-xs text-amber-400/70 mt-0.5">You can have up to 1 active number per plan</p>
      </div>
      <Button className="w-full" loading={loading} onClick={() => onSubmit(form)}>
        <Phone className="w-4 h-4" /> Purchase Number
      </Button>
    </div>
  )
}

export default function NumbersPage() {
  const qc = useQueryClient()
  const [showPurchase, setShowPurchase] = useState(false)
  const [releaseId, setReleaseId] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['numbers'],
    queryFn: numbersApi.list,
    select: r => r.data.numbers,
  })

  const purchaseMutation = useMutation({
    mutationFn: numbersApi.purchase,
    onSuccess: () => {
      toast.success('Phone number purchased! Your bot is now active.')
      qc.invalidateQueries(['numbers'])
      setShowPurchase(false)
    },
    onError: e => toast.error(e.response?.data?.error || 'Purchase failed'),
  })

  const releaseMutation = useMutation({
    mutationFn: numbersApi.release,
    onSuccess: () => {
      toast.success('Number released')
      qc.invalidateQueries(['numbers'])
      setReleaseId(null)
    },
    onError: e => toast.error(e.response?.data?.error || 'Release failed'),
  })

  const numbers = data || []

  return (
    <DashboardLayout title="Phone Numbers" subtitle="Manage your AI bot's virtual numbers">

      {/* How it works */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { icon: '📞', title: 'Virtual Number', desc: 'Customers call or WhatsApp this number to reach your bot' },
          { icon: '🤖', title: 'AI Handles It', desc: 'Priya (or your chosen persona) answers, books, and qualifies leads' },
          { icon: '📊', title: 'You Get Insights', desc: 'All conversations tracked with analytics and lead scoring' },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="glass-card p-4 flex items-start gap-3">
            <span className="text-2xl">{icon}</span>
            <div>
              <p className="text-sm font-semibold text-slate-200">{title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mb-5">
        <h3 className="font-display font-semibold text-slate-200">Your Numbers</h3>
        {numbers.length === 0 && (
          <Button onClick={() => setShowPurchase(true)}>
            <Plus className="w-4 h-4" /> Get a Number
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : numbers.length === 0 ? (
        <EmptyState
          icon="📱"
          title="No phone number yet"
          description="Purchase a virtual number to activate your WhatsApp & voice bot"
          action={
            <Button onClick={() => setShowPurchase(true)}>
              <Plus className="w-4 h-4" /> Get Your Bot Number
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {numbers.map((num) => (
            <div key={num.id} className="glass-card gradient-border p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-brand-blue" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-slate-100 text-xl tracking-wide">{num.phoneNumber}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge color={num.isActive ? 'green' : 'slate'}>
                        {num.isActive ? '● Active' : '○ Inactive'}
                      </Badge>
                      <span className="text-xs text-slate-500 capitalize">{num.type || 'local'} · {num.country || 'IN'}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setReleaseId(num.id)}
                  className="p-2 text-slate-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10"
                  title="Release number"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-navy-400/20">
                {[
                  { label: 'Total Calls', value: num.totalCalls || 0 },
                  { label: 'WhatsApp Msgs', value: num.totalMessages || 0 },
                  { label: 'Purchased', value: num.purchasedAt ? new Date(num.purchasedAt?.toDate?.() || num.purchasedAt).toLocaleDateString('en-IN') : '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center">
                    <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
                    <p className="font-display font-semibold text-slate-200 mt-0.5">{value}</p>
                  </div>
                ))}
              </div>

              {num.isActive && (
                <div className="mt-4 flex items-center gap-2 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  Bot is live on this number — customers can call or WhatsApp to get served
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Purchase modal */}
      <Modal open={showPurchase} onClose={() => setShowPurchase(false)} title="Get a Virtual Number">
        <PurchaseForm onSubmit={purchaseMutation.mutate} loading={purchaseMutation.isPending} />
      </Modal>

      {/* Release confirm modal */}
      <Modal open={!!releaseId} onClose={() => setReleaseId(null)} title="Release Number" size="sm">
        <div className="space-y-4">
          <Alert type="warning">
            Releasing this number will deactivate your bot. Customers won't be able to reach you through this number.
          </Alert>
          <div className="flex gap-2.5">
            <Button variant="secondary" className="flex-1" onClick={() => setReleaseId(null)}>Cancel</Button>
            <Button variant="danger" className="flex-1" loading={releaseMutation.isPending} onClick={() => releaseMutation.mutate(releaseId)}>
              Release Number
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}
