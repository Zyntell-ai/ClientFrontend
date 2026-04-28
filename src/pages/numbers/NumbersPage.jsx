import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { numbersApi } from '../../api/index'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Button, Modal, Input, EmptyState, Spinner, Alert, Badge } from '../../components/ui/index'
import {
  Phone, Plus, Trash2, CheckCircle2,
  ArrowRight, ShieldCheck, RefreshCw, Copy
} from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

// ─── Step 1: Enter phone number ───────────────────────────────
function StepEnterNumber({ onSend, loading }) {
  const [phone, setPhone] = useState('+91')

  const handleSend = () => {
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
        <p className="text-xs text-slate-500">
          Use international format — start with country code e.g.{' '}
          <span className="text-slate-600">+91</span> for India
        </p>
      </div>

      {/* How it works */}
      <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 space-y-2.5">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">How it works</p>
        {[
          { step: '1', text: 'We verify you own this number via OTP' },
          { step: '2', text: 'Register it on WhatsApp Business API' },
          { step: '3', text: 'Set up missed call forwarding (5 min setup)' },
          { step: '4', text: 'Your AI bot Priya goes live on your number ✅' },
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

// ─── Step 2: Enter OTP ────────────────────────────────────────
function StepVerifyOtp({ phone, onVerify, onResend, loading, devOtp }) {
  // Auto-fill in dev mode
  const [otp, setOtp] = useState(devOtp || '')

  return (
    <div className="space-y-4">
      <Alert type="success">
        OTP sent to <span className="font-semibold">{phone}</span>. Enter it below to verify ownership.
      </Alert>

      {/* Dev mode banner */}
      {devOtp && (
        <div className="flex items-center gap-2.5 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <span className="text-amber-400 text-sm">🧪</span>
          <div>
            <p className="text-xs font-semibold text-amber-300">DEV MODE — SMS skipped</p>
            <p className="text-xs text-amber-400/80">
              OTP auto-filled: <span className="font-mono font-bold">{devOtp}</span>
            </p>
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

      <Button
        className="w-full"
        loading={loading}
        onClick={() => otp.length === 6 && onVerify(otp)}
        disabled={otp.length !== 6}
      >
        <ShieldCheck className="w-4 h-4" /> Verify & Register Number
      </Button>

      <button
        onClick={onResend}
        className="w-full text-xs text-slate-500 hover:text-slate-600 transition-colors py-1"
      >
        <RefreshCw className="w-3 h-3 inline mr-1" /> Resend OTP
      </button>
    </div>
  )
}

// ─── Step 3: Setup instructions ───────────────────────────────
function SetupInstructions({ number, setup, onDone }) {
  const copy = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied!')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
        <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-green-300">Number Registered!</p>
          <p className="text-xs text-green-400/70">{number} is now on Zyntell</p>
        </div>
      </div>

      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
        Complete Setup — 2 more steps
      </p>

      <div className="space-y-3">
        {/* Step A: WhatsApp */}
        <div className="bg-violet-50 border border-violet-100 rounded-xl p-4">
          <p className="text-xs font-semibold text-[#1E1B4B] mb-2">
            Step A — WhatsApp Business API Webhook
          </p>
          <p className="text-xs text-slate-400 mb-2">
            In Meta Business Manager → WhatsApp → Configuration, set webhook URL to:
          </p>
          <div className="flex items-center gap-2 bg-white rounded-lg p-2.5">
            <code className="text-xs text-violet-600 flex-1 break-all">
              {setup?.whatsappWebhook}
            </code>
            <button
              onClick={() => copy(setup?.whatsappWebhook)}
              className="text-slate-500 hover:text-slate-600 shrink-0 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Step B: Missed Call */}
        <div className="bg-violet-50 border border-violet-100 rounded-xl p-4">
          <p className="text-xs font-semibold text-[#1E1B4B] mb-2">
            Step B — Missed Call Webhook
          </p>
          <p className="text-xs text-slate-400 mb-2">
            When a call is missed, your telecom should POST to:
          </p>
          <div className="flex items-center gap-2 bg-white rounded-lg p-2.5">
            <code className="text-xs text-violet-600 flex-1 break-all">
              {setup?.callStatusWebhook}
            </code>
            <button
              onClick={() => copy(setup?.callStatusWebhook)}
              className="text-slate-500 hover:text-slate-600 shrink-0 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            💡 Most Indian telecoms (Airtel, Jio, BSNL) support missed call webhooks.
            Contact your provider or forward unanswered calls to a Twilio relay number.
          </p>
        </div>
      </div>

      <Button className="w-full" onClick={onDone}>
        Done <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────
export default function NumbersPage() {
  const qc = useQueryClient()

  const [showRegister, setShowRegister]         = useState(false)
  const [step, setStep]                         = useState(1)
  const [phone, setPhone]                       = useState('')
  const [devOtp, setDevOtp]                     = useState('')
  const [setupData, setSetupData]               = useState(null)
  const [registeredNumber, setRegisteredNumber] = useState('')
  const [releaseId, setReleaseId]               = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['numbers'],
    queryFn:  numbersApi.list,
    select:   r => r.data.numbers,
  })

  // Step 1 — Send OTP
  const sendOtpMutation = useMutation({
    mutationFn: (phoneNumber) => numbersApi.sendOtp({ phoneNumber }),
    onSuccess: (res, phoneNumber) => {
      setPhone(phoneNumber)
      setStep(2)

      if (res.data.devOtp) {
        // Dev mode — OTP returned directly
        setDevOtp(res.data.devOtp)
        toast.success(`DEV MODE — OTP: ${res.data.devOtp}`, { duration: 15000 })
      } else {
        setDevOtp('')
        toast.success('OTP sent to your number!')
      }
    },
    onError: e => toast.error(e.response?.data?.error || 'Could not send OTP'),
  })

  // Step 2 — Verify OTP + Register
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

  // Release number
  const releaseMutation = useMutation({
    mutationFn: numbersApi.release,
    onSuccess: () => {
      toast.success('Number removed')
      qc.invalidateQueries(['numbers'])
      setReleaseId(null)
    },
    onError: e => toast.error(e.response?.data?.error || 'Could not remove number'),
  })

  const resetModal = () => {
    setShowRegister(false)
    setStep(1)
    setPhone('')
    setDevOtp('')
    setSetupData(null)
    setRegisteredNumber('')
  }

  const numbers = data || []

  return (
    <DashboardLayout title="Phone Numbers" subtitle="Manage your AI bot's virtual numbers">

      {/* How it works strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { icon: '📞', title: 'Virtual Number',   desc: 'Customers call or WhatsApp this number to reach your bot' },
          { icon: '🤖', title: 'AI Handles It',    desc: 'Priya (or your chosen persona) answers, books, and qualifies leads' },
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
          <Button onClick={() => setShowRegister(true)}>
            <Plus className="w-4 h-4" /> Register Your Number
          </Button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : numbers.length === 0 ? (
        <EmptyState
          icon="📱"
          title="No phone number yet"
          description="Register your existing business number to activate your WhatsApp & voice bot"
          action={
            <Button onClick={() => setShowRegister(true)}>
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
                  <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-slate-100 text-xl tracking-wide">
                      {num.phoneNumber}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge color={num.isActive ? 'green' : 'slate'}>
                        {num.isActive ? '● Active' : '○ Inactive'}
                      </Badge>
                      {num.isOwned && <Badge color="blue">Your Number</Badge>}
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

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-violet-100">
                {[
                  { label: 'Total Calls',   value: num.totalCalls    || 0 },
                  { label: 'WhatsApp Msgs', value: num.totalMessages || 0 },
                  {
                    label: 'Registered',
                    value: num.createdAt?.toDate
                      ? new Date(num.createdAt.toDate()).toLocaleDateString('en-IN')
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

      {/* Register Number Modal */}
      <Modal
        open={showRegister}
        onClose={resetModal}
        title={
          step === 1 ? 'Register Your Business Number' :
          step === 2 ? 'Verify Your Number' :
          'Setup Complete 🎉'
        }
      >
        {step === 1 && (
          <StepEnterNumber
            onSend={sendOtpMutation.mutate}
            loading={sendOtpMutation.isPending}
          />
        )}
        {step === 2 && (
          <StepVerifyOtp
            phone={phone}
            devOtp={devOtp}
            onVerify={verifyMutation.mutate}
            onResend={() => {
              setDevOtp('')
              sendOtpMutation.mutate(phone)
            }}
            loading={verifyMutation.isPending}
          />
        )}
        {step === 3 && (
          <SetupInstructions
            number={registeredNumber}
            setup={setupData}
            onDone={resetModal}
          />
        )}
      </Modal>

      {/* Remove confirm modal */}
      <Modal
        open={!!releaseId}
        onClose={() => setReleaseId(null)}
        title="Remove Number"
        size="sm"
      >
        <div className="space-y-4">
          <Alert type="warning">
            Removing this number will deactivate your bot. Customers won't be able to reach you through Zyntell on this number.
          </Alert>
          <div className="flex gap-2.5">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setReleaseId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              loading={releaseMutation.isPending}
              onClick={() => releaseMutation.mutate(releaseId)}
            >
              Remove Number
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}