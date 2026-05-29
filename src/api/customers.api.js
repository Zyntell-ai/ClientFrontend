/**
 * @file        customers.api.js
 * @module      Customers API
 * @project     ClientFrontend
 * @layer       API
 * @description API functions for customer management — listing, profile retrieval, and re-engagement triggering.
 *
 * @updated     2026-05-29
 * @version     1.0.0
 *
 * @dependencies
 *   - ./apiClient (apiClient)
 *
 * @sideEffects
 *   - HTTP GET requests to /api/customers, /api/customers/:id
 *   - HTTP POST request to /api/customers/:id/reengage
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
 * @function    customersApi
 * @purpose     Namespace object exposing customer management endpoints
 * @returns {Promise<AxiosResponse>} API response
 */
export const customersApi = {
  /**
   * @function    list
   * @purpose     Fetch a paginated/filtered list of customers
   * @param  {object} p - Query parameters (search, status, page, limit)
   * @returns {Promise<AxiosResponse>} API response
   */
  // [API CALL]: Retrieve customer list with optional search/filter
  list: (p) => apiClient.get('/api/customers', { params: p }),

  /**
   * @function    get
   * @purpose     Fetch a single customer profile by ID
   * @param  {string} id - Customer document ID
   * @returns {Promise<AxiosResponse>} API response
   */
  // [API CALL]: Retrieve a specific customer profile
  get: (id) => apiClient.get(`/api/customers/${id}`),

  /**
   * @function    reengage
   * @purpose     Trigger an automated re-engagement message to a lapsed customer via the bot
   * @param  {string} id - Customer document ID
   * @returns {Promise<AxiosResponse>} API response
   */
  // [API CALL]: Trigger bot re-engagement flow for a customer
  reengage: (id) => apiClient.post(`/api/customers/${id}/reengage`),
}

// ─────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────
