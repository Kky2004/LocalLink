import api from './api';

export const paymentService = {
  createOrder: async (data) => {
    const response = await api.post('/payments/create-order', data);
    return response.data;
  },

  verifyPayment: async (data) => {
    const response = await api.post('/payments/verify', data);
    return response.data;
  },

  getPaymentByBookingId: async (bookingId) => {
    const response = await api.get(`/payments/booking/${bookingId}`);
    return response.data;
  },
};
