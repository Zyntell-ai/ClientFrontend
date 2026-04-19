import apiClient from './apiClient'
export const commissionsApi = {
  list: (p) => apiClient.get('/api/commissions', { params: p }),
  summary: () => apiClient.get('/api/commissions/summary'),
}
