import apiClient from './apiClient'
export const billingApi = {
  current: () => apiClient.get('/api/billing/current'),
  invoices: () => apiClient.get('/api/billing/invoices'),
  pay: (d) => apiClient.post('/api/billing/pay', d),
}
