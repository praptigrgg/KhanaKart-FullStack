import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) =>
    api.post('/login', { email, password }),
  
  register: (data) =>
    api.post('/register', data),
  
  logout: () => api.post('/logout'),
  
  dashboard: (date) => {
    const params = date ? { date } : {};
    return api.get('/dashboard', { params });
  },
};

// Menu Items API
export const menuAPI = {
  getAll: () => api.get('/menu-items'),
  create: (data) => api.post('/menu-items', data),
  update: (id, data) => api.put(`/menu-items/${id}`, data),
  delete: (id) => api.delete(`/menu-items/${id}`),
  getById: (id) => api.get(`/menu-items/${id}`),
};

// Tables API
export const tableAPI = {
  getAll: () => api.get('/tables'),
  bulkCreate: (count, capacity) =>
    api.post('/tables/bulk-create', { count, capacity }),
  update: (id, data) => api.put(`/tables/${id}`, data),
  delete: (id) => api.delete(`/tables/${id}`),
};

// Orders API
export const orderAPI = {
  getAll: (status) => {
    const params = status ? { status } : {};
    return api.get('/orders', { params });
  },
  create: (data) => api.post('/orders', data),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) =>
    api.put(`/orders/${id}/status`, { status }),
markPaid: (id, payment_method, discount = 0) =>
  api.put(`/orders/${id}/pay`, {
    payment_method,
    discount
  }),

  delete: (id) => api.delete(`/orders/${id}`),
  addItems: (id, items) =>
    api.post(`/orders/${id}/add-items`, { items }),
};

// Order Items API
export const orderItemAPI = {
  updateStatus: (id, status) =>
    api.put(`/order-items/${id}/status`, { status }),
};

// Roles API
export const roleAPI = {
  getAll: () => api.get('/roles'),
  create: (data) => api.post('/roles', data),
  update: (id, data) => api.put(`/roles/${id}`, data),
  delete: (id) => api.delete(`/roles/${id}`),
};

// Users API
export const userAPI = {
  getAll: () => api.get('/users'),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getById: (id) => api.get(`/users/${id}`),
};

// Inventory API
export const inventoryAPI = {
  getItems: () => api.get('/items'),
  createItem: (data) => api.post('/items', data),
  updateItem: (id, data) => api.put(`/items/${id}`, data),
  deleteItem: (id) => api.delete(`/items/${id}`),
  
  getSuppliers: () => api.get('/suppliers'),
  createSupplier: (data) => api.post('/suppliers', data),
  updateSupplier: (id, data) => api.put(`/suppliers/${id}`, data),
  deleteSupplier: (id) => api.delete(`/suppliers/${id}`),
  
  getPurchases: () => api.get('/purchases'),
  createPurchase: (data) => api.post('/purchases', data),
};

// Invoice API
export const invoiceAPI = {
  getAll: () => api.get('/invoices'),
  getById: (id) => api.get(`/invoices/${id}`),
};

// Payment API
export const paymentAPI = {
  createPaymentRequest: (amount, order_id) =>
    api.post('/payment/create', { amount, order_id }),
};

export default api;