import api from './axios';

export const paymentApi = {

  // Tenant uploads — uses FormData for multipart
  uploadPayment: (formData) =>
    api.post('/payments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Tenant payment history
  getMyPayments: (page = 0, size = 20) =>
    api.get('/payments/my', { params: { page, size } }),

  // Landlord — pending queue
  getPendingPayments: (page = 0, size = 20) =>
    api.get('/payments/pending', { params: { page, size } }),

  // Landlord — all payments with optional filters
  getLandlordPayments: (params = {}) =>
    api.get('/payments', { params }),

  // Single payment
  getPayment: (id) =>
    api.get(`/payments/${id}`),

  // Proof screenshot URL — for use in <img src> or download link
  getProofUrl: (id) =>
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'}/payments/${id}/proof`,

  // Fetch proof as a blob directly using Axios
  getProofBlob: (id) =>
    api.get(`/payments/${id}/proof`, { responseType: 'blob' }),

  // Approve / Reject
  approvePayment: (id) =>
    api.patch(`/payments/${id}/approve`),

  rejectPayment: (id, landLoardComment) =>
    api.patch(`/payments/${id}/reject`, { landLoardComment }),

  // Admin platform-wide view
  getAllPaymentsAdmin: (page = 0, size = 20) =>
    api.get('/admin/payments', { params: { page, size } }),
};