// Run: npm test  (Node's built-in test runner — no extra dependencies)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { hoursSaveErrorMessage } from './workingHours.js'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const week = DAYS.map((_, d) => ({ dayOfWeek: d, startTime: '09:00', endTime: '18:00', isOpen: d !== 0, breakStart: null, breakEnd: null }))

test('a validation error names the day and field instead of only "Validation failed"', () => {
  const err = { response: { status: 400, data: { error: 'Validation failed', details: [{ field: 'hours.3.breakStart', message: 'Use a 24-hour time such as 09:00' }] } } }
  assert.equal(hoursSaveErrorMessage(err, week, DAYS), 'Wed break start: Use a 24-hour time such as 09:00')
  const closing = { response: { data: { error: 'Validation failed', details: [{ field: 'hours.1.endTime', message: 'Use a 24-hour time such as 09:00' }] } } }
  assert.equal(hoursSaveErrorMessage(closing, week, DAYS), 'Mon closing time: Use a 24-hour time such as 09:00')
})

test('whole-payload errors, server errors and network failures stay meaningful', () => {
  assert.equal(hoursSaveErrorMessage({ response: { data: { error: 'Validation failed', details: [{ field: 'hours', message: 'Each day of the week (0–6) must appear exactly once' }] } } }, week, DAYS),
    'Each day of the week (0–6) must appear exactly once')
  assert.equal(hoursSaveErrorMessage({ response: { data: { error: 'Database error. Please try again.' } } }, week, DAYS), 'Database error. Please try again.')
  assert.match(hoursSaveErrorMessage({ message: 'Network Error' }, week, DAYS), /Could not reach the server/)
})

test('the Working Hours tab sends what it loaded (incl. null breaks) and shows the detailed error', () => {
  const page = readFileSync(new URL('../pages/settings/SettingsPage.jsx', import.meta.url), 'utf8')
  assert.match(page, /mutationFn: \(h\) => businessApi\.updateHours\({ hours: h }\)/)
  assert.match(page, /onError: \(e, sent\) => toast\.error\(hoursSaveErrorMessage\(e, sent, DAY_LABELS\)\)/)
})
