/**
 * @file        insights.js
 * @description Display helpers for Conversation Insights. Wording never claims more than the backend's conservative
 *              outcome: only ANSWERED means "answered from your business data"; UNCERTAIN means the system could not
 *              verify the answer (not that it was wrong); ESCALATED only after a real human handoff.
 */

export const OUTCOME_ORDER = ['ANSWERED', 'UNCERTAIN', 'UNANSWERED', 'ESCALATED']

export const OUTCOME_META = {
  ANSWERED:   { label: 'Answered',     color: 'green', help: 'Answered from your business data (a booking record or a live availability check).' },
  UNCERTAIN:  { label: 'Not verified', color: 'amber', help: 'The AI replied, but Zyntell could not confirm the answer came from your business information.' },
  UNANSWERED: { label: 'Unanswered',   color: 'red',   help: 'The AI said it did not have the information (or could not give medical advice).' },
  ESCALATED:  { label: 'Handed to staff', color: 'blue', help: 'A real handoff to a person took place.' },
}

export const CHANNEL_LABEL = { voice: 'Voice call', whatsapp: 'WhatsApp' }

/** Percentage of `part` in `total`, rounded; 0 when total is 0 */
export const percent = (part, total) => (total > 0 ? Math.round((part / total) * 100) : 0)

/** Short, non-identifying reference to the source conversation, e.g. "Voice call · …a1b2" */
export const conversationLabel = (ref) => {
  if (!ref || !ref.id) return '—'
  const tail = String(ref.id).slice(-4)
  return `${ref.type === 'voice_call' ? 'Voice call' : 'WhatsApp chat'} · …${tail}`
}

/** True when the summary holds no questions at all */
export const isEmptySummary = (summary) => !summary || !summary.total
