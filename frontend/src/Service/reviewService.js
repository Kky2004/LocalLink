import api from './api';

export const reviewService = {
  async createReview(data) {
    const response = await api.post('/reviews', data);
    return response.data;
  },

  async getProviderReviews(providerId) {
    const response = await api.get(`/reviews/provider/${providerId}`);
    return response.data;
  },

  async getProviderRating(providerId) {
    const response = await api.get(`/reviews/provider/${providerId}/rating`);
    return response.data;
  },
};
