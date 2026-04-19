import apiClient from './apiClient'
export const bookingsApi = {
  list: (p) => apiClient.get('/api/bookings', { params: p }),
  calendar: (p) => apiClient.get('/api/bookings/view/calendar', { params: p }),
  slots: (p) => apiClient.get('/api/bookings/slots', { params: p }),
  get: (id) => apiClient.get(`/api/bookings/${id}`),
  updateStatus: (id, d) => apiClient.put(`/api/bookings/${id}/status`, d),
  verifyOtp: (id, d) => apiClient.post(`/api/bookings/${id}/verify-otp`, d),
  markAttended: (id) => apiClient.post(`/api/bookings/${id}/mark-attended`),
}
