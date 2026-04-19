import apiClient from './apiClient'
export const leadsApi = {
  list: (p) => apiClient.get('/api/leads', { params: p }),
  claim: (id) => apiClient.post(`/api/leads/${id}/claim`),
  bid: (id, d) => apiClient.post(`/api/leads/${id}/bid`, d),
  bids: (id) => apiClient.get(`/api/leads/${id}/bids`),
}
