// Run: npm test  (Node's built-in test runner — no extra dependencies)
// Batch 2 FAQ Training: client validation mirrors the backend limits; status wording never over-claims; the tab offers
// add / edit / enable-disable / delete-with-confirmation, healthcare approval notice, conflicts, loading/error/empty.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { FAQ_LIMITS, validateFaq, faqErrorFromResponse, faqStatusChip, faqIndexChip, CONFLICT_LABEL } from './faqs.js'

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8')

test('limits match the backend (5–300 / 5–1,500 / 50) and validation trims whitespace', () => {
  assert.deepEqual(FAQ_LIMITS, { questionMin: 5, questionMax: 300, answerMin: 5, answerMax: 1500, categoryMax: 50 })
  assert.equal(validateFaq({ question: '      ', answer: 'Hello there' }).question, 'Question is required.')
  assert.match(validateFaq({ question: 'Hi?', answer: 'Hello there' }).question, /at least 5/)
  assert.match(validateFaq({ question: 'q'.repeat(301), answer: 'Hello there' }).question, /at most 300/)
  assert.match(validateFaq({ question: 'Valid question?', answer: 'a'.repeat(1501) }).answer, /at most 1500/)
  assert.match(validateFaq({ question: 'Valid question?', answer: 'Valid answer', category: 'c'.repeat(51) }).category, /at most 50/)
  assert.deepEqual(validateFaq({ question: `${'q'.repeat(299)}?`, answer: 'a'.repeat(1500), category: 'c'.repeat(50) }), {})
})

test('structured backend errors map to fields', () => {
  const e = { response: { data: { error: 'An active FAQ with the same question already exists.', code: 'DUPLICATE_QUESTION', details: [{ field: 'question', message: 'This question already exists in another active FAQ.' }] } } }
  assert.deepEqual(faqErrorFromResponse(e), { fields: { question: 'This question already exists in another active FAQ.' }, message: 'An active FAQ with the same question already exists.' })
  assert.equal(faqErrorFromResponse({}).message, 'Something went wrong. Please try again.')
})

test('status wording: disabled / rejected / awaiting approval are never "in use"; failed indexing is never "ready"', () => {
  assert.equal(faqStatusChip({ enabled: false, usedByAi: false }).label, 'Disabled')
  assert.equal(faqStatusChip({ enabled: true, approvalStatus: 'REJECTED', usedByAi: false }).label, 'Rejected')
  assert.equal(faqStatusChip({ enabled: true, approvalStatus: 'PENDING_APPROVAL', approvalReason: 'HEALTHCARE_REVIEW', usedByAi: false }).label, 'Awaiting admin approval')
  assert.equal(faqStatusChip({ enabled: true, approvalStatus: 'APPROVED', usedByAi: true }).label, 'In use')
  assert.equal(faqIndexChip({ enabled: true, searchIndex: 'FAILED' }).label, 'Smart search: indexing failed')
  assert.equal(faqIndexChip({ enabled: true, searchIndex: 'NOT_INDEXED' }), null)
  assert.equal(faqIndexChip({ enabled: false, searchIndex: 'READY' }), null)
  assert.ok(CONFLICT_LABEL.PRICE_MISMATCH && CONFLICT_LABEL.HEALTH_REVIEW)
})

test('FAQ tab: edit, toggle, confirmed delete, approval notice, conflicts, loading / error / empty states; no internals', () => {
  const tab = read('../pages/settings/FaqsTab.jsx')
  for (const re of [/businessApi\.updateFaq\(editing\.id, body\)/, /businessApi\.setFaqEnabled\(id, enabled\)/, /title="Delete FAQ\?"/, /remove\.mutate\(deleting\.id\)/,
    /Healthcare FAQs are reviewed by a Zyntell administrator/, /Saving changes sends this FAQ for administrator approval again/, /CONFLICT_LABEL\[c\.type\]/,
    /isLoading \?/, /isError \?/, /No FAQs yet/, /Try again/, /setServerErrors\(fields\)/]) assert.match(tab, re)
  assert.doesNotMatch(tab, /\.embedding|embeddingB64|contentHash|indexError|\.keywords/) // no index internals rendered
  const api = read('../api/business.api.js')
  assert.match(api, /updateFaq: \(id, d\) => apiClient\.put\(`\/api\/business\/faqs\/\$\{id\}`, d\)/)
  assert.match(api, /setFaqEnabled: \(id, enabled\) => apiClient\.patch\(`\/api\/business\/faqs\/\$\{id\}\/status`, \{ enabled \}\)/)
  assert.match(read('../pages/settings/SettingsPage.jsx'), /import FaqsTab from '\.\/FaqsTab'/)
})

test('unclassified business: FAQs are shown as awaiting business review and not in use', () => {
  const chip = faqStatusChip({ enabled: true, approvalStatus: 'PENDING_APPROVAL', approvalReason: 'AWAITING_CLASSIFICATION', usedByAi: false })
  assert.equal(chip.label, 'Awaiting business review')
  assert.match(chip.help, /Not used by your AI receptionist/)
  assert.match(read('../pages/settings/FaqsTab.jsx'), /not used by your AI receptionist until our team has completed your business review/)
})
