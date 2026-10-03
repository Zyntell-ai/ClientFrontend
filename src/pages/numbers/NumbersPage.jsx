/**
 * @file        NumbersPage.jsx
 * @module      Numbers
 * @project     ClientFrontend
 * @layer       Page
 * @description Phone Numbers — request a virtual number, follow the request's status, and see the active number.
 *
 *              V1 (manual provisioning): the business submits a request; Zyntell buys and configures the
 *              voice number (Exotel), allocates it, tests it and activates it. A number appears here only once it
 *              is ACTIVE (the backend never returns allocated-but-inactive numbers). There is no self-service
 *              purchase and no OTP registration.
 *
 * @sideEffects
 *   - GET  /api/numbers            — active numbers
 *   - GET  /api/numbers/requests   — this business's requests (status, timestamps, reason)
 *   - POST /api/numbers/requests   — request a virtual number
 */

// ─────────────────────────────────────────
// IMPORTS & DEPENDENCIES
// ─────────────────────────────────────────
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { numbersApi } from '../../api/index'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Button, Modal, Input, Textarea, Spinner, Alert, Badge } from '../../components/ui/index'
import { Phone, CheckCircle2, Clock, PhoneCall } from 'lucide-react'
import toast from 'react-hot-toast'

// ─────────────────────────────────────────
// CONSTANTS & HELPERS
// ─────────────────────────────────────────

/** Business-facing request statuses (backend numberRequests state machine) */
const REQUEST_STATUS = {
  PENDING:     { label: 'Requested',            color: 'amber',  hint: 'We have received your request.' },
  IN_PROGRESS: { label: 'In progress',          color: 'blue',   hint: 'Our team is setting up your number.' },
  ALLOCATED:   { label: 'Number allocated',     color: 'purple', hint: 'Your number is reserved and being tested. It will appear here once it is live.' },
  ACTIVE:      { label: 'Active',               color: 'green',  hint: 'Your number is live.' },
  REJECTED:    { label: 'Not approved',         color: 'red',    hint: 'Your request could not be completed.' },
  CANCELLED:   { label: 'Cancelled',            color: 'slate',  hint: 'This request was cancelled.' },
}
const OPEN_STATUSES = ['PENDING', 'IN_PROGRESS', 'ALLOCATED']

/** Firestore timestamps arrive as { _seconds } (or ISO strings) over JSON */
const toDate = (v) => {
  if (!v) return null
  if (typeof v === 'string') return new Date(v)
  if (v._seconds != null) return new Date(v._seconds * 1000)
  if (v.seconds != null) return new Date(v.seconds * 1000)
  return null
}
const fmtDateTime = (v) => {
  const d = toDate(v)
  return d ? d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'
}

// ─────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────

/** One request with its status history */
function RequestCard({ request }) {
  const cfg = REQUEST_STATUS[request.status] || { label: request.status, color: 'slate', hint: '' }
  return (
    <div className="glass-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#1E1B4B]">Virtual number request</p>
          <p className="text-xs text-slate-500 mt-0.5">Requested {fmtDateTime(request.createdAt)}</p>
        </div>
        <Badge color={cfg.color}>{cfg.label}</Badge>
      </div>

      <p className="text-sm text-slate-600 mt-3">{cfg.hint}</p>
      {request.status === 'REJECTED' && request.statusReason && (
        <Alert type="error" className="mt-3">Reason: {request.statusReason}</Alert>
      )}

      {(request.preferredArea || request.preferredNumber || request.notes) && (
        <div className="mt-3 text-xs text-slate-500 space-y-0.5">
          {request.preferredArea && <p>Preferred area: <span className="text-slate-700">{request.preferredArea}</span></p>}
          {request.preferredNumber && <p>Preferred number: <span className="text-slate-700">{request.preferredNumber}</span></p>}
          {request.notes && <p>Notes: <span className="text-slate-700">{request.notes}</span></p>}
        </div>
      )}

      {request.statusHistory?.length > 0 && (
        <ol className="mt-4 pt-4 border-t border-violet-100 space-y-1.5">
          {request.statusHistory.map((h, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
              <span className="font-medium text-slate-700">{REQUEST_STATUS[h.status]?.label || h.status}</span>
              <span>· {fmtDateTime(h.at)}</span>
              {h.note && h.status === 'REJECTED' && <span>· {h.note}</span>}
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

/** An ACTIVE number */
function NumberCard({ num }) {
  return (
    <div className="glass-card gradient-border p-5">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center">
          <Phone className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <p className="font-display font-bold text-[#1E1B4B] text-xl tracking-wide">{num.phoneNumber}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge color="green">● Active</Badge>
            {num.trial && <Badge color="amber">Trial number · {num.trial.expired ? 'trial period ended' : `until ${fmtDateTime(num.trial.endsAt)}`}</Badge>}
            {num.type === 'voice' ? <Badge color="amber">🎙 Voice</Badge> : <Badge color="purple">💬 WhatsApp</Badge>}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-violet-100">
        <div className="text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wide">{num.type === 'voice' ? 'Total calls' : 'Messages'}</p>
          <p className="font-display font-semibold text-[#1E1B4B] mt-0.5">{(num.type === 'voice' ? num.totalCalls : num.totalMessages) || 0}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Live since</p>
          <p className="font-display font-semibold text-[#1E1B4B] mt-0.5">{fmtDateTime(num.activatedAt || num.assignedAt || num.createdAt)}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs text-green-700 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
        {num.type === 'voice'
          ? 'AI Receptionist is answering calls on this number'
          : 'Your WhatsApp assistant is live on this number'}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────

/**
 * @function    NumbersPage
 * @purpose     Request a virtual number and follow it until it is live
 */
export default function NumbersPage() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ preferredArea: '', notes: '' })

  const numbersQuery = useQuery({ queryKey: ['numbers'], queryFn: numbersApi.list, select: (r) => r.data.numbers || [] })
  const requestsQuery = useQuery({ queryKey: ['number-requests'], queryFn: numbersApi.listRequests, select: (r) => r.data.requests || [] })

  const createMutation = useMutation({
    mutationFn: () => numbersApi.createRequest({
      preferredArea: form.preferredArea.trim() || undefined,
      notes: form.notes.trim() || undefined,
    }),
    onSuccess: () => {
      toast.success('Request sent — we will set up your number and let you know here.')
      setShowModal(false)
      setForm({ preferredArea: '', notes: '' })
      queryClient.invalidateQueries({ queryKey: ['number-requests'] })
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Could not send your request'),
  })

  const numbers = numbersQuery.data || []
  const requests = requestsQuery.data || []
  const openRequest = requests.find((r) => OPEN_STATUSES.includes(r.status))
  // [BUSINESS RULE]: V1 — one number per business; the backend enforces it, the UI just doesn't offer a second
  const canRequest = numbers.length === 0 && !openRequest
  const loading = numbersQuery.isLoading || requestsQuery.isLoading
  const loadError = numbersQuery.isError || requestsQuery.isError

  return (
    <DashboardLayout title="Phone Numbers" subtitle="Your business's virtual number">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { icon: '📝', title: '1. Request',  desc: 'Tell us your preferred area. No purchase needed from you.' },
          { icon: '🛠️', title: '2. We set it up', desc: 'Our team buys, connects and tests your number.' },
          { icon: '📞', title: '3. Go live',  desc: 'Your number appears here once it is active, with the AI Receptionist answering.' },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="glass-card p-4 flex items-start gap-3">
            <span className="text-2xl">{icon}</span>
            <div>
              <p className="text-sm font-semibold text-[#1E1B4B]">{title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mb-5">
        <h3 className="font-display font-semibold text-[#1E1B4B]">Your Number</h3>
        {canRequest && !loading && !loadError && (
          <Button onClick={() => setShowModal(true)}>
            <PhoneCall className="w-4 h-4" /> Request Virtual Number
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : loadError ? (
        <Alert type="error">We couldn't load your phone numbers. Please refresh the page.</Alert>
      ) : (
        <div className="space-y-4">
          {numbers.map((num) => <NumberCard key={num.id} num={num} />)}

          {numbers.length === 0 && !openRequest && (
            <div className="glass-card p-10 text-center">
              <p className="text-3xl mb-3">📱</p>
              <p className="font-display font-semibold text-[#1E1B4B] mb-1">No phone number yet</p>
              <p className="text-sm text-slate-500 mb-6">Request a virtual number and we'll set it up for you.</p>
              <Button onClick={() => setShowModal(true)}>
                <PhoneCall className="w-4 h-4" /> Request Virtual Number
              </Button>
            </div>
          )}

          {numbers.length > 0 && (
            <p className="text-xs text-slate-500">Need a different or additional number? Contact support.</p>
          )}

          {requests.length > 0 && (
            <div className="pt-2">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Requests
              </h4>
              <div className="space-y-3">
                {requests.map((r) => <RequestCard key={r.id} request={r} />)}
              </div>
            </div>
          )}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Request Virtual Number">
        <div className="space-y-4">
          <Alert type="info">
            Our team will set up a dedicated number for your business and test it before it goes live.
            It will appear on this page as soon as it is active.
          </Alert>
          <Input
            label="Preferred area (optional)"
            placeholder="e.g., Indiranagar, Bengaluru"
            value={form.preferredArea}
            maxLength={100}
            onChange={(e) => setForm((f) => ({ ...f, preferredArea: e.target.value }))}
          />
          <Textarea
            label="Notes (optional)"
            placeholder="Anything we should know?"
            value={form.notes}
            maxLength={500}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
          <div className="flex gap-2.5">
            <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button className="flex-1" loading={createMutation.isPending} onClick={() => createMutation.mutate()}>
              Send Request
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}
