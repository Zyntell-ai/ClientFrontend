// src/utils/formatters.js
import { format, formatDistanceToNow, parseISO } from 'date-fns'

export const fmt = {
  currency: (n) => `₹${(n || 0).toLocaleString('en-IN')}`,
  date: (d) => {
    if (!d) return '—'
    const dt = d?.toDate ? d.toDate() : typeof d === 'string' ? parseISO(d) : new Date(d)
    return format(dt, 'dd MMM yyyy')
  },
  datetime: (d) => {
    if (!d) return '—'
    const dt = d?.toDate ? d.toDate() : typeof d === 'string' ? parseISO(d) : new Date(d)
    return format(dt, 'dd MMM, hh:mm a')
  },
  time: (d) => {
    if (!d) return '—'
    const dt = d?.toDate ? d.toDate() : typeof d === 'string' ? parseISO(d) : new Date(d)
    return format(dt, 'hh:mm a')
  },
  ago: (d) => {
    if (!d) return '—'
    const dt = d?.toDate ? d.toDate() : typeof d === 'string' ? parseISO(d) : new Date(d)
    return formatDistanceToNow(dt, { addSuffix: true })
  },
  phone: (p) => p || '—',
  percent: (n) => `${n || 0}%`,
  duration: (mins) => {
    if (!mins) return '—'
    if (mins < 60) return `${mins}m`
    return `${Math.floor(mins / 60)}h ${mins % 60 ? `${mins % 60}m` : ''}`
  },
  initials: (name) =>
    (name || 'U')
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase(),
}

// src/utils/constants.js
export const BOOKING_STATUS_COLORS = {
  PENDING: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  CONFIRMED: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  COMPLETED: 'text-green-400 bg-green-400/10 border-green-400/20',
  CANCELLED: 'text-red-400 bg-red-400/10 border-red-400/20',
  NO_SHOW: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
}

export const LEAD_QUALITY_CONFIG = {
  HOT: { color: 'text-red-400 bg-red-400/10 border-red-400/25', label: '🔥 Hot' },
  WARM: { color: 'text-amber-400 bg-amber-400/10 border-amber-400/25', label: '♨️ Warm' },
  MILD_OKAY: { color: 'text-blue-400 bg-blue-400/10 border-blue-400/25', label: '🌊 Mild OK' },
  MILD_NOT_OKAY: { color: 'text-slate-400 bg-slate-400/10 border-slate-400/25', label: '🌫️ Mild NO' },
  COLD: { color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/25', label: '❄️ Cold' },
}

export const PLAN_CONFIG = {
  trial: { label: 'Trial', color: 'text-amber-400', badge: 'bg-amber-400/10 border-amber-400/25 text-amber-400' },
  plus: { label: 'Plus', color: 'text-blue-400', badge: 'bg-blue-400/10 border-blue-400/25 text-blue-400' },
  pro: { label: 'Pro', color: 'text-purple-400', badge: 'bg-purple-400/10 border-purple-400/25 text-purple-400' },
}

export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const DAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export const BOT_PERSONAS = ['Priya', 'Rahul', 'Ananya', 'Arjun', 'Kavya', 'Vikram']
export const BOT_TONES = [
  { value: 'friendly', label: 'Friendly & Warm' },
  { value: 'formal', label: 'Professional & Formal' },
  { value: 'mixed', label: 'Mixed (Context-Based)' },
]
export const LANGUAGES = [
  { value: 'te', label: 'Telugu', flag: '🇮🇳' },
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'hi', label: 'Hindi', flag: '🇮🇳' },
]

export const CATEGORY_ICONS = {
  healthcare: '🏥',
  realestate: '🏠',
  restaurant: '🍽️',
  salon: '💇',
  coaching: '📚',
  insurance: '🛡️',
  auto: '🚗',
  homeservice: '🔧',
}

export const CATEGORY_LABELS = {
  healthcare: 'Healthcare',
  realestate: 'Real Estate',
  restaurant: 'Restaurant',
  salon: 'Salon & Spa',
  coaching: 'Coaching',
  insurance: 'Insurance',
  auto: 'Auto Service',
  homeservice: 'Home Services',
}

export const RANGE_OPTIONS = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '1y', label: 'Last year' },
]
