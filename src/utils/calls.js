/**
 * @file        calls.js
 * @description Display helpers for the business call-management page. Only facts the backend returns are shown —
 *              a missing duration/status stays "—" (never 0 or a guess).
 */

export const CALL_OUTCOME_META = {
  BOOKED:      { label: 'Booked',        color: 'green',  help: 'The AI receptionist created a booking on this call.' },
  ANSWERED:    { label: 'Answered',      color: 'blue',   help: 'The call was answered (by the AI receptionist or your team).' },
  MISSED:      { label: 'Missed',        color: 'red',    help: 'The call was not answered.' },
  IN_PROGRESS: { label: 'In progress',   color: 'amber',  help: 'Exotel has not reported the end of this call yet.' },
  UNKNOWN:     { label: 'Not reported',  color: 'slate',  help: 'Exotel did not report enough to classify this call.' },
}

export const MISSED_REASON_LABEL = {
  NO_ANSWER: 'No answer',
  BUSY: 'Busy',
  FAILED: 'Failed',
  CALLER_HUNG_UP_BEFORE_ANSWER: 'Caller hung up before answer',
  CALLER_HUNG_UP: 'Caller hung up',
  NOT_ANSWERED: 'Not answered',
  ENDED_WITHIN_5S: 'Ended within 5 seconds',
}

/** Seconds → "1m 35s" / "45s"; null/undefined → "—" (unknown is never shown as 0) */
export const formatCallDuration = (seconds) => {
  if (seconds === null || seconds === undefined || !Number.isFinite(Number(seconds))) return '—'
  const s = Math.max(0, Math.floor(Number(seconds)))
  const m = Math.floor(s / 60)
  return m ? `${m}m ${s % 60}s` : `${s}s`
}

/** Short call reference for display, e.g. "…a1b2" */
export const callReference = (callSid) => (callSid ? `…${String(callSid).slice(-4)}` : '—')

/** YYYY-MM-DD for a Date in the browser's local calendar */
export const isoDay = (d) => {
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Preset ranges (inclusive days ending today) */
export const RANGE_PRESETS = [
  { key: '7', label: 'Last 7 days', days: 7 },
  { key: '30', label: 'Last 30 days', days: 30 },
  { key: '90', label: 'Last 90 days', days: 90 },
]
export const presetRange = (days, now = new Date()) => {
  const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1))
  return { from: isoDay(from), to: isoDay(now) }
}

/** Merge pages of calls, keeping the first occurrence of each call id (a call may straddle a page boundary) */
export const mergeCallPages = (pages = []) => {
  const seen = new Map()
  pages.forEach((p) => (p?.calls || []).forEach((c) => {
    if (!seen.has(c.id)) seen.set(c.id, c)
  }))
  return [...seen.values()]
}

/** Display string for the assigned virtual number(s) */
export const assignedNumberLabel = (numbers = []) => {
  const voice = numbers.filter((n) => n.phoneNumber && (!n.type || n.type === 'voice'))
  return voice.length ? voice.map((n) => n.phoneNumber).join(', ') : null
}
