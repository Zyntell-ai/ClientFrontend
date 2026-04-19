import apiClient from './apiClient'
export const businessApi = {
  getDashboard: () => apiClient.get('/api/business/dashboard'),
  getServices: () => apiClient.get('/api/business/services'),
  createService: (d) => apiClient.post('/api/business/services', d),
  updateService: (id, d) => apiClient.put(`/api/business/services/${id}`, d),
  deleteService: (id) => apiClient.delete(`/api/business/services/${id}`),
  getStaff: () => apiClient.get('/api/business/staff'),
  createStaff: (d) => apiClient.post('/api/business/staff', d),
  deleteStaff: (id) => apiClient.delete(`/api/business/staff/${id}`),
  getHours: () => apiClient.get('/api/business/hours'),
  updateHours: (d) => apiClient.put('/api/business/hours', d),
  getSettings: () => apiClient.get('/api/business/settings'),
  updateSettings: (d) => apiClient.put('/api/business/settings', d),
  getFaqs: () => apiClient.get('/api/business/faqs'),
  createFaq: (d) => apiClient.post('/api/business/faqs', d),
  deleteFaq: (id) => apiClient.delete(`/api/business/faqs/${id}`),
}
