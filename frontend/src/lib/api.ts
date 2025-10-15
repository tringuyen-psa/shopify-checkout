import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:29000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Package API
export const packageApi = {
  getAll: () => api.get('/packages'),
  getById: (id: string) => api.get(`/packages/${id}`),
  getPrice: (id: string, cycle: string) =>
    api.get(`/packages/${id}/price/${cycle}`),
  search: (query: string) => api.get(`/packages/search?q=${query}`),
  getPopular: (limit?: number) =>
    api.get(`/packages/popular${limit ? `?limit=${limit}` : ''}`),
  seed: () => api.post('/packages/seed'),
};

// Purchase API
export const purchaseApi = {
  getAll: () => api.get('/purchases'),
  getByUserId: (userId: string) => api.get(`/purchases/user/${userId}`),
  getActivePurchases: (userId: string) =>
    api.get(`/purchases/user/${userId}/active`),
  getById: (id: string) => api.get(`/purchases/${id}`),
  create: (data: any) => api.post('/purchases', data),
  complete: (id: string, paymentId: string) =>
    api.patch(`/purchases/${id}/complete`, { paymentId }),
  cancel: (id: string) => api.patch(`/purchases/${id}/cancel`),
  refund: (id: string) => api.patch(`/purchases/${id}/refund`),
  renew: (id: string) => api.patch(`/purchases/${id}/renew`),
  extend: (id: string, days: number) =>
    api.patch(`/purchases/${id}/extend`, { days }),
  getStats: (userId?: string) =>
    api.get(`/purchases/stats${userId ? `?userId=${userId}` : ''}`),
  getExpiring: (days?: number) =>
    api.get(`/purchases/expiring${days ? `?days=${days}` : ''}`),
};

// Payment API
export const paymentApi = {
  // Stripe
  stripe: {
    createCheckoutSession: (data: any) =>
      api.post('/payments/stripe/create-checkout', data),
    createPaymentIntent: (data: any) =>
      api.post('/payments/stripe/create-payment-intent', data),
    retrieveSession: (sessionId: string) =>
      api.get(`/payments/stripe/retrieve-session/${sessionId}`),
    retrievePaymentIntent: (paymentIntentId: string) =>
      api.get(`/payments/stripe/retrieve-payment-intent/${paymentIntentId}`),
    confirmPayment: (paymentIntentId: string) =>
      api.post(`/payments/stripe/confirm-payment/${paymentIntentId}`),
    cancelPayment: (paymentIntentId: string) =>
      api.post(`/payments/stripe/cancel-payment/${paymentIntentId}`),
    refund: (paymentIntentId: string, amount?: number) =>
      api.post(`/payments/stripe/refund/${paymentIntentId}`, { amount }),
    getConfig: () => api.get('/payments/stripe/config'),
  },
  // PayPal
  paypal: {
    createOrder: (data: any) =>
      api.post('/payments/paypal/create-order', data),
    captureOrder: (orderId: string) =>
      api.post(`/payments/paypal/${orderId}/capture`),
    getOrderDetails: (orderId: string) =>
      api.get(`/payments/paypal/${orderId}/details`),
    refund: (captureId: string, amount?: number) =>
      api.post(`/payments/paypal/refund/${captureId}`, { amount }),
    createPayout: (data: any) =>
      api.post('/payments/paypal/payout', data),
    getConfig: () => api.get('/payments/paypal/config'),
    getHealth: () => api.get('/payments/paypal/health'),
    createTestOrder: (purchaseId?: string) =>
      api.post('/payments/paypal/test-payment', null, {
        params: purchaseId ? { purchaseId } : {}
      }),
  },
};

export default api;