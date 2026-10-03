/**
 * @file        BillingPage.jsx
 * @module      Billing
 * @project     ClientFrontend
 * @layer       Page
 * @description Billing dashboard — current plan status, trial countdown, running invoice, the plan catalog
 *              served by the backend (EXECUTION-PLAN C14), Razorpay-powered plan purchase and invoice payment,
 *              and invoice history. Everything stays on this page; no redirects to external checkout pages.
 *
 *              Payment flow (both purposes): the backend creates a paymentOrder with an explicit purpose —
 *              PLAN_PURCHASE via /plan-order for an exact catalog priceId, INVOICE via /pay for an invoice —
 *              and sets the amount itself. Razorpay Checkout collects the payment, then /verify confirms it
 *              server-side. The UI changes plan/invoice state only from the /verify response.
 *
 * @updated     2026-05-30
 * @version     1.0.0
 *
 * @sideEffects
 *   - GET /api/billing/current  — current plan + invoice
 *   - GET /api/billing/invoices — invoice history
 *   - GET /api/billing/plan     — server-side current plan, subscription and allowed upgrades
 *   - GET /api/billing/catalog  — purchasable plans with their catalog prices (priceIds)
 *   - POST /api/billing/plan-order — PLAN_PURCHASE Razorpay order for a catalog priceId
 *   - POST /api/billing/pay     — INVOICE Razorpay order for an invoice
 *   - POST /api/billing/verify  — server-side confirmation after Razorpay Checkout
 *   - Loads Razorpay Checkout.js script from CDN before opening Checkout
 *   - After a verified payment: refetches billing data and refreshes authStore.business via /api/auth/me
 */

/*
 * ╔══════════════════════════════════════════╗
 * ║           SDLC LIFECYCLE STATUS          ║
 * ╠══════════════════════════════════════════╣
 * ║ Planning     : ✅ Complete               ║
 * ║ Design       : ✅ Complete               ║
 * ║ Development  : ✅ Complete               ║
 * ║ Testing      : ⚠️  Partial              ║
 * ║ Deployment   : ✅ Complete               ║
 * ║ Maintenance  : 🔄 Active                ║
 * ╚══════════════════════════════════════════╝
 */

// ─────────────────────────────────────────
// IMPORTS & DEPENDENCIES
// ─────────────────────────────────────────
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { billingApi, authApi } from '../../api/index'
import { useAuthStore } from '../../store/authStore'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Button, Card, Badge, StatCard, Alert, Modal } from '../../components/ui/index'
import { fmt } from '../../utils/index'
import { useBillingPlan } from '../../hooks/usePlanFeatures'
import {
  Receipt, CreditCard, DollarSign, Calendar, CheckCircle2,
  XCircle, ArrowRight, Zap, Clock, AlertCircle, TrendingUp
} from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

// ─────────────────────────────────────────
// CONSTANTS & CONFIG
// ─────────────────────────────────────────

/** Human-readable labels for backend plan feature keys (display only — access comes from /api/billing/plan) */
const FEATURE_LABELS = {
  whatsappBot:          'WhatsApp AI Bot',
  virtualNumber:        'Virtual Number',
  missedCallToWhatsApp: 'Missed Call → WhatsApp',
  aiVoiceAgent:         'AI Voice Call Agent',
  leadQualification:    'Lead Qualification',
  showupVerification:   'Show-up Verification',
  analyticsDashboard:   'Analytics Dashboard',
  multilingualSupport:  'Telugu + Hindi + English',
  leadAuctionAccess:    'Lead Auction Access',
  customBotPersona:     'Custom Bot Persona',
  apiAccess:            'API Access',
}

/** Labels for catalog price programs (backend PROGRAMS) */
const PROGRAM_LABELS = { founding: 'Founding Partner', standard: 'Standard' }

/** Integer paise of an invoice/receipt (paise is authoritative; INR `total` is the legacy fallback) */
const invoicePaise = (inv) => (Number.isInteger(inv?.totalPaise) ? inv.totalPaise : Math.round((inv?.total || 0) * 100))

/** ₹ from integer paise — shows paise only when present (₹299.90, ₹5,999) */
const formatPaise = (paise) => {
  const rupees = (paise || 0) / 100
  const hasPaise = (paise || 0) % 100 !== 0
  return `₹${rupees.toLocaleString('en-IN', { minimumFractionDigits: hasPaise ? 2 : 0, maximumFractionDigits: 2 })}`
}

/** A finalized, unpaid monthly invoice with something to pay — never an estimate, a receipt, or ₹0 */
const isPayableInvoice = (inv) => Boolean(inv?.id)
  && (inv.type || 'MONTHLY') === 'MONTHLY'
  && ['PENDING', 'OVERDUE'].includes(inv.status)
  && invoicePaise(inv) > 0

/** Line items of a monthly invoice or estimate (amounts from the backend, never recomputed) */
function InvoiceBreakdown({ invoice }) {
  const line = (key) => (Number.isInteger(invoice[`${key}Paise`]) ? invoice[`${key}Paise`] : Math.round((invoice[key] || 0) * 100))
  const rows = [
    ['Plan fee', line('baseFee')],
    ['Booking commissions', line('bookingCommissions')],
    ['Show-up commissions (legacy)', line('showupCommissions')],
    ['Lead commissions', line('leadCommissions')],
    ['Credits', line('credits')],
    ['Adjustments', line('adjustments')],
  ].filter(([, v]) => v !== 0)
  return (
    <div className="mt-3 space-y-1 text-xs text-slate-500 border-t border-violet-50 pt-3">
      {rows.length === 0 && <div>Nothing billed yet this month</div>}
      {rows.map(([label, v]) => (
        <div key={label} className="flex justify-between"><span>{label}</span><span>{formatPaise(v)}</span></div>
      ))}
      <div className="text-[10px] text-slate-400 pt-1">Appointment commissions are GST-inclusive — no GST is added.</div>
    </div>
  )
}

/** Plan accent colours for the plan cards */
const PLAN_COLORS = {
  trial:   { border: 'border-slate-300', bg: 'bg-slate-50/40',    badge: 'bg-slate-100 text-slate-600' },
  starter: { border: 'border-violet-300', bg: 'bg-violet-50/60',  badge: 'bg-violet-100 text-violet-700' },
  growth:  { border: 'border-indigo-400', bg: 'bg-indigo-50/60',  badge: 'bg-indigo-100 text-indigo-700' },
  pro:     { border: 'border-amber-400',  bg: 'bg-amber-50/60',   badge: 'bg-amber-100 text-amber-800' },
}

// ─────────────────────────────────────────
// HELPER — load Razorpay script
// ─────────────────────────────────────────

/**
 * @function    loadRazorpayScript
 * @purpose     Dynamically inject Razorpay Checkout.js if not already present
 * @returns {Promise<boolean>} true if loaded successfully
 */
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (document.getElementById('rzp-script')) { resolve(true); return }
    const s = document.createElement('script')
    s.id  = 'rzp-script'
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload  = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })

// ─────────────────────────────────────────
// STATE & HOOKS
// ─────────────────────────────────────────

/**
 * @function    BillingPage
 * @purpose     Renders the complete billing dashboard — plan status, upgrade grid, invoice payment, history
 */
export default function BillingPage() {
  const { business, updateBusiness } = useAuthStore()
  const queryClient = useQueryClient()

  // [STATE]: Invoice being paid (a finalized, unpaid monthly invoice) — null when the modal is closed
  const [payTarget, setPayTarget]               = useState(null)
  // [STATE]: Plan purchase confirmation — { plan, price } exactly as served by /api/billing/catalog
  const [selectedPrice, setSelectedPrice]       = useState(null)
  // [STATE]: Success modal after a plan purchase is verified server-side
  const [purchaseSuccess, setPurchaseSuccess]   = useState(null)
  // [STATE]: Loading state while Razorpay opens
  const [rzpLoading, setRzpLoading]             = useState(false)
  // [STATE]: True while /api/billing/verify is confirming a completed Checkout
  const [verifying, setVerifying]               = useState(false)

  // [API CALL]: Current plan + outstanding invoice
  const { data: current, isLoading: cl } = useQuery({
    queryKey: ['billing-current'],
    queryFn:  billingApi.current,
    select:   r => r.data,
  })

  // [API CALL]: Billing history — plan-purchase receipts AND monthly invoices (separated below)
  const { data: invoices, isLoading: il, isError: invoicesError, refetch: refetchInvoices } = useQuery({
    queryKey: ['billing-invoices'],
    queryFn:  billingApi.invoices,
    select:   r => r.data.invoices,
  })
  const receipts = (invoices || []).filter((i) => i.type === 'PLAN_PURCHASE_RECEIPT')
  const monthlyInvoices = (invoices || []).filter((i) => i.type !== 'PLAN_PURCHASE_RECEIPT')

  // [API CALL]: Server-side current plan, subscription and the plans this business may upgrade to
  //             (shared cache with FeatureGate / Sidebar / Dashboard via useBillingPlan)
  const { data: planData } = useBillingPlan()

  // [API CALL]: Plan catalog — the only source of purchasable plans, priceIds and prices
  const { data: catalog, isLoading: catLoading, isError: catError } = useQuery({
    queryKey: ['billing-catalog'],
    queryFn:  billingApi.catalog,
    select:   r => r.data,
  })

  // [API CALL]: INVOICE payment order for this month's invoice
  const payMutation = useMutation({
    mutationFn: (d) => billingApi.pay(d),
    onSuccess: (res) => {
      setPayTarget(null)
      openRazorpay(res.data, 'Invoice Payment')
    },
    onError: e => toast.error(e.response?.data?.error || 'Payment failed'),
  })

  // [API CALL]: PLAN_PURCHASE order for the selected catalog priceId — amount and plan come from the backend
  const planOrderMutation = useMutation({
    mutationFn: (priceId) => billingApi.createPlanOrder(priceId),
    onSuccess: (res) => {
      setSelectedPrice(null)
      openRazorpay(res.data, `${res.data.planName} Plan`)
    },
    onError: e => toast.error(e.response?.data?.error || 'Could not start the plan purchase'),
  })

  // ─── Razorpay integration ───────────────────────────────────

  /**
   * @function    refreshBillingState
   * @purpose     Refetches billing data and the business profile after a verified payment
   */
  const refreshBillingState = () => {
    ['billing-current', 'billing-invoices', 'billing-plan', 'billing-catalog']
      .forEach(key => queryClient.invalidateQueries({ queryKey: [key] }))
    authApi.me()
      .then(res => updateBusiness(res.data.business))
      .catch(() => {})
  }

  /**
   * @function    verifyCheckout
   * @purpose     Confirms a completed Razorpay Checkout via POST /api/billing/verify. The payment purpose,
   *              plan and invoice state all come from the verify response — nothing is assumed client-side.
   * @param  {Object} response - Razorpay Checkout handler payload
   */
  const verifyCheckout = async (response) => {
    setVerifying(true)
    toast.loading('Confirming your payment…', { id: 'billing-verify' })
    try {
      const res = await billingApi.verify({
        razorpay_order_id:   response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature:  response.razorpay_signature,
      })
      const result = res.data

      // [BUSINESS RULE]: Captured but not yet confirmed — the webhook completes it; no state change yet
      if (res.status === 202 || result.status === 'pending') {
        toast(result.message || 'Payment received and awaiting confirmation.', { id: 'billing-verify', icon: 'ℹ️' })
        return
      }

      if (result.purpose === 'PLAN_PURCHASE') {
        toast.dismiss('billing-verify')
        const plan = catalog?.plans?.find(p => p.planId === result.plan)
        const before = planData?.planConfig?.features || {}
        setPurchaseSuccess({
          planName: plan?.name || result.plan,
          features: Object.entries(plan?.features || {})
            .filter(([k, v]) => v === true && !before[k] && FEATURE_LABELS[k])
            .map(([k]) => FEATURE_LABELS[k]),
        })
      } else {
        toast.success(
          result.invoiceStatus === 'PAID' ? 'Payment successful! Your invoice has been marked as paid.' : 'Payment successful!',
          { id: 'billing-verify' },
        )
      }
      refreshBillingState()
    } catch (e) {
      toast.error(
        e.response?.data?.error || 'We could not confirm your payment. If you were charged, it will be applied automatically.',
        { id: 'billing-verify' },
      )
    } finally {
      setVerifying(false)
    }
  }

  /**
   * @function    openRazorpay
   * @purpose     Loads Razorpay Checkout.js and opens Checkout for an order created by the backend.
   *              On success the payment is confirmed server-side via verifyCheckout — never assumed.
   * @param  {Object} order       - /plan-order or /pay response: { orderId, amountPaise, currency, keyId, ... }
   * @param  {string} description - Checkout description line
   */
  const openRazorpay = async (order, description) => {
    setRzpLoading(true)
    const loaded = await loadRazorpayScript()
    setRzpLoading(false)

    if (!loaded) {
      toast.error('Could not load payment gateway. Please check your internet connection.')
      return
    }

    const options = {
      key:         order.keyId,
      amount:      order.amountPaise,
      currency:    order.currency,
      order_id:    order.orderId,
      name:        'Zyntell',
      description,
      theme:       { color: '#4F46E5' },
      prefill: {
        name:  business?.name  || '',
        email: business?.email || '',
        contact: business?.phone || '',
      },
      handler: (response) => { verifyCheckout(response) },
      modal: {
        ondismiss: () => toast('Payment cancelled', { icon: 'ℹ️' }),
      },
    }

    // [GUARD]: Razorpay is injected globally by the CDN script
    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  // [DATA TRANSFORM]: Calculate days remaining on trial
  const trialDaysLeft = (() => {
    if (!business?.isTrialActive || !business?.trialEndDate) return null
    const end = business.trialEndDate?.toDate ? business.trialEndDate.toDate() : new Date(business.trialEndDate)
    return Math.max(0, Math.ceil((end - new Date()) / (1000 * 60 * 60 * 24)))
  })()

  // [DATA TRANSFORM]: Current plan from the backend (/api/billing/plan)
  const currentPlanId   = planData?.currentPlan
  const currentPlanName = planData?.planConfig?.name || '…'
  const currentFeatures = planData?.planConfig?.features || {}
  const subscription    = planData?.subscription || null
  // [BUSINESS RULE]: Only plans the backend lists as upgrades can be bought here; other changes go through support
  const upgradeIds      = new Set((planData?.upgrades || []).map(u => u.id))

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <DashboardLayout title="Billing" subtitle="Plans, invoices & payments">

      {/* ── Section 1: Current Status ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">

        {/* Current Plan Card */}
        <div className="lg:col-span-2">
          <Card title="Current Plan">
            {cl ? (
              <div className="h-24 animate-pulse bg-violet-50 rounded-lg" />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-display font-bold text-[#1E1B4B]">{currentPlanName} Plan</p>
                    <p className="text-sm text-slate-500 mt-1">
                      {Number.isFinite(subscription?.amountINR)
                        ? `${fmt.currency(subscription.amountINR)}/mo${subscription.program ? ` · ${PROGRAM_LABELS[subscription.program] || subscription.program}` : ''}`
                        : planData?.planConfig?.description}
                    </p>
                  </div>
                  <span className={clsx('text-xs font-bold px-3 py-1.5 rounded-full', PLAN_COLORS[currentPlanId]?.badge)}>
                    {currentPlanName}
                  </span>
                </div>

                {/* Trial countdown */}
                {business?.isTrialActive && trialDaysLeft !== null && (
                  <div className={clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-lg border',
                    trialDaysLeft <= 3
                      ? 'bg-red-50 border-red-200'
                      : 'bg-amber-50 border-amber-200'
                  )}>
                    <Clock className={clsx('w-4 h-4 shrink-0', trialDaysLeft <= 3 ? 'text-red-500' : 'text-amber-600')} />
                    <div>
                      <p className={clsx('text-sm font-semibold', trialDaysLeft <= 3 ? 'text-red-700' : 'text-amber-800')}>
                        {trialDaysLeft <= 3
                          ? `⚠️ Trial ends in ${trialDaysLeft} day${trialDaysLeft !== 1 ? 's' : ''} — upgrade now to keep your bot running`
                          : `Trial active — ${trialDaysLeft} days remaining`}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">Bot deactivates when trial expires</p>
                    </div>
                  </div>
                )}

                {/* Current invoice */}
                {current?.invoice && (
                  <div className="border border-violet-100 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-semibold text-[#1E1B4B]">This Month's Invoice</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {current.invoice.status === 'ESTIMATED' ? 'Running estimate — finalised on 1st' : `Due: ${fmt.date(current.invoice.dueDate)}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-display font-bold text-amber-500">{formatPaise(invoicePaise(current.invoice))}</p>
                        <Badge color={current.invoice.status === 'PAID' ? 'green' : current.invoice.status === 'OVERDUE' ? 'red' : 'amber'}>
                          {current.invoice.status}
                        </Badge>
                      </div>
                    </div>
                    {/* Invoice breakdown */}
                    <InvoiceBreakdown invoice={current.invoice} />
                    {/* [BUSINESS RULE]: Only a finalized, unpaid invoice with a balance can be paid — never an estimate or ₹0 */}
                    {isPayableInvoice(current.invoice) && (
                      <Button className="w-full mt-3" onClick={() => setPayTarget(current.invoice)}>
                        <CreditCard className="w-4 h-4" /> Pay Now {formatPaise(invoicePaise(current.invoice))}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Total Due stat — finalized, unpaid monthly invoices only (an estimate is never "due") */}
        <StatCard
          icon={<DollarSign className="w-5 h-5" />}
          label="Total Due"
          value={formatPaise(monthlyInvoices.filter(isPayableInvoice).reduce((sum, inv) => sum + invoicePaise(inv), 0))}
          color="amber"
          sub={business?.isTrialActive ? 'No charges during trial' : monthlyInvoices.some(isPayableInvoice) ? 'Unpaid invoices' : 'Nothing due right now'}
        />
      </div>

      {/* ── Section 2: Plan Comparison & Upgrade ─────────────── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-[#1E1B4B] text-lg">Plans</h3>
          <p className="text-xs text-slate-500">All plans include a 14-day free trial</p>
        </div>

        {catalog?.foundingEligible && (
          <div className="mb-4">
            <Alert type="info">You're a member of the {catalog.programName} — founding prices are available to you.</Alert>
          </div>
        )}

        {catalog?.appointmentCommission && (
          <p className="text-xs text-slate-500 mb-4">
            All plans: {catalog.appointmentCommission.ratePercent}% commission on the {catalog.appointmentCommission.basis} for
            each completed booking made through Zyntell — GST-inclusive (no GST added), billed on your monthly invoice.
          </p>
        )}

        {catLoading ? (
          <div className="h-40 animate-pulse bg-violet-50 rounded-xl" />
        ) : catError || !catalog?.plans?.length ? (
          <p className="text-slate-500 text-sm text-center py-6">Plans could not be loaded. Please refresh the page.</p>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {catalog.plans.map((plan) => {
            const planId    = plan.planId
            const colors    = PLAN_COLORS[planId] || PLAN_COLORS.starter
            const isCurrent = planId === currentPlanId
            const canBuy    = upgradeIds.has(planId)
            const prices    = (plan.prices || []).filter(p => p.available)
            const features  = plan.features || {}

            return (
              <div
                key={planId}
                className={clsx(
                  'rounded-xl border p-5 flex flex-col transition-all',
                  colors.border,
                  colors.bg,
                  isCurrent && 'ring-2 ring-offset-1',
                  planId === 'growth' && 'ring-indigo-400'
                )}
              >
                {/* Plan header */}
                <div className="mb-4">
                  {planId === 'growth' && (
                    <div className="text-[10px] text-indigo-700 font-bold uppercase tracking-wider mb-1.5">⭐ Most Popular</div>
                  )}
                  <p className="font-display font-bold text-[#1E1B4B] text-lg">{plan.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{plan.description}</p>
                </div>

                {/* Catalog prices (priceIds) available to this business */}
                <div className="space-y-2 mb-4">
                  {prices.map((price) => (
                    <div key={price.priceId} className="rounded-lg border border-slate-200 bg-white/70 p-3">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {PROGRAM_LABELS[price.program] || price.program}
                        </span>
                        <span className="text-xl font-display font-extrabold text-[#1E1B4B]">
                          {fmt.currency(price.amountINR)}
                          <span className="text-xs text-slate-500 font-normal">/{price.interval === 'month' ? 'mo' : price.interval}</span>
                        </span>
                      </div>
                      {(price.regularPriceINR || price.lockMonths) && (
                        <p className="text-[11px] text-slate-500 mt-1 text-right">
                          {price.regularPriceINR ? <span className="line-through mr-1">{fmt.currency(price.regularPriceINR)}</span> : null}
                          {price.lockMonths ? `locked for ${price.lockMonths} months` : null}
                        </p>
                      )}
                      {canBuy && (
                        <Button
                          variant={price.program === 'founding' || planId === 'growth' ? 'primary' : 'secondary'}
                          className="w-full mt-2"
                          size="sm"
                          onClick={() => setSelectedPrice({ plan, price })}
                        >
                          Choose {PROGRAM_LABELS[price.program] || ''} <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Feature list */}
                <ul className="space-y-1.5 mb-5 flex-1">
                  {Object.entries(FEATURE_LABELS).map(([key, label]) => {
                    const val = features[key]
                    if (typeof val === 'number') return null // skip numeric features (commissions)
                    return (
                      <li key={key} className="flex items-center gap-2 text-xs">
                        {val
                          ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                          : <XCircle      className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                        <span className={val ? 'text-slate-700' : 'text-slate-400'}>{label}</span>
                      </li>
                    )
                  })}
                </ul>

                {/* Plan status */}
                {isCurrent ? (
                  <div className="text-center text-xs font-semibold text-slate-500 py-2 border border-slate-200 rounded-lg bg-white/60">
                    ✓ Current Plan
                  </div>
                ) : !canBuy && planData ? (
                  <div className="text-center text-xs text-slate-400 py-2">
                    To change or renew your plan, contact support
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
        )}
      </div>

      {/* ── Section 3: Billing history — receipts and monthly invoices are separate ── */}
      {invoicesError ? (
        <Card title="Billing History">
          <Alert type="error">
            We couldn't load your billing history.{' '}
            <button className="underline font-semibold" onClick={() => refetchInvoices()}>Try again</button>
          </Alert>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card title="Plan Payments">
            {il ? (
              <div className="h-20 animate-pulse bg-violet-50 rounded-lg" />
            ) : !receipts.length ? (
              <p className="text-slate-500 text-sm text-center py-6">No plan payments yet</p>
            ) : (
              <div className="space-y-2">
                {receipts.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-3 bg-violet-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-[#1E1B4B]">
                        {r.planName || r.plan} plan{r.program ? ` · ${PROGRAM_LABELS[r.program] || r.program}` : ''}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Paid {fmt.date(r.paidAt || r.createdAt)}{r.razorpayPaymentId ? ` · ${r.razorpayPaymentId}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-semibold text-[#1E1B4B]">{formatPaise(invoicePaise(r))}</p>
                      <Badge color="green">PAID</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="Monthly Invoices">
            {il ? (
              <div className="h-20 animate-pulse bg-violet-50 rounded-lg" />
            ) : !monthlyInvoices.length ? (
              <p className="text-slate-500 text-sm text-center py-6">No monthly invoices yet</p>
            ) : (
              <div className="space-y-2">
                {monthlyInvoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-3 bg-violet-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-[#1E1B4B]">{inv.month}</p>
                      {inv.dueDate && inv.status !== 'PAID' && (
                        <p className="text-xs text-slate-500 mt-0.5">Due {fmt.date(inv.dueDate)}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-semibold text-[#1E1B4B]">{formatPaise(invoicePaise(inv))}</p>
                      <Badge color={inv.status === 'PAID' ? 'green' : inv.status === 'OVERDUE' ? 'red' : inv.status === 'VOID' ? 'slate' : 'amber'}>{inv.status}</Badge>
                      {isPayableInvoice(inv) && (
                        <Button size="sm" onClick={() => setPayTarget(inv)}>Pay</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ── Invoice Payment Modal ─────────────────────────────── */}
      <Modal open={!!payTarget} onClose={() => setPayTarget(null)} title={payTarget?.month ? `Pay Invoice — ${payTarget.month}` : 'Pay Invoice'}>
        {payTarget && (
          <div className="space-y-4">
            <Alert type="info">Payment is processed securely via Razorpay. You will not leave this page.</Alert>
            <div className="bg-violet-50 rounded-lg p-4 text-sm">
              <InvoiceBreakdown invoice={payTarget} />
              <div className="flex justify-between font-bold pt-2 mt-2 border-t border-violet-100">
                <span className="text-[#1E1B4B]">Total</span>
                <span className="text-amber-500">{formatPaise(invoicePaise(payTarget))}</span>
              </div>
            </div>
            <Button
              className="w-full"
              loading={payMutation.isPending || rzpLoading || verifying}
              onClick={() => payMutation.mutate({ invoiceId: payTarget.id })}
            >
              <CreditCard className="w-4 h-4" /> Pay {formatPaise(invoicePaise(payTarget))}
            </Button>
          </div>
        )}
      </Modal>

      {/* ── Plan Purchase Confirmation Modal ──────────────────── */}
      {selectedPrice && (
        <Modal open={!!selectedPrice} onClose={() => setSelectedPrice(null)} title={`Upgrade to ${selectedPrice.plan.name}`}>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              You're upgrading from <strong>{currentPlanName}</strong> to <strong>{selectedPrice.plan.name}</strong>
              {' '}({PROGRAM_LABELS[selectedPrice.price.program] || selectedPrice.price.program}) at{' '}
              <strong>{fmt.currency(selectedPrice.price.amountINR)}/month</strong>.
            </p>
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-3">Features you're unlocking</p>
              <ul className="space-y-2">
                {Object.entries(FEATURE_LABELS).map(([key, label]) => {
                  const hadBefore = Boolean(currentFeatures[key])
                  const getsNow   = Boolean(selectedPrice.plan.features?.[key])
                  if (!getsNow || hadBefore) return null
                  return (
                    <li key={key} className="flex items-center gap-2 text-sm text-indigo-800">
                      <Zap className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      {label}
                    </li>
                  )
                })}
              </ul>
            </div>
            <Alert type="info">
              You'll pay <strong>{fmt.currency(selectedPrice.price.amountINR)}</strong> securely via Razorpay.
              Your plan changes as soon as the payment is confirmed.
            </Alert>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setSelectedPrice(null)}>Cancel</Button>
              <Button
                className="flex-1"
                loading={planOrderMutation.isPending || rzpLoading || verifying}
                onClick={() => planOrderMutation.mutate(selectedPrice.price.priceId)}
              >
                Confirm & Pay <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Plan Purchase Success Modal (shown only after /verify confirms it) ── */}
      {purchaseSuccess && (
        <Modal open={!!purchaseSuccess} onClose={() => setPurchaseSuccess(null)} title="Welcome to Zyntell!">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
              <div>
                <p className="font-semibold text-green-700">{purchaseSuccess.planName} Plan Active!</p>
                <p className="text-xs text-green-600/70 mt-0.5">Your new features are live right now</p>
              </div>
            </div>
            {purchaseSuccess.features.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Now available for you</p>
                <ul className="space-y-2">
                  {purchaseSuccess.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                      <Zap className="w-4 h-4 text-indigo-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Button className="w-full" onClick={() => setPurchaseSuccess(null)}>
              Start Exploring <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Modal>
      )}

    </DashboardLayout>
  )
}
