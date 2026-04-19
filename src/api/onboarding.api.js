import apiClient from './apiClient'
export const onboardingApi = {
  complete: (d) => apiClient.post('/api/onboarding/complete', d),
  status: () => apiClient.get('/api/onboarding/status'),
}
