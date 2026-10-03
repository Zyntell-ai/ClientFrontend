// Run: npm test  (Node's built-in test runner — no extra dependencies)
// Fixtures are shaped like GET /api/billing/plan responses; feature values are illustrative, not a plan table.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isFeatureAvailable, isFeatureDisabledByOverride, planThatUnlocks } from './planFeatures.js'

const planResponse = (currentPlan, features, { featureOverrides = {}, upgrades = [] } = {}) => ({
  currentPlan, planConfig: { id: currentPlan, name: currentPlan, features }, subscription: null,
  foundingEligible: false, featureOverrides, isTrialActive: currentPlan === 'trial', upgrades,
})

const starter = planResponse('starter', {
  aiVoiceAgent: true, leadQualification: true, analyticsDashboard: true, multilingualSupport: false, includedNumbers: 1,
}, { upgrades: [{ id: 'growth', name: 'Growth', features: { multilingualSupport: true } }, { id: 'pro', name: 'Pro', features: { apiAccess: true } }] })

test('features come from the backend planConfig (Starter includes voice, lead qualification, analytics)', () => {
  assert.equal(isFeatureAvailable(starter, 'aiVoiceAgent'), true)
  assert.equal(isFeatureAvailable(starter, 'leadQualification'), true)
  assert.equal(isFeatureAvailable(starter, 'analyticsDashboard'), true)
  assert.equal(isFeatureAvailable(starter, 'multilingualSupport'), false)
})

test('unknown or missing feature keys are not granted', () => {
  assert.equal(isFeatureAvailable(starter, 'somethingNew'), false)
})

test('numeric feature values are coerced like the backend (0 → false, >0 → true)', () => {
  assert.equal(isFeatureAvailable(starter, 'includedNumbers'), true)
  assert.equal(isFeatureAvailable(planResponse('trial', { includedNumbers: 0 }), 'includedNumbers'), false)
})

test('trial is just the trial plan', () => {
  const trial = planResponse('trial', { whatsappBot: true, aiVoiceAgent: false })
  assert.equal(isFeatureAvailable(trial, 'whatsappBot'), true)
  assert.equal(isFeatureAvailable(trial, 'aiVoiceAgent'), false)
})

test('growth and pro use their own backend features', () => {
  const growth = planResponse('growth', { multilingualSupport: true, leadAuctionAccess: false })
  const pro = planResponse('pro', { leadAuctionAccess: true, apiAccess: true })
  assert.equal(isFeatureAvailable(growth, 'multilingualSupport'), true)
  assert.equal(isFeatureAvailable(growth, 'leadAuctionAccess'), false)
  assert.equal(isFeatureAvailable(pro, 'leadAuctionAccess'), true)
})

test('an override enabling a feature wins over the plan', () => {
  const p = planResponse('trial', { aiVoiceAgent: false }, { featureOverrides: { aiVoiceAgent: true } })
  assert.equal(isFeatureAvailable(p, 'aiVoiceAgent'), true)
  assert.equal(isFeatureDisabledByOverride(p, 'aiVoiceAgent'), false)
})

test('an override disabling a feature wins over the plan', () => {
  const p = planResponse('pro', { aiVoiceAgent: true }, { featureOverrides: { aiVoiceAgent: false } })
  assert.equal(isFeatureAvailable(p, 'aiVoiceAgent'), false)
  assert.equal(isFeatureDisabledByOverride(p, 'aiVoiceAgent'), true)
})

test('fails closed while the plan is loading or failed (no data)', () => {
  for (const data of [undefined, null, {}, { planConfig: {} }]) {
    assert.equal(isFeatureAvailable(data, 'aiVoiceAgent'), false)
    assert.equal(planThatUnlocks(data, 'aiVoiceAgent'), null)
  }
})

test('lock message names the lowest backend upgrade that includes the feature', () => {
  assert.equal(planThatUnlocks(starter, 'multilingualSupport'), 'Growth')
  assert.equal(planThatUnlocks(starter, 'apiAccess'), 'Pro')
  assert.equal(planThatUnlocks(starter, 'somethingNew'), null)
})
