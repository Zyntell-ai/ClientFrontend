// Run: npm test  (Node's built-in test runner — no extra dependencies)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { accountFields, validatePasswordChange, passwordStrengthError, passwordChangeErrorMessage, toDateValue } from './account.js'

// Shape of GET /api/auth/me → business (Firestore timestamps arrive as { _seconds, _nanoseconds })
const me = {
  id: 'bizA', name: 'Glow Salon', email: 'owner@glow.test', phone: '+919800000001', category: 'salon',
  plan: 'growth', createdAt: { _seconds: 1767225600, _nanoseconds: 0 }, settings: {}, trial: null,
}

test('account information: business, authenticated email, phone and creation date', () => {
  const rows = accountFields(me)
  assert.deepEqual(rows.map((r) => r.key), ['email', 'phone', 'name', 'createdAt'])
  assert.equal(rows.find((r) => r.key === 'email').value, 'owner@glow.test')
  assert.equal(rows.find((r) => r.key === 'name').value, 'Glow Salon')
  assert.match(rows.find((r) => r.key === 'createdAt').value, /2026/)
})

test('no undefined/null/empty account fields are rendered; nothing is invented', () => {
  const rows = accountFields({ name: 'X', email: 'x@y.z', phone: null, role: undefined, ownerName: '', createdAt: null })
  assert.deepEqual(rows.map((r) => r.key), ['email', 'name'])
  for (const r of accountFields({ ...me, phone: 'undefined', ownerName: 'null' })) {
    assert.doesNotMatch(r.value, /^(undefined|null)$/)
  }
  assert.deepEqual(accountFields(undefined), [])
  // owner name / role only when the backend actually has them
  assert.deepEqual(accountFields({ ...me, ownerName: 'Asha', role: 'OWNER' }).map((r) => r.key), ['ownerName', 'email', 'phone', 'name', 'role', 'createdAt'])
})

test('account fields never include any password/credential data', () => {
  const rows = accountFields({ ...me, password: '$2a$12$hash', passwordResetOtp: 'h', passwordResetExpiry: 'x' })
  assert.doesNotMatch(JSON.stringify(rows), /password|\$2a\$/i)
})

test('dates from Firestore JSON, ISO strings and Dates', () => {
  assert.equal(toDateValue({ _seconds: 0 }).getTime(), 0)
  assert.equal(toDateValue('2026-01-01T00:00:00Z').toISOString(), '2026-01-01T00:00:00.000Z')
  assert.equal(toDateValue('garbage'), null)
  assert.equal(toDateValue(undefined), null)
})

test('valid password change passes client validation', () => {
  assert.deepEqual(validatePasswordChange({ currentPassword: 'OldPassw0rd', newPassword: 'NewPassw0rd9', confirmPassword: 'NewPassw0rd9' }), {})
})

test('password mismatch is rejected', () => {
  assert.equal(validatePasswordChange({ currentPassword: 'a', newPassword: 'NewPassw0rd9', confirmPassword: 'NewPassw0rd8' }).confirmPassword, 'Passwords do not match')
})

test('weak / invalid new passwords are rejected (same rules as the backend)', () => {
  assert.notEqual(passwordStrengthError('Ab1'), '')
  assert.notEqual(passwordStrengthError('onlyletters'), '')
  assert.notEqual(passwordStrengthError('1234567890'), '')
  assert.notEqual(passwordStrengthError(`A1${'x'.repeat(80)}`), '')
  assert.equal(passwordStrengthError('Passw0rdOK'), '')
  assert.ok(validatePasswordChange({ currentPassword: 'Same1234', newPassword: 'Same1234', confirmPassword: 'Same1234' }).newPassword)
  assert.ok(validatePasswordChange({}).currentPassword)
})

test('incorrect current password, validation errors and API/network failures map to clear messages', () => {
  assert.deepEqual(passwordChangeErrorMessage({ response: { status: 400, data: { error: 'Current password is incorrect' } } }), { currentPassword: 'Current password is incorrect' })
  assert.deepEqual(passwordChangeErrorMessage({ response: { status: 400, data: { error: 'Validation failed', details: [{ field: 'newPassword', message: 'Password must be at least 8 characters' }] } } }), { newPassword: 'Password must be at least 8 characters' })
  assert.match(passwordChangeErrorMessage({ response: { status: 500, data: { error: 'Internal server error' } } }).general, /Internal server error/)
  assert.match(passwordChangeErrorMessage({ message: 'Network Error' }).general, /Network error/)
})

// Source-level guards (no browser/React test environment in ClientFrontend)
test('AccountSettings keeps passwords out of storage and uses the backend endpoints', () => {
  const src = readFileSync(new URL('../components/account/AccountSettings.jsx', import.meta.url), 'utf8')
  assert.doesNotMatch(src, /(localStorage|sessionStorage)\s*\.\s*(setItem|getItem)|window\.(localStorage|sessionStorage)\[/)
  assert.match(src, /authApi\.changePassword/)
  assert.match(src, /queryFn: authApi\.me/)
  assert.match(src, /setAuth\(res\.data\.token, current\)/) // only the token is stored, never a password
  assert.match(src, /disabled=\{changeMutation\.isPending\}/)
  const api = readFileSync(new URL('../api/auth.api.js', import.meta.url), 'utf8')
  assert.match(api, /apiClient\.post\('\/api\/auth\/change-password', data\)/)
})
