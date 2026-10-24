/**
 * @file        approval.js
 * @module      Signup approval (admin-approved signup)
 * @description Where an authenticated business belongs, from its approval status — the one rule shared by the route
 *              guards, the login page and the API error handling. Mirrors the backend (services/businessApproval.js):
 *              a business with no approvalStatus is an existing (legacy) account and is treated as approved.
 *              The backend enforces access on every API call; this only decides which screen to show.
 */

export const APPROVAL = Object.freeze({
  PENDING_ONBOARDING: 'pending_onboarding',
  PENDING_REVIEW: 'pending_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
})

const ALL = Object.values(APPROVAL)

/** Backend error codes returned (HTTP 403) when an unapproved business calls a protected endpoint */
export const APPROVAL_ERROR_CODES = Object.freeze(['APPROVAL_PENDING', 'APPROVAL_REJECTED'])

export const STATUS_PATH = '/application-status'

/** Effective approval status — missing or unknown means approved (legacy accounts) */
export const approvalStatusOf = (business) =>
  (ALL.includes(business?.approvalStatus) ? business.approvalStatus : APPROVAL.APPROVED)

/** True when this business should see the application-status screen instead of the product */
export const isUnderReviewOrRejected = (business) =>
  [APPROVAL.PENDING_REVIEW, APPROVAL.REJECTED].includes(approvalStatusOf(business))

/**
 * The screen an authenticated business belongs on
 * @returns {'/application-status'|'/onboarding'|'/dashboard'}
 */
export const homePathFor = (business) => {
  if (isUnderReviewOrRejected(business)) return STATUS_PATH
  if (approvalStatusOf(business) === APPROVAL.PENDING_ONBOARDING || !business?.setupCompleted) return '/onboarding'
  return '/dashboard'
}

/**
 * Reads an approval refusal from an API error (axios shape)
 * @returns {{ code: string, approvalStatus: string }|null}
 */
export const approvalErrorOf = (err) => {
  const data = err?.response?.data
  if (err?.response?.status !== 403 || !APPROVAL_ERROR_CODES.includes(data?.code)) return null
  return { code: data.code, approvalStatus: ALL.includes(data.approvalStatus) ? data.approvalStatus : null }
}
