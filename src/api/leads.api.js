/**
 * @file        leads.api.js
 * @module      Leads API
 * @project     ClientFrontend
 * @layer       API
 * @description API functions for lead management — listing, claiming, bidding, and fetching bids on leads.
 *
 * @updated     2026-05-29
 * @version     1.0.0
 *
 * @dependencies
 *   - ./apiClient (apiClient)
 *
 * @sideEffects
 *   - HTTP GET requests to /api/leads, /api/leads/:id/bids
 *   - HTTP POST requests to /api/leads/:id/claim, /api/leads/:id/bid
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
 * @function    leadsApi
 * @purpose     Namespace object exposing lead marketplace endpoints
 * @returns {Promise<AxiosResponse>} API response
 */
export const leadsApi = {
  /**
   * @function    list
   * @purpose     Fetch a filtered list of available leads from the marketplace
   * @param  {object} p - Query parameters (quality, category, location, page, limit)
   * @returns {Promise<AxiosResponse>} API response
   */
  // [API CALL]: Retrieve available leads with optional filters
  list: (p) => apiClient.get('/api/leads', { params: p }),

  /**
   * @function    claim
   * @purpose     Claim a lead exclusively for the authenticated business
   * @param  {string} id - Lead document ID
   * @returns {Promise<AxiosResponse>} API response
   */
  // [API CALL]: Claim a lead from the marketplace
  claim: (id) => apiClient.post(`/api/leads/${id}/claim`),

  /**
   * @function    bid
   * @purpose     Place a bid on a lead in the bidding marketplace
   * @param  {string} id - Lead document ID
   * @param  {object} d - Bid payload (amount, message, etc.)
   * @returns {Promise<AxiosResponse>} API response
   */
  // [API CALL]: Submit a bid on a marketplace lead
  bid: (id, d) => apiClient.post(`/api/leads/${id}/bid`, d),

  /**
   * @function    bids
   * @purpose     Fetch all bids placed on a specific lead
   * @param  {string} id - Lead document ID
   * @returns {Promise<AxiosResponse>} API response
   */
  // [API CALL]: Retrieve all bids for a lead
  bids: (id) => apiClient.get(`/api/leads/${id}/bids`),
}

// ─────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────
