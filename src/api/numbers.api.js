import apiClient from './apiClient'
export const numbersApi = {
  list: () => apiClient.get('/api/numbers'),
  purchase: (d) => apiClient.post('/api/numbers/purchase', d),
  release: (id) => apiClient.delete(`/api/numbers/${id}`),
}
