import api from './api';

export const bookingService = {
  async createBooking(data) {
    const response = await api.post('/bookings', data);
    return response.data;
  },

  async getMyBookings() {
    const response = await api.get('/bookings/my-bookings');
    return response.data;
  },

  async getMyOrders() {
    const response = await api.get('/bookings/my-orders');
    return response.data;
  },

  async getBookingById(id) {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  async updateBookingStatus(id, status) {
    const response = await api.put(`/bookings/${id}/status?status=${status}`);
    return response.data;
  },

   async updatePaymentStatus(id, status) {
    const response = await api.put(`/bookings/${id}/payment-status?payment-status=${status}`);
    return response.data;
  },

  async cancelBooking(id) {
    await api.delete(`/bookings/${id}`);
  },
};
