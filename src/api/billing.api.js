/**
 * @file        billing.api.js
 * @module      Billing API
 * @project     ClientFrontend
 * @layer       API
 * @description API functions for billing management — current subscription, invoice history, and payment processing.
 *
 * @updated     2026-05-29
 * @version     1.0.0
 *
 * @dependencies
 *   - ./apiClient (apiClient)
 *
 * @sideEffects
 *   - HTTP GET requests to /api/billing/current, /api/billing/invoices
 *   - HTTP POST request to /api/billing/pay
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
  // [API CALL]: Retrieve active plan + outstanding invoice
  current:  ()            => apiClient.get('/api/billing/current'),
  // [API CALL]: Retrieve invoice history
  invoices: ()            => apiClient.get('/api/billing/invoices'),
  // [API CALL]: Fetch current plan config + available upgrade paths
  plan:     ()            => apiClient.get('/api/billing/plan'),
  // [API CALL]: Create Razorpay order for an existing invoice
  pay:      (d)           => apiClient.post('/api/billing/pay', d),
  // [API CALL]: Create Razorpay order for a plan upgrade
  upgrade:  (targetPlan)  => apiClient.post('/api/billing/upgrade', { targetPlan }),
}

// ─────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────
