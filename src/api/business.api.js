/**
 * @file        business.api.js
 * @module      Business API
 * @project     ClientFrontend
 * @layer       API
 * @description API functions for business profile management — dashboard, services, staff, operating hours, settings, and FAQs.
 *
 * @updated     2026-05-29
 * @version     1.0.0
 *
 * @dependencies
 *   - ./apiClient (apiClient)
 *
 * @sideEffects
 *   - HTTP GET requests to /api/business/dashboard, /api/business/services, /api/business/staff, /api/business/hours, /api/business/settings, /api/business/faqs
 *   - HTTP POST requests to /api/business/services, /api/business/staff, /api/business/faqs
 *   - HTTP PUT requests to /api/business/services/:id, /api/business/hours, /api/business/settings
 *   - HTTP DELETE requests to /api/business/services/:id, /api/business/staff/:id, /api/business/faqs/:id
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
 * @function    businessApi
 * @purpose     Namespace object exposing all business management endpoints
 * @returns {Promise<AxiosResponse>} API response
 */
export const businessApi = {
  /**
   * @function    getDashboard
   * @purpose     Fetch aggregated dashboard metrics for the authenticated business
   * @returns {Promise<AxiosResponse>} API response
   */
  // [API CALL]: Retrieve business dashboard summary metrics
  getDashboard: () => apiClient.get('/api/business/dashboard'),

  /**
   * @function    getServices
   * @purpose     Fetch all services offered by the business
   * @returns {Promise<AxiosResponse>} API response
   */
  // [API CALL]: Retrieve all business services
  getServices: () => apiClient.get('/api/business/services'),

  /**
   * @function    createService
   * @purpose     Create a new service offering for the business
   * @param  {object} d - Service payload (name, duration, price, etc.)
   * @returns {Promise<AxiosResponse>} API response
   */
  // [API CALL]: Add a new service to the business catalogue
  createService: (d) => apiClient.post('/api/business/services', d),

  /**
   * @function    updateService
   * @purpose     Update an existing service by ID
   * @param  {string} id - Service document ID
   * @param  {object} d - Updated service fields
   * @returns {Promise<AxiosResponse>} API response
   */
  // [API CALL]: Mutate an existing service record
  updateService: (id, d) => apiClient.put(`/api/business/services/${id}`, d),

  /**
   * @function    deleteService
   * @purpose     Remove a service from the business catalogue
   * @param  {string} id - Service document ID
   * @returns {Promise<AxiosResponse>} API response
   */
  // [API CALL]: Delete a service record
  deleteService: (id) => apiClient.delete(`/api/business/services/${id}`),

  /**
   * @function    getStaff
   * @purpose     Fetch all staff members associated with the business
   * @returns {Promise<AxiosResponse>} API response
   */
  // [API CALL]: Retrieve all staff members
  getStaff: () => apiClient.get('/api/business/staff'),

  /**
   * @function    createStaff
   * @purpose     Add a new staff member to the business
   * @param  {object} d - Staff payload (name, role, phone, etc.)
   * @returns {Promise<AxiosResponse>} API response
   */
  // [API CALL]: Add a new staff member
  createStaff: (d) => apiClient.post('/api/business/staff', d),

  /**
   * @function    deleteStaff
   * @purpose     Remove a staff member from the business
   * @param  {string} id - Staff document ID
   * @returns {Promise<AxiosResponse>} API response
   */
  // [API CALL]: Delete a staff member record
  deleteStaff: (id) => apiClient.delete(`/api/business/staff/${id}`),

  /**
   * @function    getHours
   * @purpose     Fetch the business operating hours configuration
   * @returns {Promise<AxiosResponse>} API response
   */
  // [API CALL]: Retrieve operating hours
  getHours: () => apiClient.get('/api/business/hours'),

  /**
   * @function    updateHours
   * @purpose     Update operating hours for the business
   * @param  {object} d - Hours payload (days, open/close times)
   * @returns {Promise<AxiosResponse>} API response
   */
  // [API CALL]: Save updated operating hours
  updateHours: (d) => apiClient.put('/api/business/hours', d),

  /**
   * @function    getSettings
   * @purpose     Fetch the business bot and general settings
   * @returns {Promise<AxiosResponse>} API response
   */
  // [API CALL]: Retrieve business settings
  getSettings: () => apiClient.get('/api/business/settings'),

  /**
   * @function    updateSettings
   * @purpose     Update business settings (bot persona, tone, language, etc.)
   * @param  {object} d - Settings payload
   * @returns {Promise<AxiosResponse>} API response
   */
  // [API CALL]: Save updated business settings
  updateSettings: (d) => apiClient.put('/api/business/settings', d),

  /**
   * @function    getFaqs
   * @purpose     Fetch all FAQs configured for the business bot
   * @returns {Promise<AxiosResponse>} API response
   */
  // [API CALL]: Retrieve bot FAQ entries
  getFaqs: () => apiClient.get('/api/business/faqs'),

  /**
   * @function    createFaq
   * @purpose     Add a new FAQ entry for the business bot
   * @param  {object} d - FAQ payload (question, answer)
   * @returns {Promise<AxiosResponse>} API response
   */
  // [API CALL]: Add a new FAQ entry
  createFaq: (d) => apiClient.post('/api/business/faqs', d),

  /**
   * @function    deleteFaq
   * @purpose     Remove an FAQ entry from the business bot knowledge base
   * @param  {string} id - FAQ document ID
   * @returns {Promise<AxiosResponse>} API response
   */
  // [API CALL]: Delete an FAQ entry
  deleteFaq: (id) => apiClient.delete(`/api/business/faqs/${id}`),
}

// ─────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────
