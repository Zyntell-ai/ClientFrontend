/**
 * @file        categories.api.js
 * @module      Categories API
 * @project     ClientFrontend
 * @layer       API
 * @description API functions for fetching available business category definitions from the backend.
 *
 * @updated     2026-05-29
 * @version     1.0.0
 *
 * @dependencies
 *   - ./apiClient (apiClient)
 *
 * @sideEffects
 *   - HTTP GET request to /api/categories
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
 * @function    categoriesApi
 * @purpose     Namespace object exposing category lookup endpoints
 * @returns {Promise<AxiosResponse>} API response
 */
export const categoriesApi = {
  /**
   * @function    list
   * @purpose     Fetch all available business categories for onboarding and configuration
   * @returns {Promise<AxiosResponse>} API response
   */
  // [API CALL]: Retrieve all supported business category options
  list: () => apiClient.get('/api/categories'),
}

// ─────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────
