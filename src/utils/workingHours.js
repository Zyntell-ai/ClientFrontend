// Working-hours helpers (Settings → Working Hours) — React-free so they can be unit tested (npm test).

const FIELD_LABELS = { startTime: 'opening time', endTime: 'closing time', breakStart: 'break start', breakEnd: 'break end' }

/**
 * Actionable message for a failed PUT /api/business/hours. Turns the API's
 * { error: 'Validation failed', details: [{ field: 'hours.3.breakStart', message }] } into e.g.
 * "Wed break start: Use a 24-hour time such as 09:00" instead of only "Validation failed".
 * @param {*} err         - axios error
 * @param {Array} hours   - the payload that was sent (index → dayOfWeek)
 * @param {string[]} dayLabels - labels indexed by dayOfWeek (0 = Sunday)
 */
export function hoursSaveErrorMessage(err, hours = [], dayLabels = []) {
  const data = err?.response?.data
  const detail = Array.isArray(data?.details) ? data.details[0] : null
  if (detail) {
    const m = String(detail.field || '').match(/^hours\.(\d+)\.(\w+)$/)
    if (m) {
      const day = hours[Number(m[1])]
      const dayName = day ? (dayLabels[day.dayOfWeek] || `Day ${day.dayOfWeek}`) : `Day ${Number(m[1]) + 1}`
      return `${dayName} ${FIELD_LABELS[m[2]] || m[2]}: ${detail.message}`
    }
    return detail.message
  }
  if (!err?.response) return 'Could not reach the server. Check your connection and try again.'
  return data?.error || 'Failed to save working hours'
}
