/**
 * @file        BillingPage.jsx
 * @module      Billing
 * @project     ClientFrontend
 * @layer       Page
 * @description Billing dashboard — shows current plan status, trial countdown, running invoice,
 *              four-plan comparison grid, Razorpay-powered plan upgrade, and invoice history.
 *              Everything stays on this page; no redirects to external checkout pages.
 *
 * @updated     2026-05-30
 * @version     1.0.0
 *
 * @sideEffects
 *   - GET /api/billing/current  — current plan + invoice
 *   - GET /api/billing/invoices — invoice history
 *   - GET /api/billing/plan     — plan config + upgrade options
 *   - POST /api/billing/pay     — Razorpay order for invoice payment
 *   - POST /api/billing/upgrade — Razorpay order for plan upgrade
 *   - Loads Razorpay Checkout.js script from CDN on upgrade
 *   - Updates authStore.business.plan after successful upgrade
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
import { useQuery, useMutation } from '@tanstack/react-query'
import { billingApi } from '../../api/index'
import { useAuthStore } from '../../store/authStore'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Button, Card, Badge, StatCard, Alert, Modal } from '../../components/ui/index'
import { fmt } from '../../utils/index'
import { PLANS, PLAN_ORDER, getPlanConfig, resolvePlanId, isPlanHigher, getPlanThatUnlocks } from '../../config/plans'
import {
  Receipt, CreditCard, DollarSign, Calendar, CheckCircle2,
  XCircle, ArrowRight, Zap, Clock, AlertCircle, TrendingUp
} from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

// ─────────────────────────────────────────
// CONSTANTS & CONFIG
// ─────────────────────────────────────────

/** Human-readable feature labels matching keys in plans.js */
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

/** Plan accent colours for the upgrade cards */
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
  const currentPlanId = resolvePlanId(business?.plan)

  // [STATE]: Payment modal for existing invoice
  const [showPayModal, setShowPayModal]         = useState(false)
  // [STATE]: Upgrade confirmation modal — holds the target plan object
  const [confirmUpgrade, setConfirmUpgrade]     = useState(null)
  // [STATE]: Success modal after upgrade payment completes
  const [upgradeSuccess, setUpgradeSuccess]     = useState(null)
  // [STATE]: Loading state while Razorpay opens
  const [rzpLoading, setRzpLoading]             = useState(false)

  // [API CALL]: Current plan + outstanding invoice
  const { data: current, isLoading: cl } = useQuery({
    queryKey: ['billing-current'],
    queryFn:  billingApi.current,
    select:   r => r.data,
  })

  // [API CALL]: Invoice history
  const { data: invoices, isLoading: il } = useQuery({
    queryKey: ['billing-invoices'],
    queryFn:  billingApi.invoices,
    select:   r => r.data.invoices,
  })

  // [API CALL]: Plan config + upgrade options from backend
  const { data: planData } = useQuery({
    queryKey: ['billing-plan'],
    queryFn:  billingApi.plan,
    select:   r => r.data,
  })

  // [API CALL]: Mutation for invoice payment
  const payMutation = useMutation({
    mutationFn: (d) => billingApi.pay(d),
    onSuccess: (res) => {
      // [ASYNC]: Open Razorpay checkout for invoice payment
      openRazorpay(res.data, null)
      setShowPayModal(false)
    },
    onError: e => toast.error(e.response?.data?.error || 'Payment failed'),
  })

  // [API CALL]: Mutation for plan upgrade order
  const upgradeMutation = useMutation({
    mutationFn: (targetPlan) => billingApi.upgrade(targetPlan),
    onSuccess: (res, targetPlan) => {
      // [ASYNC]: Open Razorpay checkout for upgrade payment
      openRazorpay(res.data, targetPlan)
      setConfirmUpgrade(null)
    },
    onError: e => toast.error(e.response?.data?.error || 'Could not initiate upgrade'),
  })

  // ─── Razorpay integration ───────────────────────────────────

  /**
   * @function    openRazorpay
   * @purpose     Loads Razorpay Checkout.js and opens the payment modal.
   *              On success, updates the auth store so the UI reflects the new plan immediately.
   * @param  {Object}  orderData  - { orderId, amountPaise, keyId, ... }
   * @param  {string|null} targetPlan - Plan being upgraded to (null for invoice payments)
   */
  const openRazorpay = async (orderData, targetPlan) => {
    setRzpLoading(true)
    const loaded = await loadRazorpayScript()
    setRzpLoading(false)

    if (!loaded) {
      toast.error('Could not load payment gateway. Please check your internet connection.')
      return
    }

    const options = {
      key:         orderData.keyId,
      amount:      orderData.amountPaise,
      currency:    'INR',
      order_id:    orderData.orderId,
      name:        'Zyntell',
      description: targetPlan ? `Upgrade to ${orderData.planName || targetPlan} Plan` : 'Invoice Payment',
      theme:       { color: '#4F46E5' },
      prefill: {
        name:  business?.name  || '',
        email: business?.email || '',
        contact: business?.phone || '',
      },
      handler: (response) => {
        // [BUSINESS RULE]: Payment captured — webhook handles DB update.
        // We optimistically update the auth store so the UI refreshes immediately.
        if (targetPlan) {
          updateBusiness({ plan: targetPlan, isTrialActive: false })
          const newConfig = getPlanConfig(targetPlan)
          setUpgradeSuccess({
            planName: newConfig.name,
            features: Object.entries(newConfig.features)
              .filter(([k, v]) => v === true && FEATURE_LABELS[k])
              .map(([k]) => FEATURE_LABELS[k]),
          })
        } else {
          toast.success('Payment successful! Your invoice has been marked as paid.')
        }
      },
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

  const currentConfig = getPlanConfig(currentPlanId)

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
                    <p className="text-2xl font-display font-bold text-[#1E1B4B]">{currentConfig.name} Plan</p>
                    <p className="text-sm text-slate-500 mt-1">{currentConfig.badge}</p>
                  </div>
                  <span className={clsx('text-xs font-bold px-3 py-1.5 rounded-full', PLAN_COLORS[currentPlanId]?.badge)}>
                    {currentConfig.name}
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
                        <p className="text-xl font-display font-bold text-amber-500">{fmt.currency(current.invoice.total)}</p>
                        <Badge color={current.invoice.status === 'PAID' ? 'green' : current.invoice.status === 'OVERDUE' ? 'red' : 'amber'}>
                          {current.invoice.status}
                        </Badge>
                      </div>
                    </div>
                    {/* Invoice breakdown */}
                    <div className="mt-3 space-y-1 text-xs text-slate-500 border-t border-violet-50 pt-3">
                      {current.invoice.baseFee > 0 && (
                        <div className="flex justify-between"><span>Plan fee</span><span>{fmt.currency(current.invoice.baseFee)}</span></div>
                      )}
                      {current.invoice.bookingCommissions > 0 && (
                        <div className="flex justify-between"><span>Booking commissions</span><span>{fmt.currency(current.invoice.bookingCommissions)}</span></div>
                      )}
                      {current.invoice.showupCommissions > 0 && (
                        <div className="flex justify-between"><span>Show-up commissions</span><span>{fmt.currency(current.invoice.showupCommissions)}</span></div>
                      )}
                      {current.invoice.leadCommissions > 0 && (
                        <div className="flex justify-between"><span>Lead commissions</span><span>{fmt.currency(current.invoice.leadCommissions)}</span></div>
                      )}
                    </div>
                    {current.invoice.status !== 'PAID' && !business?.isTrialActive && (
                      <Button className="w-full mt-3" onClick={() => setShowPayModal(true)}>
                        <CreditCard className="w-4 h-4" /> Pay Now {fmt.currency(current.invoice.total)}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Total Due stat */}
        <StatCard
          icon={<DollarSign className="w-5 h-5" />}
          label="Total Due"
          value={fmt.currency(current?.invoice?.total ?? 0)}
          color="amber"
          sub={business?.isTrialActive ? 'No charges during trial' : 'Current billing period'}
        />
      </div>

      {/* ── Section 2: Plan Comparison & Upgrade ─────────────── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-[#1E1B4B] text-lg">Plans</h3>
          <p className="text-xs text-slate-500">All plans include a 14-day free trial</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {PLAN_ORDER.map((planId) => {
            const cfg = PLANS[planId]
            if (typeof cfg === 'string') return null // skip aliases
            const colors    = PLAN_COLORS[planId]
            const isCurrent = planId === currentPlanId
            const isHigher  = isPlanHigher(planId, currentPlanId)
            const isLower   = isPlanHigher(currentPlanId, planId) && planId !== currentPlanId

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
                  <p className="font-display font-bold text-[#1E1B4B] text-lg">{cfg.name}</p>
                  <p className="text-2xl font-display font-extrabold text-[#1E1B4B] mt-1">
                    {cfg.price === 0 ? 'Free' : fmt.currency(cfg.price)}
                    <span className="text-xs text-slate-500 font-normal">{cfg.price > 0 ? '/mo' : ''}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{cfg.description}</p>
                </div>

                {/* Feature list */}
                <ul className="space-y-1.5 mb-5 flex-1">
                  {Object.entries(FEATURE_LABELS).map(([key, label]) => {
                    const val = cfg.features[key]
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
                  {/* Commission rates */}
                  {cfg.features.bookingCommission > 0 && (
                    <li className="flex items-center gap-2 text-xs mt-2 pt-2 border-t border-slate-200">
                      <span className="text-slate-500">Booking commission:</span>
                      <span className="font-semibold text-slate-700">₹{cfg.features.bookingCommission}</span>
                    </li>
                  )}
                  {cfg.features.showupCommission > 0 && (
                    <li className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500">Show-up bonus:</span>
                      <span className="font-semibold text-slate-700">₹{cfg.features.showupCommission}</span>
                    </li>
                  )}
                </ul>

                {/* Action button */}
                {isCurrent ? (
                  <div className="text-center text-xs font-semibold text-slate-500 py-2 border border-slate-200 rounded-lg bg-white/60">
                    ✓ Current Plan
                  </div>
                ) : isHigher ? (
                  <Button
                    variant={planId === 'growth' ? 'primary' : 'secondary'}
                    className="w-full"
                    size="sm"
                    onClick={() => setConfirmUpgrade(cfg)}
                  >
                    Upgrade to {cfg.name} <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                ) : (
                  <div className="text-center text-xs text-slate-400 py-2">
                    To downgrade, contact support
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Section 3: Invoice History ────────────────────────── */}
      <Card title="Invoice History">
        {il ? (
          <div className="h-20 animate-pulse bg-violet-50 rounded-lg" />
        ) : !invoices?.length ? (
          <p className="text-slate-500 text-sm text-center py-6">No invoices yet</p>
        ) : (
          <div className="space-y-2">
            {invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between p-3 bg-violet-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-[#1E1B4B]">{inv.month}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-sm font-semibold text-[#1E1B4B]">{fmt.currency(inv.total)}</p>
                  <Badge color={inv.status === 'PAID' ? 'green' : inv.status === 'OVERDUE' ? 'red' : 'amber'}>{inv.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Invoice Payment Modal ─────────────────────────────── */}
      <Modal open={showPayModal} onClose={() => setShowPayModal(false)} title="Pay Invoice">
        <div className="space-y-4">
          <Alert type="info">Payment is processed securely via Razorpay. You will not leave this page.</Alert>
          <div className="bg-violet-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-400">Plan fee</span><span>{fmt.currency(current?.invoice?.baseFee || 0)}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Commissions</span>
              <span>{fmt.currency((current?.invoice?.bookingCommissions || 0) + (current?.invoice?.showupCommissions || 0) + (current?.invoice?.leadCommissions || 0))}</span>
            </div>
            <div className="flex justify-between font-bold pt-2 border-t border-violet-100">
              <span className="text-[#1E1B4B]">Total</span>
              <span className="text-amber-500">{fmt.currency(current?.invoice?.total || 0)}</span>
            </div>
          </div>
          <Button
            className="w-full"
            loading={payMutation.isPending || rzpLoading}
            onClick={() => payMutation.mutate({ invoiceId: current?.invoice?.id })}
          >
            <CreditCard className="w-4 h-4" /> Pay {fmt.currency(current?.invoice?.total || 0)}
          </Button>
        </div>
      </Modal>

      {/* ── Upgrade Confirmation Modal ────────────────────────── */}
      {confirmUpgrade && (
        <Modal open={!!confirmUpgrade} onClose={() => setConfirmUpgrade(null)} title={`Upgrade to ${confirmUpgrade.name}`}>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              You're upgrading from <strong>{currentConfig.name}</strong> to <strong>{confirmUpgrade.name}</strong> at <strong>{fmt.currency(confirmUpgrade.price)}/month</strong>.
            </p>
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-3">Features you're unlocking</p>
              <ul className="space-y-2">
                {Object.entries(FEATURE_LABELS).map(([key, label]) => {
                  const hadBefore = Boolean(currentConfig.features[key])
                  const getsNow   = Boolean(confirmUpgrade.features[key])
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
              Your billing cycle resets on upgrade. You'll be charged <strong>{fmt.currency(confirmUpgrade.price)}</strong> now, then monthly.
            </Alert>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setConfirmUpgrade(null)}>Cancel</Button>
              <Button
                className="flex-1"
                loading={upgradeMutation.isPending || rzpLoading}
                onClick={() => upgradeMutation.mutate(confirmUpgrade.id)}
              >
                Confirm & Pay <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Upgrade Success Modal ─────────────────────────────── */}
      {upgradeSuccess && (
        <Modal open={!!upgradeSuccess} onClose={() => setUpgradeSuccess(null)} title="Welcome to Zyntell!">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
              <div>
                <p className="font-semibold text-green-700">{upgradeSuccess.planName} Plan Active!</p>
                <p className="text-xs text-green-600/70 mt-0.5">Your new features are live right now</p>
              </div>
            </div>
            {upgradeSuccess.features.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Now available for you</p>
                <ul className="space-y-2">
                  {upgradeSuccess.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                      <Zap className="w-4 h-4 text-indigo-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Button className="w-full" onClick={() => setUpgradeSuccess(null)}>
              Start Exploring <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Modal>
      )}

    </DashboardLayout>
  )
}
