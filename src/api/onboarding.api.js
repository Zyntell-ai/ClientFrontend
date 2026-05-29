/**
 * @file        onboarding.api.js
 * @module      Onboarding API
 * @project     ClientFrontend
 * @layer       API
 * @description API functions for the business onboarding flow — completing setup and checking onboarding status.
 *
 * @updated     2026-05-29
 * @version     1.0.0
 *
 * @dependencies
 *   - ./apiClient (apiClient)
 *
 * @sideEffects
 *   - HTTP POST request to /api/onboarding/complete
 *   - HTTP GET request to /api/onboarding/status
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
 * @function    onboardingApi
 * @purpose     Namespace object exposing onboarding wizard endpoints
 * @returns {Promise<AxiosResponse>} API response
 */
export const onboardingApi = {
  /**
   * @function    complete
   * @purpose     Submit the completed onboarding wizard data to finalize business setup
   * @param  {object} d - Onboarding payload (businessName, category, hours, services, etc.)
   * @returns {Promise<AxiosResponse>} API response
   */
  // [API CALL]: Finalize onboarding and mark setup as complete
  complete: (d) => apiClient.post('/api/onboarding/complete', d),

  /**
   * @function    status
   * @purpose     Check the current onboarding completion status for the authenticated business
   * @returns {Promise<AxiosResponse>} API response
   */
  // [API CALL]: Retrieve onboarding completion status
  status: () => apiClient.get('/api/onboarding/status'),
}

// ─────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────
