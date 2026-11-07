/**
 * @file        calls.api.js
 * @module      Call Management API
 * @project     ClientFrontend
 * @layer       API
 * @description The business's own Exotel call logs and assigned virtual number. Always scoped to the logged-in
 *              business by the backend (the business ID is never sent). Recordings are never available here.
 */
import apiClient from './apiClient'

export const callsApi = {
  /** GET /api/calls?from=&to=&cursor=&limit= → { calls, nextCursor, range, assignedNumbers } */
  list: ({ from, to, cursor, limit } = {}) => apiClient.get('/api/calls', { params: { from, to, cursor, limit } }),
}
