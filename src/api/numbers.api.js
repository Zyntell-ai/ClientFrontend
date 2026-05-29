/**
 * @file        numbers.api.js
 * @module      Numbers API
 * @project     ClientFrontend
 * @layer       API
 * @description API functions for virtual phone number management — listing, OTP-based registration flow, and number release.
 *
 * @updated     2026-05-29
 * @version     1.0.0
 *
 * @dependencies
 *   - ./apiClient (apiClient)
 *
 * @sideEffects
 *   - HTTP GET request to /api/numbers
 *   - HTTP POST requests to /api/numbers/send-otp, /api/numbers/verify-register
 *   - HTTP DELETE request to /api/numbers/:id
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
 * @function    numbersApi
 * @purpose     Namespace object exposing virtual phone number management endpoints
 * @returns {Promise<AxiosResponse>} API response
 */
export const numbersApi = {
  /**
   * @function    list
   * @purpose     Fetch all virtual phone numbers registered to the business
   * @returns {Promise<AxiosResponse>} API response
   */
  // [API CALL]: Retrieve registered virtual numbers
  list:           ()           => apiClient.get('/api/numbers'),

  /**
   * @function    sendOtp
   * @purpose     Send an OTP to a phone number to begin the verification and registration flow
   * @param  {object} data - Payload containing the phone number to verify
   * @returns {Promise<AxiosResponse>} API response
   */
  // [API CALL]: Initiate phone number OTP verification
  sendOtp:        (data)       => apiClient.post('/api/numbers/send-otp', data),

  /**
   * @function    verifyRegister
   * @purpose     Verify the OTP and complete virtual number registration
   * @param  {object} data - Payload containing phone number and OTP code
   * @returns {Promise<AxiosResponse>} API response
   */
  // [API CALL]: Complete OTP verification and register the number
  verifyRegister: (data)       => apiClient.post('/api/numbers/verify-register', data),

  /**
   * @function    release
   * @purpose     Release/remove a registered virtual phone number from the business account
   * @param  {string} id - Number document ID
   * @returns {Promise<AxiosResponse>} API response
   */
  // [API CALL]: Remove a registered virtual phone number
  release:        (id)         => apiClient.delete(`/api/numbers/${id}`),
}

// ─────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────
