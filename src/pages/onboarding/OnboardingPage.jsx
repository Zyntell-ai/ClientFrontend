// src/pages/onboarding/OnboardingPage.jsx
// Multi-step onboarding wizard — maps to POST /api/onboarding/complete
// Steps: Services → Staff → Working Hours → Bot Config → Review & Launch

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { onboardingApi, businessApi } from '../../api/index'
import { Button, Input, Select, Toggle, Alert, Spinner } from '../../components/ui/index'
import { BOT_PERSONAS, BOT_TONES, LANGUAGES, DAY_LABELS, CATEGORY_ICONS, CATEGORY_LABELS } from '../../utils/index'
import { Zap, Plus, Trash2, Check, ArrowRight, ArrowLeft, Rocket } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const DEFAULT_HOURS = [
  { dayOfWeek: 0, isOpen: false, startTime: '09:00', endTime: '18:00' },
  { dayOfWeek: 1, isOpen: true, startTime: '09:00', endTime: '18:00' },
  { dayOfWeek: 2, isOpen: true, startTime: '09:00', endTime: '18:00' },
  { dayOfWeek: 3, isOpen: true, startTime: '09:00', endTime: '18:00' },
  { dayOfWeek: 4, isOpen: true, startTime: '09:00', endTime: '18:00' },
  { dayOfWeek: 5, isOpen: true, startTime: '09:00', endTime: '18:00' },
  { dayOfWeek: 6, isOpen: false, startTime: '09:00', endTime: '14:00' },
]

const STEPS = [
  { id: 'services', label: 'Services', icon: '🗂️' },
  { id: 'staff', label: 'Staff', icon: '👥' },
  { id: 'hours', label: 'Hours', icon: '🕐' },
  { id: 'bot', label: 'Bot Config', icon: '🤖' },
  { id: 'launch', label: 'Launch', icon: '🚀' },
]

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { business, updateBusiness } = useAuthStore()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form data
  const [services, setServices] = useState([
    { name: '', nameRegional: '', description: '', duration: 30, price: '', priceMin: '', priceMax: '' }
  ])
  const [staff, setStaff] = useState([])
  const [hours, setHours] = useState(DEFAULT_HOURS)
  const [botConfig, setBotConfig] = useState({
    botPersona: 'Priya',
    botTone: 'friendly',
    language: 'te',
  })

  const category = business?.category || 'healthcare'
  const catLabel = CATEGORY_LABELS[category] || 'Business'
  const catIcon = CATEGORY_ICONS[category] || '🏢'

  // ─── Services ─────────────────────────────────────────────
  const addService = () => setServices(s => [...s, { name: '', nameRegional: '', description: '', duration: 30, price: '', priceMin: '', priceMax: '' }])
  const removeService = (i) => setServices(s => s.filter((_, idx) => idx !== i))
  const updateService = (i, key, val) => setServices(s => s.map((svc, idx) => idx === i ? { ...svc, [key]: val } : svc))

  // ─── Staff ────────────────────────────────────────────────
  const addStaff = () => setStaff(s => [...s, { name: '', role: '', specialization: '', phone: '', availableDays: [1, 2, 3, 4, 5] }])
  const removeStaff = (i) => setStaff(s => s.filter((_, idx) => idx !== i))
  const updateStaff = (i, key, val) => setStaff(s => s.map((m, idx) => idx === i ? { ...m, [key]: val } : m))
  const toggleStaffDay = (staffIdx, day) => {
    setStaff(s => s.map((m, idx) => {
      if (idx !== staffIdx) return m
      const days = m.availableDays.includes(day) ? m.availableDays.filter(d => d !== day) : [...m.availableDays, day]
      return { ...m, availableDays: days }
    }))
  }

  // ─── Hours ────────────────────────────────────────────────
  const updateHour = (dayIdx, key, val) => setHours(h => h.map((d, i) => i === dayIdx ? { ...d, [key]: val } : d))

  const validateStep = () => {
    if (step === 0) {
      const invalid = services.some(s => !s.name.trim() || !s.duration)
      if (invalid) { setError('Please fill service name and duration for all services'); return false }
    }
    setError('')
    return true
  }

  const handleNext = () => {
    if (!validateStep()) return
    setStep(s => Math.min(s + 1, STEPS.length - 1))
  }

  const handleComplete = async () => {
    setLoading(true)
    setError('')
    try {
      const payload = {
        services: services.map(s => ({
          ...s,
          duration: Number(s.duration),
          price: s.price ? Number(s.price) : undefined,
          priceMin: s.priceMin ? Number(s.priceMin) : undefined,
          priceMax: s.priceMax ? Number(s.priceMax) : undefined,
        })),
        staff: staff.length > 0 ? staff : undefined,
        workingHours: hours,
        ...botConfig,
      }
      const res = await onboardingApi.complete(payload)
      updateBusiness({ setupCompleted: true, botTrainingScore: res.data.botTrainingScore })
      toast.success('🎉 Bot is ready! Welcome to Zyntell.')
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Setup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy-950 bg-grid-pattern bg-grid">
      {/* Header */}
      <div className="border-b border-navy-400/20 bg-navy-900/80 backdrop-blur-sm px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-slate-100 text-sm">Setting up your bot</p>
              <p className="text-xs text-slate-500">{catIcon} {catLabel} · {business?.name}</p>
            </div>
          </div>
          <p className="text-xs text-slate-500">{step + 1} / {STEPS.length}</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="border-b border-navy-400/15 bg-navy-900/40">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center gap-1 overflow-x-auto">
          {STEPS.map(({ id, label, icon }, idx) => (
            <React.Fragment key={id}>
              <button
                onClick={() => idx < step && setStep(idx)}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
                  idx === step ? 'bg-brand-blue/15 text-brand-blue border border-brand-blue/30'
                    : idx < step ? 'text-green-400 cursor-pointer hover:bg-green-400/10'
                      : 'text-slate-600 cursor-default'
                )}
              >
                {idx < step ? <Check className="w-3 h-3" /> : <span>{icon}</span>}
                {label}
              </button>
              {idx < STEPS.length - 1 && <div className={clsx('w-4 h-px shrink-0', idx < step ? 'bg-green-400/40' : 'bg-navy-400/30')} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        {error && <div className="mb-5"><Alert type="error">{error}</Alert></div>}

        {/* Step 0: Services */}
        {step === 0 && (
          <div className="animate-slide-up">
            <h2 className="font-display text-2xl font-bold text-slate-100 mb-1">Your Services</h2>
            <p className="text-slate-500 text-sm mb-6">What do you offer? The bot will use this to book appointments.</p>

            <div className="space-y-4">
              {services.map((svc, i) => (
                <div key={i} className="glass-card gradient-border p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Service {i + 1}</span>
                    {services.length > 1 && (
                      <button onClick={() => removeService(i)} className="text-red-400/60 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Service Name *" placeholder="e.g., General Consultation" value={svc.name} onChange={e => updateService(i, 'name', e.target.value)} />
                    <Input label="Regional Name (Optional)" placeholder="Telugu / Hindi name" value={svc.nameRegional} onChange={e => updateService(i, 'nameRegional', e.target.value)} />
                    <Input label="Duration (minutes) *" type="number" min="5" value={svc.duration} onChange={e => updateService(i, 'duration', e.target.value)} />
                    <Input label="Fixed Price (₹)" type="number" placeholder="Leave blank for range" value={svc.price} onChange={e => updateService(i, 'price', e.target.value)} />
                    <Input label="Min Price (₹)" type="number" placeholder="If price range" value={svc.priceMin} onChange={e => updateService(i, 'priceMin', e.target.value)} />
                    <Input label="Max Price (₹)" type="number" placeholder="If price range" value={svc.priceMax} onChange={e => updateService(i, 'priceMax', e.target.value)} />
                    <div className="col-span-2">
                      <Input label="Description (Optional)" placeholder="Brief description of the service" value={svc.description} onChange={e => updateService(i, 'description', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="secondary" onClick={addService} className="mt-4 w-full border-dashed">
              <Plus className="w-4 h-4" /> Add Another Service
            </Button>
          </div>
        )}

        {/* Step 1: Staff */}
        {step === 1 && (
          <div className="animate-slide-up">
            <h2 className="font-display text-2xl font-bold text-slate-100 mb-1">Your Team</h2>
            <p className="text-slate-500 text-sm mb-6">Add staff members so the bot can assign bookings. (Optional)</p>

            {staff.length === 0 ? (
              <div className="glass-card p-8 text-center mb-4">
                <p className="text-3xl mb-3">👤</p>
                <p className="text-slate-400 text-sm mb-4">No staff added yet. You can skip this and add later.</p>
                <Button onClick={addStaff}><Plus className="w-4 h-4" /> Add Staff Member</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {staff.map((member, i) => (
                  <div key={i} className="glass-card gradient-border p-5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Team Member {i + 1}</span>
                      <button onClick={() => removeStaff(i)} className="text-red-400/60 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <Input label="Full Name *" placeholder="e.g., Dr. Priya Sharma" value={member.name} onChange={e => updateStaff(i, 'name', e.target.value)} />
                      <Input label="Role *" placeholder="e.g., Doctor, Stylist, Agent" value={member.role} onChange={e => updateStaff(i, 'role', e.target.value)} />
                      <Input label="Specialization" placeholder="e.g., Dermatology" value={member.specialization || ''} onChange={e => updateStaff(i, 'specialization', e.target.value)} />
                      <Input label="Phone" placeholder="+91 98765 43210" value={member.phone || ''} onChange={e => updateStaff(i, 'phone', e.target.value)} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Available Days</p>
                      <div className="flex gap-1.5">
                        {DAY_LABELS.map((day, dayIdx) => (
                          <button key={day} onClick={() => toggleStaffDay(i, dayIdx)}
                            className={clsx('w-9 h-9 rounded-lg text-xs font-semibold border transition-all',
                              member.availableDays?.includes(dayIdx)
                                ? 'bg-brand-blue border-brand-blue text-white'
                                : 'border-navy-400/40 text-slate-500 hover:border-navy-400/70'
                            )}
                          >{day.slice(0, 2)}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="secondary" onClick={addStaff} className="w-full border-dashed">
                  <Plus className="w-4 h-4" /> Add Another Member
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Working Hours */}
        {step === 2 && (
          <div className="animate-slide-up">
            <h2 className="font-display text-2xl font-bold text-slate-100 mb-1">Working Hours</h2>
            <p className="text-slate-500 text-sm mb-6">Set when your business is open. The bot won't book outside these hours.</p>

            <div className="glass-card p-1">
              {hours.map((day, i) => (
                <div key={i} className={clsx('flex items-center gap-4 px-4 py-3 rounded-lg transition-colors', day.isOpen ? 'bg-navy-600/20' : 'opacity-50')}>
                  <div className="w-10 text-xs font-semibold text-slate-400">{DAY_LABELS[i]}</div>
                  <Toggle
                    checked={day.isOpen}
                    onChange={(v) => updateHour(i, 'isOpen', v)}
                  />
                  {day.isOpen ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input type="time" value={day.startTime} onChange={e => updateHour(i, 'startTime', e.target.value)}
                        className="input-field text-xs py-1.5 px-2 flex-1" />
                      <span className="text-slate-600 text-xs">to</span>
                      <input type="time" value={day.endTime} onChange={e => updateHour(i, 'endTime', e.target.value)}
                        className="input-field text-xs py-1.5 px-2 flex-1" />
                    </div>
                  ) : (
                    <span className="text-xs text-slate-600">Closed</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Bot Config */}
        {step === 3 && (
          <div className="animate-slide-up">
            <h2 className="font-display text-2xl font-bold text-slate-100 mb-1">Configure Your Bot</h2>
            <p className="text-slate-500 text-sm mb-6">Customize how your AI assistant speaks to customers.</p>

            <div className="space-y-5">
              {/* Bot Persona */}
              <div className="glass-card p-5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Bot Persona</p>
                <div className="flex flex-wrap gap-2">
                  {BOT_PERSONAS.map(persona => (
                    <button key={persona} onClick={() => setBotConfig(c => ({ ...c, botPersona: persona }))}
                      className={clsx('px-4 py-2 rounded-full text-sm font-medium border transition-all',
                        botConfig.botPersona === persona
                          ? 'bg-brand-blue border-brand-blue text-white shadow-glow'
                          : 'border-navy-400/40 text-slate-400 hover:border-navy-400/70'
                      )}>{persona}</button>
                  ))}
                </div>
                <p className="text-xs text-slate-600 mt-3">Your bot will introduce itself as this name to customers.</p>
              </div>

              {/* Bot Tone */}
              <div className="glass-card p-5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Conversation Tone</p>
                <div className="space-y-2">
                  {BOT_TONES.map(({ value, label }) => (
                    <button key={value} onClick={() => setBotConfig(c => ({ ...c, botTone: value }))}
                      className={clsx('w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all',
                        botConfig.botTone === value
                          ? 'border-brand-blue bg-brand-blue/10'
                          : 'border-navy-400/30 bg-navy-600/20 hover:border-navy-400/50'
                      )}>
                      <div className={clsx('w-4 h-4 rounded-full border-2 shrink-0', botConfig.botTone === value ? 'border-brand-blue bg-brand-blue' : 'border-navy-400/50')} />
                      <span className={clsx('text-sm font-medium', botConfig.botTone === value ? 'text-slate-200' : 'text-slate-400')}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div className="glass-card p-5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Primary Language</p>
                <div className="grid grid-cols-3 gap-2">
                  {LANGUAGES.map(({ value, label, flag }) => (
                    <button key={value} onClick={() => setBotConfig(c => ({ ...c, language: value }))}
                      className={clsx('flex flex-col items-center gap-1 p-3 rounded-lg border transition-all',
                        botConfig.language === value
                          ? 'border-brand-blue bg-brand-blue/10'
                          : 'border-navy-400/30 bg-navy-600/20 hover:border-navy-400/50'
                      )}>
                      <span className="text-2xl">{flag}</span>
                      <span className={clsx('text-xs font-semibold', botConfig.language === value ? 'text-brand-blue-light' : 'text-slate-400')}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review & Launch */}
        {step === 4 && (
          <div className="animate-slide-up text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-blue-500/30 mb-6">
              <Rocket className="w-9 h-9 text-brand-blue" />
            </div>
            <h2 className="font-display text-2xl font-bold text-slate-100 mb-2">Ready to Launch!</h2>
            <p className="text-slate-500 text-sm mb-8 max-w-sm mx-auto">
              Your bot will be configured with {services.length} service{services.length !== 1 ? 's' : ''}, {staff.length} staff member{staff.length !== 1 ? 's' : ''}, and {botConfig.botPersona} as the AI persona.
            </p>

            <div className="grid grid-cols-3 gap-3 mb-8 text-left">
              {[
                { icon: '🗂️', label: 'Services', value: `${services.length} added` },
                { icon: '👥', label: 'Staff', value: staff.length > 0 ? `${staff.length} added` : 'Skipped' },
                { icon: '🤖', label: 'Bot Persona', value: botConfig.botPersona },
              ].map(({ icon, label, value }) => (
                <div key={label} className="glass-card p-4 text-center">
                  <p className="text-2xl mb-1">{icon}</p>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
                  <p className="text-sm font-semibold text-slate-200 mt-0.5">{value}</p>
                </div>
              ))}
            </div>

            <Button className="w-full max-w-xs mx-auto" size="lg" onClick={handleComplete} loading={loading}>
              <Rocket className="w-4 h-4" /> Launch My Bot
            </Button>
          </div>
        )}

        {/* Navigation */}
        {step < 4 && (
          <div className="flex items-center gap-3 mt-8">
            {step > 0 && (
              <Button variant="secondary" onClick={() => setStep(s => s - 1)}>
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
            )}
            <Button className="flex-1" onClick={handleNext}>
              {step === 3 ? 'Review & Launch' : 'Continue'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
        {step === 4 && step > 0 && (
          <div className="flex justify-center mt-4">
            <Button variant="ghost" onClick={() => setStep(s => s - 1)}>
              <ArrowLeft className="w-4 h-4" /> Go back
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
