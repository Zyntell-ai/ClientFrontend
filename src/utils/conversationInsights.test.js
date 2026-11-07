// Run: npm test  (Node's built-in test runner — no extra dependencies)
// Phase 3 Conversation Insights page + Phase 2 Safety settings (emergency contact, classification request).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { OUTCOME_ORDER, OUTCOME_META, CHANNEL_LABEL, percent, conversationLabel, isEmptySummary } from './insights.js'

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8')

test('the four outcomes, with wording that never over-claims', () => {
  assert.deepEqual(OUTCOME_ORDER, ['ANSWERED', 'UNCERTAIN', 'UNANSWERED', 'ESCALATED'])
  assert.match(OUTCOME_META.ANSWERED.help, /from your business data/)
  assert.equal(OUTCOME_META.UNCERTAIN.label, 'Not verified')
  assert.doesNotMatch(OUTCOME_META.UNCERTAIN.help, /wrong|incorrect/i)
  assert.match(OUTCOME_META.ESCALATED.help, /real handoff/)
  assert.deepEqual(CHANNEL_LABEL, { voice: 'Voice call', whatsapp: 'WhatsApp' })
})

test('helpers: percent, short conversation reference (no full ids), empty summary', () => {
  assert.equal(percent(1, 3), 33)
  assert.equal(percent(0, 0), 0)
  assert.equal(conversationLabel({ type: 'voice_call', id: 'CA0123456789abcd' }), 'Voice call · …abcd')
  assert.equal(conversationLabel({ type: 'whatsapp_conversation', id: 'conv-xyz9' }), 'WhatsApp chat · …xyz9')
  assert.equal(conversationLabel(null), '—')
  assert.equal(isEmptySummary({ total: 0 }), true)
  assert.equal(isEmptySummary(undefined), true)
  assert.equal(isEmptySummary({ total: 2 }), false)
})

test('insights page: route, sidebar entry, API, retention notice, loading / error / empty states, no transcript', () => {
  assert.match(read('../App.jsx'), /<Route path="\/insights" element=\{<RequireAuth><InsightsPage \/><\/RequireAuth>\} \/>/)
  assert.match(read('../components/layout/Sidebar.jsx'), /\{ to: '\/insights', +icon: Lightbulb, +label: 'Conversation Insights' \}/)
  assert.match(read('../api/insights.api.js'), /summary: \(\) => apiClient\.get\('\/api\/insights'\)/)
  const page = read('../pages/insights/InsightsPage.jsx')
  assert.match(page, /kept for 30 days, then deleted automatically/)
  assert.match(page, /isLoading \?/)
  assert.match(page, /isError \?/)
  assert.match(page, /No questions captured yet/)
  assert.match(page, /Try again/)
  assert.doesNotMatch(page, /\.reply\b|transcript\}/) // only questions are shown
})

test('safety tab: emergency contact sends ONLY that field; classification can only be requested, never set', () => {
  const page = read('../pages/settings/SettingsPage.jsx')
  assert.match(page, /\{ id: 'safety', +label: 'Safety', +icon: ShieldCheck +\}/)
  assert.match(page, /businessApi\.updateSettings\(\{ emergencyContact \}\)/)
  assert.match(page, /the AI never makes one up/)
  assert.match(page, /businessApi\.requestHealthcareClassification\(\{ isHealthcare: requested === 'yes', reason: reason\.trim\(\) \}\)/)
  assert.doesNotMatch(page, /isHealthcare:\s*true\s*\}/)
  assert.match(page, /A request does not change anything until Zyntell approves it/)
  const api = read('../api/business.api.js')
  assert.match(api, /requestHealthcareClassification: \(d\) => apiClient\.post\('\/api\/business\/healthcare-classification\/request', d\)/)
  assert.doesNotMatch(api, /put\('\/api\/business\/healthcare/)
})
