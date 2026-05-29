/**
 * @file        analytics.api.js
 * @module      Analytics API
 * @project     ClientFrontend
 * @layer       API
 * @description API functions for fetching analytics data — bookings, customers, and revenue metrics with optional query params.
 *
 * @updated     2026-05-29
 * @version     1.0.0
 *
 * @dependencies
 *   - ./apiClient (apiClient)
 *
 * @sideEffects
 *   - HTTP GET requests to /api/analytics/bookings, /api/analytics/customers, /api/analytics/revenue
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
 * @function    analyticsApi
 * @purpose     Namespace object exposing analytics data endpoints
 * @returns {Promise<AxiosResponse>} API response
 */
export const analyticsApi = {
  /**
   * @function    bookings
   * @purpose     Fetch bookings analytics data for a given date range or filter params
   * @param  {object} p - Query parameters (e.g., range, startDate, endDate)
   * @returns {Promise<AxiosResponse>} API response
   */
  // [API CALL]: Retrieve bookings analytics metrics
  bookings: (p) => apiClient.get('/api/analytics/bookings', { params: p }),

  /**
   * @function    customers
   * @purpose     Fetch customer analytics data including retention and acquisition stats
   * @param  {object} p - Query parameters (e.g., range)
   * @returns {Promise<AxiosResponse>} API response
   */
  // [API CALL]: Retrieve customer analytics metrics
  customers: (p) => apiClient.get('/api/analytics/customers', { params: p }),

  /**
   * @function    revenue
   * @purpose     Fetch revenue analytics data for charting and reporting
   * @param  {object} p - Query parameters (e.g., range, groupBy)
   * @returns {Promise<AxiosResponse>} API response
   */
  // [API CALL]: Retrieve revenue analytics metrics
  revenue: (p) => apiClient.get('/api/analytics/revenue', { params: p }),
}

// ─────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────
