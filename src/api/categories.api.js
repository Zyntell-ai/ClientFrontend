import apiClient from './apiClient'
export const categoriesApi = { list: () => apiClient.get('/api/categories') }
