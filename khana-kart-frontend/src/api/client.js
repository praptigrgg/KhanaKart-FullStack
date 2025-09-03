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

export async function markPaid(orderOrId, paymentMethod = 'cash') {
  const orderId = typeof orderOrId === 'object' ? orderOrId.id : orderOrId;
  if (!orderId) {
    throw new Error('Order ID is required to mark payment');
  }
  if (!['cash', 'card', 'qr'].includes(paymentMethod)) {
    throw new Error('Invalid payment method');
  }

  const response = await api.put(`/orders/${orderId}/pay`, {
    payment_method: paymentMethod, 
  });

  return response.data;
}
