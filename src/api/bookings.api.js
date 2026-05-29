/**
 * @file        bookings.api.js
 * @module      Bookings API
 * @project     ClientFrontend
 * @layer       API
 * @description API functions for booking management — listing, calendar view, slot availability, status updates, OTP verification, and attendance marking.
 *
 * @updated     2026-05-29
 * @version     1.0.0
 *
 * @dependencies
 *   - ./apiClient (apiClient)
 *
 * @sideEffects
 *   - HTTP GET requests to /api/bookings, /api/bookings/view/calendar, /api/bookings/slots, /api/bookings/:id
 *   - HTTP PUT request to /api/bookings/:id/status
 *   - HTTP POST requests to /api/bookings/:id/verify-otp, /api/bookings/:id/mark-attended
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
 * @function    bookingsApi
 * @purpose     Namespace object exposing all booking CRUD and action endpoints
 * @returns {Promise<AxiosResponse>} API response
 */
export const bookingsApi = {
  /**
   * @function    list
   * @purpose     Fetch a paginated/filtered list of bookings
   * @param  {object} p - Query parameters (status, date, page, limit, etc.)
   * @returns {Promise<AxiosResponse>} API response
   */
  // [API CALL]: Retrieve filtered bookings list
  list: (p) => apiClient.get('/api/bookings', { params: p }),

  /**
   * @function    calendar
   * @purpose     Fetch bookings formatted for calendar view
   * @param  {object} p - Query parameters (date range, view type)
   * @returns {Promise<AxiosResponse>} API response
   */
  // [API CALL]: Retrieve calendar-formatted bookings
  calendar: (p) => apiClient.get('/api/bookings/view/calendar', { params: p }),

  /**
   * @function    slots
   * @purpose     Fetch available time slots for a given date and service
   * @param  {object} p - Query parameters (date, serviceId, staffId)
   * @returns {Promise<AxiosResponse>} API response
   */
  // [API CALL]: Retrieve open booking slots
  slots: (p) => apiClient.get('/api/bookings/slots', { params: p }),

  /**
   * @function    get
   * @purpose     Fetch a single booking by its ID
   * @param  {string} id - Booking document ID
   * @returns {Promise<AxiosResponse>} API response
   */
  // [API CALL]: Retrieve a specific booking record
  get: (id) => apiClient.get(`/api/bookings/${id}`),

  /**
   * @function    updateStatus
   * @purpose     Update the status of an existing booking (confirm, cancel, complete, etc.)
   * @param  {string} id - Booking document ID
   * @param  {object} d - Status payload (status, reason, etc.)
   * @returns {Promise<AxiosResponse>} API response
   */
  // [API CALL]: Mutate booking status
  updateStatus: (id, d) => apiClient.put(`/api/bookings/${id}/status`, d),

  /**
   * @function    verifyOtp
   * @purpose     Verify customer OTP for a booking confirmation
   * @param  {string} id - Booking document ID
   * @param  {object} d - OTP payload (otp)
   * @returns {Promise<AxiosResponse>} API response
   */
  // [API CALL]: Verify customer OTP for booking
  verifyOtp: (id, d) => apiClient.post(`/api/bookings/${id}/verify-otp`, d),

  /**
   * @function    markAttended
   * @purpose     Mark a customer as attended for a completed appointment
   * @param  {string} id - Booking document ID
   * @returns {Promise<AxiosResponse>} API response
   */
  // [API CALL]: Record customer attendance for the booking
  markAttended: (id) => apiClient.post(`/api/bookings/${id}/mark-attended`),
}

// ─────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────
