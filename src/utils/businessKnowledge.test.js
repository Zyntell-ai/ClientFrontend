// Run: npm test  (Node's built-in test runner — no extra dependencies)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  KNOWLEDGE_MAX_LENGTH, KNOWLEDGE_FIELDS, knowledgeFromResponse, validateKnowledge, changedKnowledge,
  isKnowledgeDirty, knowledgeErrorMessage,
} from './businessKnowledge.js'
import { setUnsavedChangesMessage, hasUnsavedChanges, confirmLeaveWithUnsavedChanges } from './unsavedChanges.js'

test('never-saved knowledge starts as empty strings', () => {
  assert.deepEqual(knowledgeFromResponse({ knowledge: { businessDescription: '', aiInstructions: '', updatedAt: null } }),
    { businessDescription: '', aiInstructions: '', updatedAt: null })
  assert.deepEqual(knowledgeFromResponse({}), { businessDescription: '', aiInstructions: '', updatedAt: null })
})

test('5,000-character limit matches the backend (trimmed String.length)', () => {
  assert.equal(KNOWLEDGE_MAX_LENGTH, 5000)
  assert.deepEqual(validateKnowledge({ businessDescription: 'a'.repeat(5000), aiInstructions: `  ${'b'.repeat(5000)}  ` }), {})
  const errors = validateKnowledge({ businessDescription: 'a'.repeat(5001), aiInstructions: '' })
  assert.deepEqual(Object.keys(errors), ['businessDescription'])
  assert.match(errors.businessDescription, /5,000 characters or fewer \(currently 5,001\)/)
})

test('only changed fields are sent, trimmed; an unchanged field is never resent', () => {
  const saved = { businessDescription: 'About us', aiInstructions: 'Be kind' }
  assert.deepEqual(changedKnowledge({ businessDescription: 'About us', aiInstructions: 'Be formal ' }, saved), { aiInstructions: 'Be formal' })
  assert.deepEqual(changedKnowledge({ businessDescription: '', aiInstructions: 'Be kind' }, saved), { businessDescription: '' })
  assert.deepEqual(changedKnowledge({ businessDescription: 'About us  ', aiInstructions: 'Be kind' }, saved), {})
  assert.equal(isKnowledgeDirty({ businessDescription: 'About us\n', aiInstructions: 'Be kind' }, saved), false)
  assert.equal(isKnowledgeDirty({ businessDescription: 'About us!', aiInstructions: 'Be kind' }, saved), true)
})

test('save errors are actionable', () => {
  assert.equal(knowledgeErrorMessage({ response: { data: { error: 'Validation failed', details: [{ field: 'aiInstructions', message: 'Must be 5000 characters or fewer' }] } } }),
    'Instructions for your AI: Must be 5000 characters or fewer')
  assert.match(knowledgeErrorMessage({ message: 'Network Error' }), /Could not reach the server/)
  assert.equal(knowledgeErrorMessage({ response: { data: { error: 'Settings not found' } } }), 'Settings not found')
  assert.deepEqual(KNOWLEDGE_FIELDS.map((f) => f.key), ['businessDescription', 'aiInstructions'])
})

test('sidebar guard: asks only while a page has unsaved changes', () => {
  setUnsavedChangesMessage(null)
  let asked = 0
  assert.equal(confirmLeaveWithUnsavedChanges(() => { asked++; return false }), true)
  assert.equal(asked, 0)
  setUnsavedChangesMessage('Unsaved!')
  assert.equal(hasUnsavedChanges(), true)
  assert.equal(confirmLeaveWithUnsavedChanges((m) => { asked++; assert.equal(m, 'Unsaved!'); return false }), false) // stay
  assert.equal(hasUnsavedChanges(), true)
  assert.equal(confirmLeaveWithUnsavedChanges(() => true), true) // leave → cleared
  assert.equal(hasUnsavedChanges(), false)
})

test('page is wired: route, sidebar entry after Staff, guarded links, API methods', () => {
  const app = readFileSync(new URL('../App.jsx', import.meta.url), 'utf8')
  assert.match(app, /path="\/business-knowledge" element={<RequireAuth><BusinessKnowledgePage \/><\/RequireAuth>}/)
  const sidebar = readFileSync(new URL('../components/layout/Sidebar.jsx', import.meta.url), 'utf8')
  assert.match(sidebar, /label: 'Staff' },\n\s+{ to: '\/business-knowledge', icon: BookOpen, label: 'Business Knowledge' }/)
  assert.match(sidebar, /onClick={\(e\) => guardNavigation\(e, to\)}/)
  const api = readFileSync(new URL('../api/business.api.js', import.meta.url), 'utf8')
  assert.match(api, /getKnowledge: \(\) => apiClient\.get\('\/api\/business\/knowledge'\)/)
  assert.match(api, /updateKnowledge: \(d\) => apiClient\.put\('\/api\/business\/knowledge', d\)/)
  const page = readFileSync(new URL('../pages/business-knowledge/BusinessKnowledgePage.jsx', import.meta.url), 'utf8')
  assert.match(page, /useUnsavedChangesWarning\(dirty/)
  assert.match(page, /toast\.success\('Business knowledge saved'\)/)
  assert.doesNotMatch(page, /usePlanFeatures|FeatureGate|lockedFeature/) // available on every plan
})
