/**
 * @file        commissions.api.js
 * @module      Commissions API
 * @project     ClientFrontend
 * @layer       API
 * @description API functions for staff commission tracking — paginated listing and summary totals.
 *
 * @updated     2026-05-29
 * @version     1.0.0
 *
 * @dependencies
 *   - ./apiClient (apiClient)
 *
 * @sideEffects
 *   - HTTP GET requests to /api/commissions, /api/commissions/summary
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
 * @function    commissionsApi
 * @purpose     Namespace object exposing commission data endpoints
 * @returns {Promise<AxiosResponse>} API response
 */
export const commissionsApi = {
  /**
   * @function    list
   * @purpose     Fetch a paginated/filtered list of commission records
   * @param  {object} p - Query parameters (staffId, date range, page, limit)
   * @returns {Promise<AxiosResponse>} API response
   */
  // [API CALL]: Retrieve commission records with optional filtering
  list: (p) => apiClient.get('/api/commissions', { params: p }),

  /**
   * @function    summary
   * @purpose     Fetch aggregated commission summary totals for the business
   * @returns {Promise<AxiosResponse>} API response
   */
  // [API CALL]: Retrieve aggregated commission summary data
  summary: () => apiClient.get('/api/commissions/summary'),
}

// ─────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────
