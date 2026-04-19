import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../../store/authStore'
import { businessApi } from '../../api/index'
import apiClient from '../../api/apiClient'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Alert } from '../../components/ui/index'
import { CATEGORY_ICONS } from '../../utils/index'
import {
  Send, RotateCcw, Bot, Wifi, Check, CheckCheck,
  Zap, Info, ChevronDown
} from 'lucide-react'
import { format } from 'date-fns'
import clsx from 'clsx'

// ── API calls ─────────────────────────────────────────────────
const botTestApi = {
  send:  (message, sessionId) => apiClient.post('/api/business/bot-test', { message, sessionId }),
  reset: (sessionId)          => apiClient.post('/api/business/bot-test', { reset: true, sessionId }),
}

// ── Quick test scenarios ──────────────────────────────────────
const SCENARIOS = {
  healthcare: [
    { label: '🤒 Health concern',   msg: 'I have knee pain, I need to see a doctor' },
    { label: '📅 Book appointment', msg: 'I want to book an appointment' },
    { label: '💰 Pricing',          msg: 'What are your consultation charges?' },
    { label: '🕐 Working hours',    msg: 'What are your clinic timings?' },
    { label: '🦷 Dental',           msg: 'I have a severe toothache, is a dentist available?' },
  ],
  realestate: [
    { label: '🏠 Buy property', msg: 'I want to buy a 2BHK, budget around 60 lakhs' },
    { label: '🔑 Rental',       msg: 'Looking for 1BHK flat on rent near Gachibowli' },
    { label: '📍 Site visit',   msg: 'Can I schedule a site visit this weekend?' },
    { label: '💰 Prices',       msg: 'What are the current property prices?' },
  ],
  restaurant: [
    { label: '🍽️ Table booking',   msg: 'I want to book a table for 4 people this Saturday at 8 PM' },
    { label: '🎂 Birthday dinner', msg: 'I need to plan a birthday dinner for 10 people' },
    { label: '🥗 Menu query',      msg: 'Do you have a vegetarian menu?' },
    { label: '⏰ Timings',         msg: 'What time do you open?' },
  ],
  salon: [
    { label: '✂️ Haircut',      msg: 'I want to book a haircut for tomorrow' },
    { label: '💇 Hair colour', msg: 'How much does hair colouring cost?' },
    { label: '📅 Weekend slot', msg: 'Do you have slots available this Sunday?' },
    { label: '💅 Full package', msg: 'What are the charges for a facial and hair treatment?' },
  ],
  default: [
    { label: '📅 Book appointment', msg: 'I want to book an appointment' },
    { label: '💰 Pricing',          msg: 'What are your prices?' },
    { label: '🕐 Working hours',    msg: 'What are your working hours?' },
    { label: '📍 Location',         msg: 'Where are you located?' },
    { label: '👋 Greet',            msg: 'Hello!' },
  ],
}

// ── Message bubble ────────────────────────────────────────────
function Bubble({ msg }) {
  const isBot = msg.role === 'bot'

  if (msg.role === 'system') {
    return (
      <div className="flex justify-center my-1.5">
        <span className="bg-[#182229] border border-white/5 text-slate-600 text-[10px] px-3 py-1 rounded-full">
          {msg.text}
        </span>
      </div>
    )
  }

  return (
    <div className={clsx('flex mb-2.5', isBot ? 'justify-start' : 'justify-end')}>
      {isBot && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shrink-0 mr-2 mt-1">
          <Bot style={{ width: 15, height: 15 }} className="text-white" />
        </div>
      )}
      <div className={clsx(
        'max-w-[76%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm',
        isBot
          ? 'bg-[#1f2c33] text-slate-200 rounded-tl-sm border border-white/5'
          : 'bg-[#005c4b] text-white rounded-tr-sm'
      )}>
        <p className="whitespace-pre-wrap break-words">{msg.text}</p>
        <div className={clsx('flex items-center gap-1 justify-end mt-1 text-[10px]',
          isBot ? 'text-slate-600' : 'text-green-200/60')}>
          {msg.time}
          {!isBot && (msg.sent ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />)}
        </div>
      </div>
    </div>
  )
}

function Typing() {
  return (
    <div className="flex items-center gap-2 mb-2.5">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shrink-0">
        <Bot style={{ width: 15, height: 15 }} className="text-white" />
      </div>
      <div className="bg-[#1f2c33] border border-white/5 px-4 py-2.5 rounded-2xl rounded-tl-sm inline-flex items-center gap-1">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce"
            style={{ animationDelay: `${i * 0.18}s`, animationDuration: '0.8s' }} />
        ))}
      </div>
    </div>
  )
}

function CollapsiblePanel({ title, icon: Icon, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="glass-card overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-navy-600/20 transition-colors">
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{title}</span>
        </div>
        <ChevronDown className={clsx('w-3.5 h-3.5 text-slate-600 transition-transform duration-200', open && 'rotate-180')} />
      </button>
      {open && <div className="px-4 pb-4 border-t border-navy-400/20">{children}</div>}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function BotTestPage() {
  const { business } = useAuthStore()
  const [messages, setMessages] = useState([])
  const [input, setInput]       = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError]       = useState('')
  const [msgCount, setMsgCount] = useState(0)

  const sessionId = useRef(`${business?.id}_${Date.now()}`)
  const scrollRef = useRef(null)
  const inputRef  = useRef(null)

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: businessApi.getSettings,
    select: r => r.data.settings,
  })
  const { data: services } = useQuery({
    queryKey: ['services'],
    queryFn: businessApi.getServices,
    select: r => r.data.services,
  })

  const persona   = settings?.botPersona || 'Priya'
  const catIcon   = CATEGORY_ICONS[business?.category] || '🏢'
  const scenarios = SCENARIOS[business?.category] || SCENARIOS.default
  const langLabel = { te: 'Telugu', hi: 'Hindi', en: 'English' }[settings?.language] || 'English'

  const ts  = () => format(new Date(), 'hh:mm a')
  const add = (role, text, extra = {}) =>
    setMessages(m => [...m, { id: Date.now() + Math.random(), role, text, time: ts(), ...extra }])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Show bot welcome message on load
  useEffect(() => {
    if (messages.length === 0 && settings !== undefined) {
      const welcome = settings?.welcomeMessage ||
        `Hi! I'm ${persona} from ${business?.name}. How can I help you today? 😊`
      setTimeout(() => add('bot', welcome), 500)
    }
  }, [settings])

  // Send message to real backend bot
  const send = useCallback(async (text) => {
    const msg = text.trim()
    if (!msg || isTyping) return
    setInput('')
    setError('')
    setMsgCount(c => c + 1)
    add('user', msg, { sent: false })
    setTimeout(() => {
      setMessages(m => m.map((x, i) => i === m.length - 1 ? { ...x, sent: true } : x))
    }, 350)
    setIsTyping(true)
    try {
      const res = await botTestApi.send(msg, sessionId.current)
      setIsTyping(false)
      add('bot', res.data.reply || "I didn't understand that. Could you rephrase? 🙏")
    } catch (err) {
      setIsTyping(false)
      const e = err.response?.data?.error || 'Connection error — is the backend running?'
      setError(e)
      add('system', `⚠️ ${e}`)
    }
  }, [isTyping])

  const reset = async () => {
    setIsTyping(false)
    setError('')
    setMsgCount(0)
    try { await botTestApi.reset(sessionId.current) } catch { /* silent */ }
    sessionId.current = `${business?.id}_${Date.now()}`
    setMessages([])
    setTimeout(() => {
      const welcome = settings?.welcomeMessage ||
        `Hi! I'm ${persona} from ${business?.name}. How can I help you today? 😊`
      add('bot', welcome)
      inputRef.current?.focus()
    }, 300)
  }

  const handleKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) }
  }

  return (
    <DashboardLayout title="Live Bot Test" subtitle="Chat with your real AI bot — same engine as production">
      <div className="flex gap-5" style={{ height: 'calc(100vh - 11rem)' }}>

        {/* Phone mockup */}
        <div className="flex flex-col" style={{ width: '410px', minWidth: '380px' }}>
          <div className="flex-1 flex flex-col overflow-hidden rounded-[2.5rem] border-[3px] border-navy-400/30"
            style={{
              background: '#0b141a',
              boxShadow: '0 0 0 6px #040d21, 0 0 0 8px rgba(30,58,95,.2), 0 30px 70px rgba(0,0,0,.6)',
            }}>

            {/* Status bar */}
            <div className="flex justify-between px-6 pt-3 pb-1 text-[10px] text-slate-700">
              <span>{format(new Date(), 'HH:mm')}</span>
              <div className="flex gap-1 items-center">
                <Wifi className="w-3 h-3" /><span>5G</span>
              </div>
            </div>

            {/* WhatsApp header */}
            <div className="bg-[#1f2c33] px-4 py-2.5 flex items-center gap-3 border-b border-white/5">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow">
                  <Bot style={{ width: 18, height: 18 }} className="text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[#1f2c33]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-100 leading-tight">{persona}</p>
                <p className="text-[10px] text-green-400 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  {catIcon} {business?.name}
                </p>
              </div>
              <button onClick={reset} title="Reset conversation"
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors">
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3"
              style={{ background: 'linear-gradient(180deg,#0b141a 0%,#0d1b22 100%)' }}>
              <div className="flex justify-center mb-3">
                <span className="bg-[#182229] border border-white/5 text-slate-600 text-[10px] px-3 py-1 rounded-full">
                  {format(new Date(), 'dd MMM yyyy')} · TEST MODE
                </span>
              </div>
              {messages.map(m => <Bubble key={m.id} msg={m} />)}
              {isTyping && <Typing />}
              <div ref={scrollRef} />
            </div>

            {/* Input bar */}
            <div className="bg-[#1f2c33] px-3 py-2.5 flex items-end gap-2 border-t border-white/5">
              <div className="flex-1 bg-[#2a3942] rounded-full px-4 py-2.5 min-h-[42px] flex items-center">
                <textarea ref={inputRef} rows={1} value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  disabled={isTyping}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 resize-none outline-none max-h-28 overflow-y-auto leading-relaxed disabled:opacity-50"
                  style={{ scrollbarWidth: 'none' }} />
              </div>
              <button onClick={() => send(input)}
                disabled={!input.trim() || isTyping}
                className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-[#00c49e] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-lg">
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 min-w-0 flex flex-col gap-4 overflow-y-auto">

          {error && (
            <Alert type="error">
              <strong>Backend error:</strong> {error}
            </Alert>
          )}

          {/* Quick scenarios */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-3.5 h-3.5 text-brand-blue" />
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Quick Scenarios</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {scenarios.map(({ label, msg }) => (
                <button key={label} onClick={() => send(msg)} disabled={isTyping}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border border-navy-400/30 text-slate-400
                             hover:border-brand-blue/50 hover:text-brand-blue hover:bg-brand-blue/5
                             disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Session stats */}
          <div className="glass-card p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Session</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Messages sent', value: msgCount },
                { label: 'Persona',       value: persona },
                { label: 'Language',      value: langLabel },
              ].map(({ label, value }) => (
                <div key={label} className="bg-navy-700/50 rounded-xl p-3 text-center">
                  <p className="text-sm font-bold text-slate-200">{value ?? '—'}</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
            <button onClick={reset}
              className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-navy-400/25
                         text-xs text-slate-500 hover:text-red-400 hover:border-red-400/30 transition-all">
              <RotateCcw className="w-3 h-3" /> Reset conversation
            </button>
          </div>

          {/* Bot config */}
          <CollapsiblePanel title="Bot Configuration" icon={Bot}>
            <div className="mt-3">
              {[
                ['Persona',            settings?.botPersona || 'Priya'],
                ['Tone',               settings?.botTone || 'friendly'],
                ['Language',           langLabel],
                ['Auto-confirm',       settings?.autoConfirmBookings ? 'Yes' : 'No'],
                ['Buffer (min)',        settings?.bookingBufferMinutes ?? 0],
                ['Max per slot',       settings?.maxBookingsPerSlot ?? 1],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-2 border-b border-navy-400/10 last:border-0">
                  <span className="text-xs text-slate-600">{label}</span>
                  <span className="text-xs font-semibold text-slate-300 capitalize">{String(value)}</span>
                </div>
              ))}
            </div>
          </CollapsiblePanel>

          {/* Services list */}
          {services?.length > 0 && (
            <CollapsiblePanel title={`Services (${services.length})`} icon={Info}>
              <div className="mt-3">
                {services.map(s => (
                  <div key={s.id} className="flex justify-between items-center py-2 border-b border-navy-400/10 last:border-0">
                    <div>
                      <p className="text-xs font-medium text-slate-300">{s.name}</p>
                      {s.nameRegional && <p className="text-[10px] text-slate-600">{s.nameRegional}</p>}
                    </div>
                    <span className="text-xs font-semibold text-green-400">
                      {s.price ? `₹${s.price}` : s.priceMin ? `₹${s.priceMin}–${s.priceMax}` : 'On consult'}
                    </span>
                  </div>
                ))}
              </div>
            </CollapsiblePanel>
          )}

          {/* How it works */}
          <div className="glass-card p-4 border border-brand-blue/10">
            <p className="text-xs font-semibold text-slate-500 mb-2.5 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-brand-blue/60" /> How this works
            </p>
            <ul className="text-[11px] text-slate-600 space-y-2 leading-relaxed">
              <li>→ Messages go to <span className="text-brand-blue font-medium">POST /api/business/bot-test</span></li>
              <li>→ The <span className="text-brand-blue font-medium">real stateMachine</span> processes it — same code as production</li>
              <li>→ Reply is captured <span className="text-brand-blue font-medium">before reaching Twilio</span> and returned here</li>
              <li>→ Conversation state lives in Redis — resets when you tap ↺</li>
              <li>→ Changes to services / FAQs / hours take effect after reset</li>
            </ul>
          </div>

        </div>
      </div>
    </DashboardLayout>
  )
}