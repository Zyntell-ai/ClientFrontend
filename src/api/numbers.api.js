import apiClient from './apiClient'

export const numbersApi = {
  list:           ()           => apiClient.get('/api/numbers'),
  sendOtp:        (data)       => apiClient.post('/api/numbers/send-otp', data),
  verifyRegister: (data)       => apiClient.post('/api/numbers/verify-register', data),
  release:        (id)         => apiClient.delete(`/api/numbers/${id}`),
}