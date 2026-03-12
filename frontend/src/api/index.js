import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 产品 API
export const productAPI = {
  list: (params) => api.get('/products', { params }),
  popular: (limit) => api.get('/products/popular', { params: { limit } }),
  detail: (id) => api.get(`/products/${id}`),
  categories: () => api.get('/products/categories')
}

// 试用 API - v1.3 核心
export const trialAPI = {
  create: (data) => api.post('/trials', data),
  detail: (id) => api.get(`/trials/${id}`),
  userTrials: (userId) => api.get(`/trials/user/${userId}`),
  feedback: (id, data) => api.post(`/trials/${id}/feedback`, data),
  extend: (id, days) => api.post(`/trials/${id}/extend`, null, { params: { days } }),
  stats: () => api.get('/trials/stats')
}

// AI API
export const aiAPI = {
  chat: (data) => api.post('/ai/chat', data),
  recommend: (requirements) => api.post('/ai/recommend', requirements)
}

export const feedbackAPI = {
  listAll: () => api.get('/feedback/all'),
  update: (id, data) => api.put(`/feedback/${id}`, data)
}

export const adminAPI = {
  trialRequests: () => api.get('/admin/trial-requests'),
  trialRequestDetail: (trialId) => api.get(`/admin/trial-requests/${trialId}`)
}

export default api
