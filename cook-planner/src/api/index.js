import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://meal-planner-jvf1.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cp_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Handle 401 globally — token expired
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cp_token')
      localStorage.removeItem('cp_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
}

// ── Weekly Plans ──────────────────────────────────────────────────────────────
export const weeklyPlansApi = {
  getAll: () => api.get('/weekly-plans'),
  getActive: () => api.get('/weekly-plans/active'),
  getById: (id) => api.get(`/weekly-plans/${id}`),
  create: (data) => api.post('/weekly-plans', data),
  update: (id, data) => api.put(`/weekly-plans/${id}`, data),
  rename: (id, name) => api.put(`/weekly-plans/${id}/rename`, { name }),
  duplicate: (id) => api.post(`/weekly-plans/${id}/duplicate`),
  activate: (id) => api.put(`/weekly-plans/${id}/activate`),
  delete: (id) => api.delete(`/weekly-plans/${id}`),
}

export default api
