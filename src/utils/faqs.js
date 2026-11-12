/**
 * @file        faqs.js
 * @description FAQ Training helpers for the Client Dashboard: the same limits the backend enforces
 *              (FinalBackend services/knowledge/faqNormalizer.js FAQ_LIMITS — the backend stays authoritative and returns
 *              structured errors), client-side validation, and owner-facing status wording. Wording never claims an FAQ
 *              is used by the AI when it is not (disabled, awaiting approval, rejected), and never calls it "ready" when
 *              its search indexing failed.
 */

export const FAQ_LIMITS = Object.freeze({ questionMin: 5, questionMax: 300, answerMin: 5, answerMax: 1500, categoryMax: 50 })

/** Trim + collapse whitespace the same way the backend does before checking lengths */
const clean = (v, keepLines = false) => {
  const s = typeof v === 'string' ? v.normalize('NFC') : ''
  return (keepLines ? s.replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n') : s.replace(/\s+/g, ' ')).trim()
}

/** @returns {Record<string,string>} field → message (empty object when valid) */
export function validateFaq({ question, answer, category } = {}, limits = FAQ_LIMITS) {
  const errors = {}
  const q = clean(question)
  const a = clean(answer, true)
  const c = clean(category)
  if (!q) errors.question = 'Question is required.'
  else if (q.length < limits.questionMin) errors.question = `Question must be at least ${limits.questionMin} characters.`
  else if (q.length > limits.questionMax) errors.question = `Question must be at most ${limits.questionMax} characters.`
  if (!a) errors.answer = 'Answer is required.'
  else if (a.length < limits.answerMin) errors.answer = `Answer must be at least ${limits.answerMin} characters.`
  else if (a.length > limits.answerMax) errors.answer = `Answer must be at most ${limits.answerMax} characters.`
  if (c.length > limits.categoryMax) errors.category = `Category must be at most ${limits.categoryMax} characters.`
  return errors
}

/** Backend error → { field: message } (structured details) plus a general message */
export function faqErrorFromResponse(err) {
  const data = err?.response?.data || {}
  const fields = {}
  ;(data.details || []).forEach((d) => { if (d?.field) fields[d.field] = d.message })
  return { fields, message: data.error || 'Something went wrong. Please try again.' }
}

/** Primary status chip for an FAQ */
export function faqStatusChip(faq) {
  if (!faq.enabled) return { label: 'Disabled', color: 'slate', help: 'Not used by your AI receptionist.' }
  if (faq.approvalStatus === 'REJECTED') return { label: 'Rejected', color: 'red', help: 'Not used by your AI receptionist. Edit it to submit it again.' }
  if (faq.approvalStatus === 'PENDING_APPROVAL' && !faq.usedByAi) {
    return faq.approvalReason === 'AWAITING_CLASSIFICATION'
      ? { label: 'Awaiting business review', color: 'amber', help: 'Not used by your AI receptionist until our team has completed your business review.' }
      : { label: 'Awaiting admin approval', color: 'amber', help: 'Healthcare FAQs are used by your AI receptionist only after an administrator approves them.' }
  }
  if (faq.usedByAi) return { label: 'In use', color: 'green', help: 'Your AI receptionist can use this FAQ.' }
  return { label: 'Not in use', color: 'slate', help: 'Not used by your AI receptionist.' }
}

/** Secondary chip for the (future) smart-search index — only when it adds information */
export function faqIndexChip(faq) {
  if (!faq.enabled) return null
  if (faq.searchIndex === 'FAILED') return { label: 'Smart search: indexing failed', color: 'red' }
  if (faq.searchIndex === 'INDEXING') return { label: 'Smart search: preparing', color: 'blue' }
  if (faq.searchIndex === 'READY') return { label: 'Smart search: ready', color: 'purple' }
  return null
}

/** Owner-facing conflict wording */
export const CONFLICT_LABEL = {
  PRICE_MISMATCH: 'Price differs from your service list',
  HOURS_MISMATCH: 'Hours differ from your working hours',
  STAFF_MISMATCH: 'Mentions someone not in your staff list',
  DUPLICATE_CONFLICT: 'Conflicts with another FAQ',
  HEALTH_REVIEW: 'Medical wording — needs administrator review',
}
