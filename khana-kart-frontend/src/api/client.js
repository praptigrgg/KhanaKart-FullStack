import axios from 'axios'

// IMPORTANT: set VITE_API_URL in .env.local, e.g.
// VITE_API_URL=http://localhost:8000
// We will hit `${VITE_API_URL}/api/...`
const baseURL = `${import.meta.env.VITE_API_URL}/api`

export const api = axios.create({ baseURL })

// Get auth token from localStorage
function getToken() {
  return localStorage.getItem('token')
}

// Attach token on every request
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401s: redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)