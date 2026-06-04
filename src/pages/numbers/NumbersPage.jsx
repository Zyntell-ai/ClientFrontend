/**
 * @file        NumbersPage.jsx
 * @module      Virtual Numbers
 * @project     ClientFrontend
 * @layer       Page
 * @description Manages virtual phone numbers for the AI bot. Supports two flows:
 *              (1) Register an existing business number via OTP verification.
 *              (2) Search and purchase a new Twilio number with auto webhook configuration.
 *              Both flows exist within this single page — nothing moved.
 *
 * @updated     2026-05-30
 * @version     1.0.0
 *
 * @sideEffects
 *   - GET  /api/numbers              — list registered numbers
 *   - POST /api/numbers/send-otp     — send OTP for own-number verification
 *   - POST /api/numbers/verify-register — verify OTP and register own number
 *   - GET  /api/numbers/search       — search available Twilio numbers
 *   - POST /api/numbers/purchase     — purchase a Twilio number
 *   - DELETE /api/numbers/:id        — release a number
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
import { numbersApi } from '../../api/index'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Button, Modal, Input, EmptyState, Spinner, Alert, Badge } from '../../components/ui/index'
import {
  Phone, Plus, Trash2, CheckCircle2,
  ArrowRight, ShieldCheck, RefreshCw, Copy,
  Search, ShoppingCart, ChevronDown, ChevronUp,
  Zap
} from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

// ─────────────────────────────────────────
// CONSTANTS & CONFIG
// ─────────────────────────────────────────

/** Acquisition mode — determines which wizard the modal shows */
const MODE_OWN   = 'own'    // Register an existing own number via OTP
const MODE_TWILIO = 'twilio' // Search and purchase a new Twilio number

// ─────────────────────────────────────────
// SUB-COMPONENTS — OWN NUMBER FLOW
// ─────────────────────────────────────────

/**
 * @function    StepEnterNumber
 * @purpose     Step 1 of own-number flow: collect phone and send OTP
 */
function StepEnterNumber({ onSend, loading }) {
  const [phone, setPhone] = useState('+91')

  const handleSend = () => {
    // [VALIDATION]: Enforce E.164 international format before sending OTP
    if (!/^\+[1-9]\d{6,14}$/.test(phone)) {
      toast.error('Enter a valid number e.g. +919876543210')
      return
    }
    onSend(phone)
  }

  return (
    <div className="space-y-4">
      <Alert type="info">
        Enter your existing business phone number. We'll send an OTP to verify you own it.
        Your customers will call or WhatsApp this number — the AI bot handles everything.
      </Alert>
      <div className="space-y-1.5">
        <Input
          label="Your Business Phone Number"
          placeholder="+919876543210"
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />
        <p className="text-xs text-slate-500">International format — start with country code e.g. <span className="text-slate-600">+91</span> for India</p>
      </div>
      <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 space-y-2.5">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">How it works</p>
        {[
          { step: '1', text: 'We verify you own this number via OTP' },
          { step: '2', text: 'Register it on WhatsApp Business API' },
          { step: '3', text: 'Set up missed call forwarding (5 min setup)' },
          { step: '4', text: 'Your AI bot goes live on your number ✅' },
        ].map(({ step, text }) => (
          <div key={step} className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-brand-blue/20 border border-brand-blue/30 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-violet-600">{step}</span>
            </div>
            <p className="text-xs text-slate-400">{text}</p>
          </div>
        ))}
      </div>
      <Button className="w-full" loading={loading} onClick={handleSend}>
        <Phone className="w-4 h-4" /> Send OTP to Verify
      </Button>
    </div>
  )
}

/**
 * @function    StepVerifyOtp
 * @purpose     Step 2 of own-number flow: verify OTP and register
 */
function StepVerifyOtp({ phone, onVerify, onResend, loading, devOtp }) {
  const [otp, setOtp] = useState(devOtp || '')

  return (
    <div className="space-y-4">
      <Alert type="success">
        OTP sent to <span className="font-semibold">{phone}</span>. Enter it below to verify ownership.
      </Alert>
      {devOtp && (
        <div className="flex items-center gap-2.5 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <span className="text-amber-400 text-sm">🧪</span>
          <div>
            <p className="text-xs font-semibold text-amber-300">DEV MODE — SMS skipped</p>
            <p className="text-xs text-amber-400/80">OTP auto-filled: <span className="font-mono font-bold">{devOtp}</span></p>
          </div>
        </div>
      )}
      <Input
        label="Enter OTP"
        placeholder="6-digit OTP"
        value={otp}
        onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
        maxLength={6}
      />
      <Button className="w-full" loading={loading} onClick={() => otp.length === 6 && onVerify(otp)} disabled={otp.length !== 6}>
        <ShieldCheck className="w-4 h-4" /> Verify & Register Number
      </Button>
      <button onClick={onResend} className="w-full text-xs text-slate-500 hover:text-slate-600 transition-colors py-1">
        <RefreshCw className="w-3 h-3 inline mr-1" /> Resend OTP
      </button>
    </div>
  )
}

/**
 * @function    SetupInstructions
 * @purpose     Step 3 of own-number flow: show webhook URLs to configure
 */
function SetupInstructions({ number, setup, onDone }) {
  const copy = (text) => { navigator.clipboard.writeText(text); toast.success('Copied!') }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
        <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-green-300">Number Registered!</p>
          <p className="text-xs text-green-400/70">{number} is now on Zyntell</p>
        </div>
      </div>
      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Complete Setup — 2 more steps</p>
      <div className="space-y-3">
        <div className="bg-violet-50 border border-violet-100 rounded-xl p-4">
          <p className="text-xs font-semibold text-[#1E1B4B] mb-2">Step A — WhatsApp Business API Webhook</p>
          <p className="text-xs text-slate-400 mb-2">In Meta Business Manager → WhatsApp → Configuration, set webhook URL to:</p>
          <div className="flex items-center gap-2 bg-white rounded-lg p-2.5">
            <code className="text-xs text-violet-600 flex-1 break-all">{setup?.whatsappWebhook}</code>
            <button onClick={() => copy(setup?.whatsappWebhook)} className="text-slate-500 hover:text-slate-600 shrink-0 transition-colors">
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="bg-violet-50 border border-violet-100 rounded-xl p-4">
          <p className="text-xs font-semibold text-[#1E1B4B] mb-2">Step B — Missed Call Webhook</p>
          <p className="text-xs text-slate-400 mb-2">When a call is missed, your telecom should POST to:</p>
          <div className="flex items-center gap-2 bg-white rounded-lg p-2.5">
            <code className="text-xs text-violet-600 flex-1 break-all">{setup?.callStatusWebhook}</code>
            <button onClick={() => copy(setup?.callStatusWebhook)} className="text-slate-500 hover:text-slate-600 shrink-0 transition-colors">
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">💡 Most Indian telecoms (Airtel, Jio, BSNL) support missed call webhooks. Contact your provider or forward unanswered calls to a Twilio relay number.</p>
        </div>
      </div>
      <Button className="w-full" onClick={onDone}>Done <ArrowRight className="w-4 h-4" /></Button>
    </div>
  )
}

// ─────────────────────────────────────────
// SUB-COMPONENTS — TWILIO PURCHASE FLOW
// ─────────────────────────────────────────

/**
 * @function    TwilioSearchStep
 * @purpose     Search available Twilio numbers by country + optional area code, then let user pick one to purchase.
 */
function TwilioSearchStep({ onPurchase, purchasing }) {
  const [country, setCountry]     = useState('IN')
  const [areaCode, setAreaCode]   = useState('')
  const [results, setResults]     = useState([])
  const [searching, setSearching] = useState(false)
  const [searched, setSearched]   = useState(false)
  const [selected, setSelected]   = useState(null)

  /**
   * @function    handleSearch
   * @purpose     Call the backend to search available Twilio numbers
   */
  const handleSearch = async () => {
    setSearching(true)
    setSearched(false)
    setResults([])
    setSelected(null)
    try {
      // [API CALL]: Search Twilio inventory for available purchasable numbers
      const res = await numbersApi.search({ country, type: 'local', areaCode: areaCode || undefined })
      setResults(res.data.numbers || [])
      setSearched(true)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Search failed. Please try again.')
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="space-y-4">
      <Alert type="info">
        Search our number inventory and purchase a ready-to-use number. Webhooks are configured automatically — your bot goes live instantly.
      </Alert>

      {/* Country + Area Code */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Country</label>
          <select
            value={country}
            onChange={e => setCountry(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-navy-400/40 bg-navy-700/50 text-slate-200 focus:outline-none focus:border-brand-blue"
          >
            <option value="IN">🇮🇳 India</option>
            <option value="US">🇺🇸 United States</option>
            <option value="GB">🇬🇧 United Kingdom</option>
            <option value="SG">🇸🇬 Singapore</option>
            <option value="AU">🇦🇺 Australia</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Area Code (optional)</label>
          <Input
            placeholder="e.g. 022 or 080"
            value={areaCode}
            onChange={e => setAreaCode(e.target.value.replace(/\D/g, ''))}
          />
        </div>
      </div>

      <Button className="w-full" loading={searching} onClick={handleSearch}>
        <Search className="w-4 h-4" /> Search Available Numbers
      </Button>

      {/* Results */}
      {searched && results.length === 0 && (
        <div className="text-center py-6 text-slate-500 text-sm">
          No numbers found for this area code. Try a different code or leave blank.
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          <p className="text-xs text-slate-500 uppercase tracking-wide">{results.length} numbers found</p>
          {results.map(num => (
            <button
              key={num.phoneNumber}
              onClick={() => setSelected(num.phoneNumber)}
              className={clsx(
                'w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between',
                selected === num.phoneNumber
                  ? 'border-brand-blue bg-brand-blue/10'
                  : 'border-navy-400/30 hover:border-navy-400/60 bg-navy-700/30'
              )}
            >
              <div>
                <p className="font-mono font-bold text-slate-100">{num.phoneNumber}</p>
                <p className="text-xs text-slate-500 mt-0.5">{num.friendlyName || num.locality || 'Local number'}</p>
              </div>
              {selected === num.phoneNumber && (
                <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}

      {selected && (
        <Button
          className="w-full"
          loading={purchasing}
          onClick={() => onPurchase(selected)}
        >
          <ShoppingCart className="w-4 h-4" /> Purchase {selected}
        </Button>
      )}
    </div>
  )
}

/**
 * @function    TwilioPurchaseSuccess
 * @purpose     Shown after a Twilio number is purchased — confirms webhooks are live
 */
function TwilioPurchaseSuccess({ number, webhooks, onDone }) {
  const copy = (text) => { navigator.clipboard.writeText(text); toast.success('Copied!') }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
        <Zap className="w-5 h-5 text-green-400 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-green-300">Number Purchased — Bot is Live!</p>
          <p className="text-xs text-green-400/70">{number} is configured and ready for WhatsApp & voice</p>
        </div>
      </div>

      <Alert type="success">
        Webhooks have been automatically configured on this number. For WhatsApp, you still need to link the number in your Twilio Console → Messaging → WhatsApp Senders.
      </Alert>

      <div className="space-y-2">
        {[
          { label: 'WhatsApp Webhook', url: webhooks?.whatsapp },
          { label: 'Voice Webhook', url: webhooks?.voice },
          { label: 'Call Status Webhook', url: webhooks?.callStatus },
        ].map(({ label, url }) => (
          <div key={label} className="bg-violet-50 border border-violet-100 rounded-xl p-3">
            <p className="text-xs font-semibold text-[#1E1B4B] mb-1">{label}</p>
            <div className="flex items-center gap-2 bg-white rounded-lg px-2.5 py-2">
              <code className="text-xs text-violet-600 flex-1 break-all">{url}</code>
              <button onClick={() => copy(url)} className="text-slate-500 hover:text-slate-600 shrink-0">
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <Button className="w-full" onClick={onDone}>Done <ArrowRight className="w-4 h-4" /></Button>
    </div>
  )
}

// ─────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────

/**
 * @function    NumbersPage
 * @purpose     Orchestrates both number acquisition flows (own-number OTP and Twilio purchase)
 *              and the registered numbers list with release support.
 */
export default function NumbersPage() {
  const qc = useQueryClient()

  // [STATE]: Modal open/close and which acquisition mode is active
  const [showModal, setShowModal]   = useState(false)
  const [mode, setMode]             = useState(null)      // MODE_OWN | MODE_TWILIO

  // [STATE]: Own-number OTP flow state
  const [step, setStep]                         = useState(1)
  const [phone, setPhone]                       = useState('')
  const [devOtp, setDevOtp]                     = useState('')
  const [setupData, setSetupData]               = useState(null)
  const [registeredNumber, setRegisteredNumber] = useState('')

  // [STATE]: Twilio purchase flow state
  const [purchaseSuccess, setPurchaseSuccess]   = useState(null)  // { number, webhooks }

  // [STATE]: Release confirmation
  const [releaseId, setReleaseId] = useState(null)

  // [API CALL]: Fetch existing registered numbers
  const { data, isLoading } = useQuery({
    queryKey:  ['numbers'],
    queryFn:   numbersApi.list,
    select:    r => r.data.numbers,
  })

  // ── Own-number mutations ────────────────────────────────────

  // [API CALL]: Send OTP to own phone number
  const sendOtpMutation = useMutation({
    mutationFn: (phoneNumber) => numbersApi.sendOtp({ phoneNumber }),
    onSuccess: (res, phoneNumber) => {
      setPhone(phoneNumber)
      setStep(2)
      if (res.data.devOtp) {
        setDevOtp(res.data.devOtp)
        toast.success(`DEV MODE — OTP: ${res.data.devOtp}`, { duration: 15000 })
      } else {
        setDevOtp('')
        toast.success('OTP sent to your number!')
      }
    },
    onError: e => toast.error(e.response?.data?.error || 'Could not send OTP'),
  })

  // [API CALL]: Verify OTP and register own number
  const verifyMutation = useMutation({
    mutationFn: (otp) => numbersApi.verifyRegister({ phoneNumber: phone, otp }),
    onSuccess: (res) => {
      setSetupData(res.data.setup)
      setRegisteredNumber(res.data.number.phoneNumber)
      setStep(3)
      qc.invalidateQueries(['numbers'])
      toast.success('Number registered successfully!')
    },
    onError: e => toast.error(e.response?.data?.error || 'Verification failed'),
  })

  // ── Twilio purchase mutation ────────────────────────────────

  // [API CALL]: Purchase a Twilio number and auto-configure webhooks
  const purchaseMutation = useMutation({
    mutationFn: (phoneNumber) => numbersApi.purchase(phoneNumber),
    onSuccess: (res) => {
      setPurchaseSuccess({
        number:   res.data.number.phoneNumber,
        webhooks: res.data.webhooks,
      })
      qc.invalidateQueries(['numbers'])
      toast.success('Number purchased — bot is live!')
    },
    onError: e => toast.error(e.response?.data?.error || 'Purchase failed. Please try again.'),
  })

  // ── Release mutation ────────────────────────────────────────

  // [API CALL]: Release (remove) a registered number
  const releaseMutation = useMutation({
    mutationFn: numbersApi.release,
    onSuccess: () => {
      toast.success('Number removed')
      qc.invalidateQueries(['numbers'])
      setReleaseId(null)
    },
    onError: e => toast.error(e.response?.data?.error || 'Could not remove number'),
  })

  /**
   * @function    resetModal
   * @purpose     Resets all modal state and closes it
   */
  const resetModal = () => {
    setShowModal(false)
    setMode(null)
    setStep(1)
    setPhone('')
    setDevOtp('')
    setSetupData(null)
    setRegisteredNumber('')
    setPurchaseSuccess(null)
  }

  /**
   * @function    openMode
   * @purpose     Opens the modal in a specific acquisition mode
   */
  const openMode = (m) => { setMode(m); setShowModal(true) }

  const numbers = data || []

  // [DATA TRANSFORM]: Modal title varies by mode and step
  const modalTitle = mode === MODE_OWN
    ? (step === 1 ? 'Register Your Business Number' : step === 2 ? 'Verify Your Number' : 'Setup Complete 🎉')
    : mode === MODE_TWILIO
      ? (purchaseSuccess ? 'Purchase Complete 🎉' : 'Buy a New Number')
      : 'Get a Number'

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <DashboardLayout title="Phone Numbers" subtitle="Manage your AI bot's virtual numbers">

      {/* How it works strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { icon: '📞', title: 'Virtual Number',   desc: 'Customers call or WhatsApp this number to reach your bot' },
          { icon: '🤖', title: 'AI Handles It',    desc: 'Your bot persona answers, books, and qualifies leads' },
          { icon: '📊', title: 'You Get Insights', desc: 'All conversations tracked with analytics and lead scoring' },
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

      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h3 className="font-display font-semibold text-[#1E1B4B]">Your Numbers</h3>
        {numbers.length === 0 && (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => openMode(MODE_OWN)}>
              <Phone className="w-4 h-4" /> Use My Number
            </Button>
            <Button onClick={() => openMode(MODE_TWILIO)}>
              <ShoppingCart className="w-4 h-4" /> Buy a Number
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : numbers.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <p className="text-3xl mb-3">📱</p>
          <p className="font-display font-semibold text-[#1E1B4B] mb-1">No phone number yet</p>
          <p className="text-sm text-slate-500 mb-6">Choose how you'd like to connect a number to your AI bot</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => openMode(MODE_OWN)}
              className="flex items-start gap-3 p-4 rounded-xl border border-violet-200 bg-violet-50/60 hover:border-violet-400 transition-all text-left"
            >
              <Phone className="w-5 h-5 text-violet-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[#1E1B4B]">Use My Existing Number</p>
                <p className="text-xs text-slate-500 mt-0.5">Verify your current business phone via OTP</p>
              </div>
            </button>
            <button
              onClick={() => openMode(MODE_TWILIO)}
              className="flex items-start gap-3 p-4 rounded-xl border border-violet-200 bg-violet-50/60 hover:border-violet-400 transition-all text-left"
            >
              <ShoppingCart className="w-5 h-5 text-violet-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[#1E1B4B]">Buy a New Twilio Number</p>
                <p className="text-xs text-slate-500 mt-0.5">Get a dedicated number — webhooks auto-configured</p>
              </div>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {numbers.map((num) => (
            <div key={num.id} className="glass-card gradient-border p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-slate-100 text-xl tracking-wide">{num.phoneNumber}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge color={num.isActive ? 'green' : 'slate'}>{num.isActive ? '● Active' : '○ Inactive'}</Badge>
                      {num.isOwned && <Badge color="blue">Your Number</Badge>}
                      {!num.isOwned && <Badge color="purple">Twilio</Badge>}
                      {num.isVerified && <Badge color="green">✓ Verified</Badge>}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setReleaseId(num.id)}
                  className="p-2 text-slate-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10"
                  title="Remove number"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-violet-100">
                {[
                  { label: 'Total Calls',   value: num.totalCalls    || 0 },
                  { label: 'WhatsApp Msgs', value: num.totalMessages || 0 },
                  {
                    label: 'Registered',
                    value: num.createdAt?.toDate
                      ? new Date(num.createdAt.toDate()).toLocaleDateString('en-IN')
                      : typeof num.createdAt === 'string'
                        ? new Date(num.createdAt).toLocaleDateString('en-IN')
                        : '—'
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center">
                    <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
                    <p className="font-display font-semibold text-[#1E1B4B] mt-0.5">{value}</p>
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

      {/* ── Number Acquisition Modal ─────────────────────────── */}
      <Modal open={showModal} onClose={resetModal} title={modalTitle}>

        {/* Mode selector — only shown before a mode is chosen */}
        {!mode && (
          <div className="flex flex-col gap-3">
            <button onClick={() => setMode(MODE_OWN)} className="flex items-start gap-3 p-4 rounded-xl border border-violet-200 bg-violet-50/60 hover:border-violet-400 transition-all text-left">
              <Phone className="w-5 h-5 text-violet-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[#1E1B4B]">Use My Existing Number</p>
                <p className="text-xs text-slate-500 mt-0.5">Verify your current business phone via OTP</p>
              </div>
            </button>
            <button onClick={() => setMode(MODE_TWILIO)} className="flex items-start gap-3 p-4 rounded-xl border border-violet-200 bg-violet-50/60 hover:border-violet-400 transition-all text-left">
              <ShoppingCart className="w-5 h-5 text-violet-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[#1E1B4B]">Buy a New Twilio Number</p>
                <p className="text-xs text-slate-500 mt-0.5">Get a dedicated number — webhooks auto-configured</p>
              </div>
            </button>
          </div>
        )}

        {/* Own-number OTP wizard */}
        {mode === MODE_OWN && (
          <>
            {step === 1 && (
              <StepEnterNumber onSend={sendOtpMutation.mutate} loading={sendOtpMutation.isPending} />
            )}
            {step === 2 && (
              <StepVerifyOtp
                phone={phone}
                devOtp={devOtp}
                onVerify={verifyMutation.mutate}
                onResend={() => { setDevOtp(''); sendOtpMutation.mutate(phone) }}
                loading={verifyMutation.isPending}
              />
            )}
            {step === 3 && (
              <SetupInstructions number={registeredNumber} setup={setupData} onDone={resetModal} />
            )}
          </>
        )}

        {/* Twilio purchase wizard */}
        {mode === MODE_TWILIO && (
          <>
            {!purchaseSuccess ? (
              <TwilioSearchStep onPurchase={purchaseMutation.mutate} purchasing={purchaseMutation.isPending} />
            ) : (
              <TwilioPurchaseSuccess
                number={purchaseSuccess.number}
                webhooks={purchaseSuccess.webhooks}
                onDone={resetModal}
              />
            )}
          </>
        )}
      </Modal>

      {/* Release confirm modal */}
      <Modal open={!!releaseId} onClose={() => setReleaseId(null)} title="Remove Number" size="sm">
        <div className="space-y-4">
          <Alert type="warning">
            Removing this number will deactivate your bot. Customers won't be able to reach you through Zyntell on this number.
          </Alert>
          <div className="flex gap-2.5">
            <Button variant="secondary" className="flex-1" onClick={() => setReleaseId(null)}>Cancel</Button>
            <Button variant="danger" className="flex-1" loading={releaseMutation.isPending} onClick={() => releaseMutation.mutate(releaseId)}>
              Remove Number
            </Button>
          </div>
        </div>
      </Modal>

    </DashboardLayout>
  )
}
