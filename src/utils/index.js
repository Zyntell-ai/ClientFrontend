/**
 * @file        index.js
 * @module      Utilities
 * @project     ClientFrontend
 * @layer       Utility
 * @description Shared utility functions and application-wide constants — date/currency formatters, booking/lead status configs, plan configs, and category metadata.
 *
 * @updated     2026-05-29
 * @version     1.0.0
 *
 * @dependencies
 *   - date-fns (format, formatDistanceToNow, parseISO)
 *
 * @sideEffects
 *   - None
 */

// ─────────────────────────────────────────
// IMPORTS & DEPENDENCIES
// ─────────────────────────────────────────
import { format, formatDistanceToNow, parseISO } from 'date-fns'

// ─────────────────────────────────────────
// CORE LOGIC / HANDLER FUNCTIONS
// ─────────────────────────────────────────

/**
 * @function    toDate
 * @purpose     Normalize any date-like value (Firestore Timestamp, ISO string, plain Date, or epoch object) into a JavaScript Date
 * @param  {any} d - Input date value (Firestore Timestamp, ISO string, seconds object, or Date)
 * @returns {Date|null} Parsed JavaScript Date, or null if the value is falsy or unparseable
 */
// [DATA TRANSFORM]: Normalize Firestore Timestamps, ISO strings, and plain dates into JS Date
export const toDate = (d) => {
  if (!d) return null
  // Native Firestore Timestamp (client SDK)
  if (typeof d.toDate === 'function') return d.toDate()
  // Serialized Firestore Timestamp from REST API: { _seconds, _nanoseconds } or { seconds, nanoseconds }
  const secs = d._seconds ?? d.seconds
  if (typeof secs === 'number') return new Date(secs * 1000)
  // ISO string
  if (typeof d === 'string') return parseISO(d)
  // Fallback
  const dt = new Date(d)
  return isNaN(dt.getTime()) ? null : dt
}

/**
 * @function    fmt
 * @purpose     Collection of display formatters for currency, dates, times, durations, and initials
 * @returns {object} Object of named formatter functions
 */
// [DATA TRANSFORM]: Formatting helpers for UI display
export const fmt = {
  /** Format a number as Indian Rupee currency */
  currency: (n) => `₹${(n || 0).toLocaleString('en-IN')}`,
  /** Format a date value as "dd MMM yyyy" */
  date: (d) => {
    const dt = toDate(d)
    return dt ? format(dt, 'dd MMM yyyy') : '—'
  },
  /** Format a date value as "dd MMM, hh:mm a" */
  datetime: (d) => {
    const dt = toDate(d)
    return dt ? format(dt, 'dd MMM, hh:mm a') : '—'
  },
  /** Format a date value as "hh:mm a" */
  time: (d) => {
    const dt = toDate(d)
    return dt ? format(dt, 'hh:mm a') : '—'
  },
  /** Format a date value as a relative time string (e.g. "2 hours ago") */
  ago: (d) => {
    const dt = toDate(d)
    return dt ? formatDistanceToNow(dt, { addSuffix: true }) : '—'
  },
  /** Return phone number string or em-dash placeholder */
  phone: (p) => p || '—',
  /** Format a number as a percentage string */
  percent: (n) => `${n || 0}%`,
  /** Format a duration in minutes as "Xh Ym" or "Xm" */
  duration: (mins) => {
    if (!mins) return '—'
    if (mins < 60) return `${mins}m`
    return `${Math.floor(mins / 60)}h ${mins % 60 ? `${mins % 60}m` : ''}`
  },
  /** Extract up to two-character initials from a full name */
  initials: (name) =>
    (name || 'U')
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase(),
}

// ─────────────────────────────────────────
// CONSTANTS & CONFIG
// ─────────────────────────────────────────

/**
 * @constant    BOOKING_STATUS_COLORS
 * @purpose     Tailwind class map for booking status badge styling
 */
// [UI]: Booking status → Tailwind color class mapping
export const BOOKING_STATUS_COLORS = {
  PENDING:   'text-amber-400 bg-amber-400/10 border-amber-400/20',
  CONFIRMED: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  COMPLETED: 'text-green-400 bg-green-400/10 border-green-400/20',
  CANCELLED: 'text-red-400 bg-red-400/10 border-red-400/20',
  NO_SHOW:   'text-slate-400 bg-slate-400/10 border-slate-400/20',
}

/**
 * @constant    LEAD_QUALITY_CONFIG
 * @purpose     Display config for lead quality tiers — Tailwind color class and human-readable label
 */
// [UI]: Lead quality → color class and display label mapping
export const LEAD_QUALITY_CONFIG = {
  HOT:          { color: 'text-red-400 bg-red-400/10 border-red-400/25',     label: '🔥 Hot'     },
  WARM:         { color: 'text-amber-400 bg-amber-400/10 border-amber-400/25', label: '♨️ Warm'   },
  MILD_OKAY:    { color: 'text-blue-400 bg-blue-400/10 border-blue-400/25',   label: '🌊 Mild OK' },
  MILD_NOT_OKAY:{ color: 'text-slate-400 bg-slate-400/10 border-slate-400/25',label: '🌫️ Mild NO'},
  COLD:         { color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/25',   label: '❄️ Cold'   },
}

/**
 * @constant    PLAN_CONFIG
 * @purpose     Display config for subscription plan tiers — label, color class, and badge style
 */
// [AUTH]: Subscription plan → display label and color class mapping
export const PLAN_CONFIG = {
  trial: { label: 'Trial', color: 'text-amber-400', badge: 'bg-amber-400/10 border-amber-400/25 text-amber-400' },
  plus:  { label: 'Plus',  color: 'text-blue-400',  badge: 'bg-blue-400/10 border-blue-400/25 text-blue-400'   },
  pro:   { label: 'Pro',   color: 'text-purple-400', badge: 'bg-purple-400/10 border-purple-400/25 text-purple-400' },
}

/**
 * @constant    DAY_LABELS
 * @purpose     Short 3-letter day name abbreviations indexed by getDay()
 */
export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/**
 * @constant    DAY_FULL
 * @purpose     Full day name strings indexed by getDay()
 */
export const DAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/**
 * @constant    BOT_PERSONAS
 * @purpose     Available AI bot persona name options
 */
export const BOT_PERSONAS = ['Priya', 'Rahul', 'Ananya', 'Arjun', 'Kavya', 'Vikram']

/**
 * @constant    BOT_TONES
 * @purpose     Available bot conversation tone options with value/label pairs
 */
export const BOT_TONES = [
  { value: 'friendly', label: 'Friendly & Warm'        },
  { value: 'formal',   label: 'Professional & Formal'  },
  { value: 'mixed',    label: 'Mixed (Context-Based)'  },
]

/**
 * @constant    LANGUAGES
 * @purpose     Supported bot conversation language options with value, label, and flag
 */
export const LANGUAGES = [
  { value: 'te', label: 'Telugu',  flag: '🇮🇳' },
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'hi', label: 'Hindi',   flag: '🇮🇳' },
]

/**
 * @constant    CATEGORY_ICONS
 * @purpose     Emoji icon map keyed by business category slug
 */
// [UI]: Business category → emoji icon mapping
export const CATEGORY_ICONS = {
  healthcare:  '🏥',
  realestate:  '🏠',
  restaurant:  '🍽️',
  salon:       '💇',
  coaching:    '📚',
  insurance:   '🛡️',
  auto:        '🚗',
  homeservice: '🔧',
}

/**
 * @constant    CATEGORY_LABELS
 * @purpose     Human-readable display labels keyed by business category slug
 */
// [UI]: Business category → display label mapping
export const CATEGORY_LABELS = {
  healthcare:  'Healthcare',
  realestate:  'Real Estate',
  restaurant:  'Restaurant',
  salon:       'Salon & Spa',
  coaching:    'Coaching',
  insurance:   'Insurance',
  auto:        'Auto Service',
  homeservice: 'Home Services',
}

/**
 * @constant    RANGE_OPTIONS
 * @purpose     Date range filter options used in analytics and reporting views
 */
export const RANGE_OPTIONS = [
  { value: '7d',  label: 'Last 7 days'  },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '1y',  label: 'Last year'    },
]
