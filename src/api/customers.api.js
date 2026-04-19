import apiClient from './apiClient'
export const customersApi = {
  list: (p) => apiClient.get('/api/customers', { params: p }),
  get: (id) => apiClient.get(`/api/customers/${id}`),
  reengage: (id) => apiClient.post(`/api/customers/${id}/reengage`),
}
