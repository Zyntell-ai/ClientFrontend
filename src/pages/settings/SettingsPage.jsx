// src/pages/settings/SettingsPage.jsx
// Maps to: GET/PUT /api/business/settings, GET/PUT /api/business/hours, GET/POST/DELETE /api/business/faqs
import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { businessApi } from '../../api/index'
import { useAuthStore } from '../../store/authStore'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Button, Input, Select, Textarea, Toggle, Modal, Alert, Card, EmptyState, Spinner } from '../../components/ui/index'
import {
  BOT_PERSONAS, BOT_TONES, LANGUAGES, DAY_LABELS, CATEGORY_ICONS
} from '../../utils/index'
import { Bot, Clock, MessageSquare, Bell, Trash2, Plus, Save, MapPin, Globe } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

// ─── Tab definitions ──────────────────────────────────────────
const TABS = [
  { id: 'bot', label: 'Bot Config', icon: Bot },
  { id: 'hours', label: 'Working Hours', icon: Clock },
  { id: 'faqs', label: 'FAQs / Training', icon: MessageSquare },
  { id: 'notifications', label: 'Notifications', icon: Bell },
]

// ─── Bot Config Tab ───────────────────────────────────────────
function BotConfigTab({ settings, onSave, saving }) {
  const [form, setForm] = useState({
    welcomeMessage: '',
    botPersona: 'Priya',
    botTone: 'friendly',
    language: 'te',
    allowCancellation: true,
    cancellationHoursLimit: 2,
    bookingBufferMinutes: 0,
    maxBookingsPerSlot: 1,
    autoConfirmBookings: false,
    conversationCap: 50,
    address: '',
    leadExclusiveWindowHours: 2,
    ...settings,
  })

  useEffect(() => { if (settings) setForm(f => ({ ...f, ...settings })) }, [settings])
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="space-y-6">
      {/* Persona */}
      <Card title="Bot Personality">
        <div className="space-y-5">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Bot Name / Persona</p>
            <div className="flex flex-wrap gap-2">
              {BOT_PERSONAS.map(p => (
                <button key={p} onClick={() => set('botPersona', p)}
                  className={clsx('px-4 py-2 rounded-full text-sm font-medium border transition-all',
                    form.botPersona === p ? 'bg-brand-blue border-brand-blue text-white shadow-glow' : 'border-navy-400/40 text-slate-400 hover:border-navy-400/70'
                  )}>{p}</button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Conversation Tone</p>
            <div className="grid grid-cols-3 gap-2">
              {BOT_TONES.map(({ value, label }) => (
                <button key={value} onClick={() => set('botTone', value)}
                  className={clsx('p-3 rounded-lg border text-center transition-all',
                    form.botTone === value ? 'border-brand-blue bg-brand-blue/10' : 'border-navy-400/30 bg-navy-700/30 hover:border-navy-400/50'
                  )}>
                  <p className={clsx('text-xs font-semibold', form.botTone === value ? 'text-brand-blue-light' : 'text-slate-400')}>{label}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Primary Language</p>
            <div className="flex gap-3">
              {LANGUAGES.map(({ value, label, flag }) => (
                <button key={value} onClick={() => set('language', value)}
                  className={clsx('flex items-center gap-2 px-4 py-2.5 rounded-lg border flex-1 transition-all',
                    form.language === value ? 'border-brand-blue bg-brand-blue/10' : 'border-navy-400/30 bg-navy-700/30 hover:border-navy-400/50'
                  )}>
                  <span className="text-xl">{flag}</span>
                  <span className={clsx('text-sm font-medium', form.language === value ? 'text-slate-200' : 'text-slate-400')}>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Welcome message */}
      <Card title="Welcome Message">
        <Textarea
          label="Message sent when customer first contacts your bot"
          value={form.welcomeMessage || ''}
          onChange={e => set('welcomeMessage', e.target.value)}
          rows={4}
          placeholder="Hi! I'm Priya, your assistant at {businessName}. How can I help you today?"
        />
      </Card>

      {/* Booking settings */}
      <Card title="Booking Settings">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Buffer between bookings (min)" type="number" min="0" value={form.bookingBufferMinutes || 0} onChange={e => set('bookingBufferMinutes', Number(e.target.value))} />
          <Input label="Max bookings per time slot" type="number" min="1" value={form.maxBookingsPerSlot || 1} onChange={e => set('maxBookingsPerSlot', Number(e.target.value))} />
          <Input label="Cancellation limit (hours before)" type="number" min="0" value={form.cancellationHoursLimit || 2} onChange={e => set('cancellationHoursLimit', Number(e.target.value))} />
          <Input label="Exclusive lead window (hours)" type="number" min="1" value={form.leadExclusiveWindowHours || 2} onChange={e => set('leadExclusiveWindowHours', Number(e.target.value))} />
        </div>
        <div className="mt-4 space-y-3">
          <Toggle label="Allow cancellations" description="Customers can cancel bookings via bot" checked={form.allowCancellation} onChange={v => set('allowCancellation', v)} />
          <Toggle label="Auto-confirm bookings" description="Skip manual confirmation — all bookings auto-confirmed" checked={form.autoConfirmBookings} onChange={v => set('autoConfirmBookings', v)} />
        </div>
      </Card>

      {/* Location */}
      <Card title="Business Location">
        <Input label="Full address" value={form.address || ''} onChange={e => set('address', e.target.value)} placeholder="123 Main Street, Banjara Hills, Hyderabad" />
        <div className="grid grid-cols-2 gap-3 mt-3">
          <Input label="Latitude" type="number" value={form.coordinates?.lat || ''} onChange={e => set('coordinates', { ...form.coordinates, lat: Number(e.target.value) })} placeholder="17.3850" />
          <Input label="Longitude" type="number" value={form.coordinates?.lng || ''} onChange={e => set('coordinates', { ...form.coordinates, lng: Number(e.target.value) })} placeholder="78.4867" />
        </div>
        <p className="text-xs text-slate-600 mt-2 flex items-center gap-1"><MapPin className="w-3 h-3" />Used for GPS check-in verification when customers arrive</p>
      </Card>

      <Button className="w-full" loading={saving} onClick={() => onSave(form)}>
        <Save className="w-4 h-4" /> Save Bot Configuration
      </Button>
    </div>
  )
}

// ─── Working Hours Tab ────────────────────────────────────────
function WorkingHoursTab() {
  const qc = useQueryClient()
  const [hours, setHours] = useState([])

  const { data, isLoading } = useQuery({
    queryKey: ['hours'],
    queryFn: businessApi.getHours,
    select: r => r.data.hours,
  })

  useEffect(() => {
    if (data?.length) {
      const sorted = [...data].sort((a, b) => a.dayOfWeek - b.dayOfWeek)
      setHours(sorted)
    }
  }, [data])

  const updateMutation = useMutation({
    mutationFn: (h) => businessApi.updateHours({ hours: h }),
    onSuccess: () => { toast.success('Working hours saved!'); qc.invalidateQueries(['hours']) },
    onError: e => toast.error(e.response?.data?.error || 'Failed to save'),
  })

  const updateHour = (i, key, val) => setHours(h => h.map((d, idx) => idx === i ? { ...d, [key]: val } : d))

  if (isLoading) return <div className="flex justify-center py-12"><Spinner /></div>

  return (
    <div>
      <Card title="Business Hours">
        <div className="space-y-1">
          {hours.map((day, i) => (
            <div key={i} className={clsx('flex items-center gap-4 px-3 py-3 rounded-lg transition-colors', day.isOpen ? 'bg-navy-600/20' : '')}>
              <div className="w-12 shrink-0">
                <p className="text-xs font-bold text-slate-400">{DAY_LABELS[day.dayOfWeek]}</p>
              </div>
              <Toggle checked={day.isOpen} onChange={v => updateHour(i, 'isOpen', v)} />
              {day.isOpen ? (
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] text-slate-600 uppercase">Open</label>
                    <input type="time" value={day.startTime || '09:00'} onChange={e => updateHour(i, 'startTime', e.target.value)}
                      className="input-field text-xs py-1.5 px-2.5 w-28" />
                  </div>
                  <span className="text-slate-700 text-xs">–</span>
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] text-slate-600 uppercase">Close</label>
                    <input type="time" value={day.endTime || '18:00'} onChange={e => updateHour(i, 'endTime', e.target.value)}
                      className="input-field text-xs py-1.5 px-2.5 w-28" />
                  </div>
                  <div className="flex items-center gap-2 ml-4 border-l border-navy-400/30 pl-4">
                    <label className="text-[10px] text-slate-600 uppercase">Break</label>
                    <input type="time" value={day.breakStart || ''} onChange={e => updateHour(i, 'breakStart', e.target.value)}
                      placeholder="--:--" className="input-field text-xs py-1.5 px-2.5 w-24" />
                    <span className="text-slate-700 text-xs">–</span>
                    <input type="time" value={day.breakEnd || ''} onChange={e => updateHour(i, 'breakEnd', e.target.value)}
                      className="input-field text-xs py-1.5 px-2.5 w-24" />
                  </div>
                </div>
              ) : (
                <span className="text-xs text-slate-600 italic">Closed</span>
              )}
            </div>
          ))}
        </div>
      </Card>
      <Button className="mt-4 w-full" onClick={() => updateMutation.mutate(hours)} loading={updateMutation.isPending}>
        <Save className="w-4 h-4" /> Save Working Hours
      </Button>
    </div>
  )
}

// ─── FAQs Tab ─────────────────────────────────────────────────
function FaqsTab() {
  const qc = useQueryClient()
  const [showAdd, setShowAdd] = useState(false)
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', category: '' })

  const { data, isLoading } = useQuery({
    queryKey: ['faqs'],
    queryFn: businessApi.getFaqs,
    select: r => r.data.faqs,
  })

  const createMutation = useMutation({
    mutationFn: businessApi.createFaq,
    onSuccess: () => { toast.success('FAQ added — bot is now smarter!'); qc.invalidateQueries(['faqs']); setShowAdd(false); setNewFaq({ question: '', answer: '', category: '' }) },
    onError: e => toast.error(e.response?.data?.error || 'Failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: businessApi.deleteFaq,
    onSuccess: () => { toast.success('FAQ removed'); qc.invalidateQueries(['faqs']) },
  })

  const faqs = data || []

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-slate-400">Teach your bot common questions and answers.</p>
          <p className="text-xs text-slate-600 mt-0.5">The more FAQs you add, the better your bot responds.</p>
        </div>
        <Button onClick={() => setShowAdd(true)} size="sm"><Plus className="w-3.5 h-3.5" /> Add FAQ</Button>
      </div>

      {/* Bot score hint */}
      <Alert type="info" className="mb-5">
        💡 Adding FAQs improves your Bot Training Score and reduces missed customer queries.
      </Alert>

      {isLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : faqs.length === 0 ? (
        <EmptyState icon="💬" title="No FAQs yet" description="Add questions and answers to train your bot" action={<Button onClick={() => setShowAdd(true)}><Plus className="w-4 h-4" /> Add First FAQ</Button>} />
      ) : (
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div key={faq.id} className="glass-card p-4 group">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <span className="text-brand-blue text-base">Q</span>
                    {faq.question}
                  </p>
                  <p className="text-xs text-slate-400 mt-2 pl-5 leading-relaxed">{faq.answer}</p>
                  {faq.category && (
                    <span className="inline-block mt-2 text-[10px] bg-navy-700/60 text-slate-500 px-2 py-0.5 rounded">{faq.category}</span>
                  )}
                </div>
                <button onClick={() => deleteMutation.mutate(faq.id)} className="p-1.5 text-slate-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add FAQ">
        <div className="space-y-3">
          <Input label="Question *" placeholder="e.g., What are your working hours?" value={newFaq.question} onChange={e => setNewFaq(f => ({ ...f, question: e.target.value }))} />
          <Textarea label="Answer *" placeholder="e.g., We are open Mon–Fri 9AM–6PM..." value={newFaq.answer} onChange={e => setNewFaq(f => ({ ...f, answer: e.target.value }))} rows={4} />
          <Input label="Category (optional)" placeholder="e.g., Pricing, Hours, Services" value={newFaq.category} onChange={e => setNewFaq(f => ({ ...f, category: e.target.value }))} />
          <Button className="w-full" loading={createMutation.isPending} onClick={() => createMutation.mutate(newFaq)}>Add FAQ</Button>
        </div>
      </Modal>
    </div>
  )
}

// ─── Notifications Tab ────────────────────────────────────────
function NotificationsTab({ settings, onSave, saving }) {
  const [form, setForm] = useState({
    notifyOwnerOnBooking: true,
    notifyOwnerOnLead: true,
    notifyOwnerOnMissedCall: true,
    dailySummaryAt9AM: true,
    reminderHours: [24, 1],
    ...settings,
  })

  useEffect(() => { if (settings) setForm(f => ({ ...f, ...settings })) }, [settings])
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const notifToggles = [
    { key: 'notifyOwnerOnBooking', label: 'New Booking Alert', desc: 'Get notified when a customer books via bot' },
    { key: 'notifyOwnerOnLead', label: 'New Lead Alert', desc: 'Get notified when a lead is captured' },
    { key: 'notifyOwnerOnMissedCall', label: 'Missed Call Alert', desc: 'Get notified when a call is missed' },
    { key: 'dailySummaryAt9AM', label: 'Daily Summary at 9 AM', desc: 'Receive daily digest of bookings and leads' },
  ]

  return (
    <div className="space-y-5">
      <Card title="Alert Preferences">
        <div className="space-y-4">
          {notifToggles.map(({ key, label, desc }) => (
            <Toggle key={key} label={label} description={desc} checked={form[key]} onChange={v => set(key, v)} />
          ))}
        </div>
      </Card>

      <Card title="Reminder Settings">
        <p className="text-xs text-slate-500 mb-3">Send booking reminders to customers at these intervals (hours before appointment):</p>
        <div className="flex gap-2 flex-wrap">
          {[1, 2, 6, 12, 24, 48].map(h => (
            <button key={h} onClick={() => {
              const cur = form.reminderHours || []
              set('reminderHours', cur.includes(h) ? cur.filter(x => x !== h) : [...cur, h])
            }}
              className={clsx('px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                (form.reminderHours || []).includes(h)
                  ? 'bg-brand-blue border-brand-blue text-white'
                  : 'border-navy-400/40 text-slate-400 hover:border-navy-400/70'
              )}>{h}h before</button>
          ))}
        </div>
      </Card>

      <Button className="w-full" loading={saving} onClick={() => onSave(form)}>
        <Save className="w-4 h-4" /> Save Notification Settings
      </Button>
    </div>
  )
}

// ─── Main Settings Page ───────────────────────────────────────
export default function SettingsPage() {
  const { business, updateBusiness } = useAuthStore()
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState('bot')

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: businessApi.getSettings,
    select: r => r.data.settings,
  })

  const updateMutation = useMutation({
    mutationFn: businessApi.updateSettings,
    onSuccess: (res) => {
      toast.success('Settings saved!')
      qc.invalidateQueries(['settings'])
    },
    onError: e => toast.error(e.response?.data?.error || 'Failed to save'),
  })

  return (
    <DashboardLayout title="Settings" subtitle="Configure your bot and business">
      <div className="flex gap-6">
        {/* Vertical tab nav */}
        <div className="w-44 shrink-0">
          <nav className="space-y-1 sticky top-0">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={clsx(
                  'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left',
                  activeTab === id
                    ? 'bg-brand-blue/10 text-brand-blue border border-brand-blue/20'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-navy-600/40'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            ))}
          </nav>

          {/* Business info card */}
          {business && (
            <div className="mt-6 p-3 rounded-lg bg-navy-600/30 border border-navy-400/20">
              <p className="text-[10px] text-slate-600 uppercase tracking-wide mb-1.5">Your Business</p>
              <p className="text-xs font-semibold text-slate-300">{business.name}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                {CATEGORY_ICONS[business.category]} {business.category}
              </p>
              <div className="mt-2 h-1.5 bg-navy-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: `${business.botTrainingScore || 0}%` }} />
              </div>
              <p className="text-[10px] text-slate-600 mt-1">Bot score: {business.botTrainingScore || 0}%</p>
            </div>
          )}
        </div>

        {/* Tab content */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : (
            <>
              {activeTab === 'bot' && <BotConfigTab settings={settings} onSave={updateMutation.mutate} saving={updateMutation.isPending} />}
              {activeTab === 'hours' && <WorkingHoursTab />}
              {activeTab === 'faqs' && <FaqsTab />}
              {activeTab === 'notifications' && <NotificationsTab settings={settings} onSave={updateMutation.mutate} saving={updateMutation.isPending} />}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
