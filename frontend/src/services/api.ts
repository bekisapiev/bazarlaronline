import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// API endpoints
export const authAPI = {
  googleAuth: (token: string) => api.post('/auth/google', { token }),
  refreshToken: (refreshToken: string) => api.post('/auth/refresh', { refresh_token: refreshToken }),
  logout: () => api.post('/auth/logout'),
};

export const productsAPI = {
  getProducts: (params: any) => api.get('/products/', { params }),
  getProductById: (id: string) => api.get(`/products/${id}`),
  createProduct: (data: any) => api.post('/products/', data),
  updateProduct: (id: string, data: any) => api.put(`/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/products/${id}`),
  promoteProduct: (id: string) => api.post(`/products/${id}/promote`),
  getCategories: (parentId?: number) => api.get('/products/categories/', { params: { parent_id: parentId } }),
};

export const ordersAPI = {
  getOrders: () => api.get('/orders/'),
  getOrderById: (id: string) => api.get(`/orders/${id}`),
  createOrder: (data: any) => api.post('/orders/', data),
  updateOrderStatus: (id: string, status: string) => api.put(`/orders/${id}/status`, { status }),
};

export const walletAPI = {
  getBalance: () => api.get('/wallet/balance'),
  topup: (amount: number) => api.post('/wallet/topup', { amount }),
  withdraw: (data: any) => api.post('/wallet/withdraw', data),
  getTransactions: (limit: number, offset: number) => api.get('/wallet/transactions', { params: { limit, offset } }),
};

export const chatAPI = {
  getConversations: () => api.get('/chat/conversations'),
  getMessages: (chatId: string, limit: number, offset: number) =>
    api.get(`/chat/${chatId}/messages`, { params: { limit, offset } }),
  sendMessage: (data: any) => api.post('/chat/send', data),
  markMessageRead: (messageId: string) => api.put(`/chat/${messageId}/read`),
};

export const usersAPI = {
  getCurrentUser: () => api.get('/users/me'),
  updateCurrentUser: (data: any) => api.put('/users/me', data),
  getUserById: (id: string) => api.get(`/users/${id}`),
  getSellerProfile: (userId: string) => api.get(`/users/${userId}/seller-profile`),
};
