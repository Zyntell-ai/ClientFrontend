// Signup approval routing (src/utils/approval.js) — which screen each account state belongs on. Run: npm test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { approvalStatusOf, homePathFor, isUnderReviewOrRejected, approvalErrorOf, APPROVAL } from './approval.js'

test('legacy accounts (no approvalStatus) are approved and keep their existing routing', () => {
  assert.equal(approvalStatusOf({ setupCompleted: true }), APPROVAL.APPROVED)
  assert.equal(homePathFor({ setupCompleted: true }), '/dashboard')
  assert.equal(homePathFor({ setupCompleted: false }), '/onboarding')
  assert.equal(approvalStatusOf({ approvalStatus: 'something-else' }), APPROVAL.APPROVED)
})

test('a new signup goes to onboarding; a submitted or rejected application to its status screen', () => {
  assert.equal(homePathFor({ approvalStatus: 'pending_onboarding', setupCompleted: false }), '/onboarding')
  assert.equal(homePathFor({ approvalStatus: 'pending_review', setupCompleted: true }), '/application-status')
  assert.equal(homePathFor({ approvalStatus: 'rejected', setupCompleted: true }), '/application-status')
  assert.equal(homePathFor({ approvalStatus: 'approved', setupCompleted: true }), '/dashboard')
})

test('pending_onboarding never reaches the dashboard, even if setupCompleted is somehow true', () => {
  assert.equal(homePathFor({ approvalStatus: 'pending_onboarding', setupCompleted: true }), '/onboarding')
})

test('the status screen is only for pending_review / rejected (no redirect loop for anyone else)', () => {
  assert.equal(isUnderReviewOrRejected({ approvalStatus: 'pending_review' }), true)
  assert.equal(isUnderReviewOrRejected({ approvalStatus: 'rejected' }), true)
  for (const b of [{ approvalStatus: 'approved' }, { approvalStatus: 'pending_onboarding' }, {}, null]) {
    assert.equal(isUnderReviewOrRejected(b), false)
    assert.notEqual(homePathFor(b), '/application-status')
  }
})

test('backend approval refusals are recognised; other errors are not', () => {
  const err = (status, data) => ({ response: { status, data } })
  assert.deepEqual(approvalErrorOf(err(403, { code: 'APPROVAL_PENDING', approvalStatus: 'pending_review' })), { code: 'APPROVAL_PENDING', approvalStatus: 'pending_review' })
  assert.deepEqual(approvalErrorOf(err(403, { code: 'APPROVAL_REJECTED', approvalStatus: 'rejected' })), { code: 'APPROVAL_REJECTED', approvalStatus: 'rejected' })
  assert.equal(approvalErrorOf(err(403, { error: 'Account suspended. Contact support.' })), null) // suspension is separate
  assert.equal(approvalErrorOf(err(401, { code: 'APPROVAL_PENDING' })), null)
  assert.equal(approvalErrorOf(new Error('network')), null)
  assert.deepEqual(approvalErrorOf(err(403, { code: 'APPROVAL_PENDING', approvalStatus: 'weird' })), { code: 'APPROVAL_PENDING', approvalStatus: null })
})
