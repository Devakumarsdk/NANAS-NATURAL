import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('devcare_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const url = err.config?.url || '';
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');
    if (status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('devcare_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  me: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
  changePassword: (data) => API.put('/auth/change-password', data),
  forgotPassword: (email) => API.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => API.post(`/auth/reset-password/${token}`, { password }),
  addAddress: (data) => API.post('/auth/address', data),
  updateAddress: (id, data) => API.put(`/auth/address/${id}`, data),
  setDefaultAddress: (id) => API.put(`/auth/address/${id}/default`),
  deleteAddress: (id) => API.delete(`/auth/address/${id}`),
};

// Products
export const productsAPI = {
  getAll: (params) => API.get('/products', { params }),
  getBySlug: (slug) => API.get(`/products/${slug}`),
  create: (data) => API.post('/products', data),
  update: (id, data) => API.put(`/products/${id}`, data),
  delete: (id) => API.delete(`/products/${id}`),
};

// Categories
export const categoriesAPI = {
  getAll: () => API.get('/categories'),
  create: (data) => API.post('/categories', data),
  update: (id, data) => API.put(`/categories/${id}`, data),
  delete: (id) => API.delete(`/categories/${id}`),
};

// Cart
export const cartAPI = {
  get: () => API.get('/cart'),
  add: (data) => API.post('/cart/add', data),
  update: (data) => API.put('/cart/update', data),
  remove: (productId) => API.delete(`/cart/remove/${productId}`),
  clear: () => API.delete('/cart/clear'),
};

// Orders
export const ordersAPI = {
  create: (data) => API.post('/orders', data),
  getMyOrders: () => API.get('/orders/my'),
  getById: (id) => API.get(`/orders/${id}`),
  cancel: (id, reason) => API.put(`/orders/${id}/cancel`, { reason }),
  // Admin
  getAll: (params) => API.get('/orders', { params }),
  updateStatus: (id, data) => API.put(`/orders/${id}/status`, data),
  deleteOrder: (id) => API.delete(`/orders/${id}`),
};

// Payments
export const paymentsAPI = {  createStripeIntent: (orderId) => API.post('/payments/stripe/create-intent', { orderId }),
  createRazorpayOrder: (orderId) => API.post('/payments/razorpay/create-order', { orderId }),
  verifyRazorpay: (data) => API.post('/payments/razorpay/verify', data),
  confirmCOD: (orderId) => API.post('/payments/cod/confirm', { orderId }),
};

// Reviews
export const reviewsAPI = {
  create: (data) => API.post('/reviews', data),
  getByProduct: (productId) => API.get(`/reviews/product/${productId}`),
};

// Wishlist
export const wishlistAPI = {
  get: () => API.get('/wishlist'),
  toggle: (productId) => API.post(`/wishlist/toggle/${productId}`),
};

// Coupons
export const couponsAPI = {
  validate: (code, cartTotal) => API.post('/coupons/validate', { code, cartTotal }),
  getAll: () => API.get('/coupons'),
  create: (data) => API.post('/coupons', data),
  update: (id, data) => API.put(`/coupons/${id}`, data),
  delete: (id) => API.delete(`/coupons/${id}`),
  clearAll: () => API.delete('/coupons'),
};

// Admin
export const adminAPI = {
  getDashboard: () => API.get('/admin/dashboard'),
  getSalesAnalytics: (period) => API.get('/admin/analytics/sales', { params: { period } }),
  getLowStock: () => API.get('/admin/low-stock'),
  getUsers: (params) => API.get('/users', { params }),
  updateUserRole: (id, role) => API.put(`/users/${id}/role`, { role }),
  deleteUser: (id) => API.delete(`/users/${id}`),
};

export default API;


