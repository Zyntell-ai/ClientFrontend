// Run: npm test  (Node's built-in test runner — no extra dependencies)
// Phase 1: OTP check-in on every plan, full customer phone, legacy statuses shown as CONFIRMED, no alternative check-in.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { displayBookingStatus } from './index.js'

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8')

test('legacy EN_ROUTE / ARRIVED are displayed as CONFIRMED; other statuses unchanged', () => {
  assert.equal(displayBookingStatus('EN_ROUTE'), 'CONFIRMED')
  assert.equal(displayBookingStatus('ARRIVED'), 'CONFIRMED')
  for (const s of ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']) assert.equal(displayBookingStatus(s), s)
})

test('bookings page: OTP check-in is not plan-gated, the phone is never masked, statuses go through the mapping', () => {
  const page = read('../pages/bookings/BookingsPage.jsx')
  assert.doesNotMatch(page, /FeatureGate|showupVerification/)
  assert.doesNotMatch(page, /contactUnlocked|•••/)
  assert.match(page, /\['Phone', +booking\.customerPhone \|\| '—'\]/)
  assert.match(page, /bookingsApi\.verifyOtp\(id, \{ otp \}\)/)
  assert.match(page, /const canCheckIn = !booking\.otpUsed && \['PENDING', 'CONFIRMED'\]\.includes\(status\)/)
  assert.match(page, /statusStyle\(displayBookingStatus\(b\.status\)\)/)
})

test('calendar and dashboard map legacy statuses', () => {
  assert.match(read('../pages/bookings/CalendarPage.jsx'), /\{displayBookingStatus\(b\.status\)\}/)
  assert.match(read('../pages/dashboard/DashboardPage.jsx'), /\{displayBookingStatus\(b\.status\)\}/)
})

test('no alternative attendance API: mark-attended is gone', () => {
  const api = read('../api/bookings.api.js')
  assert.doesNotMatch(api, /markAttended|mark-attended/)
  assert.match(api, /verifyOtp: \(id, d\) => apiClient\.post\(`\/api\/bookings\/\$\{id\}\/verify-otp`, d\)/)
})

test('no copy promises a new appointment commission or a GPS check-in', () => {
  assert.doesNotMatch(read('../pages/commissions/CommissionsPage.jsx'), /charges 10%/)
  assert.doesNotMatch(read('../components/location/LocationEditor.jsx'), /verify customer check-ins/)
  assert.match(read('../pages/billing/BillingPage.jsx'), /showupVerification: +'OTP Check-in'/)
})

test('analytics: the completion metric is not labelled as a show-up / attendance rate', () => {
  const page = read('../pages/analytics/AnalyticsPage.jsx')
  assert.doesNotMatch(page, /label="Showup Rate"/)
  assert.match(page, /label="Completion Rate" value=\{bookingData \? fmt\.percent\(bookingData\.completionRate \?\? bookingData\.showupRate\) : '—'\} sub="Completed out of all bookings"/)
})

test('historical commissions stay visible; the dashboard no longer says new show-up bonuses are charged', () => {
  const dash = read('../pages/dashboard/DashboardPage.jsx')
  assert.doesNotMatch(dash, /Booking commissions \+ show-up bonuses/)
  assert.match(dash, /label: 'Showup commissions',\s+value: fmt\.currency\(commission\.showupTotal\)/) // historical totals still shown
  const ledger = read('../pages/commissions/CommissionsPage.jsx')
  assert.match(ledger, /SHOWUP: +'green'/) // legacy show-up rows keep their badge in the ledger
  assert.match(read('../pages/billing/BillingPage.jsx'), /\['Show-up commissions \(legacy\)', line\('showupCommissions'\)\]/)
})
