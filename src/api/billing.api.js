/**
 * @file        billing.api.js
 * @module      Billing API
 * @project     ClientFrontend
 * @layer       API
 * @description API functions for billing management — current invoice, invoice history, plan catalog,
 *              plan purchase and invoice payment (EXECUTION-PLAN C14), and Razorpay payment verification (C1).
 *              Every payment starts from a server-side paymentOrder with an explicit purpose (INVOICE via
 *              /pay, PLAN_PURCHASE via /plan-order for a catalog priceId); the amount is never chosen here.
 *
 * @updated     2026-05-29
 * @version     1.0.0
 *
 * @dependencies
 *   - ./apiClient (apiClient)
 *
 * @sideEffects
 *   - HTTP GET requests to /api/billing/current, /api/billing/invoices, /api/billing/plan, /api/billing/catalog
 *   - HTTP POST requests to /api/billing/pay, /api/billing/plan-order, /api/billing/verify
 */

// ─────────────────────────────────────────
// IMPORTS & DEPENDENCIES
// ─────────────────────────────────────────
import apiClient from './apiClient'

// ─────────────────────────────────────────
// CONSTANTS & CONFIG
// ─────────────────────────────────────────

// ─────────────────────────────────────────
// API FUNCTIONS
// ─────────────────────────────────────────

/**
 * @function    billingApi
 * @purpose     Namespace object exposing billing management endpoints
 * @returns {Promise<AxiosResponse>} API response
 */
export const billingApi = {
  // [API CALL]: This month's invoice (finalised, or a running ESTIMATED one) → { invoice, daysUntilDue }
  current:  ()            => apiClient.get('/api/billing/current'),
  // [API CALL]: Invoice history → { invoices: [{ id, month, total, status, paidAt, pdfUrl }] }
  invoices: ()            => apiClient.get('/api/billing/invoices'),
  // [API CALL]: Server-side current plan → { currentPlan, planConfig, subscription, foundingEligible, isTrialActive, upgrades, ... }
  plan:     ()            => apiClient.get('/api/billing/plan'),
  // [API CALL]: Purchasable plans and their prices → { programName, foundingEligible, currency,
  //             plans: [{ planId, name, description, features, prices: [{ priceId, program, amountINR, available, ... }] }] }
  catalog:  ()            => apiClient.get('/api/billing/catalog'),
  // [API CALL]: INVOICE payment order for an existing invoice → { orderId, paymentOrderId, amount, amountPaise, currency, keyId }
  pay:      (d)           => apiClient.post('/api/billing/pay', d),
  // [API CALL]: PLAN_PURCHASE order for an exact catalog priceId (the backend sets the amount)
  //             → { orderId, paymentOrderId, priceId, planId, planName, program, amount, amountPaise, currency, keyId }
  createPlanOrder: (priceId) => apiClient.post('/api/billing/plan-order', { priceId }),
  // [API CALL]: Confirm a completed Razorpay Checkout server-side (both purposes)
  //             body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
  //             → 200 { status: 'applied'|'already-applied', purpose, paymentId, plan, subscription, invoiceId, invoiceStatus }
  //             → 202 { status: 'pending', message } when the payment is not captured yet (the webhook completes it)
  verify:   (d)           => apiClient.post('/api/billing/verify', d),
}

// ─────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────
