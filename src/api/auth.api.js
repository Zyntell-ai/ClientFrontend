/**
 * @file        auth.api.js
 * @module      Auth API
 * @project     ClientFrontend
 * @layer       API
 * @description API functions for authentication — register, login, and current user profile retrieval.
 *
 * @updated     2026-05-29
 * @version     1.0.0
 *
 * @dependencies
 *   - ./apiClient (apiClient)
 *
 * @sideEffects
 *   - HTTP POST requests to /api/auth/register, /api/auth/login
 *   - HTTP GET request to /api/auth/me
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
 * @function    authApi
 * @purpose     Namespace object exposing authentication endpoints
 * @returns {Promise<AxiosResponse>} API response
 */
export const authApi = {
  /**
   * @function    register
   * @purpose     Register a new business account
   * @param  {object} data - Registration payload (name, email, password, etc.)
   * @returns {Promise<AxiosResponse>} API response
   */
  // [API CALL]: Create new business account
  register: (data) => apiClient.post('/api/auth/register', data),

  /**
   * @function    login
   * @purpose     Authenticate an existing business user and retrieve a JWT
   * @param  {object} data - Login credentials (email, password)
   * @returns {Promise<AxiosResponse>} API response
   */
  // [AUTH]: Authenticate user and retrieve JWT token
  login:    (data) => apiClient.post('/api/auth/login', data),

  /**
   * @function    me
   * @purpose     Fetch the currently authenticated user's business profile
   * @returns {Promise<AxiosResponse>} API response
   */
  // [API CALL]: Retrieve current session user profile
  me:       ()     => apiClient.get('/api/auth/me'),
}

// ─────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────
