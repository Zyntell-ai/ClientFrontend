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
  /**
   * @function    current
   * @purpose     Fetch the current subscription and billing plan details
   * @returns {Promise<AxiosResponse>} API response
   */
  // [API CALL]: Retrieve active subscription plan details
  current: () => apiClient.get('/api/billing/current'),

  /**
   * @function    invoices
   * @purpose     Fetch the list of past invoices for the authenticated business
   * @returns {Promise<AxiosResponse>} API response
   */
  // [API CALL]: Retrieve invoice history
  invoices: () => apiClient.get('/api/billing/invoices'),

  /**
   * @function    pay
   * @purpose     Submit a payment for an outstanding invoice or plan upgrade
   * @param  {object} d - Payment payload (invoiceId, amount, method, etc.)
   * @returns {Promise<AxiosResponse>} API response
   */
  // [API CALL]: Process a billing payment
  pay: (d) => apiClient.post('/api/billing/pay', d),
}

// ─────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────
