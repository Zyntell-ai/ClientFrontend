/**
 * @file        apiClient.js
 * @module      API Client
 * @project     ClientFrontend
 * @layer       API
 * @description Central Axios instance configured with base URL, JWT injection interceptor, and global 401 logout handler.
 *
 * @updated     2026-05-29
 * @version     1.0.0
 *
 * @dependencies
 *   - axios
 *   - ../store/authStore (useAuthStore)
 *
 * @sideEffects
 *   - Reads JWT token from authStore on every outgoing request
 *   - Calls authStore.logout() and redirects to /login on 401 responses
 */

// ─────────────────────────────────────────
// IMPORTS & DEPENDENCIES
// ─────────────────────────────────────────
import axios from 'axios'
import { useAuthStore } from '../store/authStore'

// ─────────────────────────────────────────
// CONSTANTS & CONFIG
// ─────────────────────────────────────────

/**
 * @function    apiClient
 * @purpose     Preconfigured Axios instance pointing to the Zyntell backend with auth and error interceptors
 * @returns {Promise<AxiosResponse>} API response
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://finalbackend-wwua.onrender.com',
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
})

// ─────────────────────────────────────────
// API FUNCTIONS
// ─────────────────────────────────────────

// [AUTH]: Attach JWT token to every outgoing request via Authorization header
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// [AUTH]: Handle 401 globally — force logout and redirect to login page
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // [GUARD]: Token expired or invalid — clear auth state and redirect
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ─────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────
export default apiClient
