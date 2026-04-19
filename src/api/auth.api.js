// src/api/auth.api.js
import apiClient from './apiClient'
export const authApi = {
  register: (data) => apiClient.post('/api/auth/register', data),
  login:    (data) => apiClient.post('/api/auth/login', data),
  me:       ()     => apiClient.get('/api/auth/me'),
}
