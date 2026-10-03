/**
 * @file        numbers.api.js
 * @module      Numbers API
 * @project     ClientFrontend
 * @layer       API
 * @description API functions for virtual phone numbers — list the business's active numbers and request a number
 *              (V1: Zyntell allocates and activates Exotel numbers manually; there is no self-service purchase).
 *
 * @updated     2026-05-29
 * @version     1.0.0
 *
 * @dependencies
 *   - ./apiClient (apiClient)
 *
 * @sideEffects
 *   - HTTP GET request to /api/numbers
 *   - HTTP POST request to /api/numbers/requests
 *   - HTTP GET request to /api/numbers/requests
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
  // [API CALL]: The business's ACTIVE (live) numbers — allocated-but-not-yet-active numbers are never returned
  list:          ()     => apiClient.get('/api/numbers'),
  // [API CALL]: The business's own number requests with status/timestamps/reason (newest first)
  listRequests:  ()     => apiClient.get('/api/numbers/requests'),
  // [API CALL]: Request a virtual number — body (all optional): { preferredArea, preferredNumber, notes }.
  //             Numbers are bought and configured manually by Zyntell (Exotel); nothing is purchased here.
  createRequest: (data) => apiClient.post('/api/numbers/requests', data),
}

// ─────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────
