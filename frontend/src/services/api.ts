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

// Handle 401 responses and auto-refresh token
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 error and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        // No refresh token, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Try to refresh the token
        const response = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const newAccessToken = response.data.access_token;
        const newRefreshToken = response.data.refresh_token;

        // Save new tokens
        localStorage.setItem('access_token', newAccessToken);
        localStorage.setItem('refresh_token', newRefreshToken);

        // Update authorization header
        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Process queued requests
        processQueue(null, newAccessToken);
        isRefreshing = false;

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        processQueue(refreshError, null);
        isRefreshing = false;
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// API endpoints
export const authAPI = {
  googleAuth: (token: string, refCode?: string | null) =>
    api.post('/auth/google', { token, ref_code: refCode || undefined }),
  refreshToken: (refreshToken: string) => api.post('/auth/refresh', { refresh_token: refreshToken }),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),

  // Email auth methods
  register: (email: string, password: string, full_name?: string, ref_code?: string) =>
    api.post('/auth/register', { email, password, full_name, ref_code }),

  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
};

export const productsAPI = {
  getProducts: (params: any) => api.get('/products/', { params }),
  getMyProducts: (params: any) => api.get('/products/my-products', { params }),
  getProductById: (id: string) => api.get(`/products/${id}`),
  createProduct: (data: any) => api.post('/products/', data),
  updateProduct: (id: string, data: any) => api.put(`/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/products/${id}`),
  getPromotionPackages: () => api.get('/products/promotion/packages'),
  promoteProduct: (id: string, views: number) => api.post(`/products/${id}/promote`, null, { params: { views } }),
  getWarehouseStatistics: () => api.get('/products/warehouse/statistics'),
  getCategories: (parentId?: number) => api.get('/products/categories/', { params: { parent_id: parentId } }),
  getCities: () => api.get('/locations/cities'),
  getMarkets: (params: any) => api.get('/locations/markets', { params }),
  getSellers: (params: any) => api.get('/seller-profile/catalog', { params }),
  getSellerById: (id: string, includeProducts: boolean = true) =>
    api.get(`/seller-profile/${id}`, { params: { include_products: includeProducts } }),
  getReferralProducts: (params: any) => api.get('/products/referral/products', { params }),
};

export const locationsAPI = {
  getCities: () => api.get('/locations/cities'),
  getMarkets: (params: any) => api.get('/locations/markets', { params }),
};

export const ordersAPI = {
  getOrders: (params?: any) => api.get('/orders/', { params }),
  getOrderById: (id: string) => api.get(`/orders/${id}`),
  createOrder: (data: any) => api.post('/orders/', data),
  updateOrderStatus: (id: string, status: string) => api.put(`/orders/${id}/status`, { status }),
};

export const walletAPI = {
  getBalance: () => api.get('/wallet/balance'),
  topup: (amount: number) => api.post('/wallet/topup', { amount }),
  withdraw: (data: any) => api.post('/wallet/withdraw', data),
  transfer: (data: { amount: number; from: string; to: string }) => api.post('/wallet/transfer', data),
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
  getReferralLink: () => api.get('/users/me/referral-link'),
  getReferralStats: () => api.get('/users/me/referral-stats'),
  activateTariff: (tariffId: string) => api.post(`/users/me/activate-tariff`, { tariff: tariffId }),
};

export const sellerProfileAPI = {
  createProfile: (data: any) => api.post('/seller-profile/', data),
  updateProfile: (data: any) => api.put('/seller-profile/', data),
};

export const notificationsAPI = {
  getNotifications: (params: any) => api.get('/notifications/', { params }),
  getUnreadCount: () => api.get('/notifications/unread/count'),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id: string) => api.delete(`/notifications/${id}`),
};

export const favoritesAPI = {
  getFavorites: (params: any) => api.get('/favorites/', { params }),
  addToFavorites: (productId: string) => api.post(`/favorites/${productId}`),
  removeFromFavorites: (productId: string) => api.delete(`/favorites/${productId}`),
  checkFavorite: (productId: string) => api.get(`/favorites/check/${productId}`),
  recordView: (productId: string) => api.post(`/favorites/view-history/${productId}`),
  getViewHistory: (params: any) => api.get('/favorites/view-history/', { params }),
  clearViewHistory: () => api.delete('/favorites/view-history'),
};

export const searchAPI = {
  getSuggestions: (query: string, limit: number = 10) =>
    api.get('/search/suggestions', { params: { q: query, limit } }),
  search: (params: any) => api.get('/search/', { params }),
  getTrendingSearches: (limit: number = 10) =>
    api.get('/search/trending', { params: { limit } }),
};

export const recommendationsAPI = {
  getPersonalized: (limit: number = 20) =>
    api.get('/recommendations/for-you', { params: { limit } }),
  getSimilarProducts: (productId: string, limit: number = 12) =>
    api.get(`/recommendations/similar/${productId}`, { params: { limit } }),
  getTrending: (params: any) => api.get('/recommendations/trending', { params }),
  getNewArrivals: (params: any) => api.get('/recommendations/new-arrivals', { params }),
  getDeals: (params: any) => api.get('/recommendations/deals', { params }),
};

export const couponsAPI = {
  createCoupon: (data: any) => api.post('/coupons/', data),
  validateCoupon: (code: string, orderAmount: number) =>
    api.get(`/coupons/validate/${code}`, { params: { order_amount: orderAmount } }),
  getMyCoupons: (params: any) => api.get('/coupons/my-coupons', { params }),
  deactivateCoupon: (id: string) => api.put(`/coupons/${id}/deactivate`),
  getCouponUsage: (id: string, params: any) =>
    api.get(`/coupons/${id}/usage`, { params }),
};

export const settingsAPI = {
  getSettings: () => api.get('/settings/'),
  updateSettings: (data: any) => api.put('/settings/', data),
  exportData: () => api.get('/settings/export'),
  requestDataDeletion: () => api.post('/settings/delete-account'),
};

export const exportAPI = {
  exportOrdersCSV: (params: any) =>
    api.get('/export/orders/csv', { params, responseType: 'blob' }),
  exportProductsCSV: (params: any) =>
    api.get('/export/products/csv', { params, responseType: 'blob' }),
  exportAnalyticsJSON: (params: any) =>
    api.get('/export/analytics/json', { params }),
  exportComprehensiveReport: (format: string, params: any) =>
    api.get(`/export/comprehensive/${format}`, { params, responseType: format === 'csv' ? 'blob' : 'json' }),
};

export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getProductPerformance: (sortBy: string = 'views', limit: number = 10) =>
    api.get('/analytics/products/performance', { params: { sort_by: sortBy, limit } }),
  getSalesByPeriod: (period: string) =>
    api.get('/analytics/sales/by-period', { params: { period } }),
  getReviewsStats: () => api.get('/analytics/reviews/stats'),
  getTrafficSources: () => api.get('/analytics/traffic/sources'),
};

export const reportsAPI = {
  createReport: (data: any) => api.post('/reports/', data),
  getMyReports: (params: any) => api.get('/reports/my-reports', { params }),
  getPendingReports: (params: any) => api.get('/reports/admin/pending', { params }),
  reviewReport: (id: string, data: any) => api.put(`/reports/admin/${id}/review`, data),
  getReportStats: () => api.get('/reports/admin/stats'),
};

export const reviewsAPI = {
  getProductReviews: (productId: string, params: any) =>
    api.get(`/reviews/product/${productId}`, { params }),
  getSellerReviews: (sellerId: string, params: any) =>
    api.get(`/reviews/seller/${sellerId}`, { params }),
  createReview: (data: any) => api.post('/reviews/by-product', data),
  createReviewByOrder: (data: any) => api.post('/reviews/', data),
  updateReview: (id: string, data: any) => api.put(`/reviews/${id}`, data),
  deleteReview: (id: string) => api.delete(`/reviews/${id}`),
  respondToReview: (id: string, response: string) =>
    api.post(`/reviews/${id}/respond`, { response }),
};

export const categoriesAPI = {
  getCategories: (params: any) => api.get('/categories/', { params }),
  getCategoryTree: () => api.get('/categories/tree'),
  getCategoryBySlug: (slug: string) => api.get(`/categories/slug/${slug}`),
};

export const uploadAPI = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadMultipleImages: (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return api.post('/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteFile: (filename: string) => api.delete(`/upload/${filename}`),
};
