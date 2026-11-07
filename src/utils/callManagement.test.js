// Run: npm test  (Node's built-in test runner — no extra dependencies)
// Phase 4 business call management page: helpers, wiring, states, business scoping and the recording policy.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  CALL_OUTCOME_META, formatCallDuration, callReference, presetRange, mergeCallPages, assignedNumberLabel, isoDay,
} from './calls.js'

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8')

test('duration: only a reported value is shown — unknown is "—", never 0', () => {
  assert.equal(formatCallDuration(95), '1m 35s')
  assert.equal(formatCallDuration(45), '45s')
  assert.equal(formatCallDuration(0), '0s')
  assert.equal(formatCallDuration(null), '—')
  assert.equal(formatCallDuration(undefined), '—')
})

test('outcomes, short call reference, presets and the virtual number label', () => {
  assert.deepEqual(Object.keys(CALL_OUTCOME_META), ['BOOKED', 'ANSWERED', 'MISSED', 'IN_PROGRESS', 'UNKNOWN'])
  assert.equal(callReference('CA0123456789abcd'), '…abcd')
  assert.equal(callReference(null), '—')
  assert.deepEqual(presetRange(7, new Date(2026, 10, 8)), { from: '2026-11-02', to: '2026-11-08' })
  assert.equal(isoDay(new Date(2026, 0, 5)), '2026-01-05')
  assert.equal(assignedNumberLabel([{ phoneNumber: '+918041000001', type: 'voice' }]), '+918041000001')
  assert.equal(assignedNumberLabel([]), null)
})

test('pages are merged without duplicating a call that straddles a page boundary', () => {
  const merged = mergeCallPages([{ calls: [{ id: 'a' }, { id: 'b' }] }, { calls: [{ id: 'b' }, { id: 'c' }] }])
  assert.deepEqual(merged.map((c) => c.id), ['a', 'b', 'c'])
})

test('calls page: route, sidebar entry, business-scoped API (no business id sent), states, pagination', () => {
  assert.match(read('../App.jsx'), /<Route path="\/calls" element=\{<RequireAuth><CallsPage \/><\/RequireAuth>\} \/>/)
  assert.match(read('../components/layout/Sidebar.jsx'), /\{ to: '\/calls', icon: PhoneCall, label: 'Calls' \}/)
  const api = read('../api/calls.api.js')
  assert.match(api, /apiClient\.get\('\/api\/calls', \{ params: \{ from, to, cursor, limit \} \}\)/)
  assert.doesNotMatch(api, /businessId/)
  const page = read('../pages/calls/CallsPage.jsx')
  for (const re of [/isLoading \?/, /isError \?/, /No calls in this period/, /Try again/, /Load more/, /getNextPageParam/, /type="date"/]) assert.match(page, re)
})

test('recording policy: no recording player, link or URL anywhere in the client dashboard', () => {
  const src = fileURLToPath(new URL('..', import.meta.url))
  const files = []
  const walk = (dir) => readdirSync(dir).forEach((f) => {
    const p = join(dir, f)
    if (statSync(p).isDirectory()) walk(p)
    else if (/\.(jsx?|tsx?)$/.test(f) && !/\.test\./.test(f)) files.push(p)
  })
  walk(src)
  for (const f of files) {
    const text = readFileSync(f, 'utf8')
    assert.doesNotMatch(text, /recordingUrl|\/recording\b|<audio\b|RecordingUrl/, `recording reference in ${f}`)
  }
  assert.match(read('../pages/calls/CallsPage.jsx'), /Call recordings are not available in the dashboard/)
})
