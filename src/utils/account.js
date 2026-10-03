/**
 * @file        account.js
 * @module      Utils / Account
 * @description Pure helpers for Settings → Account: which account fields to show, and password-change validation
 *              (the backend re-validates and verifies the current password; these only give fast feedback).
 */

/** Firestore timestamp over JSON ({ _seconds } / { seconds }), ISO string or Date → Date, else null */
export function toDateValue(v) {
  if (!v) return null
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v
  if (typeof v === 'string') { const d = new Date(v); return Number.isNaN(d.getTime()) ? null : d }
  const s = v._seconds ?? v.seconds
  return typeof s === 'number' ? new Date(s * 1000) : null
}

const present = (v) => typeof v === 'string' ? v.trim() !== '' && v !== 'undefined' && v !== 'null' : v !== null && v !== undefined

/**
 * @function    accountFields
 * @purpose     Account information rows from the authenticated business profile (GET /api/auth/me).
 *              Only fields that actually exist are returned — nothing is invented, no undefined/null rows.
 *              The business model has no separate owner name or role, so those appear only if present.
 * @returns {Array<{ key: string, label: string, value: string }>}
 */
export function accountFields(business) {
  if (!business) return []
  const created = toDateValue(business.createdAt)
  const rows = [
    ['ownerName', 'Account owner', business.ownerName],
    ['email', 'Email', business.email],
    ['phone', 'Phone', business.phone],
    ['name', 'Business', business.name],
    ['role', 'Role', business.role],
    ['createdAt', 'Account created', created ? created.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null],
  ]
  return rows.filter(([, , v]) => present(v)).map(([key, label, value]) => ({ key, label, value: String(value) }))
}

/** Same rules as the backend changePasswordSchema */
export function passwordStrengthError(pw) {
  if (!pw || pw.length < 8) return 'Use at least 8 characters'
  if (new TextEncoder().encode(pw).length > 72) return 'Use at most 72 characters'
  if (!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) return 'Include at least one letter and one number'
  return ''
}

/**
 * @function    validatePasswordChange
 * @returns {Object<string, string>} field → message ({} when valid)
 */
export function validatePasswordChange({ currentPassword = '', newPassword = '', confirmPassword = '' } = {}) {
  const errors = {}
  if (!currentPassword) errors.currentPassword = 'Enter your current password'
  const strength = passwordStrengthError(newPassword)
  if (strength) errors.newPassword = strength
  else if (currentPassword && newPassword === currentPassword) errors.newPassword = 'New password must be different from the current password'
  if (!confirmPassword) errors.confirmPassword = 'Confirm your new password'
  else if (newPassword !== confirmPassword) errors.confirmPassword = 'Passwords do not match'
  return errors
}

/** Maps a failed change-password API call to field errors / a general message */
export function passwordChangeErrorMessage(err) {
  const data = err?.response?.data
  if (!err?.response) return { general: 'Network error — please check your connection and try again.' }
  if (data?.error === 'Current password is incorrect') return { currentPassword: 'Current password is incorrect' }
  if (Array.isArray(data?.details) && data.details.length) {
    return Object.fromEntries(data.details.map((d) => [d.field || 'general', d.message]))
  }
  return { general: data?.error || 'Could not change the password. Please try again.' }
}
