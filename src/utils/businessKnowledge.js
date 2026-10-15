// Business Knowledge page helpers — kept free of React so they can be unit tested (npm test).
// Mirrors the backend contract: PUT /api/business/knowledge trims each field and rejects more than
// 5,000 characters (String.length — the same count the counter shows).

export const KNOWLEDGE_MAX_LENGTH = 5000

export const KNOWLEDGE_FIELDS = [
  {
    key: 'businessDescription',
    label: 'Business description',
    help: 'Describe your business: what you offer, what you specialise in, your story, and anything customers should know about you. Your AI receptionist uses this on calls and WhatsApp.',
    placeholder: 'e.g. Glow Salon is a family-run bridal studio in Kothrud since 2009. We specialise in bridal makeup, mehendi and keratin treatments…',
  },
  {
    key: 'aiInstructions',
    label: 'Instructions for your AI',
    help: 'Extra facts and guidance for how the AI should talk to customers — e.g. payment methods, parking, or "always greet callers with Namaste". Services, prices, staff and working hours still come from their own pages, and the AI will never guess anything that isn’t written down.',
    placeholder: 'e.g. We accept UPI and cards, not cash.\nFree parking is available behind the building.\nAlways greet customers with "Namaste".',
  },
]

const FIELD_KEYS = KNOWLEDGE_FIELDS.map((f) => f.key)

/** Form values from a GET/PUT response — empty strings when never saved */
export function knowledgeFromResponse(data) {
  const k = data?.knowledge || {}
  return {
    businessDescription: typeof k.businessDescription === 'string' ? k.businessDescription : '',
    aiInstructions: typeof k.aiInstructions === 'string' ? k.aiInstructions : '',
    updatedAt: k.updatedAt || null,
  }
}

/** @returns {Object<string,string>} field → error message (empty when valid) */
export function validateKnowledge(values) {
  const errors = {}
  for (const key of FIELD_KEYS) {
    const length = (values?.[key] || '').trim().length
    if (length > KNOWLEDGE_MAX_LENGTH) {
      errors[key] = `Please shorten this to ${KNOWLEDGE_MAX_LENGTH.toLocaleString('en-IN')} characters or fewer (currently ${length.toLocaleString('en-IN')}).`
    }
  }
  return errors
}

/** Only the fields that differ from what is saved (compared trimmed, as the server stores them) */
export function changedKnowledge(values, saved) {
  const payload = {}
  for (const key of FIELD_KEYS) {
    const next = (values?.[key] || '').trim()
    if (next !== (saved?.[key] || '')) payload[key] = next
  }
  return payload
}

export function isKnowledgeDirty(values, saved) {
  return Object.keys(changedKnowledge(values, saved)).length > 0
}

/** Actionable message for a failed save (validation details from the API's { error, details } shape) */
export function knowledgeErrorMessage(err) {
  const data = err?.response?.data
  const detail = Array.isArray(data?.details) ? data.details[0] : null
  if (detail) {
    const field = KNOWLEDGE_FIELDS.find((f) => f.key === detail.field)
    return field ? `${field.label}: ${detail.message}` : detail.message
  }
  if (!err?.response) return 'Could not reach the server. Check your connection and try again — your text is still here.'
  return data?.error || 'Could not save. Please try again.'
}
