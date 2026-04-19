import apiClient from './apiClient'
export const analyticsApi = {
  bookings: (p) => apiClient.get('/api/analytics/bookings', { params: p }),
  customers: (p) => apiClient.get('/api/analytics/customers', { params: p }),
  revenue: (p) => apiClient.get('/api/analytics/revenue', { params: p }),
}
